# GreenNest

GreenNest is an online nursery and marketplace for plants, gardening supplies, and professional gardening services. Built with Next.js and TypeScript, it provides storefront, booking, vendor management, and admin features.

## Project Overview

GreenNest connects customers with plants, supplies, and local vendors who offer gardening services. It supports shopping, bookings, vendor dashboards, and admin management with JWT-based authentication and optional MongoDB persistence.

## Features

- Public storefront with hero, featured products, and services
- Product listing, filtering, and detail pages
- Shopping cart and checkout flow
- Service booking system (scheduling, vendor assignments)
- User profile, order history, and dashboard
- Vendor dashboard for managing products, orders, and profile
- Admin dashboard for managing categories, vendors, and site data
- JWT authentication (login/register) with secure password hashing
- Optional MongoDB integration, with mock data fallback for local development
- Responsive, accessible UI components using Radix and Tailwind

## Tech Stack

- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Radix UI primitives
- SWR for client data fetching
- Mongoose (MongoDB) for backend persistence
- jose / jsonwebtoken and bcryptjs for authentication
- Recharts for analytics charts
- Lucide icons

## Installation Steps

1. Clone the repository

```bash
git clone <repo-url>
cd GreenNest
```

2. Install dependencies (using pnpm, npm or yarn)

```bash
pnpm install
# or
npm install
```

3. Create a `.env` file (see Environment Variables below)

4. Run the development server

```bash
pnpm dev
# or
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

Create a `.env.local` file in the project root with the following variables (example values):

```env
MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/greennest
JWT_SECRET=replace-with-a-secure-secret
NEXT_PUBLIC_SITE_NAME=GreenNest
NODE_ENV=development
```

Notes:
- `MONGODB_URI` is optional; if omitted the app falls back to mock data for local development.
- Keep `JWT_SECRET` secret in production.

## Screenshots

- homepage hero and featured products
<img width="1920" height="1080" alt="Screenshot 2026-05-19 101725" src="https://github.com/user-attachments/assets/6ebb9990-6c27-4a79-9067-5a4bb07660fe" />
<img width="1920" height="1080" alt="Screenshot 2026-05-19 101749" src="https://github.com/user-attachments/assets/c3602e3b-5151-4540-b5bd-d145634683bb" />

- product listing
<img width="1920" height="1080" alt="Screenshot 2026-05-19 101908" src="https://github.com/user-attachments/assets/39a0bff3-1ff7-4fc1-8187-e05749fc2e1d" />

- vendor/admin dashboard
<img width="1920" height="1080" alt="Screenshot 2026-05-19 103212" src="https://github.com/user-attachments/assets/e507e692-f596-4941-add9-a5be9beed6a0" />
<img width="1920" height="1080" alt="Screenshot 2026-05-19 102739" src="https://github.com/user-attachments/assets/26ff9dce-bb3c-40dc-a1ac-ae832e77a597" />

- mobile view
  <img width="461" height="754" alt="Screenshot 2026-05-19 200144" src="https://github.com/user-attachments/assets/b5e5c04b-fd5c-4c45-af0a-3487d9b06a8e" />
  <img width="457" height="743" alt="Screenshot 2026-05-19 200359" src="https://github.com/user-attachments/assets/36259b4e-e791-481f-8866-9f49aacbd0ea" />
  <img width="393" height="749" alt="Screenshot 2026-05-19 200926" src="https://github.com/user-attachments/assets/ff425b8d-cf44-4c2c-931f-a0df2203b68a" />


## Future Improvements

- Add payment gateway integration for checkout
- Support multi-tenant vendors and onboarding flows
- CI/CD pipelines and automated deployments

## Deployment
A sample deployment link:
GreenNest – Online Nursery & Gardening Services Platform [https://greennest-marketplace.vercel.app/]
