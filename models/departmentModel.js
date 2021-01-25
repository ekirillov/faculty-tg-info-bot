import mongoose from "mongoose";

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

export default mongoose.model('department', DepartmentSchema);