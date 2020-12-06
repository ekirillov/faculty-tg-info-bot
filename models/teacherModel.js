const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  name: String,
  surname: String,
  patronymic: String,
  scienceDegrees: [String],
  positions: [String],
  department: String
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

const Teacher = mongoose.model('teacher', TeacherSchema);

module.exports = Teacher;
