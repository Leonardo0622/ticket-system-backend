import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

admin_credentials = {"email": "kay@gmail.com", "password": "kay123"}
# Non-admin user credentials for testing 403 forbidden
non_admin_credentials = {"email": "user@example.com", "password": "user123"}

def login(email, password):
    url = f"{BASE_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    try:
        r = requests.post(url, json=payload, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        token = data.get("token")
        assert token is not None, "Login response missing token"
        return token
    except requests.RequestException as e:
        raise AssertionError(f"Login failed for {email}: {e}")

def create_ticket(token):
    url = f"{BASE_URL}/api/tickets/create"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Test Ticket for Assignment",
        "description": "This is a test ticket created to verify assignment and deletion by admin",
        "priority": "medium"
    }
    try:
        r = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        ticket_id = data.get("id") or data.get("_id")
        assert ticket_id is not None, "Created ticket response missing id"
        return ticket_id
    except requests.RequestException as e:
        raise AssertionError(f"Ticket creation failed: {e}")

def delete_ticket(token, ticket_id):
    url = f"{BASE_URL}/api/tickets/{ticket_id}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.delete(url, headers=headers, timeout=TIMEOUT)
        # Accept 200 OK or 204 No Content for successful deletion
        assert r.status_code in (200, 204), f"Unexpected status code deleting ticket: {r.status_code}"
    except requests.RequestException as e:
        # Log but do not raise, since it's cleanup
        print(f"Warning: failed to delete ticket {ticket_id}: {e}")

def assign_ticket(token, ticket_id, agent_id):
    url = f"{BASE_URL}/api/tickets/{ticket_id}/assign"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"agentId": agent_id}
    try:
        r = requests.patch(url, json=payload, headers=headers, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        assigned_agent = data.get("assignedAgent") or data.get("agent") or data.get("assignedTo")
        assert assigned_agent is not None, "Response missing assigned agent info"
        # Validate agent id matches
        if isinstance(assigned_agent, dict):
            assert assigned_agent.get("id") == agent_id or assigned_agent.get("_id") == agent_id, \
                "Assigned agent ID does not match"
        else:
            assert assigned_agent == agent_id, "Assigned agent value does not match agent_id"
    except requests.RequestException as e:
        raise AssertionError(f"Assign ticket failed: {e}")

def get_any_agent_id(token):
    # Admin can list users to find an agent
    url = f"{BASE_URL}/api/auth/users"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        r = requests.get(url, headers=headers, timeout=TIMEOUT)
        r.raise_for_status()
        users = r.json()
        for user in users:
            roles = user.get("roles") or user.get("role") or []
            if isinstance(roles, str):
                roles = [roles]
            if "agent" in roles:
                return user.get("id") or user.get("_id")
        raise AssertionError("No agent user found for assignment")
    except requests.RequestException as e:
        raise AssertionError(f"Failed to get users for agent selection: {e}")

def test_patch_api_tickets_id_assign_and_delete_with_role_permissions():
    # Login as admin
    admin_token = login(admin_credentials["email"], admin_credentials["password"])
    # Login as non-admin (user)
    try:
        non_admin_token = login(non_admin_credentials["email"], non_admin_credentials["password"])
    except AssertionError:
        # Non-admin user may not exist, create a user and login
        reg_url = f"{BASE_URL}/api/auth/register"
        reg_payload = {
            "email": non_admin_credentials["email"],
            "password": non_admin_credentials["password"],
            "name": "Test User"
        }
        r = requests.post(reg_url, json=reg_payload, timeout=TIMEOUT)
        assert r.status_code == 201, f"User registration failed with status {r.status_code}"
        non_admin_token = login(non_admin_credentials["email"], non_admin_credentials["password"])

    ticket_id = None
    try:
        # Create a ticket with admin (could create with user too, but admin can delete any)
        ticket_id = create_ticket(admin_token)
        # Get an agent ID for assignment
        agent_id = get_any_agent_id(admin_token)
        # PATCH assign ticket as admin - should succeed
        assign_ticket(admin_token, ticket_id, agent_id)

        # DELETE ticket as admin - should succeed
        delete_url = f"{BASE_URL}/api/tickets/{ticket_id}"
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        resp = requests.delete(delete_url, headers=headers_admin, timeout=TIMEOUT)
        assert resp.status_code in (200, 204), f"Admin failed to delete ticket, status: {resp.status_code}"

        # Create a new ticket again for testing non-admin forbidden actions
        ticket_id = create_ticket(admin_token)

        # PATCH assign as non-admin user - should be forbidden 403
        assign_url = f"{BASE_URL}/api/tickets/{ticket_id}/assign"
        headers_user = {"Authorization": f"Bearer {non_admin_token}"}
        payload_assign = {"agentId": agent_id}
        resp_assign = requests.patch(assign_url, json=payload_assign, headers=headers_user, timeout=TIMEOUT)
        assert resp_assign.status_code == 403, f"Non-admin assign did not return 403, got {resp_assign.status_code}"

        # DELETE ticket as non-admin user - should be forbidden (403 or 404)
        delete_url = f"{BASE_URL}/api/tickets/{ticket_id}"
        resp_delete = requests.delete(delete_url, headers=headers_user, timeout=TIMEOUT)
        assert resp_delete.status_code in (403, 404), f"Non-admin delete did not return 403/404, got {resp_delete.status_code}"

    finally:
        # Cleanup: delete ticket as admin if still exists
        if ticket_id is not None:
            try:
                delete_ticket(admin_token, ticket_id)
            except Exception as e:
                print(f"Cleanup failed: {e}")

test_patch_api_tickets_id_assign_and_delete_with_role_permissions()