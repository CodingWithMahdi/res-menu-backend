const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const itemRoutes = require("./routes/item.js");
const authRoutes=require('./routes/auth');

const multer = require("multer");
require("dotenv").config();

const app = express();
let port = process.env.PORT || 3000;
let host = process.env.MONGODB_URL;
mongoose.set("strictQuery", false);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  }
});

const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/svg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(upload.single("image"));

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api", itemRoutes);
app.use('/api/auth',authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(host)
  .then((result) => {
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
