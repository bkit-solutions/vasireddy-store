import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertCategory(slug: string, name: string, parentId?: string) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, parentId: parentId ?? null },
    create: { name, slug, parentId: parentId ?? null },
  });
}

async function upsertProduct(data: {
  slug: string;
  name: string;
  description: string;
  sku: string;
  basePrice: number;
  stock: number;
  categoryId: string;
}) {
  return prisma.product.upsert({
    where: { slug: data.slug },
    update: {},
    create: {
      ...data,
      isActive: true,
    },
  });
}

async function main() {
  const passwordHash = await hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vasireddydesigner.com" },
    update: {},
    create: {
      name: "Studio Admin",
      email: "admin@vasireddydesigner.com",
      role: UserRole.ADMIN,
      passwordHash,
    },
  });

  // ── Parent categories ──────────────────────────────────────────────
  const catSarees = await upsertCategory("sarees", "Sarees");
  const catBlouses = await upsertCategory("blouses", "Blouses");

  // ── Saree sub-categories (from client's list) ──────────────────────
  const semiKanchi     = await upsertCategory("semi-kanchi-pattu",       "Semi Kanchi Pattu",          catSarees.id);
  const fancySarees    = await upsertCategory("fancy-sarees",            "Fancy Sarees",               catSarees.id);
  const imitKanchi     = await upsertCategory("imitation-kanchi-pattu",  "Imitation Kanchi Pattu",     catSarees.id);
  const origKanchi     = await upsertCategory("original-kanchi-pattu",   "Original Kanchi Pattu",      catSarees.id);
  const fusionSarees   = await upsertCategory("fusion-sarees",           "Fusion Sarees",              catSarees.id);
  const dailySarees    = await upsertCategory("daily-wear-sarees",       "Daily Wear Sarees",          catSarees.id);
  const cottonSarees   = await upsertCategory("cotton-sarees",           "Cotton Sarees",              catSarees.id);
  const kotaSarees     = await upsertCategory("kota-sarees",             "Kota Sarees",                catSarees.id);
  const silkSarees     = await upsertCategory("silk-sarees",             "Silk Sarees",                catSarees.id);
  const mulCotton      = await upsertCategory("mul-cotton-sarees",       "Mul Cotton Sarees",          catSarees.id);

  // ── Blouse sub-categories (from client's list) ────────────────────
  const maggamBlouse   = await upsertCategory("maggam-blouses",          "Maggam Blouses",             catBlouses.id);
  const machineEmb     = await upsertCategory("machine-embroidery-blouses", "Machine Embroidery Blouses", catBlouses.id);
  const allOverBlouse  = await upsertCategory("all-over-blouses",        "All Over Blouses",           catBlouses.id);
  const digitalPrint   = await upsertCategory("digital-print-blouses",   "Digital Print Blouses",      catBlouses.id);
  const kanthaBlouse   = await upsertCategory("kantha-work-blouses",     "Kantha Work Blouses",        catBlouses.id);
  const readyWear      = await upsertCategory("ready-to-wear-blouses",   "Ready to Wear Blouses",      catBlouses.id);

  // ── Dummy products ─────────────────────────────────────────────────
  await upsertProduct({ slug: "semi-kanchi-rose-gold", name: "Semi Kanchi Rose Gold Saree", description: "Elegant semi Kanchipuram saree with rose gold zari border, ideal for weddings and receptions.", sku: "VDS-SKP-001", basePrice: 1299900, stock: 15, categoryId: semiKanchi.id });
  await upsertProduct({ slug: "semi-kanchi-royal-blue", name: "Semi Kanchi Royal Blue Saree", description: "Royal blue semi-silk Kanchi weave with contrasting gold border and pallu.", sku: "VDS-SKP-002", basePrice: 1499900, stock: 10, categoryId: semiKanchi.id });

  await upsertProduct({ slug: "fancy-georgette-saree", name: "Fancy Georgette Party Saree", description: "Lightweight georgette saree with contemporary prints, perfect for festive gatherings.", sku: "VDS-FAN-001", basePrice: 599900, stock: 30, categoryId: fancySarees.id });
  await upsertProduct({ slug: "fancy-organza-saree", name: "Fancy Organza Ruffle Saree", description: "Sheer organza with ruffle falls — a statement piece for cocktail events.", sku: "VDS-FAN-002", basePrice: 799900, stock: 20, categoryId: fancySarees.id });

  await upsertProduct({ slug: "imitation-kanchi-crimson", name: "Imitation Kanchi Crimson Saree", description: "High-quality imitation Kanchipuram with rich crimson hue and traditional motifs.", sku: "VDS-IKP-001", basePrice: 699900, stock: 25, categoryId: imitKanchi.id });
  await upsertProduct({ slug: "imitation-kanchi-green", name: "Imitation Kanchi Forest Green Saree", description: "Rich forest green imitation Kanchi with gold border — a festive favorite.", sku: "VDS-IKP-002", basePrice: 749900, stock: 18, categoryId: imitKanchi.id });

  await upsertProduct({ slug: "original-kanchi-bridal", name: "Original Kanchipuram Bridal Silk", description: "Authentic handloom Kanchipuram pure silk saree with traditional temple border.", sku: "VDS-OKP-001", basePrice: 2499900, stock: 5, categoryId: origKanchi.id });

  await upsertProduct({ slug: "fusion-bandhani-silk", name: "Bandhani Silk Fusion Saree", description: "Contemporary bandhani-print meets silk base — fusion wear for modern celebrations.", sku: "VDS-FUS-001", basePrice: 899900, stock: 22, categoryId: fusionSarees.id });
  await upsertProduct({ slug: "fusion-linen-digital", name: "Linen Digital Fusion Saree", description: "Linen saree with digital floral print — versatile for day and evening wear.", sku: "VDS-FUS-002", basePrice: 749900, stock: 28, categoryId: fusionSarees.id });

  await upsertProduct({ slug: "daily-wear-chiffon", name: "Chiffon Daily Wear Saree", description: "Breezy chiffon saree in pastel shades, comfortable for everyday Indian wear.", sku: "VDS-DWS-001", basePrice: 299900, stock: 50, categoryId: dailySarees.id });
  await upsertProduct({ slug: "daily-wear-crepe", name: "Crepe Plain Daily Saree", description: "Smooth crepe fabric with minimal border — easy to drape and carry all day.", sku: "VDS-DWS-002", basePrice: 249900, stock: 60, categoryId: dailySarees.id });

  await upsertProduct({ slug: "handblock-cotton-saree", name: "Handblock Cotton Saree", description: "Hand block-printed pure cotton saree with vegetable dyes — casual and eco-friendly.", sku: "VDS-COT-001", basePrice: 349900, stock: 40, categoryId: cottonSarees.id });
  await upsertProduct({ slug: "jamdani-cotton-saree", name: "Jamdani Cotton Saree", description: "Fine jamdani-weave cotton saree with intricate floral motifs.", sku: "VDS-COT-002", basePrice: 449900, stock: 30, categoryId: cottonSarees.id });

  await upsertProduct({ slug: "kota-doria-plain", name: "Kota Doria Plain Saree", description: "Lightweight Kota Doria fabric with natural sheen — ideal for summer festivals.", sku: "VDS-KOT-001", basePrice: 379900, stock: 35, categoryId: kotaSarees.id });

  await upsertProduct({ slug: "mysore-silk-saree", name: "Mysore Crepe Silk Saree", description: "Pure Mysore silk with rich crepe texture and contrast blouse piece included.", sku: "VDS-SLK-001", basePrice: 1099900, stock: 12, categoryId: silkSarees.id });
  await upsertProduct({ slug: "banarasi-silk-saree", name: "Banarasi Silk Zari Saree", description: "Classic Banarasi silk with heavy zari weave — statement piece for weddings.", sku: "VDS-SLK-002", basePrice: 1399900, stock: 8, categoryId: silkSarees.id });

  await upsertProduct({ slug: "mul-cotton-stripe-saree", name: "Mul Cotton Stripe Saree", description: "Soft mul cotton with delicate stripes — perfect for casual and semi-formal wear.", sku: "VDS-MUL-001", basePrice: 279900, stock: 45, categoryId: mulCotton.id });

  await upsertProduct({ slug: "maggam-bridal-blouse", name: "Maggam Work Bridal Blouse", description: "Heavily embellished Maggam work blouse with intricate stone and thread detailing.", sku: "VDS-MAG-001", basePrice: 599900, stock: 20, categoryId: maggamBlouse.id });
  await upsertProduct({ slug: "maggam-kutdaan-blouse", name: "Maggam Kutdaan Sleeve Blouse", description: "Elbow-sleeve Maggam blouse with kutdaan-pattern border — bridal favorite.", sku: "VDS-MAG-002", basePrice: 699900, stock: 15, categoryId: maggamBlouse.id });

  await upsertProduct({ slug: "machine-emb-net-blouse", name: "Machine Embroidery Net Blouse", description: "Sheer net blouse with machine-embroidered floral motifs — elegant and contemporary.", sku: "VDS-MEB-001", basePrice: 399900, stock: 25, categoryId: machineEmb.id });
  await upsertProduct({ slug: "machine-emb-silk-blouse", name: "Machine Embroidery Silk Blouse", description: "Silk blouse with dense machine embroidery across the back and sleeves.", sku: "VDS-MEB-002", basePrice: 449900, stock: 18, categoryId: machineEmb.id });

  await upsertProduct({ slug: "all-over-stone-blouse", name: "All Over Stone Work Blouse", description: "Full-coverage stone-embellished blouse for festive and reception wear.", sku: "VDS-AOB-001", basePrice: 549900, stock: 20, categoryId: allOverBlouse.id });

  await upsertProduct({ slug: "digital-print-peacock-blouse", name: "Digital Print Peacock Blouse", description: "Vibrant peacock-motif digital print blouse — pairs well with plain silk sarees.", sku: "VDS-DPB-001", basePrice: 349900, stock: 30, categoryId: digitalPrint.id });
  await upsertProduct({ slug: "digital-print-floral-blouse", name: "Digital Print Floral Blouse", description: "Contemporary floral digital-print blouse in pastel hues.", sku: "VDS-DPB-002", basePrice: 299900, stock: 35, categoryId: digitalPrint.id });

  await upsertProduct({ slug: "kantha-stitch-blouse", name: "Kantha Stitch Work Blouse", description: "Hand-stitched Kantha work blouse with traditional Bengal embroidery patterns.", sku: "VDS-KAN-001", basePrice: 479900, stock: 15, categoryId: kanthaBlouse.id });

  await upsertProduct({ slug: "ready-wear-plain-blouse", name: "Ready to Wear Plain Silk Blouse", description: "Pre-stitched plain silk blouse available in standard sizes — wear-ready.", sku: "VDS-RTW-001", basePrice: 249900, stock: 40, categoryId: readyWear.id });
  await upsertProduct({ slug: "ready-wear-printed-blouse", name: "Ready to Wear Printed Blouse", description: "Pre-stitched printed blouse with hook-and-eye closure — fits sizes 32–42.", sku: "VDS-RTW-002", basePrice: 279900, stock: 35, categoryId: readyWear.id });

  // ── Coupon ─────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "VDSWELCOME10" },
    update: {},
    create: { code: "VDSWELCOME10", description: "10% off on first order", discountPercent: 10 },
  });

  await prisma.cart.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  console.log("Seed complete — admin, categories, sub-categories, and demo products created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
