# AR-Vision

A clean, modern Next.js storefront with admin pages, cart + checkout, and Stripe integration.

**Features**
- Product listing and detail pages
- Persistent cart and checkout flow
- Stripe payments (client-side integration)
- Authentication pages (signin / signup)
- Basic admin area for dashboard, products, orders, and payments
- Simple server route for LAN info

**Tech Stack**
- Framework: Next.js
- UI: React + Tailwind CSS
- HTTP: Axios
- Auth state: Context API
- Payments: Stripe (stripe-js + react-stripe-js)

**Quick Start**
1. Install dependencies

```bash
npm install
```

2. Start dev server (listens on all interfaces)

```bash
npm run dev
```

3. Build and run production

```bash
npm run build
npm run start
```

**Important files**
- Project manifest: [package.json](package.json)
- App entry & routes: [src/app/](src/app)
- Global styles: [src/app/globals.css](src/app/globals.css)
- API route: [src/app/api/lan-info/route.ts](src/app/api/lan-info/route.ts)
- Authentication pages: [src/app/auth/signin/page.tsx](src/app/auth/signin/page.tsx), [src/app/auth/signup/page.tsx](src/app/auth/signup/page.tsx)
- Cart & checkout: [src/app/cart/page.tsx](src/app/cart/page.tsx), [src/app/checkout/page.tsx](src/app/checkout/page.tsx)
- Product pages: [src/app/product/[id]/page.tsx](src/app/product/[id]/page.tsx)
- Payment page: [src/app/payment/[orderId]/page.tsx](src/app/payment/[orderId]/page.tsx)
- Admin area: [src/app/admin/layout.tsx](src/app/admin/layout.tsx) and subpages under [src/app/admin](src/app/admin)
- UI components: [src/components/Navbar.tsx](src/components/Navbar.tsx), [src/components/ProductCard.tsx](src/components/ProductCard.tsx)
- Context providers: [src/context/AuthContext.tsx](src/context/AuthContext.tsx), [src/context/CartContext.tsx](src/context/CartContext.tsx)
- API helpers: [src/lib/api.ts](src/lib/api.ts)

**Environment**
- Create a `.env.local` 

```env
NEXT_PUBLIC_API_URL=your backend url
```

**Development notes**
- The dev script runs `next dev -H 0.0.0.0 -p 3000` so the server is reachable across your LAN.
- Tailwind is configured via `tailwind.config.ts` and styles are loaded from [src/app/globals.css](src/app/globals.css).

**Contributing**
- Open issues or PRs for features, bug fixes, or UI improvements.
- Keep changes focused and add small, descriptive commits.


**Continuous Integration**
- This repository includes a GitHub Actions workflow that installs dependencies, runs `npm run lint`, and attempts a production build on pushes and pull requests. See the workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
