exports.run = {
   usage: ['telesticker'],
   hidden: ['telestik', 'telestick'],
   use: 'link',
   category: 'converter',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         let exif = global.db.setting
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://t.me/addstickers/NonromanticBear'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/telesticker', {
            url: args[0]
         })
         if (!json.status) return m.reply(Func.jsonFormat(json))
         for (let v of json.data) {
            const buffer = await Func.fetchBuffer(v.url)
            client.sendSticker(m.chat, buffer, m, {
               packname: exif.sk_pack,
               author: exif.sk_author,
            })
            await Func.delay(1500)
         }
      } catch (e) {
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   premium: true,
   cache: true,
   location: __filename
}