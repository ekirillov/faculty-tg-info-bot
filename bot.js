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
  const [command, ...[surname, name, patronymic]] = message.text.split(" ");

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

bot.command("/delete", (ctx) => {
  const { message } = ctx
  const [command, ...[surname, name, patronymic]] = message.text.split(" ");

  Teacher.deleteOne({ name, surname, patronymic }, (err, teacher) => {
    if (err) return printError(command, err);
    ctx.reply(`Преподаватель ${name} ${surname} ${patronymic} был успешно удалён ✅`)
  })

})

bot.command("/all", (ctx) => {
  Teacher.find((err, teachers) => {
    if (err) return printError("/all", err);
    ctx.reply(teachers.reduce((res, { name, surname, patronymic }) => {
      return res + `* ${surname} ${name} ${patronymic}\n`;
    }, ""))
  })
})

bot.command("/teacher", (ctx) => {
  const { message } = ctx;
  const [command, ...[surname, name, patronymic]] = message.text.split(" ");

  Teacher.findOne({ name, surname, patronymic }, (err, teacher) => {
    if (err) return printError(command, err);

    if (teacher) {
      ctx.replyWithPhoto(
        {
          url: "https://picsum.photos/400/400/?random"
        },
        {
          caption: `${teacher.surname} ${teacher.name} ${teacher.patronymic}\nНаучная степень: ${teacher.scienceDegrees}\nДолжность: ${teacher.position}`
        }
      )
    } else {
      ctx.reply(`Не удалось найти преподавателя (${surname} ${name} ${patronymic})`)
    }
  })
})

bot.launch()

// console.log("launched...")

// process.on("SIGINT", () => {
//   process.exit();
// });