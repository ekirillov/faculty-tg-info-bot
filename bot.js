import { config } from "dotenv";
import mongoose from "mongoose";
import { Telegraf } from "telegraf";
import teachersController from "./src/controllers/teachersController.js";
import departmentsController from "./src/controllers/departmentsController.js";
config();

const {
  getAllTeachersByDepartmentList,
  getAllTeachersGroupedByDepartment,
  getTeachersInfo,
  getTeacherById,
  getTeacherByIdWithDepartment,
} = teachersController();

const { getAll: getAllDepartments, create: createDepartment } =
  departmentsController();

const PRINT_TEACHER_INFO = "printTeacherInfo";

mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

const bot = new Telegraf(process.env.BOT_TOKEN);

const DEPARTMENT_EMOJI = "🏫";

const TEACHERS = "🧑‍🏫 Преподаватели";
const DEPARTMENTS = "🏬 Кафедры";
const CONTACTS = "📇 Контакты";
const FIELDS_OF_STUDY = "ℹ️ Направления подготовки";
const DOCUMENTS = "📝 Документы";

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
          [{ text: DOCUMENTS }],
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
    case FIELDS_OF_STUDY:
      ctx.reply("Направления подготовки", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `${DEPARTMENT_EMOJI} Кафедра экономики`,
                callback_data: "1",
              },
            ],
            [
              { text: " ", callback_data: "2" },
              { text: "Бакалавриат", callback_data: "2" },
              { text: " ", callback_data: "2" },
            ],
            [
              { text: "Очное", callback_data: "3" },
              { text: "Заочное", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: " ", callback_data: "2" },
              { text: "Магистратура", callback_data: "2" },
              { text: " ", callback_data: "2" },
            ],
            [
              { text: "Очное", callback_data: "3" },
              { text: "Заочное", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              {
                text: ` `,
                callback_data: "1",
              },
            ],
            [
              {
                text: `${DEPARTMENT_EMOJI} Кафедра менеджмента`,
                callback_data: "1",
              },
            ],
            [
              { text: " ", callback_data: "2" },
              { text: "Бакалавриат", callback_data: "2" },
              { text: " ", callback_data: "2" },
            ],
            [
              { text: "Очное", callback_data: "3" },
              { text: "Заочное", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: " ", callback_data: "2" },
              { text: "Магистратура", callback_data: "2" },
              { text: " ", callback_data: "2" },
            ],
            [
              { text: "Очное", callback_data: "3" },
              { text: "Заочное", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              {
                text: ` `,
                callback_data: "1",
              },
            ],
            [
              {
                text: `${DEPARTMENT_EMOJI} Кафедра аналитических и цифровых технологий`,
                callback_data: "1",
              },
            ],
            [
              { text: " ", callback_data: "2" },
              { text: "Бакалавриат", callback_data: "2" },
              { text: " ", callback_data: "2" },
            ],
            [
              { text: "Очное", callback_data: "3" },
              { text: "Заочное", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: " ", callback_data: "2" },
              { text: "Магистратура", callback_data: "2" },
              { text: " ", callback_data: "2" },
            ],
            [
              { text: "Очное", callback_data: "3" },
              { text: "Заочное", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
            [
              { text: "Направление 1", callback_data: "3" },
              { text: "Направление 2", callback_data: "3" },
            ],
          ],
        },
      });
      break;
    default:
      break;
  }
  next();
});

bot.help((ctx) => ctx.reply("..."));

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
