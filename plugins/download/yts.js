const { Youtube } = require('@neoxr/youtube-scraper')
const yt = new Youtube({
   fileAsUrl: false
})
const yts = require('yt-search')
exports.run = {
   usage: ['ytsearch'],
   hidden: ['yts', 'ytfind', 'mp3', 'mp4'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      users,
      env,
      Func,
      Scraper
   }) => {
      try {
         client.yts = client.yts ? client.yts : []
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m)
         const check = client.yts.find(v => v.jid == m.sender)
         if (/mp3|mp4/.test(command) && !check && !isNaN(text)) return m.reply(Func.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))
         if (/mp3|mp4/.test(command) && check && !isNaN(text)) {
            if (Number(text) > check.results.length) return m.reply(Func.texted('bold', `🚩 Exceed amount of data.`))
            client.sendReact(m.chat, '🕒', m.key)
            if (command === 'mp4') {
               var json = await yt.fetch(check.results[Number(text) - 1], 'video', '720p')
               if (!json.status) {
                  var json = await yt.fetch(check.results[Number(text) - 1], 'video', '480p')
                  if (!json.status) {
                     if (!json.status) {
                        var json = await Api.neoxr('/youtube', {
                           url: check.results[Number(text) - 1],
                           type: 'video',
                           quality: '720p'
                        })
                        if (!json.status) {
                           var json = await Api.neoxr('/youtube', {
                              url: check.results[Number(text) - 1],
                              type: 'video',
                              quality: '480p'
                           })
                        }
                     }
                  }
               }
            } else if (command === 'mp3') {
               var json = await yt.fetch(check.results[Number(text) - 1])
               if (!json.status) {
                  var json = await Api.neoxr('/youtube', {
                     url: check.results[Number(text) - 1],
                     type: 'audio',
                     quality: '128kbps'
                  })
               }
            }
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            if (json.data.extension == 'mp3') {
               let caption = `乂  *Y T - P L A Y*\n\n`
               caption += `	◦  *Title* : ${json.title}\n`
               caption += `	◦  *Size* : ${json.data.size}\n`
               caption += `	◦  *Duration* : ${json.duration}\n`
               caption += `	◦  *Bitrate* : ${json.data.quality}\n\n`
               caption += global.footer
               const chSize = Func.sizeLimit(json.data.size, users.premium ? env.max_upload : env.max_upload_free)
               const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  thumbnail: await Func.fetchBuffer(json.thumbnail),
                  referer: 'https://tomp3.cc/'
               }).then(async () => {
                  client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                     document: true,
                     APIC: await Func.fetchBuffer(json.thumbnail),
                     referer: 'https://tomp3.cc/'
                  }, {
                     jpegThumbnail: await Func.createThumb(json.thumbnail)
                  })
               })
            } else if (json.data.extension == 'mp4') {
               let caption = `乂  *Y T - M P 4*\n\n`
               caption += `	◦  *Title* : ${json.title}\n`
               caption += `	◦  *Size* : ${json.data.size}\n`
               caption += `	◦  *Duration* : ${json.duration}\n`
               caption += `	◦  *Quality* : ${json.data.quality}\n\n`
               caption += global.footer
               const chSize = Func.sizeLimit(json.data.size, users.premium ? env.max_upload : env.max_upload_free)
               const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               let isSize = (json.data.size).replace(/MB/g, '').trim()
               if (isSize > 99) return client.sendMessageModify(m.chat, caption, m, {
                  largeThumb: true,
                  thumbnail: await Func.fetchBuffer(json.thumbnail)
               }).then(async () => {
                  await client.sendFile(m.chat, json.data.url, json.data.filename, caption, m, {
                     document: true,
                     referer: 'https://tomp3.cc/'
                  }, {
                     jpegThumbnail: await Func.createThumb(json.thumbnail)
                  })
               })
               client.sendFile(m.chat, json.data.url, json.data.filename, caption, m, {
                  referer: 'https://tomp3.cc/'
               })
            } else m.reply(Func.jsonFormat(json))
         } else {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await (await yts(text)).all
            if (!json || json.length < 1) return client.reply(m.chat, global.status.fail, m)
            if (!check) {
               client.yts.push({
                  jid: m.sender,
                  results: json.map(v => v.url),
                  created_at: new Date * 1
               })
            } else check.results = json.map(v => v.url)
            let p = `To get audio use *${isPrefix}mp3 number* and video use *${isPrefix}mp4 number*\n`
            p += `*Example* : ${isPrefix}mp4 1\n\n`
            json.map((v, i) => {
               p += `*${i+1}*. ${v.title}\n`
               p += `◦ *Duration* : ${v.timestamp}\n`
               p += `◦ *Views* : ${Func.h2k(v.views)}\n`
               p += `◦ *Link* : ${v.url}\n\n`
            }).join('\n\n')
            p += global.footer
            client.reply(m.chat, p, m)
         }
         setInterval(async () => {
            const session = client.yts.find(v => v.jid == m.sender)
            if (session && new Date - session.created_at > global.timer) {
               Func.removeItem(client.yts, session)
            }
         }, 60000)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}