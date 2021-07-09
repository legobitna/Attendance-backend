var express = require("express");
var router = express.Router();
const reportController = require("../controller/reportController");
const { report } = require("./cohort");

router.post("/notification", function (req, res, next) {
  reportController.generateAttendance(req, res, next);
});
router.post("/link", reportController.linkCohortAndSession);
router.post("/meetingstart", reportController.getCurrentParticipant);
router.post("/join", reportController.joinedParticipant);

router.get("/", function (req, res, next) {
  res.send("index", { title: "Express" });
});
module.exports = router;
