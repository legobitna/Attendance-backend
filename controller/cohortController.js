const Cohort = require("../model/cohort");
const cohortController = {};

cohortController.register = async (req, res, next) => {
  try {
    let {
      name,
      courseId,
      startDate,
      endDate,
      studentList,
      sessions,
      week,
      meetingId,
    } = req.body;

    const cohort = await Cohort.create({
      name,
      courseId,
      startDate,
      endDate,
      studentList,
      sessions,
      week,
      meetingId,
    });
    return res.status(200).json({ status: "success", data: cohort });
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

cohortController.getCohort = async (req, res, next) => {
  try {
    const cohorts = await Cohort.find({})
      .populate("courseId")
      .populate("studentList")
      .populate("sessions");

    if (cohorts) {
      return res.status(200).json({ status: "success", data: cohorts });
    } else {
      throw new Error("no cohort exist");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

cohortController.getSingleCohort = async (req, res, next) => {
  try {
    if (req.params.id) {
      const cohort = await Cohort.findById(req.params.id)
        .populate("courseId")
        .populate("studentList")
        .populate("sessions");
      if (cohort) {
        return res.status(200).json({ status: "success", data: cohort });
      } else {
        throw new Error("there is no cohort with that Id");
      }
    } else {
      throw new Error("there is no cohort id");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

cohortController.editCohort = async (req, res, next) => {
  try {
    if (req.params.id) {
      let cohort = await Cohort.findById(req.params.id);
      if (cohort) {
        const allows = [
          "name",
          "week",
          "sessions",
          "studentList",
          "startDate",
          "endDate",
          "courseId",
          "meetingId",
        ];
        allows.forEach((field) => {
          if (req.body[field] !== undefined) {
            cohort[field] = req.body[field];
          }
        });

        await cohort.save();
        return res.status(200).json({ status: "success", data: cohort });
      } else {
        throw new Error("We don't have cohort with this id");
      }
    } else {
      throw new Error("There is on cohort id");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

cohortController.removeCohort = async (req, res, next) => {
  try {
    if (req.params.id) {
      const deletedCohort = await Cohort.findByIdAndDelete(req.params.id);
      if (!deletedCohort) {
        throw new Error("there is no cohort with that id");
      }
      return res.status(200).json({ status: "success", data: deletedCohort });
    } else {
      throw new Error("There is on cohort id");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};
module.exports = cohortController;
