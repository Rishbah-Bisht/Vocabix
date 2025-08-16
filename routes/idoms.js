const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/user_login_info");
const Idiom = require('../models/idioms');
const ensureAuth = require("../middleware/auth");

router.get("/idioms", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("idoms_home.ejs", { user });
});

router.get("/idioms-on-date", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { date } = req.query;
  if (!date) return res.render('idioms-on-date', { idioms: [], selectedDate: null, user });

  const start = new Date(date);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const idioms = await Idiom.find({
    date: { $gte: start, $lte: end }
  }).sort({ idiom: 1 });

  res.render('idioms-on-date', { idioms, selectedDate: date, user });
});

router.get("/all_idoms", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const idioms = await Idiom.find({}).sort({ idiom: 1 });
  res.render('all_idoms', { idioms, user });
});

router.get("/add-idiom", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("add_idioms.ejs", { user });
});

router.get("/mcq-idioms", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("mcq-idioms.ejs", { user });
});

router.get('/idioms-mcq-json', ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const shown = req.query.shown ? JSON.parse(req.query.shown) : [];

  try {
    const totalCount = await Idiom.countDocuments();
    const remainingIdioms = await Idiom.aggregate([
      { $match: { _id: { $nin: shown.map(id => new mongoose.Types.ObjectId(id)) } } },
      { $sample: { size: 1 } }
    ]);

    if (remainingIdioms.length === 0) {
      return res.json({ finished: true, totalCount, user });
    }

    const correct = remainingIdioms[0];
    const wrongOptions = await Idiom.aggregate([
      { $match: { _id: { $ne: correct._id } } },
      { $sample: { size: 3 } }
    ]);

    const options = [correct.meaning, ...wrongOptions.map(w => w.meaning)].sort(() => Math.random() - 0.5);

    res.json({
      id: correct._id,
      idiom: correct.idiom,
      answer: correct.meaning,
      options,
      totalCount,
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch idioms quiz question' });
  }
});

router.post('/add-idiom', ensureAuth, async (req, res) => {
  const { idiom, meaning, example, date } = req.body;

  try {
    await Idiom.create({
      User_id: req.session.userId,
      idiom,
      meaning,
      example,
      date: date ? new Date(date) : undefined
    });
    res.redirect('/idioms-on-date');
  } catch (err) {
    console.error('Error adding idiom:', err);
    res.status(500).send('Error saving idiom');
  }
});

module.exports = router;
