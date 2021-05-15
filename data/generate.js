import mongoose from "mongoose";
import { config } from "dotenv";
import Teacher from "../src/models/teacherModel.js";
import Department from "../src/models/departmentModel.js";
import departments from "./departments.js";
import teachers from "./teachers.js";
config();

console.log("Opening connection...");
await mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

const dropCollections = async () => {
  const collections = (await connection.db.listCollections().toArray()).map(
    ({ name }) => name
  );

  return await Promise.all(
    collections.map(async (collectionName) => {
      await connection.db.dropCollection(collectionName);
    })
  );
};

const generateDepartments = async () => {
  return await Department.insertMany(departments);
};

const generateTeachersAndFillChairmans = async () => {
  const departments = await Department.find();

  await Teacher.insertMany(
    teachers.map((teacher) => ({
      ...teacher,
      department: departments.find(
        (department) => department.name === teacher.department
      )._id,
    }))
  );

  const chairMans = await Teacher.find({ positions: "завкафедрой" }).populate(
    "department"
  );

  await Promise.all(
    chairMans.map(async (chairMan) => {
      await Department.updateOne(
        { name: chairMan.department.name },
        { chairman: chairMan._id }
      );
    })
  );
};

console.log("Dropping all existed collections...");
await dropCollections();

console.log("Generating Departments...");
await generateDepartments();

console.log("Generating Teachers...");
await generateTeachersAndFillChairmans();

console.log("Closing connection...");
await mongoose.connection.close();

console.log("Done");
