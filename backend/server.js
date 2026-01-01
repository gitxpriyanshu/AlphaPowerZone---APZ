require("dotenv").config()
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const cors = require('cors')
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // Good practice for form-data
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://alpha-power-zone-apz.vercel.app'], // Support local and production
    credentials: true
}))
app.use(cookieParser())

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