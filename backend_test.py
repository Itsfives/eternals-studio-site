#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Eternals Studio
Tests all authentication, project management, invoice, and content management endpoints
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class EternalsStudioAPITester:
    def __init__(self, base_url="https://eternals-design.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tokens = {}  # Store tokens for different user roles
        self.users = {}   # Store user data for different roles
        self.test_data = {}  # Store created test data
        self.tests_run = 0
        self.tests_passed = 0
        
        print(f"🚀 Starting Eternals Studio API Tests")
        print(f"📍 Base URL: {self.base_url}")
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

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
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
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
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

    def test_user_registration_and_login(self):
        """Test user registration for different roles and login"""
        print("\n" + "="*60)
        print("🔐 TESTING USER AUTHENTICATION")
        print("="*60)
        
        # Test user registration for different roles
        test_users = [
            {
                "role": "super_admin",
                "email": f"superadmin_{datetime.now().strftime('%H%M%S')}@test.com",
                "password": "SuperAdmin123!",
                "full_name": "Super Admin User",
                "company": "Eternals Studio"
            },
            {
                "role": "admin", 
                "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
                "password": "Admin123!",
                "full_name": "Admin User",
                "company": "Eternals Studio"
            },
            {
                "role": "client",
                "email": f"client_{datetime.now().strftime('%H%M%S')}@test.com", 
                "password": "Client123!",
                "full_name": "Test Client",
                "company": "Test Company"
            }
        ]
        
        for user_data in test_users:
            role = user_data["role"]
            
            # Register user
            success, response = self.run_test(
                f"Register {role} user",
                "POST",
                "auth/register",
                200,
                data=user_data
            )
            
            if success:
                self.users[role] = {**user_data, "id": response.get("id")}
                
                # Login user
                login_data = {
                    "username": user_data["email"],
                    "password": user_data["password"]
                }
                
                success, login_response = self.run_test(
                    f"Login {role} user",
                    "POST", 
                    "auth/login",
                    200,
                    data=login_data,
                    headers={"Content-Type": "multipart/form-data"}
                )
                
                if success and "access_token" in login_response:
                    self.tokens[role] = login_response["access_token"]
                    
                    # Test /auth/me endpoint
                    self.run_test(
                        f"Get {role} user info",
                        "GET",
                        "auth/me", 
                        200,
                        token=self.tokens[role]
                    )
                else:
                    print(f"   ⚠️  Failed to login {role} user")
            else:
                print(f"   ⚠️  Failed to register {role} user")
        
        return len(self.tokens) >= 2  # Need at least admin and client tokens

    def test_project_management(self):
        """Test project creation, retrieval, and management"""
        print("\n" + "="*60)
        print("📁 TESTING PROJECT MANAGEMENT")
        print("="*60)
        
        if "admin" not in self.tokens or "client" not in self.tokens:
            print("   ⚠️  Skipping project tests - missing required user tokens")
            return False
            
        admin_token = self.tokens["admin"]
        client_token = self.tokens["client"]
        client_id = self.users["client"]["id"]
        
        # Test project creation by admin
        project_data = {
            "title": "Test Brand Identity Project",
            "description": "Complete brand identity design for test client",
            "client_id": client_id,
            "due_date": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        success, response = self.run_test(
            "Create project (admin)",
            "POST",
            "projects",
            200,
            data=project_data,
            token=admin_token
        )
        
        if success:
            project_id = response.get("id")
            self.test_data["project_id"] = project_id
            
            # Test get all projects (admin view)
            self.run_test(
                "Get all projects (admin)",
                "GET", 
                "projects",
                200,
                token=admin_token
            )
            
            # Test get all projects (client view - should only see their projects)
            self.run_test(
                "Get client projects (client)",
                "GET",
                "projects", 
                200,
                token=client_token
            )
            
            # Test get specific project
            self.run_test(
                "Get specific project",
                "GET",
                f"projects/{project_id}",
                200,
                token=admin_token
            )
            
            return True
        
        return False

    def test_invoice_management(self):
        """Test invoice creation, payment, and project locking"""
        print("\n" + "="*60)
        print("💰 TESTING INVOICE MANAGEMENT & PROJECT LOCKING")
        print("="*60)
        
        if "admin" not in self.tokens or "project_id" not in self.test_data:
            print("   ⚠️  Skipping invoice tests - missing required data")
            return False
            
        admin_token = self.tokens["admin"]
        client_token = self.tokens["client"]
        project_id = self.test_data["project_id"]
        
        # Create invoice for project
        invoice_data = {
            "project_id": project_id,
            "amount": 2500.00,
            "description": "Brand Identity Design Package",
            "due_date": (datetime.now() + timedelta(days=15)).isoformat()
        }
        
        success, response = self.run_test(
            "Create invoice (admin)",
            "POST",
            "invoices",
            200,
            data=invoice_data,
            token=admin_token
        )
        
        if success:
            invoice_id = response.get("id")
            self.test_data["invoice_id"] = invoice_id
            
            # Test get all invoices (admin)
            self.run_test(
                "Get all invoices (admin)",
                "GET",
                "invoices",
                200,
                token=admin_token
            )
            
            # Test get client invoices
            self.run_test(
                "Get client invoices",
                "GET", 
                "invoices",
                200,
                token=client_token
            )
            
            # Verify project is locked after invoice creation
            success, project_response = self.run_test(
                "Check project locked status",
                "GET",
                f"projects/{project_id}",
                200,
                token=admin_token
            )
            
            if success and project_response.get("is_locked"):
                print("   ✅ Project correctly locked after invoice creation")
            else:
                print("   ⚠️  Project locking may not be working correctly")
            
            # Test invoice payment
            success, payment_response = self.run_test(
                "Pay invoice (client)",
                "PUT",
                f"invoices/{invoice_id}/pay",
                200,
                token=client_token
            )
            
            if success:
                # Verify project is unlocked after payment
                success, unlocked_project = self.run_test(
                    "Check project unlocked after payment",
                    "GET",
                    f"projects/{project_id}",
                    200,
                    token=admin_token
                )
                
                if success and not unlocked_project.get("is_locked"):
                    print("   ✅ Project correctly unlocked after payment")
                    return True
                else:
                    print("   ⚠️  Project unlocking may not be working correctly")
        
        return False

    def test_messaging_system(self):
        """Test project messaging functionality"""
        print("\n" + "="*60)
        print("💬 TESTING MESSAGING SYSTEM")
        print("="*60)
        
        if "admin" not in self.tokens or "project_id" not in self.test_data:
            print("   ⚠️  Skipping messaging tests - missing required data")
            return False
            
        admin_token = self.tokens["admin"]
        client_token = self.tokens["client"]
        project_id = self.test_data["project_id"]
        
        # Create message from admin
        message_data = {
            "project_id": project_id,
            "content": "Hello! We've started working on your brand identity project."
        }
        
        success, response = self.run_test(
            "Create message (admin)",
            "POST",
            "messages",
            200,
            data=message_data,
            token=admin_token
        )
        
        if success:
            # Create reply from client
            reply_data = {
                "project_id": project_id,
                "content": "Great! Looking forward to seeing the initial concepts."
            }
            
            self.run_test(
                "Create reply (client)",
                "POST",
                "messages",
                200,
                data=reply_data,
                token=client_token
            )
            
            # Get project messages
            self.run_test(
                "Get project messages (admin)",
                "GET",
                f"messages/{project_id}",
                200,
                token=admin_token
            )
            
            self.run_test(
                "Get project messages (client)",
                "GET",
                f"messages/{project_id}",
                200,
                token=client_token
            )
            
            return True
        
        return False

    def test_content_management(self):
        """Test content management system"""
        print("\n" + "="*60)
        print("📝 TESTING CONTENT MANAGEMENT")
        print("="*60)
        
        if "admin" not in self.tokens:
            print("   ⚠️  Skipping content tests - missing admin token")
            return False
            
        admin_token = self.tokens["admin"]
        
        # Test get all content
        self.run_test(
            "Get all content sections",
            "GET",
            "content",
            200,
            token=admin_token
        )
        
        # Test update content section
        content_update = {
            "content": {
                "title": "Welcome to Eternals Studio",
                "subtitle": "Your premier destination for exceptional graphic design services",
                "description": "We create stunning visual experiences that elevate your brand"
            }
        }
        
        success, response = self.run_test(
            "Update hero content section",
            "PUT",
            "content/hero",
            200,
            data=content_update,
            token=admin_token
        )
        
        if success:
            # Test get specific content section
            self.run_test(
                "Get hero content section",
                "GET",
                "content/hero",
                200
            )
            return True
        
        return False

    def test_file_upload(self):
        """Test file upload functionality"""
        print("\n" + "="*60)
        print("📎 TESTING FILE UPLOAD")
        print("="*60)
        
        if "admin" not in self.tokens or "project_id" not in self.test_data:
            print("   ⚠️  Skipping file upload tests - missing required data")
            return False
            
        admin_token = self.tokens["admin"]
        project_id = self.test_data["project_id"]
        
        # Create a test file
        test_file_content = "This is a test file for Eternals Studio project"
        
        try:
            # Test file upload
            files = {'file': ('test_design.txt', test_file_content, 'text/plain')}
            data = {'project_id': project_id}
            headers = {'Authorization': f'Bearer {admin_token}'}
            
            url = f"{self.api_url}/files/upload"
            response = requests.post(url, files=files, data=data, headers=headers, timeout=10)
            
            self.tests_run += 1
            print(f"\n🔍 Test {self.tests_run}: Upload project file")
            
            if response.status_code == 200:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                file_data = response.json()
                print(f"   📄 Response: {file_data}")
                return True
            else:
                print(f"   ❌ FAILED - Expected 200, got {response.status_code}")
                print(f"   📄 Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ FAILED - Error: {str(e)}")
            return False

    def test_counter_statistics(self):
        """Test counter statistics API endpoints"""
        print("\n" + "="*60)
        print("📊 TESTING COUNTER STATISTICS")
        print("="*60)
        
        # Test GET counter stats (no authentication required)
        success, response = self.run_test(
            "Get counter statistics",
            "GET",
            "counter-stats",
            200
        )
        
        if success:
            # Verify default values are present
            expected_defaults = {
                "projects_completed": 13,
                "happy_clients": 15,
                "team_members": 6,
                "support_available": "24/7"
            }
            
            print("   🔍 Verifying default counter statistics values...")
            all_defaults_correct = True
            for key, expected_value in expected_defaults.items():
                actual_value = response.get(key)
                if actual_value == expected_value:
                    print(f"   ✅ {key}: {actual_value} (correct)")
                else:
                    print(f"   ❌ {key}: expected {expected_value}, got {actual_value}")
                    all_defaults_correct = False
            
            # Verify required fields are present
            required_fields = ["id", "last_updated"]
            for field in required_fields:
                if field in response:
                    print(f"   ✅ {field}: present")
                else:
                    print(f"   ❌ {field}: missing")
                    all_defaults_correct = False
            
            if all_defaults_correct:
                print("   ✅ All default values and required fields are correct")
            
            # Store original stats for comparison
            self.test_data["original_stats"] = response
        
        # Test unauthorized update (client should fail)
        if "client" in self.tokens:
            updated_stats = {
                "id": response.get("id", str(uuid.uuid4())),
                "projects_completed": 25,
                "happy_clients": 30,
                "team_members": 8,
                "support_available": "24/7"
            }
            
            self.run_test(
                "Update counter stats (client - should fail)",
                "PUT",
                "counter-stats",
                403,  # Expecting forbidden
                data=updated_stats,
                token=self.tokens["client"]
            )
        
        # Test authorized update (admin should succeed)
        if "admin" in self.tokens:
            updated_stats = {
                "id": response.get("id", str(uuid.uuid4())),
                "projects_completed": 25,
                "happy_clients": 30,
                "team_members": 8,
                "support_available": "24/7"
            }
            
            success, update_response = self.run_test(
                "Update counter stats (admin)",
                "PUT",
                "counter-stats",
                200,
                data=updated_stats,
                token=self.tokens["admin"]
            )
            
            if success:
                # Verify the update was applied
                print("   🔍 Verifying counter statistics update...")
                expected_updates = {
                    "projects_completed": 25,
                    "happy_clients": 30,
                    "team_members": 8,
                    "support_available": "24/7"
                }
                
                all_updates_correct = True
                for key, expected_value in expected_updates.items():
                    actual_value = update_response.get(key)
                    if actual_value == expected_value:
                        print(f"   ✅ {key}: {actual_value} (updated correctly)")
                    else:
                        print(f"   ❌ {key}: expected {expected_value}, got {actual_value}")
                        all_updates_correct = False
                
                # Verify updated_by field is set
                if update_response.get("updated_by"):
                    print(f"   ✅ updated_by: {update_response.get('updated_by')} (set correctly)")
                else:
                    print("   ❌ updated_by: not set")
                    all_updates_correct = False
                
                # Verify last_updated is recent
                if update_response.get("last_updated"):
                    print(f"   ✅ last_updated: {update_response.get('last_updated')} (updated)")
                else:
                    print("   ❌ last_updated: not updated")
                    all_updates_correct = False
                
                if all_updates_correct:
                    print("   ✅ Counter statistics update successful")
                
                # Verify persistence by getting stats again
                success, verify_response = self.run_test(
                    "Verify counter stats persistence",
                    "GET",
                    "counter-stats",
                    200
                )
                
                if success:
                    print("   🔍 Verifying data persistence in MongoDB...")
                    persistence_correct = True
                    for key, expected_value in expected_updates.items():
                        actual_value = verify_response.get(key)
                        if actual_value == expected_value:
                            print(f"   ✅ {key}: {actual_value} (persisted correctly)")
                        else:
                            print(f"   ❌ {key}: expected {expected_value}, got {actual_value}")
                            persistence_correct = False
                    
                    if persistence_correct:
                        print("   ✅ All counter statistics data persisted correctly in MongoDB")
                        return True
                    else:
                        print("   ❌ Counter statistics data persistence failed")
                        return False
        
        # Test super_admin access if available
        if "super_admin" in self.tokens:
            super_admin_stats = {
                "id": response.get("id", str(uuid.uuid4())),
                "projects_completed": 50,
                "happy_clients": 60,
                "team_members": 12,
                "support_available": "24/7"
            }
            
            self.run_test(
                "Update counter stats (super_admin)",
                "PUT",
                "counter-stats",
                200,
                data=super_admin_stats,
                token=self.tokens["super_admin"]
            )
        
        return success

    def test_authorization_controls(self):
        """Test role-based access controls"""
        print("\n" + "="*60)
        print("🔒 TESTING AUTHORIZATION CONTROLS")
        print("="*60)
        
        if "client" not in self.tokens:
            print("   ⚠️  Skipping authorization tests - missing client token")
            return False
            
        client_token = self.tokens["client"]
        
        # Test client trying to create project (should fail)
        project_data = {
            "title": "Unauthorized Project",
            "description": "This should fail",
            "client_id": "some-id"
        }
        
        self.run_test(
            "Client create project (should fail)",
            "POST",
            "projects",
            403,  # Expecting forbidden
            data=project_data,
            token=client_token
        )
        
        # Test client trying to create invoice (should fail)
        invoice_data = {
            "project_id": "some-id",
            "amount": 100.0,
            "description": "Unauthorized invoice"
        }
        
        self.run_test(
            "Client create invoice (should fail)",
            "POST",
            "invoices",
            403,  # Expecting forbidden
            data=invoice_data,
            token=client_token
        )
        
        # Test client trying to update content (should fail)
        content_data = {
            "content": {"title": "Hacked content"}
        }
        
        self.run_test(
            "Client update content (should fail)",
            "PUT",
            "content/hero",
            403,  # Expecting forbidden
            data=content_data,
            token=client_token
        )
        
        return True

    def run_all_tests(self):
        """Run all test suites"""
        print("🎯 ETERNALS STUDIO API COMPREHENSIVE TESTING")
        print("=" * 60)
        
        test_results = []
        
        # Run test suites in order
        test_results.append(("Authentication", self.test_user_registration_and_login()))
        test_results.append(("Project Management", self.test_project_management()))
        test_results.append(("Invoice & Locking", self.test_invoice_management()))
        test_results.append(("Messaging System", self.test_messaging_system()))
        test_results.append(("Content Management", self.test_content_management()))
        test_results.append(("File Upload", self.test_file_upload()))
        test_results.append(("Authorization Controls", self.test_authorization_controls()))
        
        # Print final results
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        
        for test_name, result in test_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name:.<30} {status}")
        
        print(f"\nOverall: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! Backend is working correctly.")
            return 0
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_tests} tests failed. Please review the issues above.")
            return 1

def main():
    tester = EternalsStudioAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())