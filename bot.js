import { config } from "dotenv";
import mongoose from "mongoose";
import { Telegraf } from "telegraf";
import Teacher from "./src/models/teacherModel.js";
import printError from "./src/utils/log.js";
import { ERROR_MESSAGE } from "./src/utils/constants.js";
import teachersController from "./src/controllers/teachersController.js";
import departmentsController from "./src/controllers/departmentsController.js";

// Call config to use process.env
config();

const {
  getAllTeachersByDepartmentList,
  getAllTeachersGroupedByDepartment,
  getTeachersInfo,
  getTeacherById,
  getTeacherByIdWithDepartment,
} = teachersController();

const {
  getAll: getAllDepartments,
  create: createDepartment,
} = departmentsController();

const PRINT_TEACHER_INFO = "printTeacherInfo";

mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

const bot = new Telegraf(process.env.BOT_TOKEN);

const DEPARTMENT_EMOJI = "🏫";

const TEACHERS = "Преподаватели";
const DEPARTMENTS = "Кафедры";
const CONTACTS = "Контакты";
const FIELDS_OF_STUDY = "Направления подготовки";

bot.start((ctx) =>
  ctx.reply(
    "<b>Факультет экономики и управления</b> готовит востребованных современным обществом специалистов в области экономики, государственного и муниципального управления, различных отраслей менеджмента.\n\n" +
      "<b>Сфера профессиональной деятельности выпускников</b> – самая широкая, от работы в органах государственного и муниципального управления, бизнес-структур, логистических площадок до квалифицированного управления малым (в том числе собственным бизнесом).\n\n" +
      "Полученные на факультете знания позволяют квалифицированно разбираться в современном бухгалтерском учете и экономической политике, нормативно-правовой базе предпринимаельской деятельности и многих других вопросах.",
    {
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [
          [{ text: TEACHERS }, { text: DEPARTMENTS }],
          [{ text: FIELDS_OF_STUDY }, { text: CONTACTS }],
        ],
        resize_keyboard: true,
      },
    }
  )
);

const replyWithTeachersInlineKeyboard = async (ctx) => {
  const teachersGroupedByDepartment = await getAllTeachersGroupedByDepartment();

  ctx.reply("Список преподавателей", {
    reply_markup: {
      inline_keyboard: generateTeachersInlineKeyboard(
        teachersGroupedByDepartment
      ),
    },
  });
};

const replyWithDepartmentsInlineKeyboard = (ctx) => {
  ctx.reply("Список кафедр", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Кафедра 1", callback_data: "1" }],
        [{ text: "Кафедра 2", callback_data: "2" }],
        [{ text: "Кафедра 3", callback_data: "3" }],
      ],
    },
  });
};

bot.on("text", async (ctx, next) => {
  const { text } = ctx.message;

  switch (text) {
    case TEACHERS:
      await replyWithTeachersInlineKeyboard(ctx);
      break;
    case DEPARTMENTS:
      await replyWithDepartmentsInlineKeyboard(ctx);
      break;
    case CONTACTS:
      ctx.reply(
        "<b>☎️ Телефон очного отделения</b>: (4812) 700-270\n\n" +
          "<b>☎️ Телефон заочного отделения</b>: (4812) 700-271\n\n" +
          "📩 dek-upr@smolgu.ru",
        {
          parse_mode: "HTML",
        }
      );
      break;
    default:
      break;
  }
  next();
});

bot.help((ctx) => ctx.reply("Welcome message"));

bot.command("/get_deps", async (ctx) => {
  const deps = await getAllDepartments();
  console.log(deps);
});

bot.command("/teachers_list", async (ctx) => {
  try {
    ctx.reply(await getAllTeachersByDepartmentList(), { parse_mode: "html" });
  } catch (error) {
    console.error(error);
    ctx.reply(ERROR_MESSAGE);
  }
});

bot.command("/teacher", async (ctx) => {
  const { message } = ctx;
  const [command, ...[nameParam1, nameParam2, nameParam3]] = message.text.split(
    " "
  );

  const { text, imageLink } = await getTeachersInfo(
    nameParam1,
    nameParam2,
    nameParam3
  );

  if (imageLink) {
    ctx.replyWithPhoto(
      {
        url: imageLink,
      },
      {
        caption: text,
        parse_mode: "html",
      }
    );
  } else {
    ctx.reply(text, { parse_mode: "html" });
  }
});

const generateTeachersInlineKeyboard = (teachersByDepartment) => {
  const getTeacherButtons = (teachers) => {
    const rows = [];

    const getButtonDefinition = ({
      name,
      gender,
      surname,
      patronymic,
      _id: id,
    }) => ({
      text: `${gender === "m" ? "👨" : "👩"} ${surname} ${name[0]}. ${
        patronymic[0]
      }`,
      callback_data: `${PRINT_TEACHER_INFO}_${id}`,
    });

    const buttonRowsCount = Math.ceil(teachers.length / 2);
    for (let i = 0; i < buttonRowsCount; i++) {
      const leftButtonDataIndex = 2 * i;
      const rightButtonDataIndex = 2 * i + 1;

      const row = [
        getButtonDefinition(teachers[leftButtonDataIndex]),
        teachers[rightButtonDataIndex]
          ? getButtonDefinition(teachers[rightButtonDataIndex])
          : {
              text: " ",
              callback_data: "-",
            },
      ];
      rows.push(row);
    }

    return rows;
  };

  return Object.entries(teachersByDepartment).reduce(
    (res, [departmentName, teachers]) => [
      ...res,
      [
        {
          text: `${DEPARTMENT_EMOJI} ${departmentName}`,
          callback_data: "do-nothing",
        },
      ],
      ...getTeacherButtons(teachers),
    ],
    []
  );
};

bot.command(
  "/teachers",
  async (ctx) => await replyWithTeachersInlineKeyboard(ctx)
);

bot.on("callback_query", async (ctx) => {
  const callbackData = ctx.update.callback_query.data;
  if (callbackData.includes(PRINT_TEACHER_INFO)) {
    const teacherId = callbackData.split("_")[1];
    const teacher = await getTeacherByIdWithDepartment(teacherId);

    await ctx.replyWithPhoto(
      {
        url: teacher.img,
      },
      {
        caption:
          `<b>${teacher.surname} ${teacher.name} ${teacher.patronymic}</b>\n` +
          `${teacher.department.name}\n` +
          `Научная степень: ${teacher.scienceDegrees}\n` +
          `Должность: ${teacher.positions}`,
        parse_mode: "html",
      }
    );
  }
  await ctx.answerCbQuery();
});

bot.launch();
