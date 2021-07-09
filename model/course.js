const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const courseSchema = Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

courseSchema.methods.toJSON = function () {
  const obj = this._doc;
  return obj;
};

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
