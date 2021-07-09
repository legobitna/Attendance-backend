var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
let courseRouter = require("./routes/course");
let cohortRouter = require("./routes/cohort");
let studentRouter = require("./routes/student");
let reportRouter = require("./routes/report");
let attendanceRouter = require("./routes/attendance");
const mongoose = require("mongoose");
require("dotenv").config();
var cors = require("cors");
const mongoURI = process.env.MONGODB_URI;

var app = express();

mongoose
  .connect(mongoURI, {
    // some options to deal with deprecated warning
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Mongoose connected to ${mongoURI}`);
  })
  .catch((err) => console.log(err));
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/course", courseRouter);
app.use("/cohort", cohortRouter);
app.use("/student", studentRouter);
app.use("/report", reportRouter);
app.use("/attendance", attendanceRouter);

module.exports = app;
