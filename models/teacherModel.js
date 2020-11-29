const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  name: String,
  surname: String,
  patronymic: String,
  scienceDegrees: [String],
  position: [String]
});

const Teacher = mongoose.model('teacher', TeacherSchema);

module.exports = Teacher;
