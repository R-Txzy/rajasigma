exports.run = {
usage: ['fakta', 'galau', 'fml', 'truth', 'dare', 'bucin', 'dilan', 'pantun', 'puisi', 'sad-anime', 'senja', 'sindiran'],
   category: 'random',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr(`/${command.toLowerCase()}`)
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         m.reply(json.data.text)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}