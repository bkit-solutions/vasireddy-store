# Vasireddy Designer Studio - Admin Guide

## Admin URL

- Admin login: http://localhost:3000/admin/login
- Admin dashboard (after login): http://localhost:3000/admin/dashboard

## Seeded Admin Credentials (Local)

Run:

```bash
npm run setup:local
```

Then login with:

- Email: admin@vasireddydesigner.com
- Password: Admin@123

## Customer Login URL

- Customer login: http://localhost:3000/login

## Important Notes

- Admin link is hidden from public top navigation.
- Only users with role `ADMIN` can access `/admin/*` routes.
- If a non-admin user tries to access admin pages, they are redirected to the store homepage.

## Local Database Setup

- Script auto-creates the database from `DATABASE_URL`.
- If password contains `@`, use `%40` in URL.
- Current local format:

```env
DATABASE_URL="mysql://root:ijustDh53%40@localhost:3306/vasireddy_store_dev"
```
