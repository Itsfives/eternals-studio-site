#!/usr/bin/env python3
"""
Dashboard Authentication Specific Test
Tests the exact issues mentioned in the review request
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class DashboardAuthTester:
    def __init__(self, base_url="https://graphix-hub-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.admin_user = None
        
        print(f"🔐 DASHBOARD AUTHENTICATION TESTING")
        print(f"📍 API URL: {self.api_url}")
        print("=" * 70)

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make API request with proper error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                if endpoint == 'auth/login':
                    # Use form data for login endpoint
                    response = requests.post(url, data=data, headers={k:v for k,v in headers.items() if k != 'Content-Type'}, timeout=10)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status": response.status_code}
            
            return response.status_code, response_data
            
        except requests.exceptions.RequestException as e:
            return 0, {"error": str(e)}

    def setup_admin_user(self):
        """Setup admin user for testing"""
        print("\n🔧 SETTING UP ADMIN USER FOR TESTING")
        print("-" * 50)
        
        # Try to find existing fives@eternalsgg.com user by creating a test user and checking users list
        # First create a super admin user
        admin_data = {
            "email": f"testsuper_{datetime.now().strftime('%H%M%S')}@eternals.com",
            "password": "TestSuper123!",
            "full_name": "Test Super Admin",
            "role": "super_admin",
            "company": "Eternals Studio"
        }
        
        status, response = self.make_request("POST", "auth/register", data=admin_data)
        
        if status == 200:
            print(f"✅ Created test super admin: {admin_data['email']}")
            
            # Login with the new admin user
            login_data = {
                "username": admin_data["email"],
                "password": admin_data["password"]
            }
            
            status, login_response = self.make_request("POST", "auth/login", data=login_data)
            
            if status == 200 and "access_token" in login_response:
                self.admin_token = login_response["access_token"]
                self.admin_user = login_response.get("user", {})
                print(f"✅ Successfully logged in as super admin")
                return True
            else:
                print(f"❌ Failed to login super admin: {login_response}")
                return False
        else:
            print(f"❌ Failed to create super admin: {response}")
            return False

    def check_fives_user(self):
        """Check if fives@eternalsgg.com exists and has correct role"""
        print("\n🔍 CHECKING FIVES@ETERNALSGG.COM USER")
        print("-" * 50)
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        # Get all users to find fives@eternalsgg.com
        status, response = self.make_request("GET", "users", token=self.admin_token)
        
        if status == 200:
            users = response
            fives_user = None
            
            for user in users:
                if user.get("email") == "fives@eternalsgg.com":
                    fives_user = user
                    break
            
            if fives_user:
                print(f"✅ Found fives@eternalsgg.com user")
                print(f"   ID: {fives_user.get('id')}")
                print(f"   Role: {fives_user.get('role')}")
                print(f"   Active: {fives_user.get('is_active')}")
                print(f"   Created: {fives_user.get('created_at')}")
                
                # Check if role is super_admin
                if fives_user.get('role') == 'super_admin':
                    print(f"✅ fives@eternalsgg.com has super_admin role")
                    return True
                else:
                    print(f"❌ fives@eternalsgg.com role is '{fives_user.get('role')}', not 'super_admin'")
                    
                    # Try to update the role
                    user_id = fives_user.get('id')
                    if user_id:
                        print(f"🔧 Attempting to update role to super_admin...")
                        status, update_response = self.make_request(
                            "PUT", 
                            f"users/{user_id}/role?new_role=super_admin", 
                            token=self.admin_token
                        )
                        
                        if status == 200:
                            print(f"✅ Successfully updated fives@eternalsgg.com role to super_admin")
                            return True
                        else:
                            print(f"❌ Failed to update role: {update_response}")
                            return False
            else:
                print(f"❌ fives@eternalsgg.com user not found in database")
                print(f"   Total users found: {len(users)}")
                
                # Show first few users for reference
                print(f"   Sample users:")
                for i, user in enumerate(users[:5]):
                    print(f"     {i+1}. {user.get('email')} - {user.get('role')}")
                
                return False
        else:
            print(f"❌ Failed to get users list: {response}")
            return False

    def test_token_validation(self):
        """Test 1: Token Validation - GET /api/auth/me endpoint"""
        print("\n🔍 TEST 1: TOKEN VALIDATION")
        print("-" * 50)
        
        if not self.admin_token:
            print("❌ No admin token available for testing")
            return False
        
        # Test with valid token
        status, response = self.make_request("GET", "auth/me", token=self.admin_token)
        
        if status == 200:
            print(f"✅ Token validation successful")
            print(f"   User ID: {response.get('id')}")
            print(f"   Email: {response.get('email')}")
            print(f"   Role: {response.get('role')}")
            print(f"   Active: {response.get('is_active')}")
            
            # Check if user roles are properly set
            role = response.get('role')
            admin_roles = ['super_admin', 'admin', 'client_manager']
            
            if role in admin_roles:
                print(f"✅ User has admin privileges (role: {role})")
                return True
            else:
                print(f"❌ User does not have admin privileges (role: {role})")
                return False
        else:
            print(f"❌ Token validation failed: Status {status}, Response: {response}")
            return False

    def test_admin_user_access(self):
        """Test 2: Admin User Access - Test protected endpoints"""
        print("\n🔍 TEST 2: ADMIN USER ACCESS TO PROTECTED ENDPOINTS")
        print("-" * 50)
        
        if not self.admin_token:
            print("❌ No admin token available for testing")
            return False
        
        # Test admin-only endpoints
        admin_endpoints = [
            ("GET", "users", "Get all users (super admin only)"),
            ("GET", "admin/analytics", "Get dashboard analytics"),
            ("GET", "clients", "Get clients list"),
            ("PUT", "counter-stats", "Update counter stats (admin only)")
        ]
        
        success_count = 0
        total_tests = len(admin_endpoints)
        
        for method, endpoint, description in admin_endpoints:
            if method == "PUT" and endpoint == "counter-stats":
                # Provide test data for counter stats update
                test_data = {
                    "id": str(uuid.uuid4()),
                    "projects_completed": 13,
                    "team_members": 6,
                    "support_available": "24/7"
                }
                status, response = self.make_request(method, endpoint, data=test_data, token=self.admin_token)
            else:
                status, response = self.make_request(method, endpoint, token=self.admin_token)
            
            if status == 200:
                print(f"✅ {description}: SUCCESS")
                if isinstance(response, list):
                    print(f"   Data count: {len(response)}")
                success_count += 1
            elif status == 403:
                print(f"❌ {description}: ACCESS DENIED (403)")
            elif status == 500:
                print(f"⚠️  {description}: SERVER ERROR (500) - Endpoint may have issues")
            else:
                print(f"❌ {description}: FAILED (Status: {status})")
        
        success_rate = (success_count / total_tests) * 100
        print(f"\n📊 Admin Access Summary: {success_count}/{total_tests} endpoints accessible ({success_rate:.1f}%)")
        
        return success_count >= (total_tests * 0.7)  # 70% success rate

    def test_dashboard_endpoints(self):
        """Test 3: Dashboard-related Endpoints"""
        print("\n🔍 TEST 3: DASHBOARD-RELATED ENDPOINTS")
        print("-" * 50)
        
        if not self.admin_token:
            print("❌ No admin token available for testing")
            return False
        
        # Test specific endpoints that dashboard depends on
        dashboard_endpoints = [
            ("GET", "clients", "Clients data for dashboard"),
            ("GET", "projects", "Projects data for dashboard"),
            ("GET", "testimonials/all", "All testimonials for admin review"),
            ("GET", "counter-stats", "Counter statistics for dashboard"),
            ("GET", "admin/analytics", "Dashboard analytics data")
        ]
        
        success_count = 0
        total_tests = len(dashboard_endpoints)
        
        for method, endpoint, description in dashboard_endpoints:
            status, response = self.make_request(method, endpoint, token=self.admin_token)
            
            if status == 200:
                print(f"✅ {description}: SUCCESS")
                if isinstance(response, list):
                    print(f"   Records: {len(response)}")
                elif isinstance(response, dict):
                    print(f"   Data keys: {list(response.keys())[:5]}")  # Show first 5 keys
                success_count += 1
            else:
                print(f"❌ {description}: FAILED (Status: {status})")
                if status == 500:
                    print(f"   Server error - check backend logs")
        
        success_rate = (success_count / total_tests) * 100
        print(f"\n📊 Dashboard Endpoints Summary: {success_count}/{total_tests} working ({success_rate:.1f}%)")
        
        return success_count >= (total_tests * 0.8)  # 80% success rate

    def test_jwt_token_format(self):
        """Test 4: JWT Token Format and Claims"""
        print("\n🔍 TEST 4: JWT TOKEN FORMAT AND CLAIMS")
        print("-" * 50)
        
        if not self.admin_token:
            print("❌ No admin token available for testing")
            return False
        
        # Check JWT token format
        token_parts = self.admin_token.split('.')
        
        if len(token_parts) == 3:
            print(f"✅ JWT token has correct format (3 parts)")
            print(f"   Header length: {len(token_parts[0])}")
            print(f"   Payload length: {len(token_parts[1])}")
            print(f"   Signature length: {len(token_parts[2])}")
        else:
            print(f"❌ JWT token has incorrect format ({len(token_parts)} parts, should be 3)")
            return False
        
        # Test token with different authorization header formats
        auth_formats = [
            f"Bearer {self.admin_token}",
            f"bearer {self.admin_token}",  # lowercase
            self.admin_token  # without Bearer prefix
        ]
        
        format_success = 0
        
        for i, auth_header in enumerate(auth_formats):
            try:
                url = f"{self.api_url}/auth/me"
                headers = {'Authorization': auth_header, 'Content-Type': 'application/json'}
                response = requests.get(url, headers=headers, timeout=10)
                
                if response.status_code == 200:
                    print(f"✅ Auth format {i+1}: SUCCESS ({auth_header[:20]}...)")
                    format_success += 1
                else:
                    print(f"❌ Auth format {i+1}: FAILED (Status: {response.status_code})")
                    
            except Exception as e:
                print(f"❌ Auth format {i+1}: ERROR ({str(e)})")
        
        print(f"\n📊 Token Format Summary: {format_success}/3 formats working")
        return format_success >= 2  # At least Bearer format should work

    def test_token_expiration(self):
        """Test 5: Token Expiration Handling"""
        print("\n🔍 TEST 5: TOKEN EXPIRATION HANDLING")
        print("-" * 50)
        
        # Test with invalid/expired token
        invalid_tokens = [
            "invalid.jwt.token",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNjAwMDAwMDAwfQ.invalid",
            ""
        ]
        
        for i, invalid_token in enumerate(invalid_tokens):
            status, response = self.make_request("GET", "auth/me", token=invalid_token, expected_status=401)
            
            if status == 401:
                print(f"✅ Invalid token {i+1}: Correctly rejected (401)")
            else:
                print(f"❌ Invalid token {i+1}: Not properly rejected (Status: {status})")
        
        # Test current valid token
        if self.admin_token:
            status, response = self.make_request("GET", "auth/me", token=self.admin_token)
            
            if status == 200:
                print(f"✅ Valid token: Correctly accepted")
                return True
            else:
                print(f"❌ Valid token: Unexpectedly rejected (Status: {status})")
                return False
        
        return False

    def run_dashboard_auth_tests(self):
        """Run complete dashboard authentication test suite"""
        print("🚀 STARTING DASHBOARD AUTHENTICATION TESTS")
        print("=" * 70)
        
        # Setup
        setup_success = self.setup_admin_user()
        if not setup_success:
            print("❌ Failed to setup admin user - cannot continue tests")
            return False
        
        # Check fives user
        fives_check = self.check_fives_user()
        
        # Run tests
        test_results = []
        
        test_results.append(("Token Validation", self.test_token_validation()))
        test_results.append(("Admin User Access", self.test_admin_user_access()))
        test_results.append(("Dashboard Endpoints", self.test_dashboard_endpoints()))
        test_results.append(("JWT Token Format", self.test_jwt_token_format()))
        test_results.append(("Token Expiration", self.test_token_expiration()))
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 DASHBOARD AUTHENTICATION TEST SUMMARY")
        print("=" * 70)
        
        passed_tests = sum(1 for _, result in test_results if result)
        total_tests = len(test_results)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        print(f"\n📋 Test Results:")
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status} {test_name}")
        
        print(f"\n👤 fives@eternalsgg.com Status: {'✅ VERIFIED' if fives_check else '❌ NEEDS ATTENTION'}")
        
        # Issues and recommendations
        if passed_tests < total_tests:
            print(f"\n🚨 ISSUES FOUND:")
            
            for test_name, result in test_results:
                if not result:
                    print(f"  ❌ {test_name} failed")
        
        print(f"\n💡 RECOMMENDATIONS FOR DASHBOARD AUTHENTICATION:")
        print(f"  1. Ensure fives@eternalsgg.com has super_admin role")
        print(f"  2. Verify JWT tokens are stored correctly in localStorage")
        print(f"  3. Check dashboard frontend authentication logic")
        print(f"  4. Test dashboard access with browser developer tools")
        print(f"  5. Verify all dashboard API endpoints are accessible")
        
        return passed_tests >= (total_tests * 0.8)  # 80% success rate

if __name__ == "__main__":
    tester = DashboardAuthTester()
    success = tester.run_dashboard_auth_tests()
    
    if success:
        print("\n🎉 DASHBOARD AUTHENTICATION TESTS COMPLETED SUCCESSFULLY")
        sys.exit(0)
    else:
        print("\n🚨 DASHBOARD AUTHENTICATION TESTS FOUND ISSUES")
        sys.exit(1)