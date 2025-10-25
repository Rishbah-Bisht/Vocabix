// index.js
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
require("dotenv").config();

// Route Files
const authRoutes = require('./routes/auth');
const Admin_Work = require('./routes/Admin_Work');
const vocabs = require('./routes/vocabs');
const idoms = require('./routes/idoms');
const table = require('./routes/table');
const gA = require('./routes/gA');

const app = express();

// ------------------ MONGODB CONNECTION ------------------
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ------------------ MIDDLEWARE ------------------
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ------------------ SESSION ------------------
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,  // Atlas URI
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: false } // 1 day
}));

// ------------------ STATIC FILES ------------------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/css")));
app.use(express.static(path.join(__dirname, "public/js")));
app.use('/uploads', express.static('uploads'));  

// ------------------ VIEW ENGINE ------------------
app.set("view engine", "ejs");
app.set("views", [
    path.join(__dirname, "views/Webpages"),
    path.join(__dirname, "views/authantication"),
    path.join(__dirname, "views/partial"),
    path.join(__dirname, "views/Webpages/home"),
    path.join(__dirname, "views/Webpages/square_cube"),
    path.join(__dirname, "views/Webpages/idoms"),
    path.join(__dirname, "views/Webpages/vocab"),
    path.join(__dirname, "views/Webpages/table"),
    path.join(__dirname, "views/Webpages/G.a"),
]);

// ------------------ FLASH ------------------
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// ------------------ ROUTES ------------------
app.use('/', authRoutes);
app.use('/', vocabs);
app.use('/', Admin_Work);
app.use('/', idoms);
app.use('/', table);
app.use('/', gA);

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at port ${PORT}`));
