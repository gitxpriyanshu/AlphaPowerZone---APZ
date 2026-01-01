const prisma = require("../config/db.config.js");

const createProducts = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;
    const ownerId = req.ownerId;

    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({
        message: "Name, description, price and categoryId are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    if (isNaN(price)) {
      return res.status(400).json({
        message: "Price must be a number",
      });
    }

    if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "categoryId must be a number",
      });
    }

    const imageUrl = req.file.path;

    if (!ownerId) {
      return res.status(401).json({ message: "Owner ID missing from request" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        Image: imageUrl,
        ownerId: Number(ownerId),
        categoryId: Number(categoryId),
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("Error from createProducts:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, owner: { select: { name: true } } }
    });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true, owner: { select: { name: true } } }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId } = req.body;
    const ownerId = req.ownerId;

    // Check if product exists and belongs to owner
    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (existing.ownerId !== ownerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = Number(price);
    if (categoryId) updateData.categoryId = Number(categoryId);
    if (req.file) updateData.Image = req.file.path;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.ownerId;

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (existing.ownerId !== ownerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createProducts, getAllProducts, getProductById, updateProduct, deleteProduct };
