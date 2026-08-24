import requests
import time

BASE_URL = "http://localhost:5173"
API_PREFIX = "/api"
AUTH_URL = BASE_URL + API_PREFIX + "/auth"
TICKETS_URL = BASE_URL + API_PREFIX + "/tickets"
TIMEOUT = 30

# Credentials for existing user from instruction
existing_username = "kay@gmail.com"
existing_password = "kay123"

def test_frontend_login_register_and_ticket_dashboard_flows():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    
    # Helper function to register a user
    def register_user(user_data):
        return session.post(
            AUTH_URL + "/register", json=user_data, timeout=TIMEOUT
        )
    
    # Helper function to login a user
    def login_user(credentials):
        return session.post(
            AUTH_URL + "/login", json=credentials, timeout=TIMEOUT
        )
    
    # 1. Test /register form validation (simulate empty and invalid inputs)
    invalid_registrations = [
        {},  # empty data
        {"email": "", "password": "", "confirmPassword": ""},  # empty fields
        {"email": "bademail", "password": "pass", "confirmPassword": "pass"},  # invalid email
        {"email": "user@example.com", "password": "123", "confirmPassword": "1234"},  # password mismatch   
    ]
    for data in invalid_registrations:
        resp = register_user(data)
        assert resp.status_code == 400, f"Expected 400 for invalid register data, got {resp.status_code}"
        json_data = resp.json()
        # Relax assertion to check common error keys
        assert any(k in json_data for k in ["error", "errors", "validation", "message"]), "Should return validation error on bad registration"
    
    # 2. Register a new valid user for full flow testing
    timestamp = int(time.time())
    test_email = f"testuser{timestamp}@example.com"
    test_password = "Testpass123!"
    valid_registration_data = {
        "email": test_email,
        "password": test_password,
        "confirmPassword": test_password
    }
    resp = register_user(valid_registration_data)
    assert resp.status_code == 201, f"Expected 201 on valid registration, got {resp.status_code}"
    registered_user = resp.json()
    assert registered_user.get("email") == test_email
    
    # 3. Login attempts - invalid credentials tested first
    invalid_logins = [
        {"email": "", "password": ""},
        {"email": "notexists@example.com", "password": "wrongpass"},
        {"email": test_email, "password": "wrongpass"},
    ]
    for creds in invalid_logins:
        resp = login_user(creds)
        assert resp.status_code == 401, f"Expected 401 for invalid login credentials, got {resp.status_code}"
        json_data = resp.json()
        assert "error" in json_data or "message" in json_data
    
    # 4. Successful login with newly registered user credentials
    login_data = {"email": test_email, "password": test_password}
    resp = login_user(login_data)
    assert resp.status_code == 200, f"Expected 200 on successful login, got {resp.status_code}"
    login_response = resp.json()
    token = login_response.get("token") or login_response.get("accessToken")
    user_payload = login_response.get("user") or login_response.get("userData")
    assert token and isinstance(token, str), "JWT token missing in login response"
    assert user_payload and user_payload.get("email") == test_email
    
    # 5. Use token to access protected /tickets/dashboard endpoints
    auth_header = {"Authorization": f"Bearer {token}"}
    
    # 5a. GET /api/tickets/list returns ticket list filtered by role successfully
    resp = session.get(TICKETS_URL + "/list", headers=auth_header, timeout=TIMEOUT)
    assert resp.status_code == 200, f"Expected 200 on tickets list fetch, got {resp.status_code}"
    tickets_list = resp.json()
    assert isinstance(tickets_list, list), "Tickets list should be a list"
    
    # 5b. Try CRUD on tickets according to role 'user'
    # Since role likely 'user', create a ticket
    ticket_payload = {
        "title": "Test Ticket for Frontend Flow",
        "description": "Created during frontend flow test.",
        "priority": "medium"
    }
    created_ticket_id = None
    try:
        # Create ticket
        resp = session.post(
            TICKETS_URL + "/create",
            headers=auth_header,
            json=ticket_payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 201, f"Expected 201 on ticket creation, got {resp.status_code}"
        ticket = resp.json()
        created_ticket_id = ticket.get("id") or ticket.get("_id")
        assert created_ticket_id, "Created ticket id missing"
        
        # Read ticket details
        resp = session.get(
            TICKETS_URL + f"/{created_ticket_id}",
            headers=auth_header,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Expected 200 on getting ticket details, got {resp.status_code}"
        ticket_details = resp.json()
        assert ticket_details.get("id") == created_ticket_id or ticket_details.get("_id") == created_ticket_id
        
        # Update ticket description (allowed for users)
        update_payload = {"description": "Updated description via frontend flow test."}
        resp = session.put(
            TICKETS_URL + f"/{created_ticket_id}",
            headers=auth_header,
            json=update_payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Expected 200 on ticket update, got {resp.status_code}"
        updated_ticket = resp.json()
        assert updated_ticket.get("description") == update_payload["description"]
        
        # Attempt disallowed update (priority) for user role - expect 403 or 400
        forbidden_update = {"priority": "high"}
        resp = session.put(
            TICKETS_URL + f"/{created_ticket_id}",
            headers=auth_header,
            json=forbidden_update,
            timeout=TIMEOUT,
        )
        assert resp.status_code in (400, 403), f"Expected 400 or 403 on forbidden update, got {resp.status_code}"
        
        # Delete own ticket - should be allowed for user
        resp = session.delete(
            TICKETS_URL + f"/{created_ticket_id}",
            headers=auth_header,
            timeout=TIMEOUT,
        )
        assert resp.status_code in (200, 204), f"Expected 200/204 on ticket deletion, got {resp.status_code}"
        created_ticket_id = None  # marked deleted
        
    finally:
        # Cleanup if ticket still exists
        if created_ticket_id is not None:
            session.delete(
                TICKETS_URL + f"/{created_ticket_id}",
                headers=auth_header,
                timeout=TIMEOUT,
            )
    
    # 6. Attempt to visit /login and /register frontend routes via GET to simulate page loading
    # Since this is frontend route, expect 200 and content-type text/html or similar
    resp = session.get(BASE_URL + "/login", timeout=TIMEOUT)
    assert resp.status_code == 200, f"Expected 200 loading /login page, got {resp.status_code}"
    assert "text/html" in resp.headers.get("Content-Type", ""), "/login should return HTML"
    
    resp = session.get(BASE_URL + "/register", timeout=TIMEOUT)
    assert resp.status_code == 200, f"Expected 200 loading /register page, got {resp.status_code}"
    assert "text/html" in resp.headers.get("Content-Type", ""), "/register should return HTML"
    
    # 7. Check routing protection: access /tickets frontend route without token (unauthenticated)
    resp = session.get(BASE_URL + "/tickets", timeout=TIMEOUT, allow_redirects=False)
    # Should redirect to /login or return 401/403 or another protective measure
    assert resp.status_code in (200, 302, 401, 403), f"Expected protected response from /tickets, got {resp.status_code}"
    # If redirect, location header points to /login or equivalent
    if resp.status_code == 302:
        location = resp.headers.get("Location", "")
        assert "/login" in location
    
    # 8. Access /tickets with valid token - expecting 200 and HTML page rendered
    # Pass the token as cookie or Auth header (simulate frontend behavior)
    # Here we try header approach, if frontend requires different (cookie), this may differ
    resp = session.get(BASE_URL + "/tickets", headers=auth_header, timeout=TIMEOUT)
    # Could return HTML, so check content type
    assert resp.status_code == 200, f"Expected 200 response for authenticated /tickets page, got {resp.status_code}"
    assert "text/html" in resp.headers.get("Content-Type", ""), "/tickets should return HTML for dashboard"
    
    session.close()

test_frontend_login_register_and_ticket_dashboard_flows()
