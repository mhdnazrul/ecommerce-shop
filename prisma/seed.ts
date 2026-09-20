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

  // ── 10 Categories and 500 Products ──────────────────────────
  const categoriesData = [
    { name: "Laptops", desc: "High-performance laptops for work and gaming." },
    { name: "Smartphones", desc: "Latest smartphones with cutting-edge features." },
    { name: "Air Conditioners", desc: "Efficient cooling solutions for your home." },
    { name: "Televisions", desc: "Stunning 4K and 8K smart TVs." },
    { name: "Smartwatches", desc: "Wearable tech to keep you connected." },
    { name: "Tablets", desc: "Portable powerhouses for creativity and entertainment." },
    { name: "Headphones", desc: "Premium audio for audiophiles." },
    { name: "Cameras", desc: "Capture your best moments in high resolution." },
    { name: "Refrigerators", desc: "Modern appliances for your kitchen." },
    { name: "Gaming Consoles", desc: "Next-gen consoles for immersive gaming." }
  ];

  let totalSeeded = 0;
  for (let i = 0; i < categoriesData.length; i++) {
    const catData = categoriesData[i];
    const catSlug = catData.name.toLowerCase().replace(/\s+/g, '-');
    
    const category = await prisma.category.upsert({
      where: { slug: catSlug },
      update: { description: catData.desc, displayOrder: i + 1 },
      create: {
        name: catData.name,
        slug: catSlug,
        description: catData.desc,
        displayOrder: i + 1,
      }
    });

    console.log(`Seeding 50 products for category: ${category.name}...`);
    
    const productsChunk = [];
    for (let j = 1; j <= 50; j++) {
      const pName = `${category.name} Model ${j} Pro`;
      const pSlug = `${catSlug}-model-${j}-pro`;
      const price = 50 + (j * 15);
      
      productsChunk.push({
        name: pName,
        slug: pSlug,
        description: `Experience the new standard with ${pName}. Featuring cutting-edge technology and sleek design.`,
        shortDescription: `Top-tier ${category.name.toLowerCase()}.`,
        price: price,
        compareAtPrice: price * 1.2,
        costPrice: price * 0.7,
        stockQuantity: 20 + j,
        sku: `SKU-${i}-${j}-${catSlug.substring(0, 5).toUpperCase()}-PRO`,
        categoryId: category.id,
        isPublished: true,
        imageUrl: `https://picsum.photos/seed/${pSlug}/800/800`,
        images: [`https://picsum.photos/seed/${pSlug}-1/800/800`, `https://picsum.photos/seed/${pSlug}-2/800/800`],
      });
    }

    // Upsert products in chunks of 10 to avoid connection limits
    for (let k = 0; k < productsChunk.length; k += 10) {
      const chunk = productsChunk.slice(k, k + 10);
      await Promise.all(chunk.map(p => 
        prisma.product.upsert({
          where: { slug: p.slug },
          update: p,
          create: p
        })
      ));
    }
    totalSeeded += productsChunk.length;
  }

  console.log(`✅ ${totalSeeded} dummy products seeded across ${categoriesData.length} categories!`)

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
