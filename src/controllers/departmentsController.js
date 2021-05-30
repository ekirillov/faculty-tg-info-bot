import Department from "../models/departmentModel.js";

const departmentsController = () => {
  const getAll = async () => {
    try {
      const departments = await Department.find().exec();
      return departments;
    } catch (err) {
      console.error("Couldn't get all departments\n ", err);
    }
  };

  const getByIdWithChairman = async (id) => {
    try {
      const department = await Department.findById(id)
        .populate("chairman")
        .exec();
      return department;
    } catch (err) {
      console.error("Couldn't get department by id\n ", err);
    }
  };

  return Object.freeze({
    getAll,
    getByIdWithChairman,
  });
};

export default departmentsController;
