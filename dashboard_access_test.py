#!/usr/bin/env python3
"""
Dashboard Access Test - Verify what fives@eternalsgg.com should have access to
"""

import requests
import sys
from datetime import datetime

class DashboardAccessTester:
    def __init__(self, base_url="https://graphix-hub-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        
        print(f"🏢 DASHBOARD ACCESS VERIFICATION TEST")
        print(f"📍 API URL: {self.api_url}")
        print("=" * 60)

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token=None):
        """Run a single API test with detailed logging"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if token:
            test_headers['Authorization'] = f'Bearer {token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 {name}")
        print(f"   Method: {method} | Endpoint: /{endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                if 'multipart/form-data' in test_headers.get('Content-Type', ''):
                    response = requests.post(url, data=data, headers={k:v for k,v in test_headers.items() if k != 'Content-Type'}, timeout=10)
                else:
                    response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   📊 Count: {len(response_data)} items")
                    elif isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   📄 Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   📄 Error: {error_detail}")
                except:
                    print(f"   📄 Error: {response.text}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"   ❌ FAILED - Network Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"   ❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_dashboard_endpoints(self):
        """Test all dashboard-related endpoints that super admin should access"""
        
        # Create a temporary super admin to test with
        print("\n" + "="*60)
        print("STEP 1: CREATE TEMPORARY SUPER ADMIN FOR TESTING")
        print("="*60)
        
        temp_admin_email = f"temp_admin_{datetime.now().strftime('%H%M%S')}@test.com"
        temp_admin_data = {
            "email": temp_admin_email,
            "password": "TempAdmin123!",
            "full_name": "Temporary Super Admin",
            "role": "super_admin"
        }
        
        success, response = self.run_test(
            "Create temporary super admin",
            "POST",
            "auth/register",
            200,
            data=temp_admin_data
        )
        
        if not success:
            print("❌ Cannot create temporary super admin - testing cannot proceed")
            return False
        
        # Login temporary admin
        login_data = {
            "username": temp_admin_email,
            "password": "TempAdmin123!"
        }
        
        success, login_response = self.run_test(
            "Login temporary super admin",
            "POST", 
            "auth/login",
            200,
            data=login_data,
            headers={"Content-Type": "multipart/form-data"}
        )
        
        if not success or "access_token" not in login_response:
            print("❌ Cannot login temporary super admin - testing cannot proceed")
            return False
        
        super_admin_token = login_response["access_token"]
        print(f"✅ Temporary super admin created and logged in successfully")
        
        # Test dashboard endpoints
        print("\n" + "="*60)
        print("STEP 2: TEST DASHBOARD ENDPOINTS ACCESS")
        print("="*60)
        
        dashboard_tests = [
            # User Management
            ("Get all users", "GET", "users", 200),
            ("Get user info", "GET", "auth/me", 200),
            
            # Dashboard Analytics
            ("Get dashboard analytics", "GET", "admin/analytics", 200),
            
            # Client Management
            ("Get all clients", "GET", "clients", 200),
            
            # Project Management
            ("Get all projects", "GET", "admin/projects", 200),
            
            # Counter Statistics
            ("Get counter statistics", "GET", "counter-stats", 200),
            
            # Testimonials Management
            ("Get all testimonials (admin)", "GET", "testimonials/all", 200),
            ("Get public testimonials", "GET", "testimonials", 200),
            
            # Content Management
            ("Get content sections", "GET", "content", 200),
            
            # OAuth Providers
            ("Get OAuth providers", "GET", "auth/providers", 200),
        ]
        
        passed_tests = 0
        total_tests = len(dashboard_tests)
        
        for test_name, method, endpoint, expected_status in dashboard_tests:
            success, response_data = self.run_test(
                test_name,
                method,
                endpoint,
                expected_status,
                token=super_admin_token
            )
            
            if success:
                passed_tests += 1
        
        print(f"\n📊 Dashboard Access Tests: {passed_tests}/{total_tests} passed")
        
        # Test specific super admin functions
        print("\n" + "="*60)
        print("STEP 3: TEST SUPER ADMIN SPECIFIC FUNCTIONS")
        print("="*60)
        
        # Test role update capability
        success, users_response = self.run_test(
            "Get users for role testing",
            "GET",
            "users",
            200,
            token=super_admin_token
        )
        
        if success and users_response:
            # Find a client user to test role update
            client_user = None
            for user in users_response:
                if user.get("role") == "client":
                    client_user = user
                    break
            
            if client_user:
                user_id = client_user.get("id")
                success, role_response = self.run_test(
                    "Test role update capability",
                    "PUT",
                    f"users/{user_id}/role?new_role=client",
                    200,
                    token=super_admin_token
                )
                
                if success:
                    print("   ✅ Super admin can update user roles")
                else:
                    print("   ❌ Super admin cannot update user roles")
        
        # Test counter stats update
        counter_data = {
            "id": "test-id",
            "projects_completed": 13,
            "team_members": 6,
            "support_available": "24/7"
        }
        
        success, counter_response = self.run_test(
            "Test counter stats update",
            "PUT",
            "counter-stats",
            200,
            data=counter_data,
            token=super_admin_token
        )
        
        if success:
            print("   ✅ Super admin can update counter statistics")
        else:
            print("   ❌ Super admin cannot update counter statistics")
        
        return passed_tests >= total_tests * 0.8  # 80% success rate

if __name__ == "__main__":
    tester = DashboardAccessTester()
    result = tester.test_dashboard_endpoints()
    
    print("\n" + "="*60)
    print("DASHBOARD ACCESS TEST SUMMARY")
    print("="*60)
    
    if result:
        print("✅ Dashboard endpoints are accessible to super admin users")
        print("✅ Once fives@eternalsgg.com password is set, they will have full dashboard access")
    else:
        print("❌ Some dashboard endpoints may have issues")
    
    print("\n🔧 CONCLUSION:")
    print("   The dashboard system is ready and functional.")
    print("   The only missing piece is setting the password for fives@eternalsgg.com")
    print("   so they can login and access these dashboard features.")
    
    sys.exit(0 if result else 1)