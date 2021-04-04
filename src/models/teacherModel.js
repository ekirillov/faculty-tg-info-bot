import mongoose from 'mongoose';
import { MODEL_NAMES } from "./utils/constants.js";

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
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

export default mongoose.model(MODEL_NAMES.TEACHER, teacherSchema);
