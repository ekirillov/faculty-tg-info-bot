import mongoose from 'mongoose';
import { MODEL_NAMES } from "./utils/constants.js";

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  surname: String,
  patronymic: String,
  scienceDegrees: [String],
  positions: [String],
  department: {
    type: Schema.Types.ObjectId,
    ref: MODEL_NAMES.DEPARTMENT
  }
});

teacherSchema.methods.getFullName = function () {
  return `${this.surname} ${this.name} ${this.patronymic}`;
};

teacherSchema.methods.getStatus = function () {
  return `${this.positions}, ${this.scienceDegrees}`;
};

teacherSchema.methods.toString = function () {
  return `${this.getFullName()} - ${this.getStatus()}`;
};

export default mongoose.model(MODEL_NAMES.TEACHER, teacherSchema);
