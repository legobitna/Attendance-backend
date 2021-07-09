const mongoose = require("mongoose");
const Cohort = require("./cohort");

const Schema = mongoose.Schema;

const studentSchema = Schema(
  {
    studentId: { type: Number },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String },
    phone: { type: String },
    status: { type: String },
    foreigner: { type: Boolean },
    discordId: { type: String },
    zoomId: [{ type: String }],
    company: { type: String },
    salary: { type: Number },
    note: { type: String },
    cvUrl: { type: String },
    showOnWebsite: { type: Boolean },
    cohortList: [
      {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Cohort",
      },
    ],
  },

  { timestamps: true }
);
studentSchema.methods.toJSON = function () {
  const obj = this._doc;
  return obj;
};

studentSchema.pre("save", async function (next) {
  try {
    if (this.cohortList.length > 0) {
      let promises = this.cohortList.map(async (cohortId) => {
        let cohort = await Cohort.findById(cohortId);
        let students = [...cohort.studentList, this._id];
        // students.push(this._id);
        let result = await Cohort.findByIdAndUpdate(cohort, {
          studentList: students,
        });
      });
      await Promise.all(promises);
    }
  } catch (err) {
    return next(err);
  }

  next();
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
