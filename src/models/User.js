const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, default: "employee" },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  }
});

module.exports = mongoose.model("User", userSchema);
