exports.run = {
   usage: ['bing', 'bingimg'],
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
         if (command === 'bing') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'apa itu kucing'), m)
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/bing-chat', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            client.reply(m.chat, json.data.message, m)
         } else if (command === 'bingimg') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'apa itu kucing'), m)
            client.sendReact(m.chat, '🕒', m.key)
            let old = new Date()
            const json = await Api.neoxr('/bingimg', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            client.sendFile(m.chat, json.data.url, 'image.jpg', `🍟 *Process* : ${((new Date - old) * 1)} ms`, m)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}