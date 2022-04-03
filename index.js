require("dotenv").config();
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const fetch = require('node-fetch');
const translate = require('friendly-node-cron');
const cron = require('node-cron');
const { fullRandom, randomImage } = require('random-img-lib');
const chat_id = '-545281554'



//Привет команды
bot.hears('Привет', async ctx => {
    await ctx.reply(`Привет, ${ctx.message.from.first_name} узнать что может бот по команде /help`);
  });

  //Доброе утро
  cron.schedule(translate('at 09:00:00'), () => {
    bot.telegram.sendMessage(chat_id, 'Доброго утро и удачного дня команда!')
  })
  //Конец дня
  cron.schedule(translate('at 18:00:00'), () => {
    bot.telegram.sendMessage(chat_id, 'Закончен день! Не забудь завершить работу в Битрикс!')
  })

//ФОТО команда
bot.hears('Фото',  ctx => {
    fullRandom().then(r =>  ctx.reply(r));
    });

// //Фото дня
//  cron.schedule(translate('on 1 minutes'), () => {
//    bot.telegram.sendMessage(chat_id, ` ${fullRandom()}`)
//  })
 
 //Курс дня
 cron.schedule(translate('at 09:00:10'), () => {
 fetch('https://www.cbr-xml-daily.ru/daily_json.js')
  .then(res => res.json())
  .then(json => {
      bot.telegram.sendMessage(chat_id, '$ бакс сейчас стоит ' + json.Valute.USD.Value.toFixed(2) + ' и он ' + (json.Valute.USD.Value < json.Valute.USD.Previous ? ' падает' : ' растёт'))
})
  });

//Курс Команда
bot.hears('Курс',  ctx => {
  fetch('https://www.cbr-xml-daily.ru/daily_json.js')
.then(res => res.json())
.then(json => {
   ctx.reply(`$ бакс сейчас стоит,  ${json.Valute.USD.Value.toFixed(2)} и он ${json.Valute.USD.Value < json.Valute.USD.Previous ? ' падает' : ' растёт'}`);
});
}) 


//Погода
bot.hears('Погода',  ctx => {
fetch('https://api.weather.yandex.ru/v2/informers?lat=47.23135001&lon=39.7232800', {
  method: "GET",
  headers: {
    "X-Yandex-API-Key": process.env.Yandex_API,
    "Content-Type": "application/json; charset=utf-8",
  },
}).then(res => res.json())
  .then(json => {
     ctx.reply(`В Ростове-на-Дону температура: ${json.fact.temp}` + "\n" + `Ощущается как: ${json.fact.feels_like}`);
  });
})

//Погода по времени
   cron.schedule(translate('at 09:00:15'), () => {
    fetch('https://api.weather.yandex.ru/v2/informers?lat=47.23135001&lon=39.7232800', {
        method: "GET",
        headers: {
          "X-Yandex-API-Key": process.env.Yandex_API,
          "Content-Type": "application/json; charset=utf-8",
        },
      }).then(res => res.json())
        .then(json => {
      bot.telegram.sendMessage(chat_id, `В Ростове-на-Дону температура: ${json.fact.temp}` + "\n" + `Ощущается как: ${json.fact.feels_like}`)
    })
   })


//Хелпер
  bot.help((ctx) => ctx.reply('Список доступных крманд:  \n Напиши боту -> Курс \n Напиши боту -> Погода \n Напиши боту -> Фото \nИспользуй эти команды непосредственно в чате с ботом а не в общем чате'))

  bot.on('sticker', ctx => {
    ctx.reply('Прикольный стикер')
  })
  bot.on('edited_message', ctx => {
    ctx.reply('Вы успешно изменили сообщение')
  })
 
 bot.launch()