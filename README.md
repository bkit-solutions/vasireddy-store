# Vasireddy Designer Studio

Full-stack ecommerce application for a saree and blouse boutique. Built with Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma ORM, MySQL, NextAuth.js, Stripe, and Cloudinary.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MySQL via Prisma ORM |
| Auth | NextAuth.js (JWT session strategy) |
| Payments | Stripe (test mode) |
| Image Storage | Cloudinary |
| Email | Nodemailer |
| Deployment | Vercel |

---

## Project Structure

```
app/
├── (store)/              # Customer-facing storefront
│   ├── page.tsx          # Homepage
│   ├── collections/      # Browse with search + category filter
│   ├── products/         # All products with search + category filter
│   │   └── [slug]/       # Individual product detail page
│   ├── cart/             # Shopping cart
│   ├── wishlist/         # Saved items
│   ├── account/          # Order history + sign out
│   ├── login/            # Customer login
│   └── register/         # Customer registration
├── (admin)/              # Admin console (role-guarded)
│   └── admin/
│       ├── dashboard/    # Stats overview
│       ├── products/     # Product CRUD
│       ├── categories/   # Category management
│       ├── orders/       # Order lifecycle management
│       ├── customers/    # Customer directory
│       ├── coupons/      # Discount codes
│       └── banners/      # Homepage campaign control
├── (auth)/               # Admin login
└── api/                  # REST + Stripe endpoints
    ├── auth/
    ├── products/
    ├── cart/
    ├── orders/
    ├── reviews/
    └── wishlist/

components/
├── layout/               # Header, Footer, MobileNav, AdminConsoleNav
├── store/                # ProductCard, Hero, CartClient, WishlistClient, ReviewSection
└── ui/                   # LoginForm, RegisterForm, SignOutButton, WhatsAppButton

lib/                      # Prisma client, auth config, Stripe, Cloudinary, utils
prisma/                   # schema.prisma + seed.ts
scripts/                  # setup-db.ts (auto-creates local MySQL DB)
public/                   # Static assets, logo
```

---

## Database Models

Defined in `prisma/schema.prisma`:

- **User** — customers and admins, role-based (`CUSTOMER` | `ADMIN`)
- **Category** — parent-child hierarchy for product organisation
- **Product** — name, slug, SKU, price (stored in paise), stock, image, active flag
- **Cart / CartItem** — per-user persistent cart
- **Order / OrderItem** — full order record with status lifecycle
- **Review** — customer reviews linked to products
- **Coupon** — discount codes with percentage and active toggle
- **WishlistItem** — saved products per user

Order statuses: `PENDING → PAID → SHIPPED → DELIVERED → CANCELLED`

---

## Environment Variables

Create `.env.local` for local development and `.env.production` for production:

```env
DATABASE_URL=mysql://user:password@localhost:3306/vasireddy_store
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_KEY=pk_test_...

EMAIL_USER=your@email.com
EMAIL_PASSWORD=your-email-password

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. One-command setup (creates DB + pushes schema + seeds data)

```bash
npm run setup:local
```

This will:
- Auto-create the MySQL database if it does not exist
- Push the Prisma schema
- Seed categories, sample products, and the admin account

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful individual commands

| Command | Purpose |
|---|---|
| `npm run db:push` | Push schema changes to local MySQL |
| `npm run db:migrate` | Create a named migration |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:seed` | Re-run seed script |
| `npm run build` | Production build |
| `npm start` | Start production server |

---

## Login Routes

| Role | URL |
|---|---|
| Customer | `/login` |
| Admin | `/admin/login` |

The **Admin Dashboard** link in the header is visible only to authenticated admin users. All `/admin/*` routes are protected by middleware — unauthenticated users are redirected to `/admin/login`, and non-admin authenticated users are redirected to the homepage.

### Seeded Admin Credentials

```
Email:    admin@vasireddydesigner.com
Password: Admin@123
```

---

## Customer Guide

### Creating an Account

1. Go to `/register`
2. Enter your name, email address, and a password
3. Submit the form — your account is created and you are signed in

### Signing In

1. Go to `/login`
2. Enter your registered email and password
3. After login you are redirected to the page you came from (cart, wishlist, or product)

### Browsing Products

**Homepage (`/`)**
- Displays featured categories, latest arrivals, trending picks, and featured products
- Shortcut banners for the wedding collection and festive collection
- Free shipping, premium quality, and easy returns info bar
- WhatsApp button (bottom-right) for direct support chat

**Collections (`/collections`)**
- Search by keyword (e.g. "silk", "maggam", "cotton")
- Filter by category using the dropdown
- Click **Apply** to run the filter; **Clear** to reset
- Shows a result count and active filter labels

**Products (`/products`)**
- Identical filter experience — keyword search + category dropdown
- Real-time result count shown below the filter bar

**Product Detail (`/products/[slug]`)**
- Requires login — unauthenticated visitors are redirected to `/login` and brought back after sign-in
- Shows product image, name, category, price, description
- Context-aware product specs (saree dimensions, blouse silhouette, etc.)
- Styling notes tailored to the product type
- Trust badges: Premium Quality · 7-Day Returns · Secure Checkout
- **Add to Cart** and **Save to Wishlist** buttons

### Cart (`/cart`)

- Requires login
- Lists all items added to cart with product name, category, and price
- Adjust quantity or remove individual items
- Apply a coupon code for a percentage discount
- **Proceed to Checkout** triggers a Stripe checkout session
- After successful payment you land on `/account?checkout=success`
- If payment is cancelled you return to `/cart?checkout=cancelled`

### Wishlist (`/wishlist`)

- Requires login
- Displays all saved products
- Remove any item from the wishlist
- Move an item directly to cart from the wishlist page

### Account & Orders (`/account`)

- Requires login
- Shows your signed-in email address
- Lists all past orders with: order reference, status, date, and total amount
- Order statuses you may see: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- **Sign Out** button to end your session

### WhatsApp Support

The floating WhatsApp button on every page opens a pre-filled chat with the studio team for styling queries, custom blouse requests, or order support.

---

## Admin Guide

All admin pages live under `/admin/*` and require an **ADMIN** role. Log in at `/admin/login`.

### Dashboard (`/admin/dashboard`)

Displays at a glance:

| Metric | What it shows |
|---|---|
| Total Orders | Count of all orders ever placed |
| Active Products | Count of products with `isActive = true` |
| Customers | Count of registered customer accounts |
| Coupons | Count of coupon records |
| Total Revenue | Sum of all order amounts |

---

### Products (`/admin/products`)

**Add a product**
1. Fill in: Name, URL Slug, SKU, Description, Price (₹), Stock quantity
2. Select a category from the dropdown
3. Upload an image file **or** paste a Cloudinary/external image URL
4. Click **Create Product** — the product goes live immediately on the storefront

**Edit a product**
1. Find the product in the paginated list (6 per page)
2. Expand the edit form inline
3. Update any field including replacing the image
4. Click **Save Changes**

**Toggle visibility**
- Each product has an **Active / Inactive** toggle
- Inactive products are hidden from the storefront but remain in the database

**Delete a product**
- Click **Delete** on any product card
- This permanently removes the product and all associated cart and wishlist references

**Search & paginate**
- Use the search bar to filter by name, SKU, or category
- Navigate pages using the Prev / Next pagination controls

---

### Categories (`/admin/categories`)

**Create a category**
1. Enter a category name
2. Optionally select a parent category to create a sub-category
3. Click **Add Category** — the slug is auto-generated from the name

**Rename a category**
- Click the rename button on any category row and enter the new name

**Delete a category**
- Only categories with **no products** and **no sub-categories** can be deleted
- The delete button is hidden / blocked for categories still in use

Categories are displayed in a parent → children tree view. Both top-level and sub-categories appear as filter options across the storefront.

---

### Orders (`/admin/orders`)

**View orders**
- Lists all orders newest-first (8 per page)
- Each order shows: order ID, customer name and email, items purchased, total, current status, and date placed

**Search orders**
- Search by order ID, customer name, customer email, or product name in the order

**Update order status**
- Select a new status from the inline dropdown on each order card
- Available transitions: `PENDING → PAID → SHIPPED → DELIVERED → CANCELLED`
- Click **Update** to save — changes reflect instantly in the customer's `/account` page

---

### Customers (`/admin/customers`)

**View customers**
- Lists all registered customer accounts newest-first (10 per page)
- Shows: name, email, total order count, join date

**Search customers**
- Search by customer name or email address

---

### Coupons (`/admin/coupons`)

**Create a coupon**
1. Enter a coupon code (automatically uppercased, e.g. `FESTIVE20`)
2. Enter a discount percentage (1–90%)
3. Optionally add a description
4. Click **Create Coupon**

**Toggle coupon status**
- Each coupon has an **Active / Inactive** toggle
- Inactive coupons are rejected at cart checkout even if the code is entered

**Search coupons**
- Search by coupon code or description

Customers apply coupon codes during cart checkout before proceeding to Stripe.

---

### Banners (`/admin/banners`)

Placeholder section for managing homepage campaign banners. Scheduling, start/end dates, and visibility controls will be available here once banner workflows are enabled.

---

## Deployment (Vercel)

1. Push this repository to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add all environment variables under **Project Settings → Environment Variables**
4. Ensure your production MySQL instance is publicly reachable from Vercel
5. Deploy

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Install command | `npm install` |
| Output directory | Next.js default |

> After deploying, update `NEXTAUTH_URL` in your Vercel environment variables to your production domain (e.g. `https://vasireddydesignerstudio.com`).

---

## Notes

- All internal imports use the `@/` alias (`@/components`, `@/lib`, `@/app`)
- Prices are stored in **paise** (integer) in the database and converted to rupees for display using `formatCurrency()`
- Stripe integration is in **test mode** — use Stripe test card numbers during checkout
- Cloudinary is used for product image uploads from the admin products page
- NextAuth uses JWT sessions — no database session table required
- The `npm run dev` script automatically runs `db:setup` and `db:push` before starting Next.js
