exports.run = {
   usage: ['setcover'],
   hidden: ['cover'],
   use: 'reply foto',
   category: 'owner',
   async: async (m, {
      client,
      setting,
      Func,
      Scraper
   }) => {
      try {
         let q = m.quoted ? m.quoted: m
         let mime = (q.msg || q).mimetype || ''
         if (!/image/.test(mime)) return client.reply(m.chat, Func.texted('bold', `🚩 Image not found.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let buffer = await q.download()
         if (!buffer) return client.reply(m.chat, global.status.wrong, m)
         let link = await Scraper.uploadImage(buffer)
         if (!link.status) return m.reply(Func.jsonFormat(link))
         setting.cover = link.data.url
         client.reply(m.chat, Func.texted('bold', `🚩 Cover successfully set.`), m)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}