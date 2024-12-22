exports.run = {
   usage: ['setmsg', 'setgrmsg'],
   use: 'text',
   category: 'owner',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      Func
   }) => {
      try {
         if (!text) return client.reply(m.chat, explain(isPrefix, command), m)
         if (command === 'setmsg') {
            setting.msg = text
            client.reply(m.chat, Func.texted('bold', `🚩 Menu Message successfully set.`), m)
         } else if (command === 'setgrmsg') {
            setting._msg = text
            client.reply(m.chat, Func.texted('bold', `🚩 Greeting Message successfully set.`), m)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}

const explain = (prefix, command) => {
   return `Sorry, can't return without text, and this explanation and how to use :

*1.* +tag : for mention sender.
*2.* +name : to getting sender name.
*3.* +greeting : to display greetings by time.

• *Example* : ${prefix + command} Hi +tag +greeting, i'm an automation system`
}