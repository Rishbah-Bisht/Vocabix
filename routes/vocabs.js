const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/user_login_info");
const Word = require("../models/vocab");
const ensureAuth = require("../middleware/auth");

router.get("/vocabs", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("vocab_home.ejs", { user });
});

router.get("/day-wise-vocab", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("day_wise_vocab.ejs", { user });
});

router.get("/all-vocabs", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const words = await Word.find({}).sort({ word: 1 });
  const grouped = {};
  words.forEach(word => {
    const firstLetter = word.word[0].toUpperCase();
    if (!grouped[firstLetter]) grouped[firstLetter] = [];
    grouped[firstLetter].push(word);
  });
  const groupedWords = Object.keys(grouped).sort().map(letter => ({
    letter,
    words: grouped[letter]
  }));
  res.render('A_to_Z_vocab', { groupedWords, user });
});

router.get("/add-word", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render("add_vocab.ejs", { user });
});

router.get("/mcq-vocab", ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const [correct] = await Word.aggregate([{ $sample: { size: 1 } }]);
  const wrongs = await Word.aggregate([
    { $match: { _id: { $ne: correct._id } } },
    { $sample: { size: 3 } }
  ]);
  const options = [correct.meaning, ...wrongs.map(w => w.meaning)];
  const shuffled = options.sort(() => Math.random() - 0.5);
  res.render('mcq-vocab', {
    word: correct.word,
    options: shuffled,
    answer: correct.meaning,
    user
  });
});

router.get('/mcq-json', ensureAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const shownWords = req.query.shown ? JSON.parse(req.query.shown) : [];
  const totalCount = await Word.countDocuments();
  const remainingWords = await Word.aggregate([
    { $match: { _id: { $nin: shownWords.map(id => new mongoose.Types.ObjectId(id)) } } },
    { $sample: { size: 1 } }
  ]);
  if (remainingWords.length === 0) {
    return res.json({ finished: true, totalCount, user });
  }
  const correct = remainingWords[0];
  const wrongs = await Word.aggregate([
    { $match: { _id: { $ne: correct._id } } },
    { $sample: { size: 3 } }
  ]);
  const options = [correct.meaning, ...wrongs.map(w => w.meaning)];
  const shuffled = options.sort(() => Math.random() - 0.5);
  res.json({
    word: correct.word,
    options: shuffled,
    answer: correct.meaning,
    sentence: correct.sentence,
    id: correct._id,
    totalCount,
    user
  });
});

router.post('/add-word', ensureAuth, async (req, res) => {
  const { word, meaning, sentence, date } = req.body;
  try {
    await Word.create({
      User_id: req.session.userId,
      word,
      meaning,
      sentence,
      date: date ? new Date(date) : undefined
    });
    res.redirect('/day-wise-vocab');
  } catch (error) {
    res.status(500).send('Error adding word');
  }
});

module.exports = router;
