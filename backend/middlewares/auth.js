const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  try {
    const token = req.cookies?.user_token;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decode.userId;
    next();
  } catch (err) {
    console.log("Error form auth middleware", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = verify;
