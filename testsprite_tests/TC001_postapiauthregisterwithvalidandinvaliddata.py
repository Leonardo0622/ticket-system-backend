import requests

BASE_URL = "http://localhost:5173/api/auth/register"
TIMEOUT = 30

def test_post_api_auth_register_with_valid_and_invalid_data():
    headers = {
        "Content-Type": "application/json"
    }

    # Valid registration data (adjusted 'username' to 'name' to match probable API expectation)
    valid_payload = {
        "name": "testuser123",
        "email": "testuser123@example.com",
        "password": "StrongPass!123"
    }

    # Invalid/incomplete registration payloads examples
    invalid_payloads = [
        {},  # empty payload
        {"name": ""},  # name empty
        {"email": "not-an-email"},  # invalid email format
        {"password": "123"},  # weak/short password
        {"name": "tu", "email": "bademail@", "password": ""},  # multiple invalid fields
    ]

    # Test valid registration - expecting 201 Created
    try:
        response = requests.post(BASE_URL, json=valid_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed for valid registration data: {e}"

    assert response.status_code == 201, f"Expected 201 Created for valid data, got {response.status_code}"
    try:
        resp_json = response.json()
    except ValueError:
        assert False, "Response body is not valid JSON for valid registration"
    # Typical successful response might contain user name and email, no password
    assert "name" in resp_json and "email" in resp_json, "Expected 'name' and 'email' in response for valid registration"
    assert "password" not in resp_json, "Password should not be included in registration response"

    # Test invalid/incomplete registration payloads - expecting 400 Bad Request
    for idx, invalid_payload in enumerate(invalid_payloads):
        try:
            resp = requests.post(BASE_URL, json=invalid_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed for invalid registration payload index {idx}: {e}"

        assert resp.status_code == 400, f"Expected 400 Bad Request for invalid payload index {idx}, got {resp.status_code}"
        try:
            error_json = resp.json()
        except ValueError:
            assert False, f"Response body not JSON for invalid payload index {idx}"

        # Expecting some kind of validation error message or error structure
        assert any(key in error_json for key in ["error", "message", "errors"]), \
            f"Expected validation error key in response for invalid payload index {idx}"

# Run the test function
test_post_api_auth_register_with_valid_and_invalid_data()