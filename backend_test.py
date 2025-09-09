#!/usr/bin/env python3
"""
FindMyHaji Backend API Testing Suite
3rd Party Configurations System Testing

This script tests the comprehensive 3rd Party Configurations backend API system
focusing on CRUD operations, authentication, backup/restore, and email testing.
"""

import requests
import json
import sys
import os
from datetime import datetime

# Configuration
BACKEND_URL = "https://28ed4ca0-5224-45ac-9ae5-cab06551907a.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Admin credentials from auth.js
ADMIN_EMAIL = "admin@findmyhaji.com"
ADMIN_PASSWORD = "password"

# Test configuration categories
CONFIGURATION_CATEGORIES = [
    'map-api', 'firebase-notification', 'recaptcha', 'apple-login', 
    'email-config', 'sms-config', 'payment-config', 'storage-config', 
    'app-settings', 'firebase-auth'
]

class ConfigurationTester:
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
    
    def test_get_all_configurations(self):
        """Test GET /api/configurations - Get all configurations"""
        print("\n📋 TESTING GET ALL CONFIGURATIONS")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{API_BASE}/configurations")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    configs = data['data']
                    self.log_test("GET All Configurations", "PASS", 
                                 f"Retrieved {len(configs)} configuration categories")
                    return configs
                else:
                    self.log_test("GET All Configurations", "FAIL", 
                                 "Invalid response format")
                    return None
            else:
                self.log_test("GET All Configurations", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("GET All Configurations", "FAIL", f"Exception: {str(e)}")
            return None
    
    def test_get_specific_configuration(self, category):
        """Test GET /api/configurations/:category - Get specific category configuration"""
        try:
            response = self.session.get(f"{API_BASE}/configurations/{category}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(f"GET Configuration - {category}", "PASS", 
                                 f"Retrieved {category} configuration")
                    return data.get('data', {})
                else:
                    self.log_test(f"GET Configuration - {category}", "FAIL", 
                                 "Invalid response format")
                    return None
            else:
                self.log_test(f"GET Configuration - {category}", "FAIL", 
                             f"Status: {response.status_code}")
                return None
                
        except Exception as e:
            self.log_test(f"GET Configuration - {category}", "FAIL", f"Exception: {str(e)}")
            return None
    
    def test_update_configuration(self, category, config_data):
        """Test PUT /api/configurations/update - Update configuration"""
        try:
            payload = {
                "category": category,
                "config": config_data
            }
            
            response = self.session.put(f"{API_BASE}/configurations/update", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(f"UPDATE Configuration - {category}", "PASS", 
                                 f"Updated {category} configuration successfully")
                    return True
                else:
                    self.log_test(f"UPDATE Configuration - {category}", "FAIL", 
                                 f"Update failed: {data.get('message', 'Unknown error')}")
                    return False
            else:
                self.log_test(f"UPDATE Configuration - {category}", "FAIL", 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test(f"UPDATE Configuration - {category}", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_email_configuration(self):
        """Test POST /api/configurations/test-email - Test email configuration"""
        print("\n📧 TESTING EMAIL CONFIGURATION")
        print("=" * 50)
        
        # First, set up a test email configuration
        email_config = {
            "host": "smtp.gmail.com",
            "port": "587",
            "encryption": "tls",
            "username": "test@findmyhaji.com",
            "password": "test_password",
            "emailId": "test@findmyhaji.com",
            "mailerName": "FindMyHaji Test"
        }
        
        # Update email configuration first
        update_success = self.test_update_configuration("email-config", email_config)
        
        if update_success:
            try:
                # Test email sending
                response = self.session.post(f"{API_BASE}/configurations/test-email", json={
                    "email": "test.recipient@findmyhaji.com"
                })
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_test("Email Configuration Test", "PASS", 
                                     "Email test completed successfully")
                    else:
                        self.log_test("Email Configuration Test", "WARN", 
                                     f"Email test failed: {data.get('message', 'Unknown error')}")
                else:
                    self.log_test("Email Configuration Test", "WARN", 
                                 f"Status: {response.status_code} (Expected for test environment)")
                    
            except Exception as e:
                self.log_test("Email Configuration Test", "WARN", 
                             f"Exception: {str(e)} (Expected for test environment)")
        else:
            self.log_test("Email Configuration Test", "SKIP", 
                         "Skipped due to configuration update failure")
    
    def test_backup_restore(self, category):
        """Test backup and restore functionality"""
        try:
            # Test backup creation
            response = self.session.post(f"{API_BASE}/configurations/backup/{category}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(f"BACKUP Configuration - {category}", "PASS", 
                                 f"Backup created for {category}")
                    
                    # Test restore from backup
                    restore_response = self.session.post(f"{API_BASE}/configurations/restore/{category}")
                    
                    if restore_response.status_code == 200:
                        restore_data = restore_response.json()
                        if restore_data.get('success'):
                            self.log_test(f"RESTORE Configuration - {category}", "PASS", 
                                         f"Restored {category} from backup")
                            return True
                        else:
                            self.log_test(f"RESTORE Configuration - {category}", "FAIL", 
                                         f"Restore failed: {restore_data.get('message', 'Unknown error')}")
                            return False
                    else:
                        self.log_test(f"RESTORE Configuration - {category}", "FAIL", 
                                     f"Restore status: {restore_response.status_code}")
                        return False
                else:
                    self.log_test(f"BACKUP Configuration - {category}", "FAIL", 
                                 f"Backup failed: {data.get('message', 'Unknown error')}")
                    return False
            else:
                self.log_test(f"BACKUP Configuration - {category}", "FAIL", 
                             f"Backup status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(f"BACKUP/RESTORE Configuration - {category}", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_configuration_history(self, category):
        """Test GET /api/configurations/history/:category - Get configuration history"""
        try:
            response = self.session.get(f"{API_BASE}/configurations/history/{category}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    history_data = data.get('data', {})
                    self.log_test(f"HISTORY Configuration - {category}", "PASS", 
                                 f"Retrieved history for {category}, version: {history_data.get('currentVersion', 'N/A')}")
                    return True
                else:
                    self.log_test(f"HISTORY Configuration - {category}", "FAIL", 
                                 "Invalid response format")
                    return False
            else:
                self.log_test(f"HISTORY Configuration - {category}", "FAIL", 
                             f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(f"HISTORY Configuration - {category}", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_public_configurations(self):
        """Test GET /api/configurations/public/:category - Get public configuration"""
        print("\n🌐 TESTING PUBLIC CONFIGURATIONS")
        print("=" * 50)
        
        # Test public categories (app-settings, recaptcha)
        public_categories = ['app-settings', 'recaptcha']
        
        for category in public_categories:
            try:
                # Test without authentication
                response = requests.get(f"{API_BASE}/configurations/public/{category}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success'):
                        self.log_test(f"PUBLIC Configuration - {category}", "PASS", 
                                     f"Retrieved public {category} configuration")
                    else:
                        self.log_test(f"PUBLIC Configuration - {category}", "FAIL", 
                                     "Invalid response format")
                else:
                    self.log_test(f"PUBLIC Configuration - {category}", "FAIL", 
                                 f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"PUBLIC Configuration - {category}", "FAIL", f"Exception: {str(e)}")
        
        # Test restricted category (should fail)
        try:
            response = requests.get(f"{API_BASE}/configurations/public/email-config")
            
            if response.status_code == 403:
                self.log_test("PUBLIC Configuration - Restricted Access", "PASS", 
                             "Correctly blocked access to restricted configuration")
            else:
                self.log_test("PUBLIC Configuration - Restricted Access", "FAIL", 
                             f"Should have blocked access, got status: {response.status_code}")
                
        except Exception as e:
            self.log_test("PUBLIC Configuration - Restricted Access", "FAIL", f"Exception: {str(e)}")
    
    def test_authentication_security(self):
        """Test authentication and security"""
        print("\n🔒 TESTING AUTHENTICATION & SECURITY")
        print("=" * 50)
        
        # Test without authentication
        try:
            response = requests.get(f"{API_BASE}/configurations")
            
            if response.status_code == 401:
                self.log_test("Authentication Required", "PASS", 
                             "Correctly rejected unauthenticated request")
            else:
                self.log_test("Authentication Required", "FAIL", 
                             f"Should have rejected request, got status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Authentication Required", "FAIL", f"Exception: {str(e)}")
        
        # Test with invalid token
        try:
            headers = {'Authorization': 'Bearer invalid_token_here'}
            response = requests.get(f"{API_BASE}/configurations", headers=headers)
            
            if response.status_code == 401:
                self.log_test("Invalid Token Rejection", "PASS", 
                             "Correctly rejected invalid token")
            else:
                self.log_test("Invalid Token Rejection", "FAIL", 
                             f"Should have rejected invalid token, got status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Token Rejection", "FAIL", f"Exception: {str(e)}")
    
    def test_input_validation(self):
        """Test input validation and error handling"""
        print("\n✅ TESTING INPUT VALIDATION")
        print("=" * 50)
        
        # Test invalid category
        try:
            response = self.session.put(f"{API_BASE}/configurations/update", json={
                "category": "invalid-category",
                "config": {"test": "value"}
            })
            
            if response.status_code == 400:
                self.log_test("Invalid Category Validation", "PASS", 
                             "Correctly rejected invalid category")
            else:
                self.log_test("Invalid Category Validation", "FAIL", 
                             f"Should have rejected invalid category, got status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Category Validation", "FAIL", f"Exception: {str(e)}")
        
        # Test missing required fields
        try:
            response = self.session.put(f"{API_BASE}/configurations/update", json={
                "category": "map-api"
                # Missing config field
            })
            
            if response.status_code == 400:
                self.log_test("Missing Fields Validation", "PASS", 
                             "Correctly rejected missing required fields")
            else:
                self.log_test("Missing Fields Validation", "FAIL", 
                             f"Should have rejected missing fields, got status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Missing Fields Validation", "FAIL", f"Exception: {str(e)}")
    
    def run_comprehensive_tests(self):
        """Run all configuration tests"""
        print("🕋 FINDMYHAJI 3RD PARTY CONFIGURATIONS API TESTING")
        print("=" * 70)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print(f"Test Categories: {', '.join(CONFIGURATION_CATEGORIES)}")
        print("=" * 70)
        
        # Step 1: Authenticate
        if not self.authenticate_admin():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Step 2: Test authentication and security
        self.test_authentication_security()
        
        # Step 3: Test input validation
        self.test_input_validation()
        
        # Step 4: Test getting all configurations
        all_configs = self.test_get_all_configurations()
        
        # Step 5: Test individual configuration operations
        print("\n🔧 TESTING INDIVIDUAL CONFIGURATION OPERATIONS")
        print("=" * 50)
        
        test_categories = ['map-api', 'firebase-notification', 'recaptcha', 'app-settings']
        
        for category in test_categories:
            print(f"\n--- Testing {category.upper()} ---")
            
            # Get specific configuration
            config_data = self.test_get_specific_configuration(category)
            
            # Create test configuration data
            if category == 'map-api':
                test_config = {
                    "apiKey": "test_google_maps_api_key_12345",
                    "enabled": True,
                    "provider": "google",
                    "features": ["geocoding", "directions", "places"]
                }
            elif category == 'firebase-notification':
                test_config = {
                    "serverKey": "test_firebase_server_key_12345",
                    "senderId": "123456789",
                    "enabled": True,
                    "priority": "high"
                }
            elif category == 'recaptcha':
                test_config = {
                    "siteKey": "test_recaptcha_site_key_12345",
                    "secretKey": "test_recaptcha_secret_key_12345",
                    "enabled": True,
                    "version": "v3",
                    "threshold": 0.5
                }
            elif category == 'app-settings':
                test_config = {
                    "appName": "FindMyHaji",
                    "appVersion": "3.0.0",
                    "appDescription": "Your Pilgrimage. Connected.",
                    "supportEmail": "support@findmyhaji.com",
                    "primaryColor": "#0f4c3a",
                    "secondaryColor": "#d4af37",
                    "timezone": "Asia/Riyadh",
                    "defaultLanguage": "en",
                    "enabledLanguages": ["en", "ar", "ur"],
                    "maintenanceMode": False,
                    "forceUpdate": False,
                    "minAppVersion": "2.0.0"
                }
            else:
                test_config = {"enabled": True, "testValue": f"test_{category}"}
            
            # Update configuration
            self.test_update_configuration(category, test_config)
            
            # Test backup and restore
            self.test_backup_restore(category)
            
            # Test configuration history
            self.test_configuration_history(category)
        
        # Step 6: Test email configuration
        self.test_email_configuration()
        
        # Step 7: Test public configurations
        self.test_public_configurations()
        
        # Step 8: Print summary
        self.print_test_summary()
        
        return self.passed_tests == self.total_tests
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 70)
        print("🏁 TEST SUMMARY")
        print("=" * 70)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🟢 EXCELLENT: 3rd Party Configurations API is working excellently!")
        elif success_rate >= 75:
            print("🟡 GOOD: 3rd Party Configurations API is working well with minor issues.")
        elif success_rate >= 50:
            print("🟠 FAIR: 3rd Party Configurations API has some issues that need attention.")
        else:
            print("🔴 POOR: 3rd Party Configurations API has significant issues.")
        
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
    tester = ConfigurationTester()
    
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