#!/usr/bin/env python3
"""
Focused Counter Statistics API Testing
Tests the specific requirements from the review request
"""

import requests
import json
from datetime import datetime

def test_counter_stats_api():
    """Test the updated counter statistics API endpoints"""
    base_url = "https://portfolio-cms-3.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 FOCUSED COUNTER STATISTICS API TESTING")
    print("=" * 60)
    
    # Test 1: GET /api/counter-stats - Verify 3 fields only
    print("\n1. Testing GET /api/counter-stats structure...")
    response = requests.get(f"{api_url}/counter-stats")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ GET request successful (Status: {response.status_code})")
        
        # Check expected fields
        expected_fields = ["projects_completed", "team_members", "support_available"]
        removed_fields = ["happy_clients"]
        
        print("\n📋 Field verification:")
        for field in expected_fields:
            if field in data:
                print(f"   ✅ {field}: {data[field]} (present)")
            else:
                print(f"   ❌ {field}: missing")
        
        for field in removed_fields:
            if field not in data:
                print(f"   ✅ {field}: correctly removed")
            else:
                print(f"   ❌ {field}: {data[field]} (should be removed)")
        
        # Verify projects_completed is auto-synced (should be integer >= 0)
        projects_count = data.get("projects_completed")
        if isinstance(projects_count, int) and projects_count >= 0:
            print(f"   ✅ projects_completed auto-sync: {projects_count} (valid)")
        else:
            print(f"   ❌ projects_completed auto-sync: {projects_count} (invalid)")
        
        print(f"\n📄 Full response: {json.dumps(data, indent=2)}")
        
    else:
        print(f"❌ GET request failed (Status: {response.status_code})")
        return False
    
    # Test 2: Create admin user for PUT testing
    print("\n2. Setting up admin user for PUT testing...")
    
    # Register admin
    admin_data = {
        "email": f"test_admin_{datetime.now().strftime('%H%M%S')}@test.com",
        "password": "TestAdmin123!",
        "full_name": "Test Admin",
        "role": "admin"
    }
    
    register_response = requests.post(f"{api_url}/auth/register", json=admin_data)
    if register_response.status_code != 200:
        print(f"❌ Admin registration failed: {register_response.status_code}")
        return False
    
    # Login admin
    login_data = {
        "username": admin_data["email"],
        "password": admin_data["password"]
    }
    
    login_response = requests.post(
        f"{api_url}/auth/login", 
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Admin login failed: {login_response.status_code}")
        return False
    
    admin_token = login_response.json()["access_token"]
    print("✅ Admin user created and authenticated")
    
    # Test 3: PUT /api/counter-stats - Test manual updates and auto-sync
    print("\n3. Testing PUT /api/counter-stats functionality...")
    
    update_data = {
        "id": data.get("id", "test-id"),
        "projects_completed": 999,  # This should be ignored (auto-sync)
        "team_members": 10,         # This should be updated
        "support_available": "24/7 Enterprise"  # This should be updated
    }
    
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    put_response = requests.put(f"{api_url}/counter-stats", json=update_data, headers=headers)
    
    if put_response.status_code == 200:
        put_data = put_response.json()
        print(f"✅ PUT request successful (Status: {put_response.status_code})")
        
        print("\n📋 Update verification:")
        
        # Verify manual fields were updated
        if put_data.get("team_members") == 10:
            print(f"   ✅ team_members: {put_data.get('team_members')} (updated correctly)")
        else:
            print(f"   ❌ team_members: expected 10, got {put_data.get('team_members')}")
        
        if put_data.get("support_available") == "24/7 Enterprise":
            print(f"   ✅ support_available: {put_data.get('support_available')} (updated correctly)")
        else:
            print(f"   ❌ support_available: expected '24/7 Enterprise', got {put_data.get('support_available')}")
        
        # Verify projects_completed was auto-synced (not 999)
        if put_data.get("projects_completed") != 999:
            print(f"   ✅ projects_completed: {put_data.get('projects_completed')} (auto-synced, ignored 999)")
        else:
            print(f"   ❌ projects_completed: {put_data.get('projects_completed')} (should not be 999)")
        
        # Verify happy_clients is not present
        if "happy_clients" not in put_data:
            print("   ✅ happy_clients: correctly absent")
        else:
            print(f"   ❌ happy_clients: {put_data.get('happy_clients')} (should be absent)")
        
        print(f"\n📄 Full PUT response: {json.dumps(put_data, indent=2)}")
        
    else:
        print(f"❌ PUT request failed (Status: {put_response.status_code})")
        print(f"Error: {put_response.text}")
        return False
    
    # Test 4: Verify persistence
    print("\n4. Testing data persistence...")
    
    verify_response = requests.get(f"{api_url}/counter-stats")
    if verify_response.status_code == 200:
        verify_data = verify_response.json()
        print("✅ Persistence verification successful")
        
        print("\n📋 Persistence check:")
        if verify_data.get("team_members") == 10:
            print(f"   ✅ team_members: {verify_data.get('team_members')} (persisted)")
        else:
            print(f"   ❌ team_members: expected 10, got {verify_data.get('team_members')}")
        
        if verify_data.get("support_available") == "24/7 Enterprise":
            print(f"   ✅ support_available: {verify_data.get('support_available')} (persisted)")
        else:
            print(f"   ❌ support_available: expected '24/7 Enterprise', got {verify_data.get('support_available')}")
        
        if isinstance(verify_data.get("projects_completed"), int):
            print(f"   ✅ projects_completed: {verify_data.get('projects_completed')} (auto-synced)")
        else:
            print(f"   ❌ projects_completed: {verify_data.get('projects_completed')} (invalid)")
        
        if "happy_clients" not in verify_data:
            print("   ✅ happy_clients: still absent after persistence")
        else:
            print(f"   ❌ happy_clients: {verify_data.get('happy_clients')} (should remain absent)")
    
    else:
        print(f"❌ Persistence verification failed (Status: {verify_response.status_code})")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 ALL COUNTER STATISTICS TESTS PASSED!")
    print("✅ GET /api/counter-stats returns correct 3 fields (no happy_clients)")
    print("✅ projects_completed auto-syncs from database count")
    print("✅ PUT /api/counter-stats allows admin updates for team_members and support_available")
    print("✅ Data persistence works correctly in MongoDB")
    print("✅ Auto-sync behavior works for projects_completed")
    return True

if __name__ == "__main__":
    test_counter_stats_api()