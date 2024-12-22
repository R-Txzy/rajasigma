const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { tmpdir } = require('os')

exports.run = {
   usage: ['toimg'],
   use: 'reply sticker',
   category: 'converter',
   async: async (m, {
      client,
      Func
   }) => {
      try {
         let mime = ((m.quoted ? m.quoted : m.msg).mimetype || '')
         if (!m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Reply to sticker or video you want to convert to an image/photo (not supported for sticker animation).`), m)
         if (m.quoted.mimetype != 'image/webp') return client.reply(m.chat, Func.texted('bold', `🚩 Reply to sticker or video you want to convert to an image/photo (not supported for sticker animation).`), m)
         let media = await client.saveMediaMessage(m.quoted)
         let file = Func.filename('png')
         let isFile = path.join(tmpdir(), file)
         exec(`ffmpeg -i ${media} ${isFile}`, (err, stderr, stdout) => {
            fs.unlinkSync(media)
            if (err) return client.reply(m.chat, Func.texted('bold', `🚩 Conversion failed.`), m)
            const buffer = fs.readFileSync(isFile)
            client.sendFile(m.chat, buffer, '', '', m)
            fs.unlinkSync(isFile)
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}