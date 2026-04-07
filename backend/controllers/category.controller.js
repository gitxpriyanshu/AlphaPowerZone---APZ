const prisma = require("../config/db.config");

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const category = await prisma.category.create({
            data: {
                name,
                Image: req.file.path,
            },
        });

        res.status(201).json({ message: "Category created", category });
    } catch (err) {
        console.error("Error creating category:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { products: true }
        });
        res.status(200).json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: { products: true }
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (err) {
        console.error("Error fetching category:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const existing = await prisma.category.findUnique({ where: { id: parseInt(id) } });
        if (!existing) {
            return res.status(404).json({ message: "Category not found" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (req.file) updateData.Image = req.file.path;

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (err) {
        console.error("Error updating category:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.category.findUnique({ where: { id: parseInt(id) } });
        if (!existing) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Get all product IDs in this category to clean up related records
        const products = await prisma.product.findMany({
            where: { categoryId: parseInt(id) },
            select: { id: true }
        });
        const productIds = products.map(p => p.id);

        if (productIds.length > 0) {
            // Delete from Cart and OrderItem first to avoid further FK issues
            await prisma.cart.deleteMany({ where: { productId: { in: productIds } } });
            await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
            // Delete the products
            await prisma.product.deleteMany({ where: { categoryId: parseInt(id) } });
        }

        await prisma.category.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory };
