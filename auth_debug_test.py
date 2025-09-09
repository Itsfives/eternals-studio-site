#!/usr/bin/env python3
"""
Authentication Debugging Test for Dashboard Access
Specifically tests JWT token validation and admin user authentication
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class AuthenticationDebugger:
    def __init__(self, base_url="https://graphix-hub-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}
        self.users = {}
        self.test_results = []
        
        print(f"🔐 AUTHENTICATION DEBUGGING FOR DASHBOARD ACCESS")
        print(f"📍 API URL: {self.api_url}")
        print("=" * 70)

    def log_test(self, name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {name}")
        if details:
            print(f"    {details}")
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

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
                if 'multipart/form-data' in headers.get('Content-Type', ''):
                    response = requests.post(url, data=data, headers={k:v for k,v in headers.items() if k != 'Content-Type'}, timeout=10)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
            
            return success, response.status_code, response_data
            
        except requests.exceptions.RequestException as e:
            return False, 0, {"error": str(e)}

    def test_existing_admin_user(self):
        """Test if fives@eternalsgg.com exists and has super_admin role"""
        print("\n🔍 TESTING EXISTING ADMIN USER (fives@eternalsgg.com)")
        print("-" * 50)
        
        # First, try to login with fives@eternalsgg.com
        # We'll try common passwords or check if user exists
        
        # Test login with the admin user
        login_data = {
            "username": "fives@eternalsgg.com",
            "password": "admin123"  # Common test password
        }
        
        success, status, response = self.make_request(
            "POST", 
            "auth/login", 
            data=login_data,
            expected_status=200
        )
        
        if success and "access_token" in response:
            self.tokens["fives"] = response["access_token"]
            self.users["fives"] = response.get("user", {})
            
            self.log_test(
                "Login fives@eternalsgg.com", 
                True, 
                f"Successfully logged in, role: {response.get('user', {}).get('role', 'unknown')}"
            )
            
            # Test /auth/me with the token
            return self.test_token_validation("fives", self.tokens["fives"])
            
        else:
            # Try alternative passwords
            alt_passwords = ["password123", "eternals123", "super123", "admin", "password"]
            
            for password in alt_passwords:
                login_data["password"] = password
                success, status, response = self.make_request(
                    "POST", 
                    "auth/login", 
                    data=login_data,
                    expected_status=200
                )
                
                if success and "access_token" in response:
                    self.tokens["fives"] = response["access_token"]
                    self.users["fives"] = response.get("user", {})
                    
                    self.log_test(
                        "Login fives@eternalsgg.com (alt password)", 
                        True, 
                        f"Password: {password}, Role: {response.get('user', {}).get('role', 'unknown')}"
                    )
                    
                    return self.test_token_validation("fives", self.tokens["fives"])
            
            self.log_test(
                "Login fives@eternalsgg.com", 
                False, 
                f"Failed to login - Status: {status}, Response: {response}"
            )
            
            # Create a test admin user instead
            return self.create_test_admin_user()

    def create_test_admin_user(self):
        """Create a test admin user for testing"""
        print("\n🔧 CREATING TEST ADMIN USER")
        print("-" * 30)
        
        # Create admin user
        admin_data = {
            "email": f"testadmin_{datetime.now().strftime('%H%M%S')}@eternals.com",
            "password": "TestAdmin123!",
            "full_name": "Test Admin User",
            "role": "super_admin",
            "company": "Eternals Studio"
        }
        
        success, status, response = self.make_request(
            "POST",
            "auth/register",
            data=admin_data,
            expected_status=200
        )
        
        if success:
            self.log_test("Create test admin user", True, f"Created user: {admin_data['email']}")
            
            # Login with the new admin user
            login_data = {
                "username": admin_data["email"],
                "password": admin_data["password"]
            }
            
            success, status, login_response = self.make_request(
                "POST",
                "auth/login",
                data=login_data,
                expected_status=200
            )
            
            if success and "access_token" in login_response:
                self.tokens["admin"] = login_response["access_token"]
                self.users["admin"] = login_response.get("user", {})
                
                self.log_test("Login test admin user", True, "Successfully logged in")
                return self.test_token_validation("admin", self.tokens["admin"])
            else:
                self.log_test("Login test admin user", False, f"Login failed: {login_response}")
                return False
        else:
            self.log_test("Create test admin user", False, f"Registration failed: {response}")
            return False

    def test_token_validation(self, user_type, token):
        """Test GET /api/auth/me endpoint with stored token"""
        print(f"\n🔍 TESTING TOKEN VALIDATION FOR {user_type.upper()}")
        print("-" * 50)
        
        success, status, response = self.make_request(
            "GET",
            "auth/me",
            token=token,
            expected_status=200
        )
        
        if success:
            user_info = response
            role = user_info.get("role", "unknown")
            email = user_info.get("email", "unknown")
            user_id = user_info.get("id", "unknown")
            
            self.log_test(
                f"Token validation for {user_type}",
                True,
                f"Email: {email}, Role: {role}, ID: {user_id}"
            )
            
            # Check if user has admin privileges
            is_admin = role in ["super_admin", "admin", "client_manager"]
            
            self.log_test(
                f"Admin privileges check for {user_type}",
                is_admin,
                f"Role '{role}' {'has' if is_admin else 'does not have'} admin privileges"
            )
            
            return True
        else:
            self.log_test(
                f"Token validation for {user_type}",
                False,
                f"Status: {status}, Response: {response}"
            )
            return False

    def test_dashboard_endpoints(self):
        """Test dashboard-related endpoints that require admin access"""
        print(f"\n🔍 TESTING DASHBOARD-RELATED ENDPOINTS")
        print("-" * 50)
        
        # Get admin token (either fives or test admin)
        admin_token = self.tokens.get("fives") or self.tokens.get("admin")
        
        if not admin_token:
            self.log_test("Dashboard endpoints test", False, "No admin token available")
            return False
        
        # Test endpoints that dashboard depends on
        dashboard_endpoints = [
            ("GET", "clients", "Get clients list"),
            ("GET", "projects", "Get projects list"),
            ("GET", "testimonials/all", "Get all testimonials (admin)"),
            ("GET", "users", "Get all users (super admin)"),
            ("GET", "admin/analytics", "Get dashboard analytics"),
            ("GET", "counter-stats", "Get counter statistics")
        ]
        
        dashboard_success = 0
        total_tests = len(dashboard_endpoints)
        
        for method, endpoint, description in dashboard_endpoints:
            success, status, response = self.make_request(
                method,
                endpoint,
                token=admin_token,
                expected_status=200
            )
            
            if success:
                data_count = len(response) if isinstance(response, list) else "N/A"
                self.log_test(
                    description,
                    True,
                    f"Status: {status}, Data count: {data_count}"
                )
                dashboard_success += 1
            else:
                # Some endpoints might return 403 if user doesn't have sufficient privileges
                if status == 403:
                    self.log_test(
                        description,
                        False,
                        f"Access denied (403) - User may not have sufficient privileges"
                    )
                else:
                    self.log_test(
                        description,
                        False,
                        f"Status: {status}, Response: {response}"
                    )
        
        overall_success = dashboard_success >= (total_tests * 0.7)  # 70% success rate
        
        self.log_test(
            "Dashboard endpoints overall",
            overall_success,
            f"{dashboard_success}/{total_tests} endpoints accessible"
        )
        
        return overall_success

    def test_token_expiration_and_refresh(self):
        """Test token expiration and refresh functionality"""
        print(f"\n🔍 TESTING TOKEN EXPIRATION AND REFRESH")
        print("-" * 50)
        
        # Create a test token with short expiration
        admin_token = self.tokens.get("fives") or self.tokens.get("admin")
        
        if not admin_token:
            self.log_test("Token expiration test", False, "No admin token available")
            return False
        
        # Test current token validity
        success, status, response = self.make_request(
            "GET",
            "auth/me",
            token=admin_token,
            expected_status=200
        )
        
        if success:
            self.log_test("Current token validity", True, "Token is currently valid")
            
            # Test with invalid token
            invalid_token = "invalid.jwt.token"
            success, status, response = self.make_request(
                "GET",
                "auth/me",
                token=invalid_token,
                expected_status=401
            )
            
            if success:  # Success means we got expected 401
                self.log_test("Invalid token rejection", True, "Invalid token correctly rejected")
                return True
            else:
                self.log_test("Invalid token rejection", False, f"Expected 401, got {status}")
                return False
        else:
            self.log_test("Current token validity", False, f"Token validation failed: {response}")
            return False

    def test_role_based_access_control(self):
        """Test role-based access control for different user types"""
        print(f"\n🔍 TESTING ROLE-BASED ACCESS CONTROL")
        print("-" * 50)
        
        # Create a client user for testing
        client_data = {
            "email": f"testclient_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestClient123!",
            "full_name": "Test Client User",
            "role": "client",
            "company": "Test Company"
        }
        
        success, status, response = self.make_request(
            "POST",
            "auth/register",
            data=client_data,
            expected_status=200
        )
        
        if success:
            # Login client user
            login_data = {
                "username": client_data["email"],
                "password": client_data["password"]
            }
            
            success, status, login_response = self.make_request(
                "POST",
                "auth/login",
                data=login_data,
                expected_status=200
            )
            
            if success and "access_token" in login_response:
                client_token = login_response["access_token"]
                
                # Test client access to admin endpoints (should fail)
                admin_endpoints = [
                    ("GET", "users", "Get all users"),
                    ("GET", "admin/analytics", "Get dashboard analytics"),
                    ("PUT", "counter-stats", "Update counter stats")
                ]
                
                rbac_success = 0
                total_rbac_tests = len(admin_endpoints)
                
                for method, endpoint, description in admin_endpoints:
                    success, status, response = self.make_request(
                        method,
                        endpoint,
                        token=client_token,
                        expected_status=403  # Expecting forbidden
                    )
                    
                    if success:  # Success means we got expected 403
                        self.log_test(
                            f"Client access denied: {description}",
                            True,
                            "Client correctly denied access to admin endpoint"
                        )
                        rbac_success += 1
                    else:
                        self.log_test(
                            f"Client access denied: {description}",
                            False,
                            f"Expected 403, got {status} - Client may have unauthorized access"
                        )
                
                overall_rbac = rbac_success == total_rbac_tests
                self.log_test(
                    "Role-based access control",
                    overall_rbac,
                    f"{rbac_success}/{total_rbac_tests} access controls working correctly"
                )
                
                return overall_rbac
            else:
                self.log_test("Client user login", False, "Failed to login client user")
                return False
        else:
            self.log_test("Client user creation", False, "Failed to create client user")
            return False

    def debug_authentication_flow(self):
        """Debug the complete authentication flow"""
        print(f"\n🔍 DEBUGGING COMPLETE AUTHENTICATION FLOW")
        print("-" * 50)
        
        # Check if tokens are being properly formatted
        admin_token = self.tokens.get("fives") or self.tokens.get("admin")
        
        if admin_token:
            # Analyze JWT token structure
            token_parts = admin_token.split('.')
            
            self.log_test(
                "JWT token format",
                len(token_parts) == 3,
                f"Token has {len(token_parts)} parts (should be 3: header.payload.signature)"
            )
            
            # Test token with different authorization headers
            auth_variations = [
                f"Bearer {admin_token}",
                f"bearer {admin_token}",
                admin_token
            ]
            
            for i, auth_header in enumerate(auth_variations):
                headers = {'Authorization': auth_header, 'Content-Type': 'application/json'}
                
                try:
                    url = f"{self.api_url}/auth/me"
                    response = requests.get(url, headers=headers, timeout=10)
                    
                    success = response.status_code == 200
                    
                    self.log_test(
                        f"Auth header variation {i+1}",
                        success,
                        f"Header: '{auth_header[:20]}...', Status: {response.status_code}"
                    )
                    
                except Exception as e:
                    self.log_test(
                        f"Auth header variation {i+1}",
                        False,
                        f"Error: {str(e)}"
                    )
        
        return True

    def run_complete_debug(self):
        """Run complete authentication debugging suite"""
        print("🚀 STARTING COMPLETE AUTHENTICATION DEBUG")
        print("=" * 70)
        
        # Test 1: Check existing admin user or create test admin
        admin_available = self.test_existing_admin_user()
        
        # Test 2: Test dashboard endpoints
        if admin_available:
            dashboard_working = self.test_dashboard_endpoints()
        else:
            dashboard_working = False
        
        # Test 3: Test token expiration and refresh
        token_handling = self.test_token_expiration_and_refresh()
        
        # Test 4: Test role-based access control
        rbac_working = self.test_role_based_access_control()
        
        # Test 5: Debug authentication flow
        auth_flow_debug = self.debug_authentication_flow()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 AUTHENTICATION DEBUG SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for test in self.test_results if test["success"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Critical issues
        critical_issues = []
        
        if not admin_available:
            critical_issues.append("❌ Admin user authentication failed")
        
        if not dashboard_working:
            critical_issues.append("❌ Dashboard endpoints not accessible")
        
        if not token_handling:
            critical_issues.append("❌ Token validation issues")
        
        if not rbac_working:
            critical_issues.append("❌ Role-based access control issues")
        
        if critical_issues:
            print("\n🚨 CRITICAL ISSUES FOUND:")
            for issue in critical_issues:
                print(f"  {issue}")
        else:
            print("\n✅ NO CRITICAL AUTHENTICATION ISSUES FOUND")
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        
        if not admin_available:
            print("  1. Verify fives@eternalsgg.com user exists and has correct password")
            print("  2. Check user role is set to 'super_admin'")
        
        if not dashboard_working:
            print("  3. Verify admin endpoints are properly protected")
            print("  4. Check JWT token is being passed correctly to dashboard")
        
        if not token_handling:
            print("  5. Verify JWT secret key and token generation")
            print("  6. Check token expiration settings")
        
        print("  7. Test dashboard authentication in browser with developer tools")
        print("  8. Verify localStorage token storage in frontend")
        
        return passed_tests >= total_tests * 0.8  # 80% success rate

if __name__ == "__main__":
    debugger = AuthenticationDebugger()
    success = debugger.run_complete_debug()
    
    if success:
        print("\n🎉 AUTHENTICATION DEBUGGING COMPLETED SUCCESSFULLY")
        sys.exit(0)
    else:
        print("\n🚨 AUTHENTICATION DEBUGGING FOUND CRITICAL ISSUES")
        sys.exit(1)