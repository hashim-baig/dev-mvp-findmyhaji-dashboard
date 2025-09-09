import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentTestInterface = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [sessionStatus, setSessionStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPackages();
    fetchTransactions();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/payments/packages`);
      if (response.data.success) {
        setPackages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/payments/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const createCheckoutSession = async () => {
    if (!selectedPackage) {
      alert('Please select a package');
      return;
    }

    setLoading(true);
    try {
      const originUrl = window.location.origin;
      const response = await axios.post(`${backendUrl}/api/payments/checkout/session`, {
        packageId: selectedPackage,
        originUrl,
        metadata: {
          source: 'admin_test',
          testMode: true
        }
      });

      if (response.data.success) {
        const { url } = response.data.data;
        window.open(url, '_blank');
      } else {
        alert('Failed to create checkout session: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const checkSessionStatus = async () => {
    const sessionId = prompt('Enter Session ID to check status:');
    if (!sessionId) return;

    try {
      const response = await axios.get(`${backendUrl}/api/payments/checkout/status/${sessionId}`);
      if (response.data.success) {
        setSessionStatus(response.data.data);
      } else {
        alert('Failed to check session status: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error checking session status:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Stripe Payment Testing</h2>
      
      {/* Payment Packages */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Available Payment Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPackage === pkg.id 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <h4 className="font-semibold text-gray-800">{pkg.name}</h4>
              <p className="text-2xl font-bold text-amber-600">${pkg.amount}</p>
              <p className="text-sm text-gray-600">{pkg.description}</p>
              <p className="text-xs text-gray-500 mt-2">Currency: {pkg.currency.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Test Payment Flow</h3>
        <div className="flex gap-4">
          <button
            onClick={createCheckoutSession}
            disabled={loading || !selectedPackage}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              loading || !selectedPackage
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Checkout Session'}
          </button>
          
          <button
            onClick={checkSessionStatus}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Check Session Status
          </button>
          
          <button
            onClick={fetchTransactions}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Refresh Transactions
          </button>
        </div>
      </div>

      {/* Session Status Display */}
      {sessionStatus && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Session Status</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Session ID</p>
                <p className="font-mono text-sm">{sessionStatus.sessionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  sessionStatus.status === 'complete' ? 'bg-green-100 text-green-800' :
                  sessionStatus.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {sessionStatus.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  sessionStatus.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  sessionStatus.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {sessionStatus.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold">${(sessionStatus.amountTotal / 100).toFixed(2)} {sessionStatus.currency?.toUpperCase()}</p>
              </div>
            </div>
            {sessionStatus.transaction && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Package: {sessionStatus.transaction.packageName}</p>
                <p className="text-sm text-gray-600">Created: {new Date(sessionStatus.transaction.createdAt).toLocaleString()}</p>
                {sessionStatus.transaction.completedAt && (
                  <p className="text-sm text-gray-600">Completed: {new Date(sessionStatus.transaction.completedAt).toLocaleString()}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Transaction ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Package</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length > 0 ? transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{transaction.id?.substring(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm">{transaction.packageName}</td>
                  <td className="px-4 py-3 text-sm font-semibold">${transaction.amount} {transaction.currency?.toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      transaction.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.paymentStatus === 'initiated' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📋 Testing Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Select a payment package above</li>
          <li>2. Click "Create Checkout Session" to open Stripe payment page</li>
          <li>3. Use test card: 4242 4242 4242 4242, any future date, any CVC</li>
          <li>4. Complete payment and return to check status</li>
          <li>5. Use "Check Session Status" to verify payment completion</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentTestInterface;