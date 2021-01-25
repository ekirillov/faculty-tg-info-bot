const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  history: String,
  philosophy: String,
  teachers: [{
    type: Schema.Types.ObjectId,
    ref: "teacher"
  }]
});

module.exports = mongoose.model('department', DepartmentSchema);
