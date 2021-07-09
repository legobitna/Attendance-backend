const Course = require("../model/course");
const courseController = {};

courseController.register = async (req, res, next) => {
  try {
    let { name } = req.body;

    const course = await Course.create({
      name,
    });
    return res.status(200).json({ status: "success", data: course });
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

courseController.getCourse = async (req, res, next) => {
  try {
    const courses = await Course.find({});
    if (courses) {
      return res.status(200).json({ status: "success", data: courses });
    } else {
      throw new Error("no course exist");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

courseController.getSingleCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      return res.status(200).json({ status: "success", data: course });
    } else {
      throw new Error("no course exist");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

courseController.editCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      const allows = ["name"];
      allows.forEach((field) => {
        if (req.body[field] !== undefined) {
          course[field] = req.body[field];
        }
      });
      await course.save();
      return res.status(200).json({ status: "success", data: course });
    } else {
      throw new Error("no course exist");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

courseController.removeCourse = async (req, res, next) => {
  try {
    if (req.params.id) {
      const deletedCourse = await Course.findByIdAndDelete(req.params.id);
      if (!deletedCourse) {
        throw new Error("There is no course with that id");
      }
      return res.status(200).json({ status: "success", data: deletedCourse });
    } else {
      throw new Error("There is on course id");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

module.exports = courseController;
