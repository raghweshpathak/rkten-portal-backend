const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "secret123");

    const user = await User.findById(decoded.id);

    req.user = user; // ⭐ attach user to request

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

