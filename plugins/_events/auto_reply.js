exports.run = {
   async: async (m, {
      client,
      body,
      isOwner,
      groupSet,
      setting,
      Func
   }) => {
      try {
         if (groupSet.autoreply) {
            m.reply('Hello')
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   cache: true,
   location: __filename
}