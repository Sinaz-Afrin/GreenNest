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

Add screenshots to `public/screenshots/` and reference them here. Example:

- `public/screenshots/home.png` - homepage hero and featured products
- `public/screenshots/product-list.png` - product listing
- `public/screenshots/dashboard.png` - vendor/admin dashboard

You can embed images in this README when available:

```md
![Home](/screenshots/home.png)
```

## Future Improvements

- Add payment gateway integration for checkout
- Improve search and filtering with server-side indexing
- Add unit and end-to-end tests
- Support multi-tenant vendors and onboarding flows
- CI/CD pipelines and automated deployments

## Deployment

A sample deployment link (update once deployed):

https://your-greennest-app.example.com

