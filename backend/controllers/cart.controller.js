const prisma = require("../config/db.config.js");

const addToCart = async (req, res) => {
    try {
        const userId = parseInt(req.userId);
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const existingCartItem = await prisma.cart.findFirst({
            where: {
                userId: userId,
                productId: parseInt(productId),
            },
        });

        if (existingCartItem) {
            const updatedCart = await prisma.cart.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
            });
            return res.json({ message: "Cart updated", cartItem: updatedCart });
        }

        const cartItem = await prisma.cart.create({
            data: {
                userId: userId,
                productId: parseInt(productId),
                quantity: quantity,
            },
        });

        res.json({ message: "Added to cart", cartItem });
    } catch (err) {
        console.log("Error in addToCart", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const userId = parseInt(req.userId);
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const cartItem = await prisma.cart.findFirst({
            where: {
                id: parseInt(id),
                userId: userId,
            },
        });

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        const updated = await prisma.cart.update({
            where: { id: parseInt(id) },
            data: { quantity: parseInt(quantity) },
        });

        res.json({ message: "Quantity updated", cartItem: updated });
    } catch (err) {
        console.log("Error in updateCartQuantity", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = parseInt(req.userId);

        const cartItems = await prisma.cart.findMany({
            where: {
                userId: userId,
            },
            include: {
                product: {
                    include: {
                        category: true,
                        owner: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        res.json(cartItems);
    } catch (err) {
        console.log("Error in getCart", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = parseInt(req.userId);
        const { id } = req.params;

        const cartItem = await prisma.cart.findFirst({
            where: {
                id: parseInt(id),
                userId: userId,
            },
        });

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        await prisma.cart.delete({
            where: {
                id: parseInt(id),
            },
        });

        res.json({ message: "Removed from cart" });
    } catch (err) {
        console.log("Error in removeFromCart", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { addToCart, updateCartQuantity, getCart, removeFromCart };
