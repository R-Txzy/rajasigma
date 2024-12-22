exports.run = {
   usage: ['genimg'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'black cat'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/genimg', {
            prompt: text,
            model: 52,
            sampler: 4
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         client.sendFile(m.chat, json.data.url, 'image.png', '', m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}