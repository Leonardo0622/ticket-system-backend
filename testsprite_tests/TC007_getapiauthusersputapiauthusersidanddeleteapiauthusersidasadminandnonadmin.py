import requests

BASE_URL = "http://localhost:5173/api"
TIMEOUT = 30

admin_credentials = {"email": "kay@gmail.com", "password": "kay123"}
non_admin_credentials = {"email": "nonadminuser@gmail.com", "password": "nonadminpass"}

def login(email, password):
    resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    token = data.get("token")
    user = data.get("user")
    assert token and user, "Login failed to return token or user info"
    return token, user

def create_user(user_data):
    resp = requests.post(
        f"{BASE_URL}/auth/register",
        json=user_data,
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()

def test_admin_and_nonadmin_user_management():
    # Login as admin
    admin_token, admin_user = login(**admin_credentials)
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # Create a non-admin user to test management operations
    new_user_data = {
        "email": "testuser_for_management@example.com",
        "username": "testuser_management",
        "password": "Testpass123!"
    }
    # Register user without auth because register is open
    created_user = create_user(new_user_data)
    user_id = created_user.get("id") or created_user.get("_id")
    assert user_id, "Created user has no id"

    headers_nonadmin = None
    try:
        # Login as the newly created non-admin user
        nonadmin_token, nonadmin_user = login(new_user_data["email"], new_user_data["password"])
        headers_nonadmin = {"Authorization": f"Bearer {nonadmin_token}"}
    except requests.HTTPError:
        # Fallback: create a user with known nonadmin credentials for this test
        nonadmin_token, nonadmin_user = login(**non_admin_credentials)
        headers_nonadmin = {"Authorization": f"Bearer {nonadmin_token}"}

    try:
        # 1. Admin GET /api/auth/users => 200 and user list includes created user
        resp = requests.get(f"{BASE_URL}/auth/users", headers=headers_admin, timeout=TIMEOUT)
        assert resp.status_code == 200
        users = resp.json()
        assert any(u.get("id") == user_id or u.get("_id") == user_id for u in users), "Created user not in users list"

        # 2. Non-admin GET /api/auth/users => 403 Forbidden
        resp = requests.get(f"{BASE_URL}/auth/users", headers=headers_nonadmin, timeout=TIMEOUT)
        assert resp.status_code == 403

        # 3. Admin PUT /api/auth/users/:id with valid update data => 200 and update reflected
        update_data = {"username": "updated_testuser_management"}
        resp = requests.put(
            f"{BASE_URL}/auth/users/{user_id}",
            json=update_data,
            headers=headers_admin,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        updated_user = resp.json()
        assert updated_user.get("username") == update_data["username"]

        # 4. Non-admin PUT /api/auth/users/:id => 403 Forbidden
        resp = requests.put(
            f"{BASE_URL}/auth/users/{user_id}",
            json={"username": "shouldfail"},
            headers=headers_nonadmin,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 403

        # 5. Admin DELETE /api/auth/users/:id => 204 or 200 confirming deletion
        resp = requests.delete(f"{BASE_URL}/auth/users/{user_id}", headers=headers_admin, timeout=TIMEOUT)
        assert resp.status_code in (200, 204)

        # 6. Non-admin DELETE /api/auth/users/:id => 403 Forbidden
        # The user is deleted by admin; to test non-admin delete we need another user:
        # So create one more user for this check:
        second_user_data = {
            "email": "testuser_for_management2@example.com",
            "username": "testuser_management2",
            "password": "Testpass123!"
        }
        second_user_created = create_user(second_user_data)
        second_user_id = second_user_created.get("id") or second_user_created.get("_id")
        resp_2 = requests.delete(
            f"{BASE_URL}/auth/users/{second_user_id}",
            headers=headers_nonadmin,
            timeout=TIMEOUT,
        )
        assert resp_2.status_code == 403

        # Cleanup second user by admin
        requests.delete(f"{BASE_URL}/auth/users/{second_user_id}", headers=headers_admin, timeout=TIMEOUT)

    finally:
        # Cleanup user if not deleted
        try:
            requests.delete(f"{BASE_URL}/auth/users/{user_id}", headers=headers_admin, timeout=TIMEOUT)
        except Exception:
            pass

test_admin_and_nonadmin_user_management()
