const express = require("express");
const mongoose = require("mongoose");
const ensureAuth = require("../middleware/auth");
const Sentence = require('../models/GA');
const router = express.Router();

router.get("/General-Awarness", ensureAuth, async (req, res) => {
    res.render('gaHome.ejs');
});

router.get("/General-Awarness/Date-Wise", ensureAuth, async (req, res) => {
    // Fetch all news initially
    const newsData = await Sentence.find().sort({ date: -1 }).lean();
    res.render("gaDate.ejs", { newsData });
});

router.post("/General-Awarness/Date-Wise/filter", ensureAuth, async (req,res) => {
    try {
        const { date } = req.body;
        if(!date) return res.json({ success:false, data:[] });

        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);

        const filteredNews = await Sentence.find({
            date: { $gte: start, $lte: end }
        }).sort({ date:-1 }).lean();

        res.json({ success:true, data:filteredNews });
    } catch(err) {
        console.error(err);
        res.json({ success:false, data:[] });
    }
});


router.get("/General-Awarness/All-News", ensureAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const sentences = await Sentence.find({ User_id: userId });

        // Group sentences by genre
        const grouped = {};
        sentences.forEach(s => {
            if (!grouped[s.gener]) grouped[s.gener] = [];
            grouped[s.gener].push(s);
        });

        res.render('gaAll.ejs', { grouped });
    } catch (err) {
        console.error("Error fetching sentences:", err);
        res.status(500).send("Server Error");
    }
});



router.get("/General-Awarness/Add", ensureAuth, async (req, res) => {
    res.render('gaAdd.ejs', { userId: req.session.userId });
});

router.post("/add-sentence", ensureAuth, async (req, res) => {
    try {
        const { sentences } = req.body;
        const docs = sentences.map(s => ({
            User_id: req.session.userId,
            gener: s.genre,
            sentence: s.sentence
        }));
        await Sentence.insertMany(docs);
        res.status(200).json({ message: "All sentences added successfully!" });
    } catch (err) {
        console.error("Error adding sentences:", err);
        res.status(500).json(err);
    }
});



module.exports = router;
