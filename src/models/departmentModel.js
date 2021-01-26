import mongoose from 'mongoose';
import { MODEL_NAMES } from "./utils/constants.js";

const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  history: String,
  philosophy: String,
  chairman: {
    type: Schema.Types.ObjectId,
    ref: MODEL_NAMES.TEACHER
  },
  teachers: [{
    type: Schema.Types.ObjectId,
    ref: MODEL_NAMES.TEACHER
  }]
});

export default mongoose.model(MODEL_NAMES.DEPARTMENT, DepartmentSchema);