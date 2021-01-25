import _ from "lodash";
import { COULD_NOT_FIND_ANYTHING } from "../utils/constants.js";
import Teacher from "../models/teacherModel.js";

const groupByDepartment = (teachers) => _.groupBy(teachers, "department")

const getDepartmentString = (departmentName) => `Кафедра ${departmentName}`

const getTeachersList = (teachres) => teachres.reduce((list, teacher) => {
  return `${list}\t> <i>${teacher.getFullName()}</i> - ${teacher.getStatus()}\n`
}, "\n")

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

const formListOfTeachersByDepartment = (teachersArray) => {

  const teachersGroupedByDepartment = groupByDepartment(teachersArray)

  return Object.entries(teachersGroupedByDepartment).reduce((result, [departmentName, teachers]) => {
    return `${result}<b>${getDepartmentString(departmentName)}</b>${getTeachersList(teachers)}\n`
  }, "")
}

const teachersController = () => {

  const getAllTeachersByDepartmentList = async () => {
    const teachers = await getAll()
    return formListOfTeachersByDepartment(teachers)
  }

  const getAllTeachersGroupedByDeparment = async () => {
    const teachers = await getAll();
    return groupByDepartment(teachers)
  }

  const getTeachersInfo = async (nameParam1, nameParam2, nameParam3) => {
    const teachers = await findTeachers(nameParam1, nameParam2, nameParam3);
    if (_.isEmpty(teachers)) {
      return {
        text: COULD_NOT_FIND_ANYTHING
      }
    }
    if (teachers.length > 1) {
      return {
        text: `Было найдено несколько преподавателей. Пожалуйста, уточните запрос.\n\n${formListOfTeachersByDepartment(teachers)}`
      }
    }
    const teacher = teachers[0];
    return {
      text: `<b>${teacher.getFullName()}</b>\nНаучная степень: ${teacher.scienceDegrees}\nДолжность: ${teacher.positions}`,
      imageLink: "https://picsum.photos/400/400/?random"
    }
  }

  const getTeacherById = async (id) => await getById(id)

  return Object.freeze({
    getAllTeachersByDepartmentList,
    getAllTeachersGroupedByDeparment,
    getTeachersInfo,
    getTeacherById
  })
}

export default teachersController