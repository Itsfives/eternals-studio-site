#!/usr/bin/env python3
"""
Focused Testimonial Submission Testing for Eternals Studio
Tests specifically for testimonial submission functionality as requested in review
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class TestimonialSubmissionTester:
    def __init__(self, base_url="https://graphix-hub-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.client_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.issues_found = []
        
        print(f"🎯 FOCUSED TESTIMONIAL SUBMISSION TESTING")
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
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   📄 Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   📄 Error: {error_detail}")
                    self.issues_found.append(f"{name}: Expected {expected_status}, got {response.status_code} - {error_detail}")
                except:
                    print(f"   📄 Error: {response.text}")
                    self.issues_found.append(f"{name}: Expected {expected_status}, got {response.status_code} - {response.text[:100]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"   ❌ FAILED - Network Error: {str(e)}")
            self.issues_found.append(f"{name}: Network Error - {str(e)}")
            return False, {}
        except Exception as e:
            print(f"   ❌ FAILED - Error: {str(e)}")
            self.issues_found.append(f"{name}: Error - {str(e)}")
            return False, {}

    def setup_admin_user(self):
        """Setup admin user for testing approval workflow"""
        print("\n" + "="*60)
        print("🔐 SETTING UP ADMIN USER FOR TESTING")
        print("="*60)
        
        # Register admin user
        admin_data = {
            "role": "admin",
            "email": f"testimonial_admin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestAdmin123!",
            "full_name": "Testimonial Admin",
            "company": "Eternals Studio"
        }
        
        success, response = self.run_test(
            "Register admin user",
            "POST",
            "auth/register",
            200,
            data=admin_data
        )
        
        if success:
            # Login admin user
            login_data = {
                "username": admin_data["email"],
                "password": admin_data["password"]
            }
            
            success, login_response = self.run_test(
                "Login admin user",
                "POST", 
                "auth/login",
                200,
                data=login_data,
                headers={"Content-Type": "multipart/form-data"}
            )
            
            if success and "access_token" in login_response:
                self.admin_token = login_response["access_token"]
                print(f"   ✅ Admin user setup successful")
                return True
        
        print(f"   ❌ Admin user setup failed")
        return False

    def test_testimonial_endpoint_availability(self):
        """Test 1: Check if testimonial endpoints are available"""
        print("\n" + "="*60)
        print("🔍 TEST 1: TESTIMONIAL ENDPOINT AVAILABILITY")
        print("="*60)
        
        # Test GET /api/testimonials (should work without auth)
        success, response = self.run_test(
            "Check GET /api/testimonials availability",
            "GET",
            "testimonials",
            200
        )
        
        if success:
            print(f"   ✅ GET /api/testimonials is available")
            print(f"   📊 Current approved testimonials: {len(response)}")
            return True
        else:
            print(f"   ❌ GET /api/testimonials is not available")
            return False

    def test_testimonial_submission_with_valid_data(self):
        """Test 2: Submit testimonial with valid data"""
        print("\n" + "="*60)
        print("🔍 TEST 2: TESTIMONIAL SUBMISSION WITH VALID DATA")
        print("="*60)
        
        # Test with comprehensive valid data
        testimonial_data = {
            "client_name": "Emily Rodriguez",
            "client_role": "Creative Director",
            "client_avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
            "rating": 5,
            "title": "Exceptional Design Work",
            "content": "Eternals Studio exceeded our expectations with their creative approach and professional service. The team delivered outstanding results on time and within budget. Highly recommend their services for any design project!",
            "highlights": ["Creative Excellence", "Professional Service", "On-Time Delivery", "Great Communication"]
        }
        
        success, response = self.run_test(
            "Submit testimonial with valid data",
            "POST",
            "testimonials",
            200,
            data=testimonial_data
        )
        
        if success:
            testimonial_id = response.get("id")
            if testimonial_id:
                print(f"   ✅ Testimonial created with ID: {testimonial_id}")
                self.testimonial_id = testimonial_id
                
                # Verify testimonial is unapproved by default
                if not response.get("approved", True):
                    print(f"   ✅ Testimonial correctly created as unapproved")
                else:
                    print(f"   ⚠️  Testimonial was auto-approved (should require admin approval)")
                    self.issues_found.append("Testimonial auto-approved instead of requiring admin approval")
                
                # Verify all fields are present
                required_fields = ["client_name", "client_role", "rating", "title", "content"]
                missing_fields = []
                for field in required_fields:
                    if field not in response:
                        missing_fields.append(field)
                
                if not missing_fields:
                    print(f"   ✅ All required fields present in response")
                else:
                    print(f"   ❌ Missing fields in response: {missing_fields}")
                    self.issues_found.append(f"Missing fields in testimonial response: {missing_fields}")
                
                return True
            else:
                print(f"   ❌ No testimonial ID returned")
                self.issues_found.append("No testimonial ID returned in response")
                return False
        else:
            print(f"   ❌ Testimonial submission failed")
            return False

    def test_testimonial_data_validation(self):
        """Test 3: Test testimonial data validation"""
        print("\n" + "="*60)
        print("🔍 TEST 3: TESTIMONIAL DATA VALIDATION")
        print("="*60)
        
        validation_tests = [
            {
                "name": "Missing client_name",
                "data": {
                    "client_role": "Manager",
                    "rating": 5,
                    "title": "Great work",
                    "content": "Excellent service"
                },
                "expected_status": 422
            },
            {
                "name": "Missing title",
                "data": {
                    "client_name": "John Doe",
                    "client_role": "Manager",
                    "rating": 5,
                    "content": "Excellent service"
                },
                "expected_status": 422
            },
            {
                "name": "Missing content",
                "data": {
                    "client_name": "John Doe",
                    "client_role": "Manager",
                    "rating": 5,
                    "title": "Great work"
                },
                "expected_status": 422
            },
            {
                "name": "Invalid rating (too high)",
                "data": {
                    "client_name": "John Doe",
                    "client_role": "Manager",
                    "rating": 6,
                    "title": "Great work",
                    "content": "Excellent service"
                },
                "expected_status": 422
            },
            {
                "name": "Invalid rating (too low)",
                "data": {
                    "client_name": "John Doe",
                    "client_role": "Manager",
                    "rating": 0,
                    "title": "Great work",
                    "content": "Excellent service"
                },
                "expected_status": 422
            }
        ]
        
        validation_passed = 0
        for test in validation_tests:
            success, response = self.run_test(
                f"Validation: {test['name']}",
                "POST",
                "testimonials",
                test["expected_status"],
                data=test["data"]
            )
            if success:
                validation_passed += 1
        
        print(f"\n   📊 Validation Tests: {validation_passed}/{len(validation_tests)} passed")
        
        if validation_passed >= len(validation_tests) * 0.8:  # 80% success rate
            print(f"   ✅ Data validation working correctly")
            return True
        else:
            print(f"   ❌ Data validation has issues")
            self.issues_found.append(f"Data validation issues: only {validation_passed}/{len(validation_tests)} tests passed")
            return False

    def test_testimonial_approval_workflow(self):
        """Test 4: Test admin approval workflow"""
        print("\n" + "="*60)
        print("🔍 TEST 4: TESTIMONIAL APPROVAL WORKFLOW")
        print("="*60)
        
        if not self.admin_token:
            print("   ❌ No admin token available - skipping approval tests")
            self.issues_found.append("Admin token not available for approval workflow testing")
            return False
        
        if not hasattr(self, 'testimonial_id'):
            print("   ❌ No testimonial ID available - skipping approval tests")
            self.issues_found.append("No testimonial ID available for approval workflow testing")
            return False
        
        # Test admin approval
        success, response = self.run_test(
            "Admin approve testimonial",
            "PUT",
            f"testimonials/{self.testimonial_id}/approve",
            200,
            token=self.admin_token
        )
        
        if success:
            if response.get("approved"):
                print(f"   ✅ Testimonial successfully approved by admin")
                
                # Verify approved testimonial appears in public list
                success, public_testimonials = self.run_test(
                    "Check approved testimonial in public list",
                    "GET",
                    "testimonials",
                    200
                )
                
                if success:
                    # Look for our testimonial in the list
                    found_testimonial = False
                    for testimonial in public_testimonials:
                        if testimonial.get("id") == self.testimonial_id:
                            found_testimonial = True
                            break
                    
                    if found_testimonial:
                        print(f"   ✅ Approved testimonial appears in public list")
                        return True
                    else:
                        print(f"   ❌ Approved testimonial not found in public list")
                        self.issues_found.append("Approved testimonial not appearing in public list")
                        return False
                else:
                    print(f"   ❌ Could not retrieve public testimonials list")
                    return False
            else:
                print(f"   ❌ Testimonial approval failed")
                self.issues_found.append("Testimonial approval did not set approved status to true")
                return False
        else:
            print(f"   ❌ Admin approval request failed")
            return False

    def test_unauthorized_approval_attempts(self):
        """Test 5: Test unauthorized approval attempts"""
        print("\n" + "="*60)
        print("🔍 TEST 5: UNAUTHORIZED APPROVAL ATTEMPTS")
        print("="*60)
        
        if not hasattr(self, 'testimonial_id'):
            print("   ❌ No testimonial ID available - skipping unauthorized tests")
            return False
        
        # Test approval without authentication
        success, response = self.run_test(
            "Approve testimonial without auth (should fail)",
            "PUT",
            f"testimonials/{self.testimonial_id}/approve",
            401  # Expecting unauthorized
        )
        
        if success:
            print(f"   ✅ Unauthenticated approval correctly rejected")
            return True
        else:
            print(f"   ❌ Unauthenticated approval not properly rejected")
            self.issues_found.append("Unauthenticated approval attempts not properly rejected")
            return False

    def test_cors_and_connectivity(self):
        """Test 6: Test CORS and basic connectivity"""
        print("\n" + "="*60)
        print("🔍 TEST 6: CORS AND CONNECTIVITY")
        print("="*60)
        
        try:
            # Test basic connectivity
            response = requests.get(f"{self.api_url}/testimonials", timeout=10)
            
            # Check CORS headers
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            print(f"   📊 Response Status: {response.status_code}")
            print(f"   📊 Response Time: {response.elapsed.total_seconds():.3f}s")
            
            cors_ok = True
            for header, value in cors_headers.items():
                if value:
                    print(f"   ✅ {header}: {value}")
                else:
                    print(f"   ⚠️  {header}: Not present")
                    if header == 'Access-Control-Allow-Origin':
                        cors_ok = False
            
            if cors_ok:
                print(f"   ✅ CORS configuration appears correct")
                return True
            else:
                print(f"   ❌ CORS configuration may have issues")
                self.issues_found.append("CORS headers missing or incorrect")
                return False
                
        except Exception as e:
            print(f"   ❌ Connectivity test failed: {str(e)}")
            self.issues_found.append(f"Connectivity test failed: {str(e)}")
            return False

    def test_error_handling_and_responses(self):
        """Test 7: Test error handling and response codes"""
        print("\n" + "="*60)
        print("🔍 TEST 7: ERROR HANDLING AND RESPONSE CODES")
        print("="*60)
        
        error_tests = [
            {
                "name": "Invalid testimonial ID for approval",
                "method": "PUT",
                "endpoint": "testimonials/invalid-id/approve",
                "expected_status": 404,
                "token": self.admin_token
            },
            {
                "name": "Empty POST data",
                "method": "POST",
                "endpoint": "testimonials",
                "expected_status": 422,
                "data": {}
            },
            {
                "name": "Invalid JSON structure",
                "method": "POST",
                "endpoint": "testimonials",
                "expected_status": 422,
                "data": {"invalid": "structure"}
            }
        ]
        
        error_tests_passed = 0
        for test in error_tests:
            success, response = self.run_test(
                test["name"],
                test["method"],
                test["endpoint"],
                test["expected_status"],
                data=test.get("data"),
                token=test.get("token")
            )
            if success:
                error_tests_passed += 1
        
        print(f"\n   📊 Error Handling Tests: {error_tests_passed}/{len(error_tests)} passed")
        
        if error_tests_passed >= len(error_tests) * 0.8:
            print(f"   ✅ Error handling working correctly")
            return True
        else:
            print(f"   ❌ Error handling has issues")
            self.issues_found.append(f"Error handling issues: only {error_tests_passed}/{len(error_tests)} tests passed")
            return False

    def run_all_tests(self):
        """Run all testimonial submission tests"""
        print("\n🚀 STARTING COMPREHENSIVE TESTIMONIAL SUBMISSION TESTING")
        
        # Setup admin user first
        admin_setup = self.setup_admin_user()
        
        # Run all tests
        test_results = []
        test_results.append(("Endpoint Availability", self.test_testimonial_endpoint_availability()))
        test_results.append(("Valid Data Submission", self.test_testimonial_submission_with_valid_data()))
        test_results.append(("Data Validation", self.test_testimonial_data_validation()))
        
        if admin_setup:
            test_results.append(("Approval Workflow", self.test_testimonial_approval_workflow()))
        else:
            test_results.append(("Approval Workflow", False))
            self.issues_found.append("Could not test approval workflow - admin setup failed")
        
        test_results.append(("Unauthorized Access", self.test_unauthorized_approval_attempts()))
        test_results.append(("CORS & Connectivity", self.test_cors_and_connectivity()))
        test_results.append(("Error Handling", self.test_error_handling_and_responses()))
        
        # Print final results
        print("\n" + "="*60)
        print("📊 TESTIMONIAL SUBMISSION TEST RESULTS")
        print("="*60)
        
        passed_tests = 0
        for test_name, result in test_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name:.<30} {status}")
            if result:
                passed_tests += 1
        
        print(f"\nOverall: {self.tests_passed}/{self.tests_run} individual tests passed")
        print(f"Test Categories: {passed_tests}/{len(test_results)} categories passed")
        
        # Print issues found
        if self.issues_found:
            print("\n" + "="*60)
            print("🚨 ISSUES IDENTIFIED")
            print("="*60)
            for i, issue in enumerate(self.issues_found, 1):
                print(f"{i}. {issue}")
        else:
            print("\n✅ NO CRITICAL ISSUES FOUND")
        
        return passed_tests == len(test_results)

if __name__ == "__main__":
    tester = TestimonialSubmissionTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL TESTIMONIAL SUBMISSION TESTS PASSED!")
        sys.exit(0)
    else:
        print("\n❌ SOME TESTIMONIAL SUBMISSION TESTS FAILED!")
        sys.exit(1)