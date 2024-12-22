exports.run = {
   usage: ['response'],
   hidden: ['res'],
   use: 'link',
   category: 'miscs',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://api.neoxr.my.id'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Func.fetchJson('https://www.neoxr.my.id/v2/response?url=' + args[0])
         client.reply(m.chat, Func.jsonFormat(json), m)
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}