const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= Mongo ================= */

mongoose
  .connect("mongodb://127.0.0.1:27017/rkten")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ Mongo error:", err));

/* ================= Models ================= */

const User = mongoose.model("User", {
  email: String,
  password: String
});

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

/* ================= Auth ================= */

const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Bad token format" });

  try {
    const decoded = jwt.verify(token, "secret123");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= Register ================= */

app.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });

    await user.save();
    res.json({ message: "User created" });
  } catch (err) {
    next(err);
  }
});

/* ================= Login ================= */

app.post("/login", async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secret123");
    res.json({ token });

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
    const emp = new Employee(req.body);
    await emp.save();
    res.json(emp);
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
