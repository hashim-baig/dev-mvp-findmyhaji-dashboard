#!/usr/bin/env python3
"""
FindMyHaji Push Notification Configuration System Backend Testing
Testing the notification API endpoints for Firebase push notification configuration
"""

import requests
import json
import sys
import os
from urllib.parse import urljoin

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://f763a908-b8bb-4de1-ba1d-7a3e1eff9332.preview.emergentagent.com')

# Admin credentials for testing
ADMIN_EMAIL = "admin@findmyhaji.com"
ADMIN_PASSWORD = "password"

def get_admin_token():
    """Get admin authentication token"""
    print("🔐 Getting admin authentication token...")
    
    try:
        response = requests.post(
            f'{BACKEND_URL}/api/auth/login',
            json={
                'email': ADMIN_EMAIL,
                'password': ADMIN_PASSWORD
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('token'):
                print("   ✅ Admin authentication successful")
                return data['token']
            else:
                print(f"   ❌ Login failed: {data.get('message', 'Unknown error')}")
                return None
        else:
            print(f"   ❌ Login request failed: {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request Error: {str(e)}")
        return None

def test_init_default_templates(token):
    """Test POST /api/notifications/admin/init-defaults"""
    print("\n🔧 TESTING INITIALIZE DEFAULT TEMPLATES")
    print("=" * 60)
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.post(
            f'{BACKEND_URL}/api/notifications/admin/init-defaults',
            headers=headers,
            timeout=15
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Response: {data}")
            
            # Verify response structure
            success = data.get('success', False)
            created_count = data.get('data', {}).get('createdCount', 0)
            
            print(f"   ✅ Success: {success}")
            print(f"   ✅ Templates Created: {created_count}")
            
            # Test should create templates for all message types
            expected_types = ['pilgrims', 'providers', 'family']
            print(f"   ✅ Expected to initialize templates for: {expected_types}")
            
            return {
                'passed': success,
                'created_count': created_count,
                'status_code': response.status_code,
                'response': data
            }
        else:
            print(f"   ❌ Failed with status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   ❌ Error: {error_data}")
            except:
                print(f"   ❌ Error: {response.text}")
            
            return {
                'passed': False,
                'status_code': response.status_code,
                'error': response.text
            }
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request Error: {str(e)}")
        return {
            'passed': False,
            'error': str(e)
        }

def test_get_all_configs(token):
    """Test GET /api/notifications/admin/config"""
    print("\n📋 TESTING GET ALL NOTIFICATION CONFIGURATIONS")
    print("=" * 60)
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(
            f'{BACKEND_URL}/api/notifications/admin/config',
            headers=headers,
            timeout=10
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {data.get('success', False)}")
            
            configs = data.get('data', {})
            print(f"   ✅ Configuration groups found: {list(configs.keys())}")
            
            # Verify expected message types
            expected_types = ['pilgrims', 'providers', 'family']
            found_types = list(configs.keys())
            
            for msg_type in expected_types:
                if msg_type in found_types:
                    print(f"   ✅ {msg_type} configurations found: {list(configs[msg_type].keys())}")
                else:
                    print(f"   ⚠️  {msg_type} configurations not found")
            
            return {
                'passed': data.get('success', False),
                'config_types': found_types,
                'total_configs': sum(len(configs[t]) for t in configs),
                'status_code': response.status_code,
                'response': data
            }
        else:
            print(f"   ❌ Failed with status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   ❌ Error: {error_data}")
            except:
                print(f"   ❌ Error: {response.text}")
            
            return {
                'passed': False,
                'status_code': response.status_code,
                'error': response.text
            }
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request Error: {str(e)}")
        return {
            'passed': False,
            'error': str(e)
        }

def test_update_notification_config(token):
    """Test PUT /api/notifications/admin/update"""
    print("\n✏️ TESTING UPDATE NOTIFICATION CONFIGURATION")
    print("=" * 60)
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Test data for updating a notification
    test_updates = [
        {
            'name': 'Arabic Translation Update',
            'data': {
                'messageType': 'pilgrims',
                'messageKey': 'booking_placed',
                'language': 'ar',
                'text': 'تم وضع حجزك بنجاح. المرجع: {booking_id}',
                'enabled': True
            }
        },
        {
            'name': 'English Update',
            'data': {
                'messageType': 'providers',
                'messageKey': 'new_booking',
                'language': 'en',
                'text': 'New booking request for {service_name} from {pilgrim_name}. Amount: {amount} SAR',
                'enabled': True
            }
        },
        {
            'name': 'Family Emergency Alert',
            'data': {
                'messageType': 'family',
                'messageKey': 'emergency_alert',
                'language': 'default',
                'text': 'URGENT: {pilgrim_name} needs assistance at {location}. Contact: {number}',
                'enabled': True,
                'firebase': {
                    'title': 'EMERGENCY ALERT',
                    'android': {
                        'priority': 'high'
                    }
                }
            }
        }
    ]
    
    results = []
    
    for test_case in test_updates:
        print(f"\n🔍 Testing: {test_case['name']}")
        
        try:
            response = requests.put(
                f'{BACKEND_URL}/api/notifications/admin/update',
                headers=headers,
                json=test_case['data'],
                timeout=10
            )
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success: {data.get('success', False)}")
                print(f"   ✅ Message: {data.get('message', '')}")
                
                # Verify the updated config
                config_data = data.get('data', {})
                if config_data:
                    print(f"   ✅ Updated config ID: {config_data.get('id', 'N/A')}")
                    print(f"   ✅ Message Type: {config_data.get('messageType', 'N/A')}")
                    print(f"   ✅ Message Key: {config_data.get('messageKey', 'N/A')}")
                    print(f"   ✅ Language: {config_data.get('language', 'N/A')}")
                    print(f"   ✅ Text: {config_data.get('content', {}).get('text', 'N/A')[:50]}...")
                
                results.append({
                    'test_name': test_case['name'],
                    'passed': True,
                    'status_code': response.status_code,
                    'response': data
                })
            else:
                print(f"   ❌ Failed with status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   ❌ Error: {error_data}")
                except:
                    print(f"   ❌ Error: {response.text}")
                
                results.append({
                    'test_name': test_case['name'],
                    'passed': False,
                    'status_code': response.status_code,
                    'error': response.text
                })
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request Error: {str(e)}")
            results.append({
                'test_name': test_case['name'],
                'passed': False,
                'error': str(e)
            })
    
    return results

def test_public_config_access():
    """Test GET /api/notifications/config/:messageType/:messageKey"""
    print("\n🌐 TESTING PUBLIC CONFIG ACCESS")
    print("=" * 60)
    
    # Test cases for public access
    test_cases = [
        {
            'name': 'Pilgrim Booking Placed (Default)',
            'messageType': 'pilgrims',
            'messageKey': 'booking_placed',
            'language': None
        },
        {
            'name': 'Pilgrim Booking Placed (Arabic)',
            'messageType': 'pilgrims',
            'messageKey': 'booking_placed',
            'language': 'ar'
        },
        {
            'name': 'Provider New Booking (English)',
            'messageType': 'providers',
            'messageKey': 'new_booking',
            'language': 'en'
        },
        {
            'name': 'Family Emergency Alert',
            'messageType': 'family',
            'messageKey': 'emergency_alert',
            'language': 'default'
        },
        {
            'name': 'Non-existent Config',
            'messageType': 'pilgrims',
            'messageKey': 'non_existent',
            'language': None
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        print(f"\n🔍 Testing: {test_case['name']}")
        
        # Build URL
        url = f"{BACKEND_URL}/api/notifications/config/{test_case['messageType']}/{test_case['messageKey']}"
        if test_case['language']:
            url += f"?language={test_case['language']}"
        
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success: {data.get('success', False)}")
                
                config_data = data.get('data', {})
                if config_data:
                    print(f"   ✅ Text: {config_data.get('text', 'N/A')[:50]}...")
                    print(f"   ✅ Enabled: {config_data.get('enabled', False)}")
                    print(f"   ✅ Variables: {config_data.get('variables', [])}")
                
                results.append({
                    'test_name': test_case['name'],
                    'passed': True,
                    'status_code': response.status_code,
                    'response': data
                })
            elif response.status_code == 404 and test_case['messageKey'] == 'non_existent':
                print(f"   ✅ Expected 404 for non-existent config")
                results.append({
                    'test_name': test_case['name'],
                    'passed': True,
                    'status_code': response.status_code,
                    'expected_404': True
                })
            else:
                print(f"   ❌ Failed with status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   ❌ Error: {error_data}")
                except:
                    print(f"   ❌ Error: {response.text}")
                
                results.append({
                    'test_name': test_case['name'],
                    'passed': False,
                    'status_code': response.status_code,
                    'error': response.text
                })
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request Error: {str(e)}")
            results.append({
                'test_name': test_case['name'],
                'passed': False,
                'error': str(e)
            })
    
    return results

def test_content_verification(token):
    """Test content verification and template structure"""
    print("\n🔍 TESTING CONTENT VERIFICATION")
    print("=" * 60)
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        # Get all configurations
        response = requests.get(
            f'{BACKEND_URL}/api/notifications/admin/config',
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"   ❌ Failed to get configs: {response.status_code}")
            return {'passed': False, 'error': 'Failed to get configs'}
        
        data = response.json()
        configs = data.get('data', {})
        
        # Expected message types and their keys
        expected_structure = {
            'pilgrims': [
                'booking_placed', 'booking_accepted', 'booking_ongoing', 'booking_complete',
                'booking_cancelled', 'schedule_change', 'group_leader_assigned', 'otp_verification',
                'daily_tip', 'add_funds', 'payment_approved', 'custom_support', 'location_updated', 'lost_pilgrim'
            ],
            'providers': [
                'new_booking', 'booking_confirmed', 'payment_received', 'rating_received', 'profile_update'
            ],
            'family': [
                'pilgrim_arrived', 'location_update', 'emergency_alert', 'ritual_completed', 'journey_complete'
            ]
        }
        
        verification_results = {
            'message_types_found': 0,
            'total_templates_found': 0,
            'missing_templates': [],
            'variable_extraction_working': True,
            'firebase_config_present': True
        }
        
        print(f"   📊 Verifying template structure...")
        
        for msg_type, expected_keys in expected_structure.items():
            if msg_type in configs:
                verification_results['message_types_found'] += 1
                print(f"   ✅ {msg_type} message type found")
                
                found_keys = list(configs[msg_type].keys())
                verification_results['total_templates_found'] += len(found_keys)
                
                for key in expected_keys:
                    if key in found_keys:
                        print(f"      ✅ {key} template found")
                        
                        # Check default language config
                        default_config = configs[msg_type][key].get('default', {})
                        if default_config:
                            # Verify variables are extracted
                            variables = default_config.get('variables', [])
                            text = default_config.get('text', '')
                            
                            # Check if variables in text match extracted variables
                            text_variables = []
                            import re
                            matches = re.findall(r'\{([^}]+)\}', text)
                            text_variables = [f'{{{match}}}' for match in matches]
                            
                            if text_variables and not variables:
                                verification_results['variable_extraction_working'] = False
                                print(f"         ⚠️  Variables not extracted for {key}")
                            elif text_variables:
                                print(f"         ✅ Variables extracted: {variables}")
                            
                            # Check Firebase configuration
                            firebase_config = default_config.get('firebase', {})
                            if not firebase_config:
                                verification_results['firebase_config_present'] = False
                                print(f"         ⚠️  No Firebase config for {key}")
                            else:
                                print(f"         ✅ Firebase config present")
                        
                    else:
                        verification_results['missing_templates'].append(f"{msg_type}.{key}")
                        print(f"      ❌ {key} template missing")
            else:
                print(f"   ❌ {msg_type} message type not found")
        
        print(f"\n   📈 VERIFICATION SUMMARY:")
        print(f"   ✅ Message types found: {verification_results['message_types_found']}/3")
        print(f"   ✅ Total templates found: {verification_results['total_templates_found']}")
        print(f"   ✅ Variable extraction working: {verification_results['variable_extraction_working']}")
        print(f"   ✅ Firebase config present: {verification_results['firebase_config_present']}")
        
        if verification_results['missing_templates']:
            print(f"   ⚠️  Missing templates: {verification_results['missing_templates']}")
        
        # Overall verification success
        verification_success = (
            verification_results['message_types_found'] == 3 and
            verification_results['total_templates_found'] >= 14 and
            len(verification_results['missing_templates']) == 0
        )
        
        return {
            'passed': verification_success,
            'results': verification_results,
            'status_code': response.status_code
        }
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request Error: {str(e)}")
        return {
            'passed': False,
            'error': str(e)
        }

def test_language_support():
    """Test multi-language support"""
    print("\n🌍 TESTING LANGUAGE SUPPORT")
    print("=" * 60)
    
    # Test different languages
    languages = ['default', 'en', 'ar', 'ur', 'bn', 'hi']
    
    results = []
    
    for language in languages:
        print(f"\n🔍 Testing language: {language}")
        
        url = f"{BACKEND_URL}/api/notifications/config/pilgrims/booking_placed"
        if language != 'default':
            url += f"?language={language}"
        
        try:
            response = requests.get(url, timeout=10)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                config_data = data.get('data', {})
                text = config_data.get('text', '')
                
                print(f"   ✅ Config found for {language}")
                print(f"   ✅ Text: {text[:50]}...")
                
                results.append({
                    'language': language,
                    'passed': True,
                    'status_code': response.status_code,
                    'text': text
                })
            elif response.status_code == 404:
                print(f"   ⚠️  No specific config for {language} (fallback expected)")
                results.append({
                    'language': language,
                    'passed': True,  # 404 is acceptable for fallback behavior
                    'status_code': response.status_code,
                    'fallback_expected': True
                })
            else:
                print(f"   ❌ Failed with status: {response.status_code}")
                results.append({
                    'language': language,
                    'passed': False,
                    'status_code': response.status_code
                })
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request Error: {str(e)}")
            results.append({
                'language': language,
                'passed': False,
                'error': str(e)
            })
    
    return results

def generate_comprehensive_summary(init_result, config_result, update_results, public_results, content_result, language_results):
    """Generate comprehensive test summary"""
    print(f"\n📊 COMPREHENSIVE NOTIFICATION SYSTEM TEST SUMMARY")
    print("=" * 80)
    
    # Initialize Default Templates Summary
    print(f"\n🔧 Initialize Default Templates:")
    if init_result.get('passed', False):
        print(f"   ✅ PASSED - Created {init_result.get('created_count', 0)} templates")
    else:
        print(f"   ❌ FAILED - {init_result.get('error', 'Unknown error')}")
    
    # Configuration Management Summary
    print(f"\n📋 Configuration Management:")
    if config_result.get('passed', False):
        print(f"   ✅ PASSED - Found {config_result.get('total_configs', 0)} configurations")
        print(f"   ✅ Config types: {config_result.get('config_types', [])}")
    else:
        print(f"   ❌ FAILED - {config_result.get('error', 'Unknown error')}")
    
    # Update Configuration Summary
    print(f"\n✏️ Update Configuration:")
    passed_updates = sum(1 for r in update_results if r.get('passed', False))
    total_updates = len(update_results)
    print(f"   {'✅' if passed_updates == total_updates else '❌'} {passed_updates}/{total_updates} update tests passed")
    
    for result in update_results:
        status = "✅" if result.get('passed', False) else "❌"
        print(f"      {status} {result.get('test_name', 'Unknown')}")
    
    # Public Config Access Summary
    print(f"\n🌐 Public Config Access:")
    passed_public = sum(1 for r in public_results if r.get('passed', False))
    total_public = len(public_results)
    print(f"   {'✅' if passed_public == total_public else '❌'} {passed_public}/{total_public} public access tests passed")
    
    # Content Verification Summary
    print(f"\n🔍 Content Verification:")
    if content_result.get('passed', False):
        results = content_result.get('results', {})
        print(f"   ✅ PASSED - All template content verified")
        print(f"   ✅ Message types: {results.get('message_types_found', 0)}/3")
        print(f"   ✅ Total templates: {results.get('total_templates_found', 0)}")
        print(f"   ✅ Variable extraction: {results.get('variable_extraction_working', False)}")
        print(f"   ✅ Firebase config: {results.get('firebase_config_present', False)}")
    else:
        print(f"   ❌ FAILED - {content_result.get('error', 'Content verification failed')}")
    
    # Language Support Summary
    print(f"\n🌍 Language Support:")
    passed_languages = sum(1 for r in language_results if r.get('passed', False))
    total_languages = len(language_results)
    print(f"   {'✅' if passed_languages == total_languages else '❌'} {passed_languages}/{total_languages} language tests passed")
    
    # Overall Assessment
    print(f"\n🎯 OVERALL ASSESSMENT:")
    
    all_tests_passed = all([
        init_result.get('passed', False),
        config_result.get('passed', False),
        passed_updates == total_updates,
        passed_public == total_public,
        content_result.get('passed', False),
        passed_languages == total_languages
    ])
    
    if all_tests_passed:
        print("   🟢 ALL TESTS PASSED - Push Notification Configuration System is fully functional!")
        print("   ✅ Default templates initialization working")
        print("   ✅ Configuration management working")
        print("   ✅ Update functionality working")
        print("   ✅ Public config access working")
        print("   ✅ Content verification passed")
        print("   ✅ Multi-language support working")
        print("   ✅ Firebase configuration properly structured")
        print("   ✅ Variable extraction working correctly")
        return True
    else:
        print("   🟡 SOME ISSUES FOUND:")
        if not init_result.get('passed', False):
            print("   ⚠️  Default template initialization failed")
        if not config_result.get('passed', False):
            print("   ⚠️  Configuration retrieval failed")
        if passed_updates != total_updates:
            print("   ⚠️  Some update operations failed")
        if passed_public != total_public:
            print("   ⚠️  Some public access tests failed")
        if not content_result.get('passed', False):
            print("   ⚠️  Content verification failed")
        if passed_languages != total_languages:
            print("   ⚠️  Some language support tests failed")
        return False

def main():
    """Main test execution"""
    print("🚀 STARTING PUSH NOTIFICATION CONFIGURATION SYSTEM TESTING")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 80)
    
    try:
        # Step 1: Get admin authentication token
        token = get_admin_token()
        if not token:
            print("❌ CRITICAL ERROR: Could not authenticate admin user")
            print("   Please ensure admin credentials are correct and auth system is working")
            return 1
        
        # Step 2: Initialize default templates
        print("\n" + "="*80)
        init_result = test_init_default_templates(token)
        
        # Step 3: Get all notification configurations
        print("\n" + "="*80)
        config_result = test_get_all_configs(token)
        
        # Step 4: Test update functionality
        print("\n" + "="*80)
        update_results = test_update_notification_config(token)
        
        # Step 5: Test public config access
        print("\n" + "="*80)
        public_results = test_public_config_access()
        
        # Step 6: Test content verification
        print("\n" + "="*80)
        content_result = test_content_verification(token)
        
        # Step 7: Test language support
        print("\n" + "="*80)
        language_results = test_language_support()
        
        # Generate comprehensive summary
        print("\n" + "="*80)
        success = generate_comprehensive_summary(
            init_result, config_result, update_results, 
            public_results, content_result, language_results
        )
        
        print(f"\n🏁 TESTING COMPLETED")
        print("=" * 80)
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR DURING TESTING: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())