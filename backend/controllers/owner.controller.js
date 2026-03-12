const prisma = require("../config/db.config.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signin = async (req, res) => {
  try {
    const { email, password, secretKey } = req.body;

    if (!email || !password || !secretKey) {
      return res.status(400).json({
        message: "Email, password, and Owner Passkey are required",
      });
    }

    const OWNER_SECRET_KEY = process.env.OWNER_SECRET_KEY || "AlphaPowerZone@2026_SecureAdmin!";
    if (secretKey !== OWNER_SECRET_KEY) {
      return res.status(401).json({
        message: "Invalid Owner Passkey",
      });
    }

    const existingOwner = await prisma.owner.findUnique({
      where: { email },
    });

    if (!existingOwner) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      existingOwner.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: existingOwner.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("owner_token", token, {
      httpOnly: true,
      secure: true, // Required for sameSite: 'none'
      sameSite: "none", // Required for cross-domain (Vercel to Render)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successfully",
      owner: {
        id: existingOwner.id,
        name: existingOwner.name,
        email: existingOwner.email,
        role: 'owner'
      }
    });
  } catch (err) {
    console.error("Error from owner signin:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'production' ? err.message : err.stack
    });
  }
};


const logout = async (req, res) => {
  try {
    res.clearCookie("owner_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    console.log("Error form logout", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signin,
  logout,
};
