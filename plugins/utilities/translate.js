const translate = require('translate-google-api')
exports.run = {
   usage: ['translate'],
   hidden: ['tr'],
   use: 'iso text',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'id i love you'), m)
      if (text && m.quoted && m.quoted.text) {
         let lang = text.slice(0, 2)
         try {
            let data = m.quoted.text.replace(new RegExp('\n', 'g'), '‾')
            let result = await translate(`${data}`, {
               to: lang
            })
            client.reply(m.chat, result[0].replace(new RegExp('‾', 'g'), '\n'), m)
         } catch {
            return client.reply(m.chat, Func.texted('bold', `🚩 Language code not supported.`), m)
         }
      } else if (text) {
         let lang = text.slice(0, 2)
         try {
            let data = text.substring(2).replace(new RegExp('\n', 'g'), '‾')
            let result = await translate(`${data}`, {
               to: lang
            })
            client.reply(m.chat, result[0].replace(new RegExp('‾', 'g'), '\n'), m)
         } catch {
            return client.reply(m.chat, Func.texted('bold', `🚩 Language code not supported.`), m)
         }
      }
   },
   error: false,
   cache: true,
   location: __filename
}