exports.run = {
   async: async (m, {
      client,
      body,
      Func
   }) => {
      try {
         global.db.storage = global.db.storage ? global.db.storage: []
         const files = global.db.storage.find(v => body && v.name == body.toLowerCase())
         if (files) {
            if (/audio/.test(files.mime)) {
               client.sendFile(m.chat, files.url, files.filename, '', m, {
                  ptt: files.ptt
               })
            } else if (/webp/.test(files.mime)) {
               const buffer = await Func.fetchBuffer(files.url)
               client.sendSticker(m.chat, buffer, m, {
                  packname: global.db.setting.sk_pack,
                  author: global.db.setting.sk_author
               })
            } else {
               client.sendFile(m.chat, files.url, files.filename, '', m)
            }
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   cache: true,
   location: __filename
}