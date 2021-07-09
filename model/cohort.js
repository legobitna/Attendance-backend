const mongoose = require("mongoose");
const Course = require("./course");

const Schema = mongoose.Schema;

const cohortSchema = Schema(
  {
    name: { type: String, required: true },
    courseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    studentList: [
      {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Student",
      },
    ],
    sessions: [
      {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Session",
      },
    ],
    week: { type: Number },
    meetingId: { type: Number },
  },
  { timestamps: true }
);
cohortSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.studentList;
  return obj;
};

// cohortSchema.virtual("course", {
//   ref: "Course",
//   localField: "courseId",
//   foreignField: "_id",
//   justOne: true,
// });

// cohortSchema.statics.calcNumberOfCohort = async function(studentList) {
//   studentList.forEach((student) => {
//     const count = await this.find({studentList: student}).select('name');
//     await Student.findByIdAndUpdate(student, {cohortCount: count})
//   })
// }

cohortSchema.pre("save", async function (next) {
  const cohort = await Course.findById(this.courseId);

  if (!cohort) {
    throw new Error("system can not find that course");
  }
  next();
});

// cohortSchema.post("update", async function (){
//   await this.constructor.calcNumberOfCohort(this.studentList)
// })

const Cohort = mongoose.model("Cohort", cohortSchema);
module.exports = Cohort;
