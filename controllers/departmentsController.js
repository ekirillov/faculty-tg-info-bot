import Department from "../models/departmentModel.js";

const departmentsController = () => {
  const create = ({
    name,
    history,
    philosophy
  }) => {
    const department = new Department({
      name,
      history,
      philosophy
    });
    department.save()
  }

  const getAll = async () => {
    try {
      const departments = await Department.find().exec()
      return departments;
    }
    catch (err) {
      console.error("Couldn't get all departments\n ", err)
    }
  }

  return Object.freeze({
    create,
    getAll
  })
}

export default departmentsController