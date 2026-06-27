# CHERIE

A premium, custom-built e-commerce storefront and admin dashboard for a luxury jewelry and craft shop.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (v4)
- **Database & Auth:** Supabase
- **Icons:** Lucide React
- **Routing:** React Router DOM

## Features

- **Public Storefront:** Dynamic product grid, category filtering, search, sorting, and an interactive shopping cart.
- **WhatsApp Checkout:** Orders are automatically formatted and sent securely via WhatsApp.
- **Admin Dashboard:** Secure, authenticated portal to manage inventory, categories, store settings, and product visibility.
- **Real-time Sync:** Powered by Supabase, meaning storefront updates (prices, images, inventory) happen instantly.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment (Vercel)

This project is fully optimized for deployment on Vercel as a Single Page Application (SPA). A `vercel.json` file is included to handle client-side routing.

1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel Environment Variables.
4. Click Deploy.
