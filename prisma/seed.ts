import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // ── Roles ────────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      name: "Admin",
      slug: "admin",
      description: "Full system access",
      isSystem: true,
    },
  })

  const customerRole = await prisma.role.upsert({
    where: { slug: "customer" },
    update: {},
    create: {
      name: "Customer",
      slug: "customer",
      description: "Standard customer account",
      isSystem: true,
    },
  })

  const managerRole = await prisma.role.upsert({
    where: { slug: "manager" },
    update: {},
    create: {
      name: "Manager",
      slug: "manager",
      description: "Store manager with elevated access",
      isSystem: true,
    },
  })

  // ── Permissions ────────────────────────────────────────────────
  const resources = [
    "Product", "Category", "Order", "User", "Role",
    "Permission", "Cart", "Wishlist", "Review", "Upload",
    "Inventory", "Settings", "Dashboard", "AuditLog", "Payment",
  ] as const

  const actions = [
    "Create", "Read", "Update", "Delete",
    "Manage", "Approve", "Export", "Import",
  ] as const

  const allPermissions: { id: string; resource: string; action: string }[] = []

  for (const resource of resources) {
    for (const action of actions) {
      const perm = await prisma.permission.upsert({
        where: {
          resource_action: {
            resource: resource as any,
            action: action as any,
          },
        },
        update: {},
        create: {
          resource: resource as any,
          action: action as any,
        },
      })
      allPermissions.push({ id: perm.id, resource: perm.resource, action: perm.action })
    }
  }

  // Assign all permissions to Admin
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    })
  }

  // Assign basic permissions to Customer
  const customerResources = new Set(["Product", "Category", "Order", "Cart", "Wishlist", "Review"])
  const customerPerms = allPermissions.filter((p) => customerResources.has(p.resource))

  for (const perm of customerPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: customerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: customerRole.id,
        permissionId: perm.id,
      },
    })
  }

  // ── Admin User ──────────────────────────────────────────────
  const adminPassword = await hash("Admin123!", 12)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@shopfinity.com" },
    update: {},
    create: {
      email: "admin@shopfinity.com",
      firstName: "Admin",
      lastName: "User",
      passwordHash: adminPassword,
      isActive: true,
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: adminUser.id, roleId: adminRole.id },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
      assignedBy: "system",
    },
  })

  // ── Test User ────────────────────────────────────────────────
  const userPassword = await hash("Password123!", 12)
  const testUser = await prisma.user.upsert({
    where: { email: "test@shopfinity.com" },
    update: {},
    create: {
      email: "test@shopfinity.com",
      firstName: "Test",
      lastName: "User",
      passwordHash: userPassword,
      isActive: true,
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: testUser.id, roleId: customerRole.id },
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: customerRole.id,
      assignedBy: "system",
    },
  })

  console.log("✅ Seed completed:")
  console.log(`   Admin: admin@shopfinity.com / Admin123!`)
  console.log(`   Test:  test@shopfinity.com / Password123!`)
  console.log(`   Roles: ${[adminRole, customerRole, managerRole].map((r) => r.name).join(", ")}`)
  console.log(`   Permissions: ${allPermissions.length}`)
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
