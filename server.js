const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./src/models/User");
const auth = require("./src/middleware/auth");

const app = express();

/* ================= Middlewares ================= */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================= Mongo ================= */

mongoose
  .connect("mongodb://127.0.0.1:27017/rkten")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ Mongo error:", err));

/* ================= Models ================= */

const Employee = mongoose.model("Employee", {
  name: String,
  email: String,
  role: String,
  salary: String
});

const Project = mongoose.model("Project", {
  name: String,
  client: String,
  deadline: String,
  status: String
});

/* ================= Routes ================= */

app.use("/tasks", auth, require("./src/routes/taskRoutes"));
app.use("/comments", auth, require("./src/routes/commentRoutes"));

/* ================= Register ================= */

app.post("/register", async (req, res) => {
  try {
    const { email, password, role, employeeId } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      role: role || "employee",
      employeeId
    });

    await user.save();

    res.json({ message: "User created" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= Login ================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secret123");

    res.json({
      token,
      role: user.role,
      name: user.email
    });


  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= Employees ================= */

app.get("/employees", auth, async (req, res, next) => {
  try {
    const list = await Employee.find();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.post("/employees", auth, async (req, res, next) => {
  try {
    const { name, email, role, salary, password } = req.body;

    // 1️⃣ Employee record
    const emp = new Employee({ name, email, role, salary });
    await emp.save();

    // 2️⃣ Login user create
    const rawPassword = password || "123456";

    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = new User({
      email,
      password: hashed,
      role: "employee",
      employeeId: emp._id
    });

    await user.save();

    res.json({
      employee: emp,
      defaultPassword: rawPassword
    });

  } catch (err) {
    next(err);
  }
});


app.put("/employees/:id", auth, async (req, res, next) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/employees/:id", auth, async (req, res, next) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
});

/* ================= Projects ================= */

app.get("/projects", auth, async (req, res, next) => {
  try {
    const list = await Project.find();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

app.post("/projects", auth, async (req, res, next) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
});

app.put("/projects/:id", auth, async (req, res, next) => {
  try {
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/projects/:id", auth, async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
});

/* ================= Root ================= */

app.get("/", (req, res) => {
  res.send("RKTen Backend Running");
});

/* ================= Global Error ================= */

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ error: err.message });
});

/* ================= Start ================= */

app.listen(5000, () => console.log("🚀 Server running on 5000"));
