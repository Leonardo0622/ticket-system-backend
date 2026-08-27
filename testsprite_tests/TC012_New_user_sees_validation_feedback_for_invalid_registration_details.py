import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Registrarse' link in the top navigation to open the registration page.
        # Registrarse link
        elem = page.get_by_role('link', name='Registrarse', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill 'Nombre' with an invalid value ('A'), 'Email' with 'invalid-email', 'Contraseña' with '123', then click the 'Registrarse' button.
        # Tu nombre text field
        elem = page.locator('[id="name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("A")
        
        # -> Fill 'Nombre' with an invalid value ('A'), 'Email' with 'invalid-email', 'Contraseña' with '123', then click the 'Registrarse' button.
        # tu@email.com email field
        elem = page.locator('[id="email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("invalid-email")
        
        # -> Fill 'Nombre' with an invalid value ('A'), 'Email' with 'invalid-email', 'Contraseña' with '123', then click the 'Registrarse' button.
        # •••••••• password field
        elem = page.locator('[id="password"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("123")
        
        # -> Fill 'Nombre' with an invalid value ('A'), 'Email' with 'invalid-email', 'Contraseña' with '123', then click the 'Registrarse' button.
        # Registrarse button
        elem = page.get_by_role('button', name='Registrarse', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> An email validation tooltip is visible explaining the missing '@' in the provided email.
        await page.locator("xpath=/html/body/div/div/main/div/div[1]/span").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: A validation tooltip is visible on the page.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div[1]/span").nth(0)).to_be_visible(timeout=15000), "A validation tooltip is visible on the page."
        
        # --> The user remained on the registration page and the registration form is still present.
        # Assert-outcome: passed
        # Assert: The current URL contains '/register'.
        await expect(page).to_have_url(re.compile("/register"), timeout=15000), "The current URL contains '/register'."
        await page.locator("xpath=/html/body/div/div/main/div/div[2]/form/div[1]/div/input").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The name input on the registration form is visible.
        await expect(page.locator("xpath=/html/body/div/div/main/div/div[2]/form/div[1]/div/input").nth(0)).to_be_visible(timeout=15000), "The name input on the registration form is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    