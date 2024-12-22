const fs = require('fs')
exports.run = {
   usage: ['backupsc'],
   category: 'owner',
   async: async (m, {
      client,
      Func
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         const DIR = './temp'
         const FILENAME = `backup_${new Date().toISOString().replace(/:/g, '-')}.zip`
         const DONT_ZIP = ['node_modules', '.git', 'session']
         const backup = await Func.compressToZip(process.cwd(), DIR + '/' + FILENAME, DONT_ZIP)
         if (!backup.status) return m.reply(Func.jsonFormat(backup))
         const buffer = fs.readFileSync(DIR + '/' + FILENAME)
         client.sendFile(m.chat, buffer, FILENAME, '', m).then(() => Func.cleanUp())
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   owner: true,
   private: true,
   location: __filename
}