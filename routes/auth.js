const express = require("express");
const session = require("express-session");
const router = express.Router();
const User = require("../models/user_login_info");
const ensureAuth = require("../middleware/auth");


router.get("/sign-up", async (req, res) => {
  res.render("signUp.ejs");
});







router.get("/login", async (req, res) => {
  res.render("Login.ejs");
});

router.post("/login", async (req, res) => {
  const { number, password } = req.body;

  if (!number || !password) {
    return res.status(400).send("Please provide both number and password");
  }

  try {
    const user = await User.findOne({ number });

    if (!user) {
      return res.status(401).send("User not found");
    }

    if (user.nickname !== password) {
      return res.status(401).send("Invalid password");
    }

    req.session.userId = user._id;

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Session error");
      }
      console.log(req.session)
      res.redirect("/home");
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Internal Server Error");
  }
});









router.post("/signup", async (req, res) => {
  const { name, number } = req.body;

  try {
    const existingUser = await User.findOne({ number });
    if (existingUser) {
      return res.render("signUp.ejs", { error: "This number is already registered" });
    }

    const newUser = new User({ name, number });
    await newUser.save();

    req.session.userId = newUser._id;
    req.session.save(err => {
      if (err) return res.status(500).send("Session error");
      res.redirect('/make-user-name');
    });
  } catch (error) {
    res.render("signUp.ejs", { error: "Internal Server Error" });
  }
});



router.get("/make-user-name", ensureAuth, async (req, res) => {
  res.render("makeUserName.ejs");
});

router.post("/Save-User-pass", ensureAuth, async (req, res) => {
  const { password } = req.body;
  const userId = req.session.userId;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nickname: password, singUp: "yes" },
      { new: true }
    );

    if (!updatedUser) return res.status(404).send("User not found");

    res.redirect("/home");
  } catch (err) {
    res.status(500).send("Signup failed");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    res.redirect("/login");
  });
});












router.get("/home", ensureAuth, async (req, res) => {
  const users = await User.find();
  res.render("home.ejs", { users });
});
module.exports = router;
