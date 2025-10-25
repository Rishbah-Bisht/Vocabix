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

router.get('/words-on-date', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Convert string to start and end of day for querying
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // Find words added on that date
    const words = await Word.find({
      date: { $gte: start, $lte: end }
    }).select('word meaning sentence -_id'); // exclude _id if you want

    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
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
  try {
    const { vocab } = req.body; // array from frontend

    if (!vocab || !Array.isArray(vocab) || vocab.length === 0) {
      return res.status(400).json({ message: 'No vocabulary data provided' });
    }

    // Add user ID and optional date to each vocab entry
    const vocabData = vocab.map(item => ({
      User_id: req.session.userId,
      word: item.word,
      meaning: item.meaning,
      sentence: item.sentence,
      date: item.date ? new Date(item.date) : undefined
    }));

    // Insert all vocab at once
    await Word.insertMany(vocabData);

    res.redirect('/words-on-date');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while adding vocabulary' });
  }
});



router.get("/percentage", ensureAuth, async (req, res) => {
  
  res.render("percentage.ejs");
});


module.exports = router;
