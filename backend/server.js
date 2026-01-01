require("dotenv").config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

// CORS configuration - Simplified and more compatible
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://alpha-power-zone-apz.vercel.app'
];

const app = express()

// MANUAL CORS MIDDLEWARE - Guaranteed to set headers
app.use((req, res, next) => {
    const origin = req.get('Origin');
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://alpha-power-zone-apz.vercel.app'
    ];

    if (allowedOrigins.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

//routes - REMOVED TRAILING SLASHES
app.use('/api/users', require('./routes/user.route.js'))
app.use('/api/owners', require('./routes/owner.route.js'))
app.use('/api/categories', require('./routes/category.route.js'))
app.use('/api/cart', require('./routes/cart.route.js'))
app.use('/api/orders', require('./routes/order.route.js'))
app.use('/api/products', require('./routes/product.route.js'))

// 404 Handler with CORS headers
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});





const PORT = process.env.PORT || 3007
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})