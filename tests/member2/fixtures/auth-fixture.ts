import { test as base } from "@playwright/test";
import { loginAsCustomer, loginAsAdmin } from "../../../tests/helpers/auth";

type Fixtures = {
  customerRequest: any;
  adminRequest: any;
};

export const test = base.extend<Fixtures>({
  customerRequest: async ({ playwright, baseURL, browser }, use) => {
    // Launch a new context to login via UI for customer
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    
    // Login using existing project helper
    await loginAsCustomer(page);
    
    // Grab authenticated cookies
    const cookies = await context.cookies();
    
    // Create an APIRequestContext pre-loaded with the authenticated cookies
    const custReq = await playwright.request.newContext({
      baseURL,
      storageState: { cookies, origins: [] }
    });
    
    await use(custReq);
    
    await custReq.dispose();
    await context.close();
  },
  adminRequest: async ({ playwright, baseURL, browser }, use) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await loginAsAdmin(page);
    const cookies = await context.cookies();
    const adminReq = await playwright.request.newContext({
      baseURL,
      storageState: { cookies, origins: [] }
    });
    await use(adminReq);
    await adminReq.dispose();
    await context.close();
  },
  adminPage: async ({ baseURL, browser }, use) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await loginAsAdmin(page);
    await use(page);
    await context.close();
  }
});
export { expect } from "@playwright/test";
