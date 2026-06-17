import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function globalSetup() {
  await seedTestData()
  await prisma.$disconnect()
}

async function seedTestData() {
  const adminPassword = await hash("Admin123!", 12)
  const userPassword = await hash("Password123!", 12)

  const adminRole = await prisma.role.upsert({
    where: { slug: "admin" },
    update: {},
    create: { name: "Admin", slug: "admin", description: "Full system access", isSystem: true },
  })

  const customerRole = await prisma.role.upsert({
    where: { slug: "customer" },
    update: {},
    create: { name: "Customer", slug: "customer", description: "Standard customer account", isSystem: true },
  })

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@shopfinity.com" },
    update: {},
    create: { email: "admin@shopfinity.com", firstName: "Admin", lastName: "User", passwordHash: adminPassword, isActive: true },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id, assignedBy: "system" },
  })

  const testUser = await prisma.user.upsert({
    where: { email: "test@shopfinity.com" },
    update: {},
    create: { email: "test@shopfinity.com", firstName: "Test", lastName: "User", passwordHash: userPassword, isActive: true },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: testUser.id, roleId: customerRole.id } },
    update: {},
    create: { userId: testUser.id, roleId: customerRole.id, assignedBy: "system" },
  })

  const ecommerceCategory = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics", description: "Electronic gadgets and devices" },
  })

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories", description: "Tech accessories and peripherals" },
  })

  const existingCount = await prisma.product.count()
  if (existingCount === 0) {
    await prisma.product.createMany({
      data: [
        { name: "Wireless Headphones", slug: "wireless-headphones", description: "Premium wireless headphones with noise cancellation", price: 299.99, stockQuantity: 50, sku: "WH-001", categoryId: ecommerceCategory.id, isPublished: true },
        { name: "USB-C Hub", slug: "usb-c-hub", description: "7-in-1 USB-C hub with HDMI", price: 49.99, stockQuantity: 100, sku: "UC-001", categoryId: accessoriesCategory.id, isPublished: true },
        { name: "Mechanical Keyboard", slug: "mechanical-keyboard", description: "RGB mechanical keyboard with Cherry MX switches", price: 149.99, stockQuantity: 30, sku: "MK-001", categoryId: accessoriesCategory.id, isPublished: true },
        { name: "Bluetooth Speaker", slug: "bluetooth-speaker", description: "Portable waterproof bluetooth speaker", price: 79.99, stockQuantity: 75, sku: "BS-001", categoryId: ecommerceCategory.id, isPublished: true },
        { name: "Laptop Stand", slug: "laptop-stand", description: "Adjustable aluminum laptop stand", price: 39.99, stockQuantity: 0, sku: "LS-001", categoryId: accessoriesCategory.id, isPublished: true },
      ],
    })
  }
}

export default globalSetup
