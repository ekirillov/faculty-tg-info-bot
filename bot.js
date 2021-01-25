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
const {
  create: createDeparment,
  getAll: getAllDepartments
} = require("./controllers/departmentsController");

const PRINT_TEACHER_INFO = "printTeacherInfo"

mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection

const bot = new Telegraf(process.env.BOT_TOKEN);

const TEACHERS = "Преподаватели"
const DEPARTMENTS = "Кафедры";

bot.start((ctx) => ctx.reply('Приветственное сообщение', {
  reply_markup: {
    keyboard: [
      [{ text: TEACHERS }, { text: DEPARTMENTS }],
      [{ text: "Контакты" }]
    ],
    resize_keyboard: true
  }
}))

const replyWithTeachersInlineKeyboard = async (ctx) => {
  const teachersGroupedByDepartment = await getAllTeachersGroupedByDeparment();
  ctx.reply("Список преподавателей", {
    reply_markup: {
      inline_keyboard: generageTeachersInlineKeyboard(teachersGroupedByDepartment)
    }
  })
}

const replyWithDepartmentsInlineKeyboard = (ctx) => {
  ctx.reply("Список кафедр", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Кафедра 1", callback_data: "1" }],
        [{ text: "Кафедра 2", callback_data: "2" }],
        [{ text: "Кафедра 3", callback_data: "3" }]
      ]
    }
  })
}

bot.on("text", async (ctx, next) => {
  const { text } = ctx.message

  switch (text) {
    case TEACHERS:
      await replyWithTeachersInlineKeyboard(ctx)
      break;
    case DEPARTMENTS:
      await replyWithDepartmentsInlineKeyboard(ctx)
    default:
      break;
  }
  next()
})

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
    department: "Менеджмента",
    departmentLink: "600dcae1462570343aa739b3"
  });

  teacher.save((err, newTeacher) => {
    if (err) return printError(command, err);
    ctx.reply(`Преподаватель ${name} ${surname} ${patronymic} был успешно добавлен ✅`)
  })
})

bot.command("/get_deps", async (ctx) => {
  const deps = await getAllDepartments();
  console.log(deps)
})

bot.command("/add_dep", (ctx) => {
  createDeparment({
    name: "Кафедра тестов",
    history: "История кафедры тестов",
    philosophy: "Философия кафедры тестов"
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

bot.command("/teachers_list", async (ctx) => {
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
      [{ text: `Кафедра ${department.toLowerCase()}`, callback_data: "do-nothing" }],
      ...getTeacherButtons(teachers)
    ]
  ), [])
}

bot.command("/teachers", async ctx => await replyWithTeachersInlineKeyboard(ctx))

bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.update.callback_query.data;
  if (callbackData.includes(PRINT_TEACHER_INFO)) {
    const teacherId = callbackData.split("_")[1];
    const teacher = await getTeacherById(teacherId)
    await ctx.replyWithPhoto(
      {
        url: "https://picsum.photos/200/200/?random"
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