require('dotenv').config()
const mongoose = require('mongoose');
const Telegraf = require("telegraf");
const Teacher = require("./models/teacherModel");
const printError = require("./utils/log");

const url = "mongodb://localhost:27017/test";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Приветственное сообщение'))

bot.help((ctx) => ctx.reply('Ну я типа ответ на команду /help. Звал? Че нада?'))

bot.command("/add", (ctx) => {
  const { message } = ctx
  const [command, ...[name, surname, patronymic]] = message.text.split(" ");

  const teacher = new Teacher({
    name,
    surname,
    patronymic,
    scienceDegrees: ["кандидат педагогических наук"],
    position: ["доцент"]
  });

  teacher.save((err, newTeacher) => {
    if (err) return printError(command, err);
    ctx.reply(`Преподаватель ${name} ${surname} ${patronymic} был успешно добавлен ✅`)
  })
})

bot.command("/all", (ctx) => {
  Teacher.find((err, teachers) => {
    if (err) return printError("/all", err);

    ctx.reply(teachers.reduce((res, { name, surname, patronymic }) => {
      return res + `* ${name} ${surname} ${patronymic}\n`;
    }, ""))
    console.log(teachers);
  })
})

bot.launch()

// console.log("launched...")

// process.on("SIGINT", () => {
//   process.exit();
// });