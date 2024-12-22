const fs = require('fs')
exports.run = {
   usage: ['getplugin'],
   hidden: ['gp'],
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return m.reply(Func.example(isPrefix, command, 'plugins/owner/hidetag.js'))
         const dir = args[0].startsWith('/') ? `.${args[0]}` : `./${args[0]}`
         if (!dir.endsWith('.js')) return m.reply(Func.texted('bold', `🚩 Plugin doesn't exists.`))
         if (!fs.existsSync(dir)) return m.reply(Func.texted('bold', `🚩 Plugin doesn't exists.`))
         client.sendFile(m.chat, dir, '', '', m)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}