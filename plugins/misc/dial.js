const moment = require('moment-timezone')
exports.run = {
   usage: ['dial'],
   category: 'miscs',
   async: async (m, {
      client,
      setting,
      Func
   }) => {
      try {
         const response = setting.dial.sort((a, b) => a.created_at - b.created_at)
         if (setting.dial.length < 1) return client.reply(m.chat, Func.texted('bold', `🚩 Empty data.`), m)
         let p = `To showing content send the number.\n`
         p += `*Example* : 1\n\n`
         response.map((v, i) => {
            p += `›  *${i+1}. ${v.title}*\n`
            p += `   *Created At* : ${moment(v.updated_at).format('DD/MM/YYYY')}\n`
            p += `   *Updated At* : ${moment(v.created_at).format('DD/MM/YYYY')}\n\n`
         })
         p += global.footer
         m.reply(p)
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}