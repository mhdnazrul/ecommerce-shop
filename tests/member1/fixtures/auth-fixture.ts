import { test as base, APIRequestContext } from "@playwright/test";
import { loginAsAdmin } from "../../../tests/helpers/auth";

type Fixtures = {
  adminRequest: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  adminRequest: async ({ playwright, baseURL, browser }, use) => {
    // Launch a new context to login via UI
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    
    // Login using existing project helper
    await loginAsAdmin(page);
    
    // Grab authenticated cookies
    const cookies = await context.cookies();
    
    // Create an APIRequestContext pre-loaded with the authenticated cookies
    const adminReq = await playwright.request.newContext({
      baseURL,
      storageState: { cookies, origins: [] }
    });
    
    await use(adminReq);
    
    await adminReq.dispose();
    await context.close();
  }
});

export { expect } from "@playwright/test";
