const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(404).json({ message: "Invalid Token" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = decode.userID;
    next();
  } catch (err) {
    console.log("Error form auth middleware", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = verify;
