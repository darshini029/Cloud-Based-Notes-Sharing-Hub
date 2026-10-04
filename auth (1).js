const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

function tokenFor(user) {
  return jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
}

router.post("/register", async (req,res) => {
  try {
    const {name,email,password} = req.body;
    if (!name || !email || !password) return res.status(400).json({message:"Please fill all fields"});
    if (password.length < 6) return res.status(400).json({message:"Password must be at least 6 characters"});
    if (await User.findOne({email})) return res.status(409).json({message:"Email already registered"});
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({name,email,password:hash});
    res.json({token:tokenFor(user), user:{name:user.name,email:user.email}});
  } catch(e) { res.status(500).json({message:"Registration failed"}); }
});

router.post("/login", async (req,res) => {
  try {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if (!user || !(await bcrypt.compare(password,user.password))) return res.status(401).json({message:"Invalid email or password"});
    res.json({token:tokenFor(user), user:{name:user.name,email:user.email}});
  } catch(e) { res.status(500).json({message:"Login failed"}); }
});

module.exports = router;