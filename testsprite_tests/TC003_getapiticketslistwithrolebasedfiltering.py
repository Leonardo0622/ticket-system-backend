import requests

BASE_URL = "http://localhost:5173"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
TICKETS_LIST_URL = f"{BASE_URL}/api/tickets/list"
TIMEOUT = 30

def test_get_api_tickets_list_with_role_based_filtering():
    # Credentials for different roles to validate role-based filtering
    users = [
        {"email": "kay@gmail.com", "password": "kay123", "expected_role": "user"},
        # Assuming some known agent and admin credentials – placeholders to be replaced if needed
        {"email": "agent1@example.com", "password": "agentpass", "expected_role": "agent"},
        {"email": "admin@example.com", "password": "adminpass", "expected_role": "admin"},
    ]
    
    for user in users:
        # Login to get JWT token
        try:
            login_resp = requests.post(
                LOGIN_URL,
                json={
                    "email": user["email"],
                    "password": user["password"]
                },
                timeout=TIMEOUT
            )
        except requests.RequestException as e:
            assert False, f"Login request failed for {user['email']}: {e}"

        assert login_resp.status_code == 200, f"Login failed for {user['email']}: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("token")
        user_payload = login_data.get("user")
        assert token is not None, f"No token received for {user['email']}"
        assert user_payload is not None, f"No user payload received for {user['email']}"

        # Get tickets list with Authorization header
        headers = {
            "Authorization": f"Bearer {token}"
        }
        try:
            tickets_resp = requests.get(TICKETS_LIST_URL, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Tickets list request failed for {user['email']}: {e}"

        assert tickets_resp.status_code == 200, f"Failed to fetch tickets list for {user['email']}: {tickets_resp.text}"
        tickets_data = tickets_resp.json()

        # Expecting a dict with a 'tickets' key containing list of tickets
        assert isinstance(tickets_data, dict), f"Tickets response should be a dict containing 'tickets' key for {user['email']}"
        assert 'tickets' in tickets_data, f"Tickets response missing 'tickets' key for {user['email']}"
        tickets_list = tickets_data['tickets']
        assert isinstance(tickets_list, list), f"'tickets' should be a list for {user['email']}"

        # Validate tickets based on role
        expected_role = user["expected_role"].lower()
        for ticket in tickets_list:
            # Each ticket should at least have "ownerId", "assignedAgentId", "status", "priority" fields per typical schema
            owner_id = ticket.get("ownerId")
            assigned_agent_id = ticket.get("assignedAgentId")
            # Validate presence of required keys in each ticket
            assert "id" in ticket, "Ticket missing 'id' field"
            assert "status" in ticket, "Ticket missing 'status' field"
            assert "priority" in ticket, "Ticket missing 'priority' field"
            assert "description" in ticket, "Ticket missing 'description' field"

            # User can see own tickets only
            if expected_role == "user":
                # user id must match ownerId in ticket
                assert user_payload.get("id") == owner_id, (
                    f"User role sees ticket not owned by them. User ID: {user_payload.get('id')} Ticket ownerId: {owner_id}"
                )

            # Agent can see assigned tickets only
            elif expected_role == "agent":
                # user id must match assignedAgentId in ticket
                assert user_payload.get("id") == assigned_agent_id, (
                    f"Agent role sees ticket not assigned to them. Agent ID: {user_payload.get('id')} Ticket assignedAgentId: {assigned_agent_id}"
                )

            # Admin can see all tickets, no filtering needed
            elif expected_role == "admin":
                # No additional check required for admin
                pass
            else:
                assert False, f"Unknown role {expected_role} for user {user['email']}"

test_get_api_tickets_list_with_role_based_filtering()
