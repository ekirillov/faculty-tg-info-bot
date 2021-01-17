const { getAll, findTeachers, getById } = require("../services/teachers");
const _ = require("lodash");
const { COULD_NOT_FIND_ANYTHING } = require("../utils/constants");

const groupByDepartment = (teachers) => _.groupBy(teachers, "department")

const getDepartmentString = (departmentName) => `Кафедра ${departmentName}`

const getTeachersList = (teachres) => teachres.reduce((list, teacher) => {
  return `${list}\t> <i>${teacher.getFullName()}</i> - ${teacher.getStatus()}\n`
}, "\n")

const formListOfTeachersByDepartment = (teachersArray) => {

  const teachersGroupedByDepartment = groupByDepartment(teachersArray)

  return Object.entries(teachersGroupedByDepartment).reduce((result, [departmentName, teachers]) => {
    return `${result}<b>${getDepartmentString(departmentName)}</b>${getTeachersList(teachers)}\n`
  }, "")
}

const getAllTeachersByDepartmentList = async () => {
  const teachers = await getAll()
  return formListOfTeachersByDepartment(teachers)
}

const getAllTeachersGroupedByDeparment = async () => {
  const teachers = await getAll();
  return groupByDepartment(teachers)
}

const getTeacherById = async (id) => await getById(id)

/**
 * 
 * @param {string} nameParam1 - name/surname/patronymic
 * @param {string} nameParam2 - name/surname/patronymic
 * @param {string} nameParam3 - name/surname/patronymic
 */
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

exports.getAllTeachersByDepartmentList = getAllTeachersByDepartmentList;
exports.getAllTeachersGroupedByDeparment = getAllTeachersGroupedByDeparment;
exports.getTeachersInfo = getTeachersInfo;
exports.getTeacherById = getTeacherById;