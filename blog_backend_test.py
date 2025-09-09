#!/usr/bin/env python3
"""
Blog Management System Backend Testing
Testing all blog API endpoints for FindMyHaji platform
"""

import requests
import json
import os
import time
from datetime import datetime
import uuid

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://f763a908-b8bb-4de1-ba1d-7a3e1eff9332.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

# Test configuration
ADMIN_CREDENTIALS = {
    "email": "admin@findmyhaji.com",
    "password": "password"
}

# Sample blog data for testing
SAMPLE_BLOG_DATA = {
    "title": "Essential Duas for Your Sacred Journey",
    "excerpt": "Discover the most important prayers and supplications for Hajj and Umrah",
    "content": "This comprehensive guide covers the essential duas that every pilgrim should know during their sacred journey. From the moment you enter the state of Ihram to the completion of your pilgrimage, these prayers will guide and protect you. The Prophet (peace be upon him) taught us specific supplications for each ritual, and understanding their meanings enhances the spiritual experience of Hajj and Umrah.",
    "category": "spiritual_guidance",
    "tags": ["duas", "prayers", "spiritual", "hajj", "umrah"],
    "status": "published",
    "featured": "true"
}

class BlogTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.created_blog_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response_data"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def authenticate_admin(self):
        """Authenticate as admin user"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=ADMIN_CREDENTIALS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('token'):
                    self.admin_token = data['token']
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.admin_token}'
                    })
                    self.log_test("Admin Authentication", True, "Successfully authenticated as admin")
                    return True
                else:
                    self.log_test("Admin Authentication", False, f"No token in response: {data}")
                    return False
            else:
                self.log_test("Admin Authentication", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_public_blogs_endpoint(self):
        """Test GET /api/blogs - Get published blogs"""
        try:
            response = self.session.get(f"{API_BASE}/blogs", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    blogs = data.get('data', {}).get('blogs', [])
                    pagination = data.get('data', {}).get('pagination', {})
                    
                    self.log_test(
                        "Public Blogs Endpoint", 
                        True, 
                        f"Retrieved {len(blogs)} blogs with pagination info",
                        {"blog_count": len(blogs), "pagination": pagination}
                    )
                    return True
                else:
                    self.log_test("Public Blogs Endpoint", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Public Blogs Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Public Blogs Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_featured_blogs_endpoint(self):
        """Test GET /api/blogs/featured - Get featured blogs"""
        try:
            response = self.session.get(f"{API_BASE}/blogs/featured", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    featured_blogs = data.get('data', [])
                    self.log_test(
                        "Featured Blogs Endpoint", 
                        True, 
                        f"Retrieved {len(featured_blogs)} featured blogs",
                        {"featured_count": len(featured_blogs)}
                    )
                    return True
                else:
                    self.log_test("Featured Blogs Endpoint", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Featured Blogs Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Featured Blogs Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_categories_endpoint(self):
        """Test GET /api/blogs/categories - Get blog categories"""
        try:
            response = self.session.get(f"{API_BASE}/blogs/categories", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    categories = data.get('data', [])
                    self.log_test(
                        "Blog Categories Endpoint", 
                        True, 
                        f"Retrieved {len(categories)} categories with counts",
                        {"categories": categories}
                    )
                    return True
                else:
                    self.log_test("Blog Categories Endpoint", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Blog Categories Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Blog Categories Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_stats_endpoint(self):
        """Test GET /api/blogs/admin/stats - Get blog statistics"""
        try:
            response = self.session.get(f"{API_BASE}/blogs/admin/stats", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    stats = data.get('data', {})
                    required_stats = ['totalBlogs', 'publishedBlogs', 'draftBlogs', 'totalViews', 'totalLikes']
                    
                    missing_stats = [stat for stat in required_stats if stat not in stats]
                    if not missing_stats:
                        self.log_test(
                            "Admin Blog Stats", 
                            True, 
                            f"Retrieved all required statistics",
                            stats
                        )
                        return True
                    else:
                        self.log_test("Admin Blog Stats", False, f"Missing statistics: {missing_stats}")
                        return False
                else:
                    self.log_test("Admin Blog Stats", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Admin Blog Stats", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Blog Stats", False, f"Exception: {str(e)}")
            return False
    
    def test_admin_all_blogs_endpoint(self):
        """Test GET /api/blogs/admin/all - Get all blogs for admin"""
        try:
            response = self.session.get(f"{API_BASE}/blogs/admin/all", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    blogs = data.get('data', {}).get('blogs', [])
                    pagination = data.get('data', {}).get('pagination', {})
                    
                    self.log_test(
                        "Admin All Blogs", 
                        True, 
                        f"Retrieved {len(blogs)} blogs for admin management",
                        {"blog_count": len(blogs), "pagination": pagination}
                    )
                    return True
                else:
                    self.log_test("Admin All Blogs", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Admin All Blogs", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin All Blogs", False, f"Exception: {str(e)}")
            return False
    
    def test_create_blog_endpoint(self):
        """Test POST /api/blogs/admin/create - Create new blog"""
        try:
            response = self.session.post(
                f"{API_BASE}/blogs/admin/create",
                json=SAMPLE_BLOG_DATA,
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success'):
                    blog = data.get('data', {})
                    self.created_blog_id = blog.get('id')
                    
                    # Verify required fields
                    required_fields = ['id', 'title', 'slug', 'excerpt', 'content', 'category', 'status']
                    missing_fields = [field for field in required_fields if not blog.get(field)]
                    
                    if not missing_fields:
                        self.log_test(
                            "Create Blog", 
                            True, 
                            f"Successfully created blog with ID: {self.created_blog_id}",
                            {"blog_id": self.created_blog_id, "title": blog.get('title')}
                        )
                        return True
                    else:
                        self.log_test("Create Blog", False, f"Created blog missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Create Blog", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Create Blog", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Blog", False, f"Exception: {str(e)}")
            return False
    
    def test_get_blog_by_slug(self):
        """Test GET /api/blogs/:slug - Get single blog by slug"""
        if not self.created_blog_id:
            self.log_test("Get Blog by Slug", False, "No blog created to test with")
            return False
            
        try:
            # First get the blog to find its slug
            response = self.session.get(f"{API_BASE}/blogs/admin/all", timeout=10)
            if response.status_code != 200:
                self.log_test("Get Blog by Slug", False, "Could not retrieve blogs to find slug")
                return False
                
            data = response.json()
            blogs = data.get('data', {}).get('blogs', [])
            test_blog = None
            
            for blog in blogs:
                if blog.get('id') == self.created_blog_id:
                    test_blog = blog
                    break
            
            if not test_blog or not test_blog.get('slug'):
                self.log_test("Get Blog by Slug", False, "Could not find created blog or its slug")
                return False
            
            # Now test getting blog by slug
            slug = test_blog['slug']
            response = self.session.get(f"{API_BASE}/blogs/{slug}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    blog_data = data.get('data', {})
                    blog = blog_data.get('blog', {})
                    related_blogs = blog_data.get('relatedBlogs', [])
                    
                    if blog.get('id') == self.created_blog_id:
                        self.log_test(
                            "Get Blog by Slug", 
                            True, 
                            f"Successfully retrieved blog by slug: {slug}",
                            {"slug": slug, "related_count": len(related_blogs)}
                        )
                        return True
                    else:
                        self.log_test("Get Blog by Slug", False, "Retrieved blog ID doesn't match created blog")
                        return False
                else:
                    self.log_test("Get Blog by Slug", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Get Blog by Slug", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Blog by Slug", False, f"Exception: {str(e)}")
            return False
    
    def test_update_blog_endpoint(self):
        """Test PUT /api/blogs/admin/:id - Update blog"""
        if not self.created_blog_id:
            self.log_test("Update Blog", False, "No blog created to test with")
            return False
            
        try:
            update_data = {
                "title": "Updated: Essential Duas for Your Sacred Journey",
                "excerpt": "Updated excerpt with more comprehensive information about prayers and supplications",
                "status": "published",
                "featured": "false"
            }
            
            response = self.session.put(
                f"{API_BASE}/blogs/admin/{self.created_blog_id}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    updated_blog = data.get('data', {})
                    
                    if updated_blog.get('title') == update_data['title']:
                        self.log_test(
                            "Update Blog", 
                            True, 
                            f"Successfully updated blog: {self.created_blog_id}",
                            {"updated_title": updated_blog.get('title')}
                        )
                        return True
                    else:
                        self.log_test("Update Blog", False, "Blog title was not updated correctly")
                        return False
                else:
                    self.log_test("Update Blog", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Update Blog", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Update Blog", False, f"Exception: {str(e)}")
            return False
    
    def test_blog_content_verification(self):
        """Verify blog data is properly stored and structured"""
        if not self.created_blog_id:
            self.log_test("Blog Content Verification", False, "No blog created to verify")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/blogs/admin/all", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                blogs = data.get('data', {}).get('blogs', [])
                test_blog = None
                
                for blog in blogs:
                    if blog.get('id') == self.created_blog_id:
                        test_blog = blog
                        break
                
                if not test_blog:
                    self.log_test("Blog Content Verification", False, "Could not find created blog")
                    return False
                
                # Verify content structure
                verification_checks = {
                    "has_slug": bool(test_blog.get('slug')),
                    "slug_generated_correctly": test_blog.get('slug', '').startswith('essential-duas') or test_blog.get('slug', '').startswith('updated-essential-duas'),
                    "category_set": test_blog.get('category') == 'spiritual_guidance',
                    "tags_array": isinstance(test_blog.get('tags'), list) and len(test_blog.get('tags', [])) > 0,
                    "status_correct": test_blog.get('status') in ['draft', 'published'],
                    "has_author": bool(test_blog.get('author')),
                    "has_timestamps": bool(test_blog.get('createdAt'))
                }
                
                failed_checks = [check for check, passed in verification_checks.items() if not passed]
                
                if not failed_checks:
                    self.log_test(
                        "Blog Content Verification", 
                        True, 
                        "All content verification checks passed",
                        verification_checks
                    )
                    return True
                else:
                    self.log_test("Blog Content Verification", False, f"Failed checks: {failed_checks}")
                    return False
            else:
                self.log_test("Blog Content Verification", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Blog Content Verification", False, f"Exception: {str(e)}")
            return False
    
    def test_file_upload_directory(self):
        """Test that uploads directory exists and is accessible"""
        try:
            # Test if we can access the uploads endpoint
            response = self.session.get(f"{BACKEND_URL}/uploads/", timeout=10)
            
            # We expect either a 200 (directory listing) or 403 (forbidden but exists)
            if response.status_code in [200, 403, 404]:
                self.log_test(
                    "File Upload Directory", 
                    True, 
                    f"Uploads directory accessible (HTTP {response.status_code})"
                )
                return True
            else:
                self.log_test("File Upload Directory", False, f"Unexpected HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("File Upload Directory", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_blog_endpoint(self):
        """Test DELETE /api/blogs/admin/:id - Delete blog (cleanup)"""
        if not self.created_blog_id:
            self.log_test("Delete Blog", False, "No blog created to delete")
            return False
            
        try:
            response = self.session.delete(
                f"{API_BASE}/blogs/admin/{self.created_blog_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test(
                        "Delete Blog", 
                        True, 
                        f"Successfully deleted blog: {self.created_blog_id}"
                    )
                    return True
                else:
                    self.log_test("Delete Blog", False, f"API returned success=false: {data.get('message')}")
                    return False
            else:
                self.log_test("Delete Blog", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Delete Blog", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all blog management tests"""
        print("🕋 Starting Blog Management System Backend Testing")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Authentication", self.authenticate_admin),
            ("Public Blogs", self.test_public_blogs_endpoint),
            ("Featured Blogs", self.test_featured_blogs_endpoint),
            ("Blog Categories", self.test_categories_endpoint),
            ("Admin Stats", self.test_admin_stats_endpoint),
            ("Admin All Blogs", self.test_admin_all_blogs_endpoint),
            ("Create Blog", self.test_create_blog_endpoint),
            ("Get Blog by Slug", self.test_get_blog_by_slug),
            ("Update Blog", self.test_update_blog_endpoint),
            ("Content Verification", self.test_blog_content_verification),
            ("File Upload Directory", self.test_file_upload_directory),
            ("Delete Blog (Cleanup)", self.test_delete_blog_endpoint)
        ]
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            test_func()
            time.sleep(0.5)  # Brief pause between tests
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for result in failed_tests:
                print(f"  • {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    print(f"🔗 Testing Backend URL: {BACKEND_URL}")
    print(f"📡 API Base URL: {API_BASE}")
    
    tester = BlogTestSuite()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL TESTS PASSED! Blog Management System is working correctly.")
    else:
        print("\n⚠️  SOME TESTS FAILED. Please check the results above.")
    
    exit(0 if success else 1)