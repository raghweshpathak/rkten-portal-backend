const express = require("express");
const Comment = require("../models/Comment");
const Task = require("../models/Task");

const router = express.Router();


// ================= GET comments =================
router.get("/:taskId", async (req, res) => {
  try {
    const comments = await Comment.find({
      taskId: req.params.taskId
    }).sort({ createdAt: -1 });

    res.json(comments);

  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ================= ADD comment =================
router.post("/", async (req, res) => {
  try {
    const comment = await Comment.create(req.body);

    // ✅ activity timeline log
    await Task.findByIdAndUpdate(req.body.taskId, {
      $push: {
        activity: {
          text: "Comment added",
          user: "Admin",
          time: new Date()
        }
      }
    });

    res.json(comment);

  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
