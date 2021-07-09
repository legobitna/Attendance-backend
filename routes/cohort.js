var express = require("express");
var router = express.Router();
const cohortController = require("../controller/cohortController");

/* GET users listing. */
router.get("/:id", cohortController.getSingleCohort);
router.put("/:id", cohortController.editCohort);
router.delete("/:id", cohortController.removeCohort);
router.get("/", cohortController.getCohort);
router.post("/", cohortController.register);

module.exports = router;
