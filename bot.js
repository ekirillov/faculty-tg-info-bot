require("dotenv").config()
const mongoose = require('mongoose');
const Telegraf = require("telegraf");
const Teacher = require("./models/teacherModel");
const printError = require("./utils/log");
const { ERROR_MESSAGE } = require("./utils/constants");
const { getAllTeachersByDepartmentList, getTeachersInfo } = require("./controllers/teachersController");

const url = "mongodb://localhost:27017/test";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Приветственное сообщение'))

bot.help((ctx) => ctx.reply('Ну я типа ответ на команду /help. Звал? Че нада?'))

bot.command("/add", (ctx) => {
  const { message } = ctx
  const [command, ...[surname, name, patronymic, department]] = message.text.split(" ");

  const teacher = new Teacher({
    name,
    surname,
    patronymic,
    scienceDegrees: ["кандидат педагогических наук"],
    positions: ["доцент"],
    department: department
  });

  teacher.save((err, newTeacher) => {
    if (err) return printError(command, err);
    ctx.reply(`Преподаватель ${name} ${surname} ${patronymic} был успешно добавлен ✅`)
  })
})

bot.command("/delete", (ctx) => {
  const { message } = ctx
  const [command, ...[surname, name, patronymic]] = message.text.split(" ");

  Teacher.deleteOne({ name, surname, patronymic }, (err, teacher) => {
    if (err) return printError(command, err);
    ctx.reply(`Преподаватель ${name} ${surname} ${patronymic} был успешно удалён ✅`)
  })

})

bot.command("/teachers", async (ctx) => {
  try {
    ctx.reply(await getAllTeachersByDepartmentList(), { parse_mode: "html" })
  } catch (error) {
    console.error(error)
    ctx.reply(ERROR_MESSAGE)
  }
})

bot.command("/teacher", async (ctx) => {
  const { message } = ctx;
  const [command, ...[nameParam1, nameParam2, nameParam3]] = message.text.split(" ");

  const { text, imageLink } = await getTeachersInfo(nameParam1, nameParam2, nameParam3);

  if (imageLink) {
    ctx.replyWithPhoto(
      {
        url: imageLink
      },
      {
        caption: text,
        parse_mode: "html"
      }
    )
  } else {
    ctx.reply(text, { parse_mode: "html" })
  }
})

bot.launch()