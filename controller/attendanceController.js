const Session = require("../model/session");
const Student = require("../model/student");
const Cohort = require("../model/cohort");
const attendanceController = {};

attendanceController.getAttendance = async (req, res, next) => {
  try {
    const attendances = await Session.find({});
    if (attendances) {
      return res.status(200).json({ status: "success", data: attendances });
    } else {
      throw new Error("no attendance exist");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

attendanceController.getAttendanceBySession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    const cohort = await Cohort.findOne({ meetingId: session.meetingId });

    if (cohort && session) {
      const students = await Student.find({ cohortList: cohort._id });
      let studentZoomIdList = [];
      let newList = [];
      for (let i = 0; i < students.length; i++) {
        let student = { ...students[i]._doc };
        for (let i = 0; i < student.zoomId.length; i++) {
          studentZoomIdList.push(student.zoomId[i]);
        }

        let record = session.participants.find((item) =>
          student.zoomId.includes(item.user_email)
        );
        if (record) {
          student.record = { ...record };
        } else {
        }
        newList.push(student);
      }

      const notFoundList = session.participants.filter(
        (record) => !studentZoomIdList.includes(record.user_email)
      );
      return res.status(200).json({
        status: "success",
        data: { attendance: newList, notFoundList: notFoundList },
      });
    } else {
      throw new Error("no attendance exist");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

module.exports = attendanceController;
