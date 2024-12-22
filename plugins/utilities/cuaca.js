const moment = require('moment-timezone')
exports.run = {
   usage: ['cuaca'],
   use: 'kecamatan',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'solokan jeruk'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/cuaca', {
            subdistrict: text
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         let p = `Prakiraan cuaca untuk wilayah *“Kec. ${json.data.subdistrict}, ${json.data.regency}, ${json.data.province}”*\n`
         p += `📍 *Tanggal* : ${moment(Date.now()).format('dddd, DD MMM YYYY')}\n\n`
         for (const v of json.data.result.find(v => v.date === moment(Date.now()).format('DD MMM')).data) {
            p += `> Pukul ${v.time}\n`
            p += `◦ *Suhu* : ${v.temperature}\n` 
            p += `◦ *Cuaca* : ${v.weather}\n`
            p += `◦ *Angin* : ${v.wind}\n\n` 
         }
         p += global.footer
         client.reply(m.chat, p, m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}