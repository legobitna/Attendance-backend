var express = require("express");
var router = express.Router();
const courseController = require("../controller/courseController");

/* GET users listing. */
router.get("/:id", courseController.getSingleCourse);
router.put("/:id", courseController.editCourse);
router.delete("/:id", courseController.removeCourse);
router.get("/", courseController.getCourse);
router.post("/", courseController.register);

module.exports = router;
