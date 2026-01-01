const prisma = require("../config/db.config");

const createOrder = async (req, res) => {
    try {
        const userId = parseInt(req.userID);

        // 1. Get user's cart
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 2. Calculate total
        let total = 0;
        const orderItemsData = cartItems.map(item => {
            total += item.product.price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price
            };
        });

        // 3. Create Order and Delete Cart transactionally
        const orderOperation = prisma.order.create({
            data: {
                userId,
                total,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: true }
        });

        const deleteCartOperation = prisma.cart.deleteMany({
            where: { userId }
        });

        const [order] = await prisma.$transaction([orderOperation, deleteCartOperation]);

        res.status(201).json({ message: "Order placed successfully", order: order });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const userId = req.userID;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { createOrder, getUserOrders };
