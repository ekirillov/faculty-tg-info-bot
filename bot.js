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

const {
  getAll: getAllDepartments,
  getByIdWithChairman: getDepartmentByIdWithChairMan,
  create: createDepartment,
} = departmentsController();

const PRINT_TEACHER_INFO = "printTeacherInfo";
const PRINT_DEPARTMENT_INFO = "printDepartmentInfo";

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
const DOCUMENTS = "📝 Квитанции и документы";
const ABOUT_US = "ℹ️ О нас";

const getGenderEmoji = (gender) => (gender === "m" ? "👨" : "👩");

bot.start((ctx) =>
  ctx.reply(
    "<b>Факультет экономики и управления</b> готовит востребованных современным обществом специалистов в области экономики, государственного и муниципального управления, различных отраслей менеджмента.\n\n" +
      "<b>Сфера профессиональной деятельности выпускников</b> – самая широкая, от работы в органах государственного и муниципального управления, бизнес-структур, логистических площадок до квалифицированного управления малым (в том числе собственным бизнесом).\n\n" +
      "Полученные на факультете знания позволяют квалифицированно разбираться в современном бухгалтерском учете и экономической политике, нормативно-правовой базе предпринимаельской деятельности и многих других вопросах.",
    {
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [
          [{ text: ABOUT_US }],
          [{ text: TEACHERS }, { text: DEPARTMENTS }],
          [{ text: DOCUMENTS }, { text: CONTACTS }],
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

const replyWithDepartmentsInlineKeyboard = async (ctx) => {
  const departments = await getAllDepartments();
  ctx.reply("Список кафедр", {
    reply_markup: {
      inline_keyboard: departments.map(({ _id: id, name }) => [
        {
          text: `${DEPARTMENT_EMOJI} ${name}`,
          callback_data: `${PRINT_DEPARTMENT_INFO}_${id}`,
        },
      ]),
    },
  });
};

const replyContacts = (ctx) => {
  ctx.reply(
    [
      "👩‍🏫 <b>Анопченко Татьяна Юрьевна</b> — Декан",
      "👩‍🏫 <b>Никитенкова Ольга Викторовна</b> — Заместитель декана по учебной и учебно-методической работе",
      "👩‍🏫 <b>Пушкарёва Людмила Викторовна</b> — Заместитель декана по внеучебной работе и международной деятельности",
      "👩‍🏫 <b>Гнездова Юлия Владимировна</b> — Заместитель декана по научной работе",
      "👩‍🏫 <b>Киреева Ольга Вячеславовна</b> — Статистик\n",
      "☎️ <b>Телефон очного отделения</b>: (4812) 700-270",
      "☎️ <b>Телефон заочного отделения</b>: (4812) 700-271",
      "📩 dek-upr@smolgu.ru\n",
      "🔗 <a href='https://vk.com/smolgu_feu'>Группа ФЭУ СмолГУ VK</a>",
      "🔗 <a href='https://vk.com/samiyluchshiyfakultet'>Группа профбюро ФЭУ СмолГУ VK</a>",
      "🔗 <a href='https://www.instagram.com/fey_smolgu/'>Аккаунт профбюро ФЭУ СмолГУ в Instagram</a>",
      "🔗 <a href='https://vk.com/smol_gu'>Официальная группа СмолГУ VK</a>",
      "🔗 <a href='https://www.instagram.com/smolgu_inst/'>Аккаунт СмолГУ в Instagram</a>",
      "🔗 <a href='https://www.youtube.com/channel/UCzruV6pBPT0RrhWIx2pBAtg'>Youtube-канал СмолГУ</a>",
    ].join("\n"),
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }
  );
};

const replyDocuments = (ctx) => {
  ctx.reply(
    [
      `<b>Образцы и шаблоны</b>`,
      `⦿ <a href="http://www.smolgu.ru/files/doc/student/kvit_ob.pdf">Образец квитанции оплаты за общежитие</a>`,
      `⦿ <a href="http://www.smolgu.ru/files/doc/student/dogovor_naima.pdf">Образец договора найма жилого помещения в общежитии</a>`,
      `⦿ <a href="http://www.smolgu.ru/%D0%91%D0%B0%D0%BD%D0%BA%D0%BE%D0%B2%D1%81%D0%BA%D0%B8%D0%B5%20%D1%80%D0%B5%D0%BA%D0%B2%D0%B8%D0%B7%D0%B8%D1%82%D1%8B%20%D0%B4%D0%BB%D1%8F%20%D0%BE%D0%BF%D0%BB%D0%B0%D1%82%D1%8B%20%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F%20%D1%81%201.01.2021.pdf">Реквизиты на перечисление средств за образовательные услуги </a>`,
      `⦿ <a href="http://www.smolgu.ru/files/doc/normativ/kvitantsiya-na-oplatu_422.pdf">Образец квитанции на оказание платных услуг</a>`,
      `\n<b>Общежитие</b>`,
      `⦿ <a href="http://www.smolgu.ru/upload/iblock/b3a/b3ab906818a15ba8cdd2d23029ecd239.pdf">Стоимость проживания в студенческих общежитиях</a>`,
      `\n<b>Обучение</b>`,
      `⦿ <a href="http://www.smolgu.ru/upload/iblock/542/5426981778006d626edcf6f2e0ce882e.pdf">Стоимость обучения в СмолГУ по договорам на оказание платных образовательных услуг в 2020-2021 учебном году (1 курс)</a>`,
      `⦿ <a href="http://www.smolgu.ru/upload/iblock/848/848014702d3a84f9d3515e5887a86471.pdf">Стоимость обучения в СмолГУ по договорам на оказание платных образовательных услуг в 2020-2021 учебном году (2-5 курсы)</a>`,
      `⦿ <a href="http://www.smolgu.ru/%EF%BF%BD%D0%B0%D0%BA%D0%B0%D0%BD%D1%82%D0%BD%D1%8B%D0%B5%20%D0%BC%D0%B5%D1%81%D1%82%D0%B0-%20%D0%BD%D0%BE%D0%B2%D0%B0%D1%8F%20%D1%84%D0%BE%D1%80%D0%BC%D0%B0-%D0%BE%D1%87%D0%BD%D0%BE%D0%B5.doc">Вакантные места очной формы обучения</a>`,
      `⦿ <a href="http://www.smolgu.ru/%EF%BF%BD%D0%B0%D0%BA%D0%B0%D0%BD%D1%82%D0%BD%D1%8B%D0%B5%20%D0%BC%D0%B5%D1%81%D1%82%D0%B0-%20%D0%BD%D0%BE%D0%B2%D0%B0%D1%8F%20%D1%84%D0%BE%D1%80%D0%BC%D0%B0-%D0%B7%D0%B0%D0%BE%D1%87%D0%BD%D0%BE%D0%B5.doc">Вакантные места заочной формы обучения</a>`,
      `\n⦿ <a href="http://www.smolgu.ru/sveden/document/">Все документы</a>`,
    ].join("\n"),
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }
  );
};

const replyAboutUs = (ctx) => {
  const imageUrls = [
    "http://www.smolgu.ru/upload/medialibrary/be3/be33d47809aae73b68235d0b92d5ed79.jpg",
    "http://www.smolgu.ru/upload/uf/c1b/c1bb16e105e0ce5b87cb0aed333be532.jpg",
    "http://www.smolgu.ru/upload/medialibrary/be2/be22087fa1e2fc681497aa595bf9cc00.jpg",
    "http://www.smolgu.ru/upload/uf/bcc/bcc22f9fbe93052d2ccae501688528e9.jpg",
    "http://www.smolgu.ru/upload/uf/01d/01d51d39ecff6aae546e88b7f62a4f68.jpg",
    "http://www.smolgu.ru/upload/uf/eec/eecd164b67ea68a9f138d2348ae7a0ac.jpg",
    "http://www.smolgu.ru/upload/uf/5a4/5a4252dceec7854f75026ac6dce3152c.jpg",
  ];
  const caption =
    "⦿ <b><a href='http://www.smolgu.ru/faculties/ekonomiki-i-upravleniya/'>Факультет экономики и управления</a></b> создан в 2000 году. Образ факультета экономики и управления состоит в позиционировании учебного подразделения как ключевого и авторитетного субъекта образовательной и научно-экспертной деятельности, охватывающего приоритетные направления подготовки квалифицированных экономических и управленческих кадров, способного существенно влиять на социально-экономическое развитие региона.\n\n" +
    "⦿ Факультет нацелен на 3-х уровневую систему образования (бакалавриат, магистратура, аспирантура) через качественные изменения в учебном процессе, заключающиеся в переносе фокуса обучения на самостоятельную работу и активном использовании информационных технологий и инноваций.\n\n" +
    "⦿ Вследствие этого миссия факультета экономики и управления состоит в формировании современной школы мирового уровня для подготовки национальной элиты экономических и управленческих кадров, способной решать задачи повышения конкурентоспособности России в экономике знаний XXI века.";
  ctx.replyWithMediaGroup(
    imageUrls.map((url, index) => ({
      type: "photo",
      media: {
        url,
      },
      caption: index === 0 ? caption : undefined,
      parse_mode: "HTML",
    }))
  );
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
      replyContacts(ctx);
      break;
    case DOCUMENTS: {
      replyDocuments(ctx);
      break;
    }
    case ABOUT_US: {
      replyAboutUs(ctx);
      break;
    }
    default:
      break;
  }
  next();
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
      text: `${getGenderEmoji(gender)} ${surname} ${name[0]}. ${patronymic[0]}`,
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
  if (callbackData.includes(PRINT_DEPARTMENT_INFO)) {
    const departmentId = callbackData.split("_")[1];
    const {
      name,
      history,
      philosophy,
      chairman: {
        name: chairmanName,
        surname: chairmanSurname,
        patronymic: chairmanPatronymic,
        positions: chairmanPositions,
        scienceDegrees: chairmanScienceDegrees,
        gender: chairmanGender,
      },
    } = await getDepartmentByIdWithChairMan(departmentId);

    const getChairmanDescription = () => {
      const genderEmoji = getGenderEmoji(chairmanGender);
      const chairmanNameFullName = `${chairmanName} ${chairmanSurname} ${chairmanPatronymic}`;
      const chairmanPositionsString = chairmanPositions.join(", ");
      const chairmanScienceDegreesString = chairmanScienceDegrees.join(", ");

      return `<b>${genderEmoji} ${chairmanNameFullName}</b> - ${chairmanPositionsString}; ${chairmanScienceDegreesString}`;
    };

    const getHistory = () => [`⦿ История кафедры`, `dsadas`].join("\n");
    const getPhilosophy = () =>
      [`⦿ Философия кафедры`, `${philosophy}`].join("\n");

    ctx.reply(
      [
        `<b>${name}</b>\n`,
        `⦿ Заведующий`,
        `${getChairmanDescription()}\n`,
        history && getHistory(),
        philosophy && getPhilosophy(),
      ]
        .filter(Boolean)
        .join("\n"),
      {
        parse_mode: "HTML",
      }
    );
  }
  await ctx.answerCbQuery();
});

bot.launch();
