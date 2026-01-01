const prisma = require("../config/db.config.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingOwner = await prisma.owner.findUnique({
      where: { email },
    });

    if (existingOwner) {
      return res.status(400).json({
        message: "Email already exists, please login",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await prisma.owner.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(201).json({
      message: "Owner registered successfully",
      owner,
    });
  } catch (err) {
    console.log("Error from signup", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
    console.log("Error from signin", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: false,
      secure: false,
      sameSite: "strict",
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
  signup,
  signin,
  logout,
};
