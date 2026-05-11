# Vasireddy's Designer Studio

Full-stack luxury ecommerce platform for a premium saree and blouse boutique. Modernized with a user-centric address management ecosystem, editorial landing page grids, and a streamlined boutique checkout experience.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS (Modern Glassmorphism & Editorial Spacing) |
| Database | MySQL via Prisma ORM |
| Auth | NextAuth.js (JWT session strategy) |
| Payments | Razorpay & Stripe Integration |
| Image Storage | Cloudinary & S3 |
| Icons | Lucide React (Refined Boutique Stroke) |

---

## New Features & Modernization

### 📍 Address Management Ecosystem
- **Saved Address Book**: Users can manage multiple delivery locations (Home, Work, etc.) with a premium, membership-style UI.
- **Intelligent Checkout**: Returning users can select saved addresses with one click, while new users are guided through an elegant entry form.
- **Auto-Save Logic**: Every successful order intelligently snapshots the delivery address and automatically saves new locations to the user's profile.

### 🛡️ Profile & Onboarding Guard
- **Welcome Guard**: A persistent, high-visibility nudge for new users to complete their delivery profile, ensuring they are ready for a seamless checkout.
- **Server-Side Validation**: Strict enforcement on order creation routes to ensure no transaction proceeds without valid shipping information.

### 🎨 Editorial Storefront
- **Refined Grids**: Redesigned landing page grids with generous "editorial" spacing and high-end background textures (Diamond weave & luxury patterns).
- **Dynamic Navigation**: Hand-picked collection banners (Bridal, Festive) now route dynamically to curated Lookbook categories.
- **Artistic Monogram**: Bespoke SVG brand identity featuring hand-crafted flourishes and gold-thread gradients.

---

## Project Structure

```
app/
├── (store)/              # Luxury Storefront
│   ├── page.tsx          # Editorial Homepage
│   ├── collections/      # Lookbook & Category Hub
│   ├── products/         # Filterable Catalog
│   ├── account/          # Address Book & Order History
│   ├── cart/             # Streamlined Checkout
│   └── ...
├── (admin)/              # Admin Dashboard (Official Credentials)
│   └── admin/
│       ├── orders/       # Order & Shipment Lifecycle
│       ├── products/     # Catalog Management
│       └── ...
├── api/                  # Secure API Gating
│   ├── orders/create     # Strict Address Validation
│   └── addresses/        # User Location CRUD
lib/                      # Core Logic (Auth, Prisma, Razorpay)
prisma/                   # Schema (Addresses, Orders, Snapshots)
```

---

## Deployment & Setup

### 1. Official Admin Credentials
The application is pre-configured with official administrative access:
- **Email**: `vasireddydesigners@gmail.com`
- **Password**: `Vasavi@4241`

### 2. Environment Configuration
Ensure your `.env` contains the following for production:
- `DATABASE_URL`: Your live MySQL connection string.
- `NEXTAUTH_SECRET`: A secure random string for JWT encryption.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: For live payment processing.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## Customer & Admin Flow

### The Boutique Journey
1. **Onboarding**: Logged-in users see the `ProfileGuard` if their address book is empty.
2. **Selection**: Customers browse categories through the refined landing page or Lookbook.
3. **Cart & Shipping**: During checkout, users either pick a "Verified Address" from their book or enter a new one.
4. **Fulfillment**: Admins see the full address snapshot on the order dashboard to ensure perfect delivery.

---

© 2026 Vasireddy's Designer Studio. All rights reserved.
Powered by itseasynow.in
