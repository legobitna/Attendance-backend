var express = require("express");
var router = express.Router();
const studentController = require("../controller/studentController");

/* GET users listing. */

router.get("/:id", studentController.getSingleStudent);
router.put("/:id", studentController.editStudent);
router.delete("/:id", studentController.removeStudent);
router.get("/", studentController.getStudent);
router.post("/", studentController.register);
router.post("/list", studentController.registerStudentList);

module.exports = router;
