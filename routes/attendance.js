var express = require("express");
var router = express.Router();
const attendanceController = require("../controller/attendanceController");

/* GET users listing. */
router.get("/:sessionId", attendanceController.getAttendanceBySession);
router.get("/", attendanceController.getAttendance);

// router.post("/", attendanceController.register);

module.exports = router;
