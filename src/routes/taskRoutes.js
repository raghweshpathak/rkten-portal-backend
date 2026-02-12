const express = require("express");
const Task = require("../models/Task");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");


const router = express.Router();


// ================= GET tasks by project =================
router.get("/:projectId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.params.projectId
    }).populate("assignedTo", "name email");

    res.json(tasks);

  } catch (err) {
    console.error("GET TASK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});



// ================= ADD task =================
router.post("/", async (req, res) => {
  try {
    if (!req.body.projectId) {
      return res.status(400).json({
        message: "projectId required"
      });
    }

    const task = new Task(req.body);

    // ✅ Step 2 — Activity log on create
    task.activity.push({
      text: "Task created",
      user: "Admin"
    });

    await task.save();

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email");

    res.json(populated);

  } catch (err) {
    console.error("🔥 ADD TASK ERROR:", err);
    res.status(500).json({
      message: "Failed to create task",
      error: err.message
    });
  }
});


// ================= UPDATE task =================
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // update fields
    Object.assign(task, req.body);

    // ✅ Step 3 — Activity on status change
    if (req.body.status) {
      task.activity.push({
        text: `Status changed to ${req.body.status}`,
        user: "Admin"
      });
    }

    // activity for assignment
    if (req.body.assignedTo) {
      task.activity.push({
        text: "Employee assigned",
        user: "Admin"
      });
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email");

    res.json(populated);

  } catch (err) {
    console.error("🔥 UPDATE TASK ERROR:", err);
    res.status(500).json({
      message: "Failed to update task",
      error: err.message
    });
  }
});


// ================= DELETE task =================
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });

  } catch (err) {
    console.error("🔥 DELETE TASK ERROR:", err);
    res.status(500).json({
      message: "Failed to delete task",
      error: err.message
    });
  }
});


// ================= FILE UPLOAD =================
router.post("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    task.files.push({
      filename: req.file.filename,
      path: req.file.path
    });

    // ✅ activity log for upload
    task.activity.push({
      text: "File uploaded",
      user: "Admin"
    });

    await task.save();

    res.json(task);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
