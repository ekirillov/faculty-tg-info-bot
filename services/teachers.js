const Teacher = require("../models/teacherModel");

const getAll = async () => {
  try {
    const teachers = await Teacher.find().exec()
    return teachers;
  }
  catch (err) {
    console.error("Couldn't get all teacher\n ", err)
  }
}

const findTeachers = async (nameParam1, nameParam2, nameParam3) => {
  const getConditionArray = (params) => {
    return params.reduce((res, value) => {
      return !!value ? [
        ...res,
        { name: value },
        { surname: value },
        { patronymic: value }
      ] : res
    }, [])
  }

  try {
    const teachers = await Teacher.find({
      $or: getConditionArray([nameParam1, nameParam2, nameParam3])
    }).exec();
    return teachers;
  } catch (err) {
    console.error("Couldn't find teachers\n ", err)
  }
}

const getById = async (id) => {
  try {
    const teacher = await Teacher.findById(id).exec()
    return teacher;
  }
  catch (err) {
    console.error(`Couldn't find a teacher with "${id}" id\n `, err)
  }
}


exports.getAll = getAll;
exports.findTeachers = findTeachers;
exports.getById = getById;
