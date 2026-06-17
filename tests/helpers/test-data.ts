export const TEST_USERS = {
  admin: { email: "admin@shopfinity.com", password: "Admin123!" },
  customer: { email: "test@shopfinity.com", password: "Password123!" },
  newUserPrefix: "e2e-test-",
}

export const TEST_PRODUCTS = {
  inStock: { name: "Wireless Headphones", slug: "wireless-headphones", price: 299.99 },
  inStock2: { name: "USB-C Hub", slug: "usb-c-hub", price: 49.99 },
  outOfStock: { name: "Laptop Stand", slug: "laptop-stand", price: 39.99 },
}

export const TEST_CATEGORIES = {
  electronics: { name: "Electronics", slug: "electronics" },
  accessories: { name: "Accessories", slug: "accessories" },
}

export const SHIPPING_ADDRESS = {
  firstName: "John",
  lastName: "Doe",
  address: "123 Test Street",
  city: "New York",
  postalCode: "10001",
}

export const STRIPE_TEST_CARD = "4242424242424242"
export const STRIPE_DECLINED_CARD = "4000000000000002"
export const FUTURE_DATE = "12/34"
export const TEST_CVC = "123"
export const TEST_ZIP = "10001"
