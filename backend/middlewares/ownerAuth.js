const jwt = require("jsonwebtoken");
const prisma = require("../config/db.config");

const verifyOwner = async (req, res, next) => {
  try {
    const token = req.cookies?.owner_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Owner token required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    const owner = await prisma.owner.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (!owner) {
      return res.status(403).json({
        message: "Access denied. Owner only",
      });
    }

    req.ownerId = owner.id;
    next();
  } catch (err) {
    console.log("Owner auth error:", err);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = verifyOwner;
