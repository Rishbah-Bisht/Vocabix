const express = require("express");
const session = require("express-session");
const router = express.Router();
const User = require("../models/user_login_info");
const user_more_info = require("../models/vocab");
const ensureAuth = require("../middleware/auth")


router.get("/home",ensureAuth, async (req, res) => {
  res.render("home.ejs");
});
router.get("/squares",ensureAuth, async (req, res) => {
  res.render("square.ejs");
});
router.get("/profile", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.redirect("/login");
  }
  res.render("profile.ejs", { user });
});


module.exports = router; 
