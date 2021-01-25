const Department = require("../models/departmentModel");

const getAll = async () => {
  try {
    const departments = await Department.find().exec()
    return departments;
  }
  catch (err) {
    console.error("Couldn't get all departments\n ", err)
  }
}

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

exports.create = create;
exports.getAll = getAll;
