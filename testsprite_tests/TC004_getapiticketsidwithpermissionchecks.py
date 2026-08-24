import requests

BASE_URL = "http://localhost:5173/api"
AUTH_CREDENTIALS = {"email": "kay@gmail.com", "password": "kay123"}
TIMEOUT = 30


def test_get_api_tickets_id_with_permission_checks():
    # Login to get JWT token
    login_url = f"{BASE_URL}/auth/login"
    try:
        login_resp = requests.post(
            login_url,
            json=AUTH_CREDENTIALS,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json().get("token")
        assert token, "Missing token in login response"
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    headers = {"Authorization": f"Bearer {token}"}

    created_ticket_id = None
    ticket_data = {
        "title": "Test Permission Check Ticket",
        "description": "This ticket is created to test permission checks.",
        "priority": "medium",
        "status": "open"
    }

    # Create new ticket to ensure it is owned by kay@gmail.com and accessible (200)
    create_ticket_url = f"{BASE_URL}/tickets/create"
    try:
        create_resp = requests.post(
            create_ticket_url,
            json=ticket_data,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Ticket creation failed: {create_resp.text}"
        created_ticket = create_resp.json()
        # safely extract id
        created_ticket_id = created_ticket.get("id") or created_ticket.get("_id")
        assert created_ticket_id, "Created ticket ID not found"
    except requests.RequestException as e:
        assert False, f"Ticket creation request failed: {e}"

    # Test GET /api/tickets/:id for ticket owned by user (should be 200)
    get_ticket_url = f"{BASE_URL}/tickets/{created_ticket_id}"
    try:
        get_resp = requests.get(get_ticket_url, headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Expected 200 for own ticket, got {get_resp.status_code}"
        ticket = get_resp.json()
        assert ticket.get("id") == created_ticket_id or ticket.get("_id") == created_ticket_id, "Ticket ID mismatch"
        # Additional asserts for ticket fields to ensure full details
        for field in ["title", "description", "priority", "status"]:
            assert field in ticket, f"Missing field '{field}' in ticket details"
    except requests.RequestException as e:
        assert False, f"Get ticket by ID request failed: {e}"

    # To test permission denied (403) or not found (404):
    # Attempt to retrieve a ticket outside of permission.
    # We try to get a ticket ID that likely exists but not owned by this user.
    # We first list tickets to pick one not owned by the current user if possible.

    list_tickets_url = f"{BASE_URL}/tickets/list"
    outside_ticket_id = None
    try:
        list_resp = requests.get(list_tickets_url, headers=headers, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"Ticket list fetch failed: {list_resp.text}"
        tickets = list_resp.json()
        # Tickets returned for user role should be filtered to own tickets only.
        # To find outside ticket, simulate by searching for an ID that looks different,
        # but safer is to create another user and ticket, which is complex here.
        # Instead, attempt to access a likely non-existent ticket ID or another user's ticket ID.

        # Strategy:
        # Pick a ticket id from the list different than created_ticket_id to try
        # If only one ticket exists, try a random/non-existent ID to provoke 404.

        other_ticket_id = None
        for tk in tickets:
            tid = tk.get("id") or tk.get("_id")
            if tid and tid != created_ticket_id:
                other_ticket_id = tid
                break

        # If no other ticket found, use a fake ID for 404 testing
        if not other_ticket_id:
            other_ticket_id = "000000000000000000000000"  # 24-char hex for MongoDB ObjectId unlikely to exist

        outside_ticket_id = other_ticket_id
    except requests.RequestException as e:
        assert False, f"Ticket list request failed: {e}"

    # Attempt to get ticket outside permission scope, expect 403 or 404
    try:
        outside_ticket_url = f"{BASE_URL}/tickets/{outside_ticket_id}"
        outside_resp = requests.get(outside_ticket_url, headers=headers, timeout=TIMEOUT)
        assert outside_resp.status_code in (403, 404), (
            f"Expected 403 or 404 for outside permission ticket access, got {outside_resp.status_code}"
        )
    except requests.RequestException as e:
        assert False, f"Get outside permission ticket by ID request failed: {e}"

    # Cleanup: delete the created ticket after test
    delete_ticket_url = f"{BASE_URL}/tickets/{created_ticket_id}"
    try:
        delete_resp = requests.delete(delete_ticket_url, headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code in (200, 204), f"Ticket deletion failed: {delete_resp.text}"
    except requests.RequestException as e:
        # Log but do not fail the test on cleanup error
        print(f"Warning: Failed to delete ticket during cleanup: {e}")


test_get_api_tickets_id_with_permission_checks()
