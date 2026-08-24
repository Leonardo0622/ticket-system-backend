import requests

def test_postapiauthloginwithvalidandinvalidcredentials():
    base_url = "http://localhost:5173"
    login_endpoint = f"{base_url}/api/auth/login"
    headers = {"Content-Type": "application/json"}
    timeout = 30

    # Valid credentials payload
    valid_payload = {
        "email": "kay@gmail.com",
        "password": "kay123"
    }

    # Invalid credentials payload
    invalid_payload = {
        "email": "kay@gmail.com",
        "password": "wrongpassword"
    }

    try:
        # Test login with valid credentials
        valid_response = requests.post(login_endpoint, json=valid_payload, headers=headers, timeout=timeout)
        assert valid_response.status_code == 200, f"Expected 200 OK for valid login, got {valid_response.status_code}"

        valid_json = valid_response.json()
        # Validate presence of JWT token (assuming response contains 'token' field with JWT)
        assert "token" in valid_json and isinstance(valid_json["token"], str) and len(valid_json["token"]) > 0, "JWT token missing or invalid in valid login response"
        # Validate presence of user info (assuming 'user' field)
        assert "user" in valid_json and isinstance(valid_json["user"], dict), "User data missing or invalid in valid login response"

        # Test login with invalid credentials
        invalid_response = requests.post(login_endpoint, json=invalid_payload, headers=headers, timeout=timeout)
        assert invalid_response.status_code == 401, f"Expected 401 Unauthorized for invalid login, got {invalid_response.status_code}"

        # Optionally, confirm response body for error message
        try:
            invalid_json = invalid_response.json()
            assert ("error" in invalid_json or "message" in invalid_json), "Error message missing in invalid login response"
        except ValueError:
            # Response not JSON, pass as error case handled by status code
            pass

    except requests.RequestException as e:
        assert False, f"RequestException during login tests: {e}"

test_postapiauthloginwithvalidandinvalidcredentials()
