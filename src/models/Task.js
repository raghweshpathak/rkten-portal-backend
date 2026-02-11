const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  title: String,
  description: String,

  status: {
    type: String,
    default: "todo"
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  },

    deadline: Date,

  files: [
    {
      filename: String,
      path: String
    }
  ],

  activity: [
    {
      text: String,
      user: String,
      time: { type: Date, default: Date.now }
    }
  ],

  
});

module.exports = mongoose.model("Task", taskSchema);
