var express = require("express");
var router = express.Router();
const reportController = require("../controller/reportController");

/* GET users listing. */
router.get("/attendance/:meetingId/", reportController.generateAttendance);

module.exports = router;
