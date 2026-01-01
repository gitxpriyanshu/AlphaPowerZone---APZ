require("dotenv").config()
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const cors = require('cors')

// CORS configuration - MUST BE FIRST
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://alpha-power-zone-apz.vercel.app'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

//routes
app.use('/api/users/', require('./routes/user.route.js'))
app.use('/api/owners/', require('./routes/owner.route.js'))
app.use('/api/categories/', require('./routes/category.route.js'))
app.use('/api/cart/', require('./routes/cart.route.js'))
app.use('/api/orders/', require('./routes/order.route.js'))
app.use('/api/', require('./routes/product.route.js'))





const PORT = process.env.PORT || 3007
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})