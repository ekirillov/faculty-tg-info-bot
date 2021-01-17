require("dotenv").config()
const mongoose = require('mongoose');
const { Telegraf, Markup } = require("telegraf");
const Teacher = require("./models/teacherModel");
const printError = require("./utils/log");
const { ERROR_MESSAGE } = require("./utils/constants");
const {
  getAllTeachersByDepartmentList,
  getTeachersInfo,
  getAllTeachersGroupedByDeparment,
  getTeacherById
} = require("./controllers/teachersController");

const PRINT_TEACHER_INFO = "printTeacherInfo"

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
    ctx.reply()
  }
})

const generageTeachersInlineKeyboard = (teachersByDeparment) => {

  const getTeacherButtons = (teachers) => {
    return [
      // TODO: form response
      // === | ===
      // === | ===
      // === | 000
      teachers.map(({ name, surname, _id }) => ({ text: `${name} ${surname}`, callback_data: `${PRINT_TEACHER_INFO}_${_id}` }))
      // [
      //   { text: "test", callback_data: "pepega" },
      //   { text: "test", callback_data: "pepega" }
      // ],
      // [
      //   { text: "test", callback_data: "pepega" },
      //   { text: "test", callback_data: "pepega" }
      // ]
    ]
  }

  return Object.entries(teachersByDeparment).reduce((res, [department, teachers]) => (
    [
      ...res,
      [{ text: `Кафедра ${department.toLowerCase()}`, callback_data: "pepega" }],
      ...getTeacherButtons(teachers)
    ]
  ), [])
}

bot.command("/getall", async ctx => {
  const teachersGroupedByDepartment = await getAllTeachersGroupedByDeparment();
  ctx.reply("Список преподавателей", {
    reply_markup: {
      inline_keyboard: generageTeachersInlineKeyboard(teachersGroupedByDepartment)
    }
  })
})

bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.update.callback_query.data;
  if (callbackData.includes(PRINT_TEACHER_INFO)) {
    const teacherId = callbackData.split("_")[1];
    const teacher = await getTeacherById(teacherId)
    await ctx.replyWithPhoto(
      {
        url: "https://picsum.photos/400/400/?random"
      },
      {
        caption:
          `<b>${teacher.getFullName()}</b>\n` +
          `Кафедра: ${teacher.department}\n` +
          `Научная степень: ${teacher.scienceDegrees}\n` +
          `Должность: ${teacher.positions}`,
        parse_mode: "html"
      }
    )
  }
  await ctx.answerCbQuery()
});


bot.launch()