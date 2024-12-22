const moment = require('moment-timezone')
exports.run = {
   usage: ['toanime', 'toanime2', 'tomanga'],
   use: 'reply photo',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func,
      Scraper
   }) => {
      try {
         const cmd = command === 'toanime' ? 'toanime' : 'aifilter'
         const style = command === 'toanime' ? {} : {
            style: command === 'toanime2' ? 'cartoon' : command === 'tomanga' ? 'epicmanga' : 'cartoon'
         }
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            if (/image/.test(type)) {
               let old = new Date()
               client.sendReact(m.chat, '🕒', m.key)
               let img = await await client.downloadMediaMessage(q)
               let image = await Scraper.uploadImageV2(img)
               const res = await Api.neoxr('/' + cmd, {
                  image: image.data.url,
                  ...style
               })
               if (!res.status) return client.reply(m.chat, Func.texted('bold', `🚩 ${res.msg}.`), m)
               client.sendFile(m.chat, res.data.url, ``, '', m)
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
            const res = await Api.neoxr('/' + cmd, {
               image: image.data.url,
               ...style
            }) 
            if (!res.status) return client.reply(m.chat, Func.texted('bold', `🚩 ${res.msg}.`), m)
            client.sendFile(m.chat, res.data.url, ``, '', m)
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