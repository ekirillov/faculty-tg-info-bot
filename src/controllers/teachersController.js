import _ from "lodash";
import Teacher from "../models/teacherModel.js";

const groupByDepartment = (teachers) => _.groupBy(teachers, "department.name");

const teachersController = () => {
  const getAllTeachersGroupedByDepartment = async () => {
    const teachers = await Teacher.find().populate("department");
    return groupByDepartment(teachers);
  };

  const getTeacherByIdWithDepartment = async (id) =>
    await Teacher.findById(id).populate("department");

  return Object.freeze({
    getAllTeachersGroupedByDepartment,
    getTeacherByIdWithDepartment,
  });
};

export default teachersController;
