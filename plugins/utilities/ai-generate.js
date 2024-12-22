exports.run = {
   usage: ['ai-pixel', 'ai-anime', 'ai-real'],
   use: 'prompt',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'cat eating banana'), m)
         let old = new Date()
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/' + command, {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         client.sendFile(m.chat, json.data.url, 'image.jpg', `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}