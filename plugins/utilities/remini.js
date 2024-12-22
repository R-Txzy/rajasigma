const moment = require('moment-timezone')
exports.run = {
   usage: ['remini'],
   hidden: ['hd'],
   use: 'reply photo',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func,
      Scraper
   }) => {
      try {
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            if (/image/.test(type)) {
               let old = new Date()
               client.sendReact(m.chat, '🕒', m.key)
               let img = await client.downloadMediaMessage(q)
               let image = await Scraper.uploadImageV2(img)
               const res = await Api.neoxr('/remini', {
                  image: image.data.url
               })
               if (!res.status) return client.reply(m.chat, Func.texted('bold', `🚩 ${res.msg}.`), m)
               client.sendFile(m.chat, res.data.url, `Remini - ${moment(new Date()).format('DD/MM/YY')}_${Date.now()}.jpg`, '', m, {
                  document: true
               })
            } else client.reply(m.chat, Func.texted('bold', `🚩 Only for photo.`), m)
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!mime) return client.reply(m.chat, Func.texted('bold', `🚩 Reply photo.`), m)
            if (!/image\/(jpe?g|png)/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Only for photo.`), m)
            let old = new Date()
            client.sendReact(m.chat, '🕒', m.key)
            let img = await q.download()
            let image = await Scraper.uploadImageV2(img)
            const res = await Api.neoxr('/remini', {
               image: image.data.url
            }) 
            if (!res.status) return client.reply(m.chat, Func.texted('bold', `🚩 ${res.msg}.`), m)
            client.sendFile(m.chat, res.data.url, `Remini - ${moment(new Date).format('DD/MM/YY')}_${Date.now()}.jpg`, '', m, {
               document: true
            })
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}