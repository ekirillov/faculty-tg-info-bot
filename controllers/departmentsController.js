const { create: createDeparment, getAll: getAllDepartments } = require("../services/departments");

const create = (params) => createDeparment(params)

const getAll = async () => await getAllDepartments()

exports.create = create;
exports.getAll = getAll;
