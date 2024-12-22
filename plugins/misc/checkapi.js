exports.run = {
   usage: ['checkapi'],
   category: 'miscs',
   async: async (m, {
      client,
      Func
   }) => {
      try {
         const json = await Api.neoxr('/check')
         if (!json.status) return m.reply(Func.jsonFormat(json))
         let caption = `乂 A P I K E Y\n\n`
         caption += `   ◦  *Name* : ${json.data.name}\n`
         caption += `   ◦  *Limit* : (${json.data.limit} / ${json.data.total})\n`
         caption += `   ◦  *Premium* : ${json.data.premium ? '√' : '×'}\n`
         caption += `   ◦  *Expired* : ${json.data.expired_at}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            thumbnail: json.data.url
         })
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}