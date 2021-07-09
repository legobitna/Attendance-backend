const Student = require("../model/student");
const studentController = {};
const Cohort = require("../model/cohort");

studentController.register = async (req, res, next) => {
  try {
    let { students } = req.body;

    for (let index = 0; index < students.length; index++) {
      // to make sure loop call student one by one (thats why i change from map to for loop)
      const student = students[index];
      let newStudent = await Student.create({
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        gender: student.gender,
        phone: student.phone,
        status: student.status,
        foreigner: student.foreigner,
        discordId: student.discordId,
        zoomId: student.zoomId,
        company: student.company,
        salary: student.salary,
        note: student.note,
        cvUrl: student.cvUrl,
        showOnWebsite: student.showOnWebsite,
        cohortList: student.cohortList,
      });
    }

    return res.status(200).json({ status: "success", data: "" });
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};
studentController.registerStudentList = async (req, res, next) => {
  try {
    let { data, sessionId } = req.body;
    const cohort = await Cohort.findOne({ sessions: sessionId });
    let studentArray = cohort.studentList;

    for (let i = 0; i < data.length; i++) {
      let student = data[i];

      if (student.user_email !== "") {
        const existUser = await Student.findOne({ zoomId: student.user_email }); //find user by zoomId
        if (existUser) {
          let cohortArray = existUser.cohortList;
          cohortArray.push(cohort._id);
          studentArray.push(existUser._id);
          await Student.findByIdAndUpdate(
            { _id: existUser._id },
            { cohortList: cohortArray }
          );
          await Cohort.findByIdAndUpdate(
            { _id: cohort._id },
            { studentList: studentArray }
          );
        } else {
          let userByCohort = await Student.findOne({
            name: student.name,
            cohortList: cohort._id,
          });

          if (userByCohort) {
            let zoomIdList = userByCohort.zoomId;
            zoomIdList.push(student.user_email);

            let userUpdate = await Student.findByIdAndUpdate(
              { _id: userByCohort._id },
              { zoomId: zoomIdList }
            );
          } else {
            let result = await Student.create({
              name: student.name,
              email: student.user_email,
              gender: "",
              phone: "",
              status: "onGoing",
              foreigner: false,
              discordId: "",
              zoomId: [student.user_email],
              company: "",
              salary: "",
              note: "",
              cvUrl: "",
              showOnWebsite: false,
              cohortList: [cohort._id],
            });

            let studentArray = cohort.studentList;
            studentArray.push(result._id);

            await Cohort.findByIdAndUpdate(
              { _id: cohort._id },
              { studentList: studentArray }
            );
          }
        }
      } else {
        throw new Error("there is no email for user", student.name);
      }
    }
    return res.status(200).json({ status: "success", data: "" });
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};
studentController.getStudent = async (req, res, next) => {
  try {
    const students = await Student.find({}).populate("cohortList");

    return res.status(200).json({ status: "success", data: students });
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};
studentController.getSingleStudent = async (req, res, next) => {
  try {
    if (req.params.id) {
      const student = await Student.findById(req.params.id).populate(
        "cohortList"
      );
      if (student) {
        return res.status(200).json({ status: "success", data: student });
      } else {
        throw new Error("there is no student with that Id");
      }
    } else {
      throw new Error("there is no student id");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

studentController.editStudent = async (req, res, next) => {
  try {
    if (req.params.id) {
      let student = await Student.findById(req.params.id);
      if (student) {
        const allows = [
          "name",
          "email",
          "gender",
          "phone",
          "status",
          "foreigner",
          "discordId",
          "zoomId",
          "company",
          "salary",
          "note",
          "cvUrl",
          "showOnWebsite",
          "cohortList",
        ];
        allows.forEach((field) => {
          if (req.body[field] !== undefined) {
            student[field] = req.body[field];
          }
        });

        await student.save();
        return res.status(200).json({ status: "success", data: student });
      } else {
        throw new Error("We don't have student with this id");
      }
    } else {
      throw new Error("There is on student id");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

studentController.removeStudent = async (req, res, next) => {
  try {
    if (req.params.id) {
      const deletedStudent = await Student.findByIdAndDelete(req.params.id);

      if (!deletedStudent) {
        throw new Error("There is no student with that id");
      }
      const cohort = await Cohort.findOne({ studentList: req.params.id });

      let newStudentList = cohort.studentList.filter((std) => {
        return std != req.params.id;
      });

      const result = await Cohort.findByIdAndUpdate(
        { _id: cohort._id },
        { studentList: [...newStudentList] }
      );

      return res.status(200).json({ status: "success", data: deletedStudent });
    } else {
      throw new Error("There is on student id");
    }
  } catch (err) {
    return res.status(401).json({ status: "fail", message: err.message });
  }
};

module.exports = studentController;
