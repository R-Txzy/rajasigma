const fs = require('fs')
const { exec } = require('child_process')
const mime = require('mime-types')
const phone = require('awesome-phonenumber')
const moment = require('moment-timezone')
moment.tz.setDefault(global.timezone).locale('id')
const tmp = require('os').tmpdir()
const path = require('path')

exports.run = {
   usage: ['storage'],
   hidden: ['save', 'getfile', 'delfile', 'files', 'drop'],
   category: 'miscs',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      isOwner,
      ctx,
      Func,
      Scraper
   }) => {
      try {
         global.db.storage = global.db.storage ? global.db.storage : []
         const commands = ctx.commands
         if (command === 'save') {
            let q = m.quoted ? m.quoted : m
            // if (/document/.test(q.mtype)) return client.reply(m.chat, Func.texted('bold', `🚩 Cannot save file in document format.`), m)
            if (/conversation|extended/.test(q.mtype)) return client.reply(m.chat, Func.texted('bold', `🚩 Media files not found.`), m)
            const file = await Func.getFile(await q.download())
            if (!text) return client.reply(m.chat, Func.texted('bold', `🚩 Give name of the file to be saved.`), m)
            if (text.length > 30) return client.reply(m.chat, Func.texted('bold', `🚩 File name is too long, max 30 characters.`), m)
            if (commands.includes(text)) return client.reply(m.chat, Func.texted('bold', `🚩 Unable to save file with name of bot command.`), m)
            if (global.db.setting.prefix.includes(text.charAt(0)) || text.charAt(0) == global.db.setting.onlyprefix) return client.reply(m.chat, Func.texted('bold', `🚩 File name cannot start with a prefix.`), m)
            const chSize = Func.sizeLimit(file.size, process.env.TG_MAX_UPLOAD) // max: 7mb
            if (chSize.oversize) return client.reply(m.chat, Func.texted('bold', `🚩 File size cannot be more than ${process.env.TG_MAX_UPLOAD} MB.`), m)
            const check = global.db.storage.some(v => v.name == text)
            if (check) return client.reply(m.chat, Func.texted('bold', `🚩 File already exists in the database.`), m)
            client.sendReact(m.chat, '🕒', m.key)
            const extension = /audio/.test(q.mimetype) ? 'mp3' : /video/.test(q.mimetype) ? 'mp4' : mime.extension(q.mimetype)
            const filename = Func.uuid() + '.' + extension
            if (extension == 'mp3') {
               let media = await client.saveMediaMessage(m.quoted)
               exec(`ffmpeg -i ${media} ${filename}`, async (err, stderr, stdout) => {
                  fs.unlinkSync(media)
                  if (err) return client.reply(m.chat, Func.texted('bold', `❌ Failed to convert.`), m)
                  const upload = await Scraper.quax(fs.readFileSync(filename))
                  if (!upload.status) return client.reply(m.chat, Func.texted('bold', `🚩 Can't save file, check back your storage configuration.`), m)
                  global.db.storage.push({
                     name: text.toLowerCase().trim(),
                     filename: upload.data.name,
                     mime: q.mimetype,
                     ptt: /audio/.test(q.mimetype) ? q.ptt ? true : false : false,
                     bytes: parseInt(upload.data.bytes),
                     size: Func.formatSize(upload.data.size),
                     author: m.sender,
                     uploaded_at: new Date * 1,
                     url: upload.data.url
                  })
                  client.reply(m.chat, `🚩 File successfully saved with name : *${text} (${Func.formatSize(upload.data.size)})*, to get files use *${isPrefix}getfile*`, m).then(() => fs.unlinkSync(filename))
               })
            } else {
               const upload = await Scraper.quax(fs.readFileSync(file.file))
               if (!upload.status) return client.reply(m.chat, Func.texted('bold', `🚩 Can't save file, check back your storage configuration.`), m)
               global.db.storage.push({
                  name: text.toLowerCase().trim(),
                  filename: upload.data.name,
                  mime: q.mimetype,
                  ptt: /audio/.test(q.mimetype) ? q.ptt ? true : false : false,
                  bytes: parseInt(upload.data.bytes),
                  size: Func.formatSize(upload.data.size),
                  author: m.sender,
                  uploaded_at: new Date * 1,
                  url: upload.data.url
               })
               client.reply(m.chat, `🚩 File successfully saved with name : *${text} (${Func.formatSize(upload.data.size)})*, to get files use *${isPrefix}getfile*`, m).then(() => fs.unlinkSync(file.file))
            }
         } else if (command === 'getfile') {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'meow'), m)
            const files = global.db.storage.find(v => v.name == text)
            if (!files) return client.reply(m.chat, Func.texted('bold', `🚩 File named "${text}" does not exist in the database.`), m)
            if (/audio/.test(files.mime)) {
               client.sendFile(m.chat, files.url, files.filename, '', m, {
                  ptt: files.ptt
               })
            } else if (/webp/.test(files.mime)) {
               const buffer = await Func.fetchBuffer(files.url)
               client.sendSticker(m.chat, buffer, m, {
                  packname: global.db.setting.sk_pack,
                  author: global.db.setting.sk_author
               })
            } else {
               client.sendFile(m.chat, files.url, files.filename, '', m)
            }
         } else if (command === 'delfile') {
            if (!isOwner) return m.reply(global.status.owner)
            if (!text) return client.reply(m.chat, Func.texted('bold', `🚩 Give name of the file to be delele.`), m)
            const files = global.db.storage.find(v => v.name === text.toLowerCase())
            if (!files) return m.reply(Func.texted('bold', `🚩 File not found.`))
            Func.removeItem(global.db.storage, files)
            m.reply(Func.texted('bold', `🚩 File removed!`))
         } else if (command === 'files') {
            if (global.db.storage.length < 1) return client.reply(m.chat, Func.texted('bold', `🚩 No files saved.`), m)
            let text = `乂 *F I L E S*\n\n`
            text += global.db.storage.map((v, i) => {
               if (i == 0) {
                  return `┌  ◦  ${v.name} (${v.size})`
               } else if (i == global.db.storage.length - 1) {
                  return `└  ◦  ${v.name} (${v.size})`
               } else {
                  return `│  ◦  ${v.name} (${v.size})`
               }
            }).join('\n')
            m.reply(text + '\n\n' + global.footer)
         } else if (command === 'drop') {
            if (!isOwner) return m.reply(global.status.owner)
            global.db.storage = []
            m.reply(Func.texted('bold', `🚩 All files were successfully deleted!`))
         } else if (command === 'storage') {
            if (global.db.storage.length < 1) return client.reply(m.chat, Func.texted('bold', `🚩 No files saved.`), m)
            let size = 0
            global.db.storage.map(v => size += require('bytes')(v.size))
            let teks = `Use the following command to save media files to Cloud Storage :\n\n`
            teks += `➠ *${isPrefix}files* ~ See all files saved\n`
            teks += `➠ *${isPrefix}save filename* ~ Save files\n`
            teks += `➠ *${isPrefix}getfile filename* ~ Get files in the database\n`
            teks += `➠ *${isPrefix}delfile filename* ~ Delete files\n`
            teks += `➠ *${isPrefix}drop* ~ delete all files\n\n`
            teks += `💾 Total Size : [ *${Func.formatSize(size)}* ]`
            m.reply(teks)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}