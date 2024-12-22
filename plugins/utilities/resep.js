exports.run = {
   usage: ['resep'],
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
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'ayam geprek'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/resep', {
            q: text
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         let caption = `乂  *R E S E P*\n\n`
         caption += `	◦  *Title* : ${json.data.title}\n`
         caption += `	◦  *Timeout* : ${json.data.timeout}\n`
         caption += `   ◦  *Portion* : ${json.data.portion}\n\n`
         caption += `乂  *I N G R E D I E N T S*\n\n`
         caption += json.data.ingredients.map(v => '  ◦  ' + v).join(`\n`)
         caption += `\n`
         caption += `乂  *S T E P S*\n\n`
         caption += json.data.steps.map(v => '  ' + v).join(`\n`)
         caption += '\n\n' + global.footer 
         client.sendFile(m.chat, json.data.thumbnail, 'image.jpg', caption, m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}