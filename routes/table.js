const express = require("express");
const mongoose = require("mongoose");
const ensureAuth = require("../middleware/auth");
const router = express.Router();

router.get("/tables", ensureAuth, async (req, res) => {
  res.render('table.ejs');
});

// ✅ MAKE SURE YOU HAVE THIS LINE AT THE END:
module.exports = router;
