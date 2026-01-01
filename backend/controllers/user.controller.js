const prisma = require("../config/db.config.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { name, email, age, password, mobile, address } = req.body;

  if (!name || !email || !age || !password || !mobile) {
    return res.status(400).json({ message: "All field are required" });
  }

  if (mobile.length !== 10) {
    return res.status(400).json({ message: "Mobile number must be 10 digits" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be more than 6 length" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Please enter the valid email" });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { mobile }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or mobile is already exists login please" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const createUser = await prisma.user.create({
      data: {
        name,
        email,
        age: parseInt(age),
        mobile,
        address: address || null,
        password: hashPassword,
      },
    });

    res.status(201).json({ message: "Registration successful!", user: { id: createUser.id, name: createUser.name, email: createUser.email } });
  } catch (err) {
    console.error("Error from signup:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'production' ? err.message : err.stack
    });
  }
};

const signin = async (req, res) => {
  const { email, mobile, password } = req.body;

  if ((!email && !mobile) || !password) {
    return res.status(400).json({
      message: "Email or mobile and password are required",
    });
  }

  if (mobile && mobile.length !== 10) {
    return res.status(400).json({
      message: "Mobile number must be exactly 10 digits",
    });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be more than 6 length" });
  }

  if (email && !email.includes("@")) {
    return res.status(400).json({
      message: "Please enter a valid email",
    });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [email ? { email } : undefined, mobile ? { mobile } : undefined],
      },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "Email or mobile is not exists signup please" });
    }

    const verifyPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!verifyPassword) {
      return res.status(404).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userID: existingUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Required for sameSite: 'none'
      sameSite: "none", // Required for cross-domain (Vercel to Render)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login Succesfully",
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: 'user'
      }
    });
  } catch (err) {
    console.error("Error from signin:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'production' ? err.message : err.stack
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
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
  signup,
  signin,
  logout
};
