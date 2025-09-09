#!/usr/bin/env python3
"""
Super Admin Password Setup Test - FOCUSED TESTING
Tests specifically for fives@eternalsgg.com password setup as requested in review
"""

import requests
import sys
import json
from datetime import datetime

class SuperAdminPasswordTester:
    def __init__(self, base_url="https://graphix-hub-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.target_email = "fives@eternalsgg.com"
        self.target_password = "admin123"  # Simple password as requested
        
        print(f"🔐 SUPER ADMIN PASSWORD SETUP TEST")
        print(f"📍 Target User: {self.target_email}")
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

    def test_super_admin_password_setup(self):
        """Test the complete super admin password setup process"""
        
        # Step 1: Create a temporary super admin to manage users
        print("\n" + "="*60)
        print("STEP 1: CREATE TEMPORARY SUPER ADMIN FOR USER MANAGEMENT")
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
        
        temp_admin_token = login_response["access_token"]
        print(f"✅ Temporary super admin created and logged in successfully")
        
        # Step 2: Check if fives@eternalsgg.com exists
        print("\n" + "="*60)
        print("STEP 2: VERIFY FIVES@ETERNALSGG.COM USER EXISTS")
        print("="*60)
        
        success, users_response = self.run_test(
            "Get all users to find fives@eternalsgg.com",
            "GET",
            "users",
            200,
            token=temp_admin_token
        )
        
        if not success:
            print("❌ Cannot get user list - testing cannot proceed")
            return False
        
        fives_user = None
        for user in users_response:
            if user.get("email") == self.target_email:
                fives_user = user
                break
        
        if not fives_user:
            print(f"❌ {self.target_email} not found in database")
            return False
        
        print(f"✅ {self.target_email} found in database")
        print(f"   📊 User ID: {fives_user.get('id')}")
        print(f"   📊 Role: {fives_user.get('role')}")
        print(f"   📊 Full Name: {fives_user.get('full_name')}")
        print(f"   📊 Active: {fives_user.get('is_active')}")
        
        # Step 3: Test current login status (should fail)
        print("\n" + "="*60)
        print("STEP 3: TEST CURRENT LOGIN STATUS (SHOULD FAIL)")
        print("="*60)
        
        test_passwords = [self.target_password, "password", "admin", "fives123", "eternals", "123456"]
        login_successful = False
        
        for password in test_passwords:
            login_data = {
                "username": self.target_email,
                "password": password
            }
            
            success, login_response = self.run_test(
                f"Try login with password: {password}",
                "POST", 
                "auth/login",
                200,
                data=login_data,
                headers={"Content-Type": "multipart/form-data"}
            )
            
            if success and "access_token" in login_response:
                print(f"✅ {self.target_email} can already login with password: {password}")
                login_successful = True
                break
        
        if login_successful:
            print(f"✅ {self.target_email} already has a working password")
            return True
        else:
            print(f"❌ {self.target_email} CANNOT LOGIN - PASSWORD NOT SET OR INCORRECT")
            print(f"🔧 This confirms the issue described in the review request")
        
        # Step 4: Attempt to set password (this would require backend modification)
        print("\n" + "="*60)
        print("STEP 4: PASSWORD SETUP ANALYSIS")
        print("="*60)
        
        print("🔍 ANALYSIS:")
        print(f"   • User {self.target_email} exists in database")
        print(f"   • User has super_admin role")
        print(f"   • User is active: {fives_user.get('is_active')}")
        print(f"   • User CANNOT login with any common passwords")
        print(f"   • This indicates the password field is either:")
        print(f"     - Not set (NULL/empty)")
        print(f"     - Set to an unknown value")
        print(f"     - Corrupted/invalid hash")
        
        print("\n🔧 REQUIRED FIX:")
        print(f"   The backend needs to implement a way to set/reset the password")
        print(f"   for {self.target_email} to '{self.target_password}' as requested.")
        print(f"   This could be done via:")
        print(f"   1. Direct database update with bcrypt hash")
        print(f"   2. Admin password reset endpoint")
        print(f"   3. Manual password update in user management")
        
        return False

if __name__ == "__main__":
    tester = SuperAdminPasswordTester()
    result = tester.test_super_admin_password_setup()
    
    print("\n" + "="*60)
    print("SUPER ADMIN PASSWORD TEST SUMMARY")
    print("="*60)
    
    if result:
        print("✅ fives@eternalsgg.com can access dashboard via email/password login")
    else:
        print("❌ fives@eternalsgg.com CANNOT access dashboard via email/password login")
        print("🔧 PASSWORD SETUP REQUIRED as described in review request")
    
    sys.exit(0 if result else 1)