require("dotenv").config();
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const fetch = require('node-fetch');
const translate = require('friendly-node-cron');
const cron = require('node-cron');
const { fullRandom, randomImage } = require('random-img-lib');
const chat_id = '-545281554'
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')



//Привет команды
bot.hears('Привет', async ctx => {
    await ctx.reply(`Привет, ${ctx.message.from.first_name} узнать что может бот по команде /help`);
  });

  //Доброе утро
  cron.schedule(translate('on mon tue wed thu fri sat sun at 09:00:00 every'), () => {
    bot.telegram.sendMessage(chat_id, 'Добрый день и удачного дня команда! \ud83c\udf1e')
  })
  //Конец дня
  cron.schedule(translate('on mon tue wed thu fri sat sun at 18:00:00'), () => {
    bot.telegram.sendMessage(chat_id, 'День окончен! Не забудь завершить работу в Битрикс! \ud83d\ude09')
  })

//ФОТО команда
bot.hears('Фото',  ctx => {
    fullRandom().then(r =>  ctx.reply(r));
    });

// //Фото дня
//  cron.schedule(translate('on 1 minutes'), () => {
//    bot.telegram.sendMessage(chat_id, ` ${fullRandom()}`)
//  })
 

//Курс Команда
bot.hears('Курс',  ctx => {
  fetch('https://www.cbr-xml-daily.ru/daily_json.js')
  .then(res => res.json())
  .then(json => {
    let date = json.Date.slice(0, 10);
    ctx.reply(`По данным ЦБР на ${date}: \ud83c\uddfa\ud83c\uddf8 ${json.Valute.USD.Value.toFixed(2)} ${json.Valute.USD.Value < json.Valute.USD.Previous ? '\ud83d\udd3b' : '\ud83d\udd3a'}`
    + ` \ud83c\uddea\ud83c\uddfa ${json.Valute.EUR.Value.toFixed(2)} ${json.Valute.EUR.Value < json.Valute.EUR.Previous ? '\ud83d\udd3b' : '\ud83d\udd3a'}`);
  });
  })

  cron.schedule(translate('on mon tue wed thu fri sat sun at 10:00:20'), () => {
    fetch('https://www.cbr-xml-daily.ru/daily_json.js')
    .then(res => res.json())
    .then(json => {
      let date = json.Date.slice(0, 10);
      bot.telegram.sendMessage(chat_id, `По данным ЦБР на ${date}: \ud83c\uddfa\ud83c\uddf8 ${json.Valute.USD.Value.toFixed(2)} ${json.Valute.USD.Value < json.Valute.USD.Previous ? '\ud83d\udd3b' : '\ud83d\udd3a'}`
       + ` \ud83c\uddea\ud83c\uddfa ${json.Valute.EUR.Value.toFixed(2)} ${json.Valute.EUR.Value < json.Valute.EUR.Previous ? '\ud83d\udd3b' : '\ud83d\udd3a'}`);
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
   cron.schedule(translate('on mon tue wed thu fri sat sun at 09:00:15'), () => {
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

   //Парсер новостей
cron.schedule(translate('on 59 minutes'), () => {
  const startLink = 'https://www.consultant.ru/legalnews/gz/'
  const getPostTitles = async (link) => {
    const resp = await axios.get(link)
    const $ = cheerio.load(resp.data)
    const postTitles = []
    $('div.listing-news__list').each((_idx, el) => {
      postTitles.push({
      title: $(el).find('div > a.listing-news__item-title').slice(0, 1).text(),
      link: $(el).find('div > a.listing-news__item-title').slice(0, 1).attr('href'),
      img: $(el).find('div.listing-news__item-image > img').attr('src'),
      })
    })
    return postTitles
  }
  async function testGetPostTitles() {
    const results = await getPostTitles(startLink)
    fs.readFile('object.json', (err, data) => {
      if (err) throw err
      let results1 = JSON.parse(data)
      if (results[0].link === results1[0].link) {
        console.log('Нет новых сообщений')
      } else {
        setTimeout( () => fs.writeFile( 'object.json', JSON.stringify(results, null, 4),(err) => 
        { if (err) {
                  console.error(err)
                  return
                }
              },
            ),
          1000,
        )
        bot.telegram.sendMessage(
          chat_id,
          results[0].title +
          '\n' +
          'Ссылка на новость \ud83d\udc49 https://www.consultant.ru' +
          results[0].link +
          '\n',
        )
        bot.telegram.sendPhoto(chat_id, results[0].img)
      }
    })
  }
  testGetPostTitles()
})

bot.hears('Новость',  ctx => {
  fs.readFile('object.json', (err, data) => {
   if (err) throw err
   let results = JSON.parse(data)
   ctx.reply(results[0].title + '\n' + 'Ссылка на новость \ud83d\udc49 https://www.consultant.ru' + results[0].link + '\n',)
   setTimeout( () =>
   ctx.reply(results[0].img),1000)
 
   });
 });

//Хелпер
  bot.help((ctx) => ctx.reply('Список доступных крманд:  \n Напиши боту \ud83d\udc49 Курс \n Напиши боту \ud83d\udc49 Погода \n Напиши боту \ud83d\udc49 Фото  \n Напиши боту \ud83d\udc49 Новость \nИспользуй эти команды непосредственно в чате с ботом а не в общем чате'))

  bot.on('sticker', ctx => {
    ctx.reply('Прикольный стикер')
  })
  bot.on('edited_message', async ctx => {
    await ctx.reply(`${ctx.from.first_name}, вы успешно изменили сообщение`)
  })
 
 bot.launch()
