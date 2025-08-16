const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
// Route Files
const authRoutes = require('./routes/auth');
const Admin_Work = require('./routes/Admin_Work');
const vocabs = require('./routes/vocabs');
const idoms = require('./routes/idoms');


const app = express();

require("dotenv").config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware Setup
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // Express's built-in middleware to handle JSON

// Session Setup
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/classnexus',
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: false,  // Set to true if using HTTPS
    }
}));

// Static Files
app.use(express.static(path.join(__dirname, "public/css")));
app.use(express.static(path.join(__dirname, "public/js")));
app.use('/uploads', express.static('uploads'));  // Serve uploaded files

// View Engine & Multiple Views Directory Setup
app.set("view engine", "ejs");
app.set("views", [
    path.join(__dirname, "views/Webpages"),
    path.join(__dirname, "views/authantication"),
    path.join(__dirname, "views/partial"),
    path.join(__dirname, "views/Webpages/home"),
    path.join(__dirname, "views/Webpages/square_cube"),
    path.join(__dirname, "views/Webpages/idoms"),
    path.join(__dirname, "views/Webpages/vocab"),

]);

app.use(flash());

// 3. flash ko res.locals me daalna (for ejs use)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/', vocabs);
app.use('/', Admin_Work);
app.use('/', idoms);


// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
