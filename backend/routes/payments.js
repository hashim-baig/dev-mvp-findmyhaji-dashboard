import express from 'express';
import PaymentTransaction from '../models/PaymentTransaction.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Define fixed payment packages for security
const PAYMENT_PACKAGES = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    amount: 9.99,
    currency: 'usd',
    description: 'Basic FindMyHaji features'
  },
  premium: {
    id: 'premium', 
    name: 'Premium Plan',
    amount: 19.99,
    currency: 'usd',
    description: 'Premium FindMyHaji features with priority support'
  },
  family: {
    id: 'family',
    name: 'Family Plan',
    amount: 29.99,
    currency: 'usd', 
    description: 'Family plan for multiple pilgrims'
  },
  group: {
    id: 'group',
    name: 'Group Plan',
    amount: 49.99,
    currency: 'usd',
    description: 'Group plan for travel agencies'
  }
};

// Import emergentintegrations for Stripe
let StripeCheckout, CheckoutSessionRequest;
try {
  const stripeModule = await import('emergentintegrations/payments/stripe/checkout');
  StripeCheckout = stripeModule.StripeCheckout;
  CheckoutSessionRequest = stripeModule.CheckoutSessionRequest;
} catch (error) {
  console.error('Failed to import Stripe integration:', error);
}

// Initialize Stripe checkout
let stripeCheckout;
if (StripeCheckout) {
  const stripeApiKey = process.env.STRIPE_API_KEY;
  if (stripeApiKey) {
    stripeCheckout = new StripeCheckout({
      api_key: stripeApiKey,
      webhook_url: '' // Will be set dynamically per request
    });
  }
}

// POST /api/payments/checkout/session - Create checkout session
router.post('/checkout/session', async (req, res) => {
  try {
    const { packageId, originUrl, metadata = {} } = req.body;
    
    // Validate required fields
    if (!packageId || !originUrl) {
      return res.status(400).json({
        success: false,
        message: 'Package ID and origin URL are required'
      });
    }
    
    // Validate package exists
    const selectedPackage = PAYMENT_PACKAGES[packageId];
    if (!selectedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package selected'
      });
    }
    
    if (!stripeCheckout) {
      return res.status(500).json({
        success: false,
        message: 'Payment system not configured'
      });
    }
    
    // Get user info if authenticated
    let userId = null;
    let userEmail = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        // Simple JWT decode to get user info (optional)
        const token = authHeader.split(' ')[1];
        // Add JWT decoding logic here if needed
      } catch (error) {
        // Continue without user info if token is invalid
      }
    }
    
    // Set webhook URL dynamically
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    stripeCheckout.webhook_url = `${hostUrl}/api/payments/webhook/stripe`;
    
    // Build success and cancel URLs
    const successUrl = `${originUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${originUrl}/payment/cancel`;
    
    // Create checkout session request
    const checkoutRequest = new CheckoutSessionRequest({
      amount: selectedPackage.amount,
      currency: selectedPackage.currency,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        userId: userId || 'anonymous',
        source: 'findmyhaji_mobile',
        ...metadata
      }
    });
    
    // Create Stripe checkout session
    const session = await stripeCheckout.create_checkout_session(checkoutRequest);
    
    // Create transaction record in database
    const transaction = await PaymentTransaction.createTransaction({
      sessionId: session.session_id,
      userId: userId,
      userEmail: userEmail,
      amount: selectedPackage.amount,
      currency: selectedPackage.currency,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      metadata: checkoutRequest.metadata
    });
    
    res.json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.session_id,
        package: selectedPackage,
        transactionId: transaction.id
      }
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

// GET /api/payments/checkout/status/:sessionId - Get checkout status
router.get('/checkout/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    if (!stripeCheckout) {
      return res.status(500).json({
        success: false,
        message: 'Payment system not configured'
      });
    }
    
    // Get status from Stripe
    const checkoutStatus = await stripeCheckout.get_checkout_status(sessionId);
    
    // Update transaction in database
    const transaction = await PaymentTransaction.updateTransactionStatus(sessionId, {
      paymentStatus: checkoutStatus.payment_status,
      status: checkoutStatus.status,
      stripeData: {
        amount_total: checkoutStatus.amount_total,
        currency: checkoutStatus.currency,
        metadata: checkoutStatus.metadata
      }
    });
    
    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        status: checkoutStatus.status,
        paymentStatus: checkoutStatus.payment_status,
        amountTotal: checkoutStatus.amount_total,
        currency: checkoutStatus.currency,
        metadata: checkoutStatus.metadata,
        transaction: {
          id: transaction.id,
          packageName: transaction.packageName,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

// POST /api/payments/webhook/stripe - Handle Stripe webhooks
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!stripeCheckout) {
      return res.status(500).json({
        success: false,
        message: 'Payment system not configured'
      });
    }
    
    // Handle webhook event
    const webhookEvent = await stripeCheckout.handle_webhook(req.body, signature);
    
    // Update transaction based on webhook event
    if (webhookEvent.session_id) {
      await PaymentTransaction.updateTransactionStatus(webhookEvent.session_id, {
        paymentStatus: webhookEvent.payment_status,
        paymentId: webhookEvent.event_id,
        stripeData: {
          eventType: webhookEvent.event_type,
          metadata: webhookEvent.metadata
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      eventType: webhookEvent.event_type
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
});

// GET /api/payments/packages - Get available payment packages
router.get('/packages', (req, res) => {
  res.json({
    success: true,
    data: Object.values(PAYMENT_PACKAGES)
  });
});

// GET /api/payments/transactions - Get user transactions (authenticated)
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    const transactions = await PaymentTransaction.getUserTransactions(userId, limit);
    
    res.json({
      success: true,
      data: transactions
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// GET /api/payments/transaction/:id - Get specific transaction
router.get('/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await PaymentTransaction.findOne({
      $or: [{ id }, { sessionId: id }]
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
    
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
});

export default router;