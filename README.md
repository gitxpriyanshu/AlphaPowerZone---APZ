# AlphaPowerZone (APZ) - E-Commerce Platform

AlphaPowerZone is a premium e-commerce platform specializing in Gym equipment, Footwear, and Apparel. The application features a modern, ultra-premium UI/UX and a robust administrative dashboard for inventory management.

## 🚀 Live Demo
- **Frontend:** [Vercel Deployment URL]
- **Backend:** [Vercel/Heroku API URL]

## ✨ Features

### 🛒 Customer Experience
- **Ultra-Premium UI:** Clean, modern "Apple-style" product cards and smooth animations.
- **Category Browsing:** Dedicated pages for Gym, Footwear, and Apparel.
- **Shopping Cart:** Seamlessly add products and manage quantities.
- **Buy Now Flow:** Quick checkout process for immediate purchases.
- **Order History:** View past orders and statuses in the user dashboard.
- **COD Support:** Cash on Delivery payment option implemented.

### 🛡️ Owner Dashboard
- **Real-time Analytics:** Track total products, categories, and inventory stats.
- **Product Management:** Full CRUD operations (Add, Edit, Delete) for products.
- **Category Management:** Manage e-commerce categories and hero images.
- **Image Uploads:** Integrated Cloudinary support for product and category images.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios, React Icons, React Router.
- **Backend:** Node.js, Express.js.
- **ORM:** Prisma.
- **Database:** MySQL / PostgreSQL (via Prisma).
- **Authentication:** JWT (JSON Web Tokens) with Cookie-based storage.
- **Media Storage:** Cloudinary.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MySQL or PostgreSQL database
- Cloudinary Account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/gitxpriyanshu/AlphaPowerZone---APZ.git
cd AlphaPowerZone---APZ
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```
Run Prisma migrations:
```bash
npx prisma migrate dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Start the development server:
```bash
npm run dev
```

## 🚀 Deployment

### Vercel Deployment
This project is pre-configured for Vercel deployment.
- Root directory: `/`
- Backend API routes are handled via `vercel.json`.

## 📄 License
This project is licensed under the ISC License.
