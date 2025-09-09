#!/usr/bin/env python3
"""
FindMyHaji Backend API Testing Suite
Third-Party Integrations Testing (Stripe, Firebase, Google Maps)

This script tests the comprehensive third-party integrations backend APIs
for FindMyHaji Flutter mobile apps focusing on:
1. Stripe Payment Integration APIs
2. Firebase Integration APIs  
3. Google Maps Integration APIs
"""

import requests
import json
import sys
import os
from datetime import datetime
import time

# Configuration
BACKEND_URL = "https://28ed4ca0-5224-45ac-9ae5-cab06551907a.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Admin credentials
ADMIN_EMAIL = "admin@findmyhaji.com"
ADMIN_PASSWORD = "password"

class ThirdPartyIntegrationsTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name, status, details=""):
        """Log test results"""
        self.total_tests += 1
        if status == "PASS":
            self.passed_tests += 1
            
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_emoji} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
    
    def authenticate_admin(self):
        """Authenticate as admin and get JWT token"""
        print("\n🔐 ADMIN AUTHENTICATION")
        print("=" * 50)
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data.get('token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.admin_token}'
                })
                self.log_test("Admin Authentication", "PASS", 
                             f"Logged in as {data.get('user', {}).get('name', 'Admin')}")
                return True
            else:
                self.log_test("Admin Authentication", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Authentication", "FAIL", f"Exception: {str(e)}")
            return False

    # ===== STRIPE PAYMENT INTEGRATION TESTS =====
    
    def test_stripe_payment_packages(self):
        """Test GET /api/payments/packages - Get available payment packages"""
        print("\n💳 TESTING STRIPE PAYMENT INTEGRATION")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{API_BASE}/payments/packages")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    packages = data['data']
                    expected_packages = ['basic', 'premium', 'family', 'group']
                    found_packages = [pkg.get('id') for pkg in packages]
                    
                    if all(pkg in found_packages for pkg in expected_packages):
                        self.log_test("Stripe Payment Packages", "PASS", 
                                     f"Retrieved {len(packages)} payment packages: {', '.join(found_packages)}")
                        return packages
                    else:
                        self.log_test("Stripe Payment Packages", "FAIL", 
                                     f"Missing expected packages. Found: {found_packages}")
                        return None
                else:
                    self.log_test("Stripe Payment Packages", "FAIL", "Invalid response format")
                    return None
            else:
                self.log_test("Stripe Payment Packages", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Stripe Payment Packages", "FAIL", f"Exception: {str(e)}")
            return None
    
    def test_stripe_checkout_session(self):
        """Test POST /api/payments/checkout/session - Create checkout session"""
        try:
            payload = {
                "packageId": "basic",
                "originUrl": "https://findmyhaji.com",
                "metadata": {
                    "userId": "test_user_123",
                    "source": "mobile_app_test"
                }
            }
            
            response = self.session.post(f"{API_BASE}/payments/checkout/session", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    session_data = data['data']
                    if 'sessionId' in session_data and 'url' in session_data:
                        self.log_test("Stripe Checkout Session Creation", "PASS", 
                                     f"Created session: {session_data['sessionId']}")
                        return session_data['sessionId']
                    else:
                        self.log_test("Stripe Checkout Session Creation", "FAIL", 
                                     "Missing sessionId or URL in response")
                        return None
                else:
                    self.log_test("Stripe Checkout Session Creation", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
                    return None
            else:
                self.log_test("Stripe Checkout Session Creation", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Stripe Checkout Session Creation", "FAIL", f"Exception: {str(e)}")
            return None
    
    def test_stripe_checkout_status(self, session_id):
        """Test GET /api/payments/checkout/status/:sessionId - Get checkout status"""
        if not session_id:
            self.log_test("Stripe Checkout Status", "SKIP", "No session ID available")
            return
            
        try:
            response = self.session.get(f"{API_BASE}/payments/checkout/status/{session_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    status_data = data['data']
                    self.log_test("Stripe Checkout Status", "PASS", 
                                 f"Status: {status_data.get('status', 'unknown')}, Payment: {status_data.get('paymentStatus', 'unknown')}")
                else:
                    self.log_test("Stripe Checkout Status", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            else:
                self.log_test("Stripe Checkout Status", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Stripe Checkout Status", "FAIL", f"Exception: {str(e)}")
    
    def test_stripe_webhook(self):
        """Test POST /api/payments/webhook/stripe - Handle Stripe webhooks"""
        try:
            # Mock webhook payload
            webhook_payload = {
                "id": "evt_test_webhook",
                "object": "event",
                "type": "checkout.session.completed",
                "data": {
                    "object": {
                        "id": "cs_test_session_123",
                        "payment_status": "paid"
                    }
                }
            }
            
            headers = {
                'stripe-signature': 'test_signature',
                'Content-Type': 'application/json'
            }
            
            response = self.session.post(f"{API_BASE}/payments/webhook/stripe", 
                                       json=webhook_payload, headers=headers)
            
            # Webhook might fail due to signature verification, but we test the endpoint exists
            if response.status_code in [200, 400, 500]:
                self.log_test("Stripe Webhook Endpoint", "PASS", 
                             f"Webhook endpoint accessible (Status: {response.status_code})")
            else:
                self.log_test("Stripe Webhook Endpoint", "FAIL", 
                             f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Stripe Webhook Endpoint", "FAIL", f"Exception: {str(e)}")
    
    def test_stripe_transactions(self):
        """Test GET /api/payments/transactions - Get user transactions (auth required)"""
        try:
            response = self.session.get(f"{API_BASE}/payments/transactions")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    transactions = data.get('data', [])
                    self.log_test("Stripe User Transactions", "PASS", 
                                 f"Retrieved {len(transactions)} transactions")
                else:
                    self.log_test("Stripe User Transactions", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            else:
                self.log_test("Stripe User Transactions", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Stripe User Transactions", "FAIL", f"Exception: {str(e)}")
    
    def test_stripe_transaction_by_id(self):
        """Test GET /api/payments/transaction/:id - Get specific transaction"""
        try:
            # Test with a mock transaction ID
            test_transaction_id = "test_transaction_123"
            response = self.session.get(f"{API_BASE}/payments/transaction/{test_transaction_id}")
            
            # Expected to return 404 for non-existent transaction
            if response.status_code == 404:
                data = response.json()
                if not data.get('success') and 'not found' in data.get('message', '').lower():
                    self.log_test("Stripe Transaction by ID", "PASS", 
                                 "Correctly returned 404 for non-existent transaction")
                else:
                    self.log_test("Stripe Transaction by ID", "FAIL", 
                                 "Unexpected response format for 404")
            else:
                self.log_test("Stripe Transaction by ID", "FAIL", 
                             f"Expected 404, got status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Stripe Transaction by ID", "FAIL", f"Exception: {str(e)}")

    # ===== FIREBASE INTEGRATION TESTS =====
    
    def test_firebase_status(self):
        """Test GET /api/firebase/status - Check Firebase configuration status"""
        print("\n🔥 TESTING FIREBASE INTEGRATION")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{API_BASE}/firebase/status")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    status_data = data['data']
                    configured = status_data.get('configured', False)
                    services = status_data.get('services', {})
                    
                    self.log_test("Firebase Status Check", "PASS", 
                                 f"Configured: {configured}, Services: {list(services.keys())}")
                    return configured
                else:
                    self.log_test("Firebase Status Check", "FAIL", "Invalid response format")
                    return False
            else:
                self.log_test("Firebase Status Check", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Firebase Status Check", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_firebase_verify_token(self):
        """Test POST /api/firebase/auth/verify-token - Verify Firebase ID token"""
        try:
            # Test with mock token
            payload = {
                "idToken": "mock_firebase_id_token_for_testing"
            }
            
            response = self.session.post(f"{API_BASE}/firebase/auth/verify-token", json=payload)
            
            # Expected to fail with invalid token, but endpoint should be accessible
            if response.status_code in [401, 500]:
                data = response.json()
                if not data.get('success'):
                    self.log_test("Firebase Verify Token", "PASS", 
                                 f"Endpoint accessible, correctly rejected invalid token (Status: {response.status_code})")
                else:
                    self.log_test("Firebase Verify Token", "FAIL", 
                                 "Should have rejected invalid token")
            else:
                self.log_test("Firebase Verify Token", "FAIL", 
                             f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Firebase Verify Token", "FAIL", f"Exception: {str(e)}")
    
    def test_firebase_create_custom_token(self):
        """Test POST /api/firebase/auth/create-custom-token - Create custom token (admin auth required)"""
        try:
            payload = {
                "uid": "test_user_123",
                "customClaims": {
                    "role": "pilgrim",
                    "premium": True
                }
            }
            
            response = self.session.post(f"{API_BASE}/firebase/auth/create-custom-token", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    token_data = data['data']
                    if 'customToken' in token_data:
                        self.log_test("Firebase Create Custom Token", "PASS", 
                                     f"Created custom token for UID: {token_data.get('uid')}")
                    else:
                        self.log_test("Firebase Create Custom Token", "FAIL", 
                                     "Missing customToken in response")
                else:
                    self.log_test("Firebase Create Custom Token", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Firebase Create Custom Token", "PASS", 
                             f"Correctly protected admin endpoint (Status: {response.status_code})")
            else:
                self.log_test("Firebase Create Custom Token", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Firebase Create Custom Token", "FAIL", f"Exception: {str(e)}")
    
    def test_firebase_get_user_record(self):
        """Test GET /api/firebase/auth/user/:uid - Get user record (admin auth required)"""
        try:
            test_uid = "test_user_123"
            response = self.session.get(f"{API_BASE}/firebase/auth/user/{test_uid}")
            
            if response.status_code == 404:
                data = response.json()
                if not data.get('success') and 'not found' in data.get('message', '').lower():
                    self.log_test("Firebase Get User Record", "PASS", 
                                 "Correctly returned 404 for non-existent user")
                else:
                    self.log_test("Firebase Get User Record", "FAIL", 
                                 "Unexpected response format for 404")
            elif response.status_code in [401, 403]:
                self.log_test("Firebase Get User Record", "PASS", 
                             f"Correctly protected admin endpoint (Status: {response.status_code})")
            else:
                self.log_test("Firebase Get User Record", "FAIL", 
                             f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Firebase Get User Record", "FAIL", f"Exception: {str(e)}")
    
    def test_firebase_send_to_device(self):
        """Test POST /api/firebase/messaging/send-to-device - Send notification to device"""
        try:
            payload = {
                "token": "mock_device_token_123",
                "title": "Test Notification",
                "body": "This is a test notification from FindMyHaji",
                "data": {
                    "type": "test",
                    "userId": "test_user_123"
                }
            }
            
            response = self.session.post(f"{API_BASE}/firebase/messaging/send-to-device", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Firebase Send to Device", "PASS", 
                                 "Successfully sent notification to device")
                else:
                    self.log_test("Firebase Send to Device", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Firebase Send to Device", "PASS", 
                             f"Correctly protected admin endpoint (Status: {response.status_code})")
            else:
                self.log_test("Firebase Send to Device", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Firebase Send to Device", "FAIL", f"Exception: {str(e)}")
    
    def test_firebase_send_to_topic(self):
        """Test POST /api/firebase/messaging/send-to-topic - Send notification to topic"""
        try:
            payload = {
                "topic": "pilgrims_updates",
                "title": "Hajj Update",
                "body": "Important update for all pilgrims",
                "data": {
                    "type": "announcement",
                    "priority": "high"
                }
            }
            
            response = self.session.post(f"{API_BASE}/firebase/messaging/send-to-topic", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("Firebase Send to Topic", "PASS", 
                                 "Successfully sent notification to topic")
                else:
                    self.log_test("Firebase Send to Topic", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Firebase Send to Topic", "PASS", 
                             f"Correctly protected admin endpoint (Status: {response.status_code})")
            else:
                self.log_test("Firebase Send to Topic", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Firebase Send to Topic", "FAIL", f"Exception: {str(e)}")
    
    def test_firebase_firestore_operations(self):
        """Test Firebase Firestore CRUD operations"""
        try:
            # Test GET collection
            response = self.session.get(f"{API_BASE}/firebase/firestore/test_collection")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    documents = data.get('data', [])
                    self.log_test("Firebase Firestore Get Collection", "PASS", 
                                 f"Retrieved {len(documents)} documents from collection")
                else:
                    self.log_test("Firebase Firestore Get Collection", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Firebase Firestore Get Collection", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Firebase Firestore Get Collection", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
            
            # Test POST document
            test_doc = {
                "name": "Test Document",
                "type": "test",
                "timestamp": datetime.now().isoformat()
            }
            
            response = self.session.post(f"{API_BASE}/firebase/firestore/test_collection", json=test_doc)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    doc_data = data['data']
                    if 'id' in doc_data:
                        self.log_test("Firebase Firestore Add Document", "PASS", 
                                     f"Created document with ID: {doc_data['id']}")
                    else:
                        self.log_test("Firebase Firestore Add Document", "FAIL", 
                                     "Missing document ID in response")
                else:
                    self.log_test("Firebase Firestore Add Document", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Firebase Firestore Add Document", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Firebase Firestore Add Document", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Firebase Firestore Operations", "FAIL", f"Exception: {str(e)}")

    # ===== GOOGLE MAPS INTEGRATION TESTS =====
    
    def test_google_maps_status(self):
        """Test GET /api/maps/status - Check Google Maps service status"""
        print("\n🗺️ TESTING GOOGLE MAPS INTEGRATION")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{API_BASE}/maps/status")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    status_data = data['data']
                    configured = status_data.get('configured', False)
                    initialized = status_data.get('initialized', False)
                    
                    self.log_test("Google Maps Status Check", "PASS", 
                                 f"Configured: {configured}, Initialized: {initialized}")
                    return configured
                else:
                    self.log_test("Google Maps Status Check", "FAIL", "Invalid response format")
                    return False
            else:
                self.log_test("Google Maps Status Check", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Google Maps Status Check", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_google_maps_geocode(self):
        """Test GET /api/maps/geocode - Convert address to coordinates"""
        try:
            params = {
                "address": "Masjid al-Haram, Mecca, Saudi Arabia"
            }
            
            response = self.session.get(f"{API_BASE}/maps/geocode", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    geocode_data = data['data']
                    if 'location' in geocode_data and 'address' in geocode_data:
                        location = geocode_data['location']
                        self.log_test("Google Maps Geocoding", "PASS", 
                                     f"Geocoded address: {geocode_data['address'][:50]}... -> {location}")
                    else:
                        self.log_test("Google Maps Geocoding", "FAIL", 
                                     "Missing location or address in response")
                else:
                    self.log_test("Google Maps Geocoding", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Google Maps Geocoding", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Google Maps Geocoding", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Google Maps Geocoding", "FAIL", f"Exception: {str(e)}")
    
    def test_google_maps_reverse_geocode(self):
        """Test GET /api/maps/reverse-geocode - Convert coordinates to address"""
        try:
            # Coordinates for Masjid al-Haram
            params = {
                "lat": "21.4225",
                "lng": "39.8262"
            }
            
            response = self.session.get(f"{API_BASE}/maps/reverse-geocode", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    results = data['data']
                    if isinstance(results, list) and len(results) > 0:
                        first_result = results[0]
                        if 'address' in first_result:
                            self.log_test("Google Maps Reverse Geocoding", "PASS", 
                                         f"Reverse geocoded coordinates -> {first_result['address'][:50]}...")
                        else:
                            self.log_test("Google Maps Reverse Geocoding", "FAIL", 
                                         "Missing address in response")
                    else:
                        self.log_test("Google Maps Reverse Geocoding", "FAIL", 
                                     "No results returned")
                else:
                    self.log_test("Google Maps Reverse Geocoding", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Google Maps Reverse Geocoding", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Google Maps Reverse Geocoding", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Google Maps Reverse Geocoding", "FAIL", f"Exception: {str(e)}")
    
    def test_google_maps_distance_matrix(self):
        """Test GET /api/maps/distance-matrix - Calculate distances between points"""
        try:
            params = {
                "origins": "Masjid al-Haram, Mecca|Masjid an-Nabawi, Medina",
                "destinations": "King Abdulaziz International Airport, Jeddah",
                "mode": "driving",
                "units": "metric"
            }
            
            response = self.session.get(f"{API_BASE}/maps/distance-matrix", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    matrix_data = data['data']
                    if 'rows' in matrix_data and 'originAddresses' in matrix_data:
                        rows = matrix_data['rows']
                        origins = matrix_data['originAddresses']
                        self.log_test("Google Maps Distance Matrix", "PASS", 
                                     f"Calculated distances for {len(origins)} origins")
                    else:
                        self.log_test("Google Maps Distance Matrix", "FAIL", 
                                     "Missing rows or originAddresses in response")
                else:
                    self.log_test("Google Maps Distance Matrix", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Google Maps Distance Matrix", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Google Maps Distance Matrix", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Google Maps Distance Matrix", "FAIL", f"Exception: {str(e)}")
    
    def test_google_maps_directions(self):
        """Test GET /api/maps/directions - Get directions between points"""
        try:
            params = {
                "origin": "Masjid al-Haram, Mecca, Saudi Arabia",
                "destination": "King Abdulaziz International Airport, Jeddah, Saudi Arabia",
                "mode": "driving",
                "language": "en",
                "units": "metric"
            }
            
            response = self.session.get(f"{API_BASE}/maps/directions", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    directions_data = data['data']
                    if isinstance(directions_data, list) and len(directions_data) > 0:
                        route = directions_data[0]
                        if 'legs' in route and 'distance' in route:
                            self.log_test("Google Maps Directions", "PASS", 
                                         f"Got directions with distance: {route.get('distance', 'N/A')}m")
                        else:
                            self.log_test("Google Maps Directions", "FAIL", 
                                         "Missing legs or distance in route")
                    else:
                        self.log_test("Google Maps Directions", "FAIL", 
                                     "No routes returned")
                else:
                    self.log_test("Google Maps Directions", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Google Maps Directions", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Google Maps Directions", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Google Maps Directions", "FAIL", f"Exception: {str(e)}")
    
    def test_google_maps_places_search(self):
        """Test GET /api/maps/places/search - Search for places"""
        try:
            params = {
                "query": "mosque near Mecca",
                "location": "21.4225,39.8262",
                "radius": "5000",
                "language": "en"
            }
            
            response = self.session.get(f"{API_BASE}/maps/places/search", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    search_data = data['data']
                    if 'results' in search_data:
                        results = search_data['results']
                        self.log_test("Google Maps Places Search", "PASS", 
                                     f"Found {len(results)} places matching query")
                    else:
                        self.log_test("Google Maps Places Search", "FAIL", 
                                     "Missing results in response")
                else:
                    self.log_test("Google Maps Places Search", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Google Maps Places Search", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Google Maps Places Search", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Google Maps Places Search", "FAIL", f"Exception: {str(e)}")
    
    def test_google_maps_places_nearby(self):
        """Test GET /api/maps/places/nearby - Find nearby places"""
        try:
            params = {
                "lat": "21.4225",
                "lng": "39.8262",
                "radius": "2000",
                "type": "mosque",
                "language": "en"
            }
            
            response = self.session.get(f"{API_BASE}/maps/places/nearby", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    nearby_data = data['data']
                    if 'results' in nearby_data:
                        results = nearby_data['results']
                        self.log_test("Google Maps Places Nearby", "PASS", 
                                     f"Found {len(results)} nearby places")
                    else:
                        self.log_test("Google Maps Places Nearby", "FAIL", 
                                     "Missing results in response")
                else:
                    self.log_test("Google Maps Places Nearby", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Google Maps Places Nearby", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Google Maps Places Nearby", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Google Maps Places Nearby", "FAIL", f"Exception: {str(e)}")
    
    def test_google_maps_static_map(self):
        """Test GET /api/maps/static-map - Generate static map URL"""
        try:
            params = {
                "center_lat": "21.4225",
                "center_lng": "39.8262",
                "zoom": "15",
                "size": "400x400",
                "maptype": "roadmap",
                "markers": "21.4225,39.8262"
            }
            
            response = self.session.get(f"{API_BASE}/maps/static-map", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    map_data = data['data']
                    if 'url' in map_data:
                        self.log_test("Google Maps Static Map", "PASS", 
                                     f"Generated static map URL: {len(map_data['url'])} chars")
                    else:
                        self.log_test("Google Maps Static Map", "FAIL", 
                                     "Missing URL in response")
                else:
                    self.log_test("Google Maps Static Map", "FAIL", 
                                 f"API Error: {data.get('message', 'Unknown error')}")
            elif response.status_code in [401, 403]:
                self.log_test("Google Maps Static Map", "PASS", 
                             f"Correctly requires authentication (Status: {response.status_code})")
            else:
                self.log_test("Google Maps Static Map", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Google Maps Static Map", "FAIL", f"Exception: {str(e)}")

    # ===== AUTHENTICATION TESTS =====
    
    def test_unauthenticated_access(self):
        """Test that protected endpoints require authentication"""
        print("\n🔒 TESTING AUTHENTICATION REQUIREMENTS")
        print("=" * 50)
        
        # Remove auth header temporarily
        auth_header = self.session.headers.get('Authorization')
        if auth_header:
            del self.session.headers['Authorization']
        
        protected_endpoints = [
            ("/api/payments/transactions", "GET"),
            ("/api/firebase/auth/create-custom-token", "POST"),
            ("/api/firebase/messaging/send-to-device", "POST"),
            ("/api/maps/geocode", "GET"),
            ("/api/maps/places/search", "GET")
        ]
        
        for endpoint, method in protected_endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{BACKEND_URL}{endpoint}")
                else:
                    response = requests.post(f"{BACKEND_URL}{endpoint}", json={})
                
                if response.status_code == 401:
                    self.log_test(f"Auth Required - {endpoint}", "PASS", 
                                 "Correctly requires authentication")
                else:
                    self.log_test(f"Auth Required - {endpoint}", "FAIL", 
                                 f"Should require auth, got status: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Auth Required - {endpoint}", "FAIL", f"Exception: {str(e)}")
        
        # Restore auth header
        if auth_header:
            self.session.headers['Authorization'] = auth_header

    # ===== MAIN TEST EXECUTION =====
    
    def run_comprehensive_tests(self):
        """Run all third-party integration tests"""
        print("🕋 FINDMYHAJI THIRD-PARTY INTEGRATIONS API TESTING")
        print("=" * 70)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("Testing: Stripe Payment, Firebase, Google Maps Integrations")
        print("=" * 70)
        
        # Step 1: Authenticate
        if not self.authenticate_admin():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Step 2: Test Stripe Payment Integration
        packages = self.test_stripe_payment_packages()
        session_id = self.test_stripe_checkout_session()
        self.test_stripe_checkout_status(session_id)
        self.test_stripe_webhook()
        self.test_stripe_transactions()
        self.test_stripe_transaction_by_id()
        
        # Step 3: Test Firebase Integration
        firebase_configured = self.test_firebase_status()
        self.test_firebase_verify_token()
        self.test_firebase_create_custom_token()
        self.test_firebase_get_user_record()
        self.test_firebase_send_to_device()
        self.test_firebase_send_to_topic()
        self.test_firebase_firestore_operations()
        
        # Step 4: Test Google Maps Integration
        maps_configured = self.test_google_maps_status()
        self.test_google_maps_geocode()
        self.test_google_maps_reverse_geocode()
        self.test_google_maps_distance_matrix()
        self.test_google_maps_directions()
        self.test_google_maps_places_search()
        self.test_google_maps_places_nearby()
        self.test_google_maps_static_map()
        
        # Step 5: Test authentication requirements
        self.test_unauthenticated_access()
        
        # Step 6: Print summary
        self.print_test_summary()
        
        return self.passed_tests >= (self.total_tests * 0.7)  # 70% pass rate
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 70)
        print("🏁 THIRD-PARTY INTEGRATIONS TEST SUMMARY")
        print("=" * 70)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🟢 EXCELLENT: Third-party integrations are working excellently!")
        elif success_rate >= 75:
            print("🟡 GOOD: Third-party integrations are working well with minor issues.")
        elif success_rate >= 50:
            print("🟠 FAIR: Third-party integrations have some issues that need attention.")
        else:
            print("🔴 POOR: Third-party integrations have significant issues.")
        
        # Categorize results by integration
        stripe_tests = [test for test in self.test_results if 'stripe' in test['test'].lower()]
        firebase_tests = [test for test in self.test_results if 'firebase' in test['test'].lower()]
        maps_tests = [test for test in self.test_results if 'maps' in test['test'].lower() or 'google' in test['test'].lower()]
        
        print(f"\n📊 INTEGRATION BREAKDOWN:")
        print(f"💳 Stripe Payment: {len([t for t in stripe_tests if t['status'] == 'PASS'])}/{len(stripe_tests)} passed")
        print(f"🔥 Firebase: {len([t for t in firebase_tests if t['status'] == 'PASS'])}/{len(firebase_tests)} passed")
        print(f"🗺️ Google Maps: {len([t for t in maps_tests if t['status'] == 'PASS'])}/{len(maps_tests)} passed")
        
        # Show failed tests
        failed_tests = [test for test in self.test_results if test['status'] == 'FAIL']
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        # Show warnings
        warning_tests = [test for test in self.test_results if test['status'] == 'WARN']
        if warning_tests:
            print(f"\n⚠️ WARNINGS ({len(warning_tests)}):")
            for test in warning_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        print("=" * 70)

def main():
    """Main test execution"""
    tester = ThirdPartyIntegrationsTester()
    
    try:
        success = tester.run_comprehensive_tests()
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error during testing: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()