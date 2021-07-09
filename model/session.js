const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sessionSchema = Schema(
  {
    meetingId: { type: Number, required: true },
    startDate: { type: String, required: true },
    participants: { type: Array, required: true },
  },
  { timestamps: true }
);
sessionSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.participants;
  return obj;
};
const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
