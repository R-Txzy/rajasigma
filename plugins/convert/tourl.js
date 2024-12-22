const { uploadV2 } = require('@neoxr/helper')
const mimeType = require('mime-types')
exports.run = {
   usage: ['tourl'],
   use: 'reply media',
   category: 'converter',
   async: async (m, {
      client,
      isPrefix,
      command,
      Func,
      Scraper
   }) => {
      try {
         if (m.quoted ? m.quoted.message: m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0]: m.mtype
            let q = m.quoted ? m.quoted.message[type]: m.msg
            let img = await client.downloadMediaMessage(q)
            if (!/image|video/.test(type)) return client.reply(m.chat, Func.texted('bold', `🚩 Give a caption or reply to the photo with the ${isPrefix + command} command`), m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await uploadV2(img, /image/.test(type) ? 'jpg' : 'mp4')
            if (!json.status) return m.reply(Func.jsonFormat(json))
            let caption = ''
            for (let v in json.data) caption += `◦  *${Func.ucword(v)}* : ${json.data[v]}\n`
            client.reply(m.chat, caption.trim(), m)
         } else {
            let q = m.quoted ? m.quoted: m
            let mime = (q.msg || q).mimetype || ''
            if (!mime) return client.reply(m.chat, Func.texted('bold', `🚩 Give a caption or reply to media with the ${isPrefix + command} command`), m)
            let img = await q.download()
            if (!img) return client.reply(m.chat, Func.texted('bold', `🚩 Give a caption or reply to the photo with the ${isPrefix + command} command`), m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await uploadV2(img, mimeType.extension(mime))
            if (!json.status) return m.reply(Func.jsonFormat(json))
            let caption = ''
            for (let v in json.data) caption += `◦  *${Func.ucword(v)}* : ${json.data[v]}\n`
            client.reply(m.chat, caption.trim(), m)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}