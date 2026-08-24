import requests

BASE_URL = "http://localhost:3000/api"
AUTH_CREDENTIALS = {"email": "kay@gmail.com", "password": "kay123"}
TIMEOUT = 30

def login_get_token(email, password):
    url = f"{BASE_URL}/auth/login"
    resp = requests.post(url, json={"email": email, "password": password}, timeout=TIMEOUT)
    assert resp.status_code == 200, f"Login failed with status code {resp.status_code}: {resp.text}"
    data = resp.json()
    token = data.get("token") or data.get("accessToken") or data.get("jwt") or data.get("access_token")
    assert token, "JWT token not found in login response"
    return token

def create_ticket(token, ticket_data):
    url = f"{BASE_URL}/tickets/create"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(url, json=ticket_data, headers=headers, timeout=TIMEOUT)
    assert resp.status_code == 201, f"Ticket creation failed: {resp.status_code} {resp.text}"
    return resp.json()

def update_ticket(token, ticket_id, update_data):
    url = f"{BASE_URL}/tickets/{ticket_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.put(url, json=update_data, headers=headers, timeout=TIMEOUT)
    return resp

def delete_ticket(token, ticket_id):
    url = f"{BASE_URL}/tickets/{ticket_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    return resp

def test_postapiticketscreateandputapiticketsidwithrolebasedupdates():
    # Login as user kay@gmail.com
    token = login_get_token(AUTH_CREDENTIALS["email"], AUTH_CREDENTIALS["password"])

    # Valid ticket data to create
    ticket_create_data = {
        "title": "Test Ticket Title",
        "description": "Test ticket description",
        "priority": "medium",
        "status": "open"
    }

    ticket = None

    try:
        # Create ticket with valid data
        ticket = create_ticket(token, ticket_create_data)
        ticket_id = ticket.get("id") or ticket.get("_id")
        assert ticket_id, "Created ticket has no ID"

        # Attempt valid update: user can update description only
        valid_update = {
            "description": "Updated description by user"
        }
        resp_valid_update = update_ticket(token, ticket_id, valid_update)
        assert resp_valid_update.status_code == 200, f"Valid update failed: {resp_valid_update.status_code} {resp_valid_update.text}"
        updated_ticket = resp_valid_update.json()
        assert updated_ticket.get("description") == valid_update["description"], "Description not updated correctly"

        # Attempt invalid update: user tries to update restricted fields status and priority
        invalid_update = {
            "status": "closed",
            "priority": "high"
        }
        resp_invalid_update = update_ticket(token, ticket_id, invalid_update)
        # Expect 403 Forbidden or 400 Bad Request due to role restrictions
        assert resp_invalid_update.status_code in (400, 403), f"Invalid update status code unexpected: {resp_invalid_update.status_code}"
        # Optionally validate error message contains restriction info
        err_json = {}
        try:
            err_json = resp_invalid_update.json()
            err_msg = err_json.get("message", "").lower()
            assert ("status" in err_msg or "priority" in err_msg or "forbidden" in err_msg or "validation" in err_msg), "Error message does not indicate forbidden field update"
        except Exception:
            pass

    finally:
        # Cleanup: delete created ticket if possible
        if ticket is not None:
            del_resp = delete_ticket(token, ticket_id)
            # Deletion might fail if user cannot delete (depends on role), so no assertion here

test_postapiticketscreateandputapiticketsidwithrolebasedupdates()
