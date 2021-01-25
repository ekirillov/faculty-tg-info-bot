const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  surname: String,
  patronymic: String,
  scienceDegrees: [String],
  positions: [String],
  department: String,
  departmentLink: {
    type: Schema.Types.ObjectId,
    ref: "department"
  }
});

TeacherSchema.methods.getFullName = function () {
  return `${this.surname} ${this.name} ${this.patronymic}`;
};

TeacherSchema.methods.getStatus = function () {
  return `${this.positions}, ${this.scienceDegrees}`;
};

TeacherSchema.methods.toString = function () {
  return `${this.getFullName()} - ${this.getStatus()}`;
};

module.exports = mongoose.model('teacher', TeacherSchema);
