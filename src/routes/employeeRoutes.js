
const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.get("/", auth, role(["admin"]), async (req, res) => {
  try {
    const list = await Employee.find();
    res.json(list);
  } catch (err) {
    console.error("GET employees error:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/employees", auth, async (req, res) => {
  try {
    const emp = new Employee(req.body);
    await emp.save();
    res.json(emp);
  } catch (err) {
    console.error("POST employees error:", err);
    res.status(500).json({ message: err.message });
  }
});

app.put("/employees/:id", auth, async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("PUT employees error:", err);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/employees/:id", auth, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("DELETE employees error:", err);
    res.status(500).json({ message: err.message });
  }
});
