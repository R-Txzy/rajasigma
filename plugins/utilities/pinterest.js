const ffmpeg = require('fluent-ffmpeg')
const tmp = require('os').tmpdir()
exports.run = {
   usage: ['pinimg', 'pinvid'],
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
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, `panda`), m)
         client.sendReact(m.chat, '🕒', m.key)
         let old = new Date()
         const shuffleArray = array => {
            const shuffledArray = [...array]
            for (let i = shuffledArray.length - 1; i > 0; i--) {
               const randomIndex = Math.floor(Math.random() * (i + 1))
               const temp = shuffledArray[i]
               shuffledArray[i] = shuffledArray[randomIndex]
               shuffledArray[randomIndex] = temp
            }
            return shuffledArray
         }
         const json = await Api.neoxr('/pinterest-v2', {
            q: text,
            show: 20,
            type: command === 'pinimg' ? 'image' : 'video'
         })
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         const result = shuffleArray(json.data).splice(0, 3)
         if (command === 'pinimg') {
            for (const v of result) {
               if (/m3u8|gif/.test(v.content[0].url)) continue
               let caption = `乂  *P I N T E R E S T*\n\n`
               caption += `   ◦ *Title* : ${v.title}\n`
               caption += `   ◦ *Description* : ${v.description}\n`
               caption += `   ◦ *Author* : ${v.author.full_name}\n`
               caption += `   ◦ *Source* : ${v.source}\n\n`
               caption += global.footer
               client.sendFile(m.chat, v.content[0].url, '', caption, m)
               await Func.delay(2000)
            }
         } else if (command === 'pinvid') {
            for (const v of result) {
               if (/jpg|gif/.test(v.content[0].url)) continue
               let caption = `乂  *P I N T E R E S T*\n\n`
               caption += `   ◦ *Title* : ${v.title}\n`
               caption += `   ◦ *Description* : ${v.description}\n`
               caption += `   ◦ *Author* : ${v.author.full_name}\n`
               caption += `   ◦ *Source* : ${v.source}\n\n`
               caption += global.footer
               if (/m3u8/.test(v.content[0].url)) {
                  const output = './temp/' + Func.filename('mp4')
                  ffmpeg(v.content[0].url)
                     .on("error", error => {
                        m.reply(Func.texted('bold', `🚩 Conversion failed!`))
                     })
                     .on("end", async () => {
                        // const gf = await Func.getFile(output)
                        client.sendFile(m.chat, output, '', caption, m)
                     })
                     .outputOptions("-c copy")
                     .outputOptions("-bsf:a aac_adtstoasc")
                     .output(output)
                     .run()
               } else {
                  client.sendFile(m.chat, v.content[0].url, '', caption, m)
               }
               await Func.delay(2000)
            }
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}