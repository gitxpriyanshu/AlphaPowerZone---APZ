require("dotenv").config()
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

// MANUAL CORS MIDDLEWARE - Applied to ALL requests
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://alpha-power-zone-apz.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174'
    ];

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        // Fallback for non-browser requests or missing origin header
        res.header('Access-Control-Allow-Origin', 'https://alpha-power-zone-apz.vercel.app');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('X-App-Version', '1.0.6-live');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Health check endpoint - TOP PRIORITY
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'APZ API is online',
        timestamp: new Date()
    });
});

// Routes
app.use('/api/users', require('./routes/user.route.js'))
app.use('/api/owners', require('./routes/owner.route.js'))
app.use('/api/categories', require('./routes/category.route.js'))
app.use('/api/cart', require('./routes/cart.route.js'))
app.use('/api/orders', require('./routes/order.route.js'))
app.use('/api/products', require('./routes/product.route.js'))

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Not Found: ${req.method} ${req.url}` });
});

const PORT = process.env.PORT || 3007
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})