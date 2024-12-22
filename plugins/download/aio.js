const { Youtube } = require('@neoxr/youtube-scraper')
const yt = new Youtube({
   fileAsUrl: false
})
const decode = require('html-entities').decode
exports.run = {
   usage: ['download'],
   hidden: ['dl', 'aio'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      env,
      Func
   }) => {
      try {
         if (!args || !args[0]) return m.reply(explain(isPrefix, command))
         await client.sendReact(m.chat, '🕒', m.key)
         const old = new Date()
         if (args[0].match(/^(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/)) {
            const json = await Api.neoxr('/fb', {
               url: Func.ttFixed(args[0])
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            let result = json.data.find(v => v.quality == 'HD' && v.response == 200)
            if (result) {
               const size = await Func.getSize(result.url)
               const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free)
               const isOver = users.premium ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(result.url)).data.url}` : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               client.sendFile(m.chat, result.url, Func.filename('mp4'), `◦ *Quality* : HD`, m)
            } else {
               let result = json.data.find(v => v.quality == 'SD' && v.response == 200)
               if (!result) return client.reply(m.chat, global.status.fail, m)
               const size = await Func.getSize(result.url)
               const chSize = Func.sizeLimit(size, users.premium ? env.max_upload : env.max_upload_free)
               const isOver = users.premium ? `💀 File size (${size}) exceeds the maximum limit, download it by yourself via this link : ${await (await Scraper.shorten(result.url)).data.url}` : `⚠️ File size (${size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
               if (chSize.oversize) return client.reply(m.chat, isOver, m)
               client.sendFile(m.chat, result.url, Func.filename('mp4'), `◦ *Quality* : SD`, m)
            }
         } else if (args[0].match('douyin.com')) {
            const json = await Api.neoxr('/douyin', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            if (json.data.video) return client.sendFile(m.chat, json.data.video, 'video.mp4', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            if (json.data.photo) {
               for (let p of json.data.photo) {
                  client.sendFile(m.chat, p, 'image.jpg', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                  await Func.delay(1500)
               }
            }
         } else if (args[0].match(/^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/)) {
            const json = await Api.neoxr('/tiktok', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            if (json.data.video) return client.sendFile(m.chat, json.data.video, 'video.mp4', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
            if (json.data.photo) {
               for (let p of json.data.photo) {
                  client.sendFile(m.chat, p, 'image.jpg', `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
                  await Func.delay(1500)
               }
            }
         } else if (args[0].match('capcut.com')) {
            const json = await Api.neoxr('/capcut', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            client.sendFile(m.chat, json.data.url, '', json.data.caption, m)
         } else if (args[0].match(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/)) {
            const json = await Api.neoxr('/ig', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            for (let v of json.data) {
               const file = await Func.getFile(v.url)
               client.sendFile(m.chat, v.url, Func.filename(/mp4|bin/.test(file.extension) ? 'mp4' : 'jpg'), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
               await Func.delay(1500)
            }
         } else if (args[0].match(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/)) {
            const json = await Api.neoxr('/ig', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
            for (let v of json.data) {
               client.sendFile(m.chat, v.url, v.type == 'mp4' ? Func.filename('mp4') : Func.filename('jpg'), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
               await Func.delay(1500)
            }
         } else if (args[0].match(/(https:\/\/www.mediafire.com\/)/)) {
            const json = await Api.neoxr('/mediafire', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            let text = `乂  *M E D I A F I R E*\n\n`
            text += '	◦  *Name* : ' + unescape(decode(json.data.filename)) + '\n'
            text += '   ◦  *Size* : ' + json.data.size + '\n'
            text += '	◦  *Extension* : ' + json.data.extension + '\n'
            text += '	◦  *Mime* : ' + json.data.mime + '\n\n'
            text += global.footer
            const chSize = Func.sizeLimit(json.data.size, users.premium ? env.max_upload : env.max_upload_free)
            const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendMessageModify(m.chat, text, m, {
               largeThumb: true,
               thumbnail: 'https://telegra.ph/file/fcf56d646aa059af84126.jpg'
            }).then(async () => {
               client.sendFile(m.chat, json.data.url, unescape(decode(json.data.filename)), '', m)
            })
         } else if (args[0].match(/pin(?:terest)?(?:\.it|\.com)/)) {
            const json = await Api.neoxr('/pin', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            if (/jpg|mp4/.test(json.data.type)) return client.sendFile(m.chat, json.data.url, '', '', m)
            if (json.data.type == 'gif') return client.sendFile(m.chat, json.data.url, '', ``, m, {
               gif: true
            })
         } else if (args[0].match('pixeldrain.com')) {
            const json = await Api.neoxr('/pixeldrain', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            const chSize = Func.sizeLimit(json.data.size, users.premium ? env.max_upload : env.max_upload_free)
            const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendFile(m.chat, json.data.url, '', '', m)
         } else if (args[0].match('videy.co')) {
            const json = await Api.neoxr('/videy', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            client.sendFile(m.chat, json.data.url, '', '', m)
         } else if (args[0].match(/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/)) {
            var json = await yt.fetch(args[0], 'video', '720p')
            if (!json.status) {
               var json = await yt.fetch(args[0], 'video', '480p')
               if (!json.status) {
                  var json = await Api.neoxr('/youtube', {
                     url: args[0],
                     type: 'video',
                     quality: '720p'
                  })
                  if (!json.status) {
                     var json = await Api.neoxr('/youtube', {
                        url: args[0],
                        type: 'video',
                        quality: '480p'
                     })
                  }
               }
            }
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
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
               })
            })
            client.sendFile(m.chat, json.data.url, json.data.filename, caption, m, {
               referer: 'https://tomp3.cc/'
            })
         } else if (args[0].match('threads.net')) {
            const json = await Api.neoxr('/threads', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            for (let v of json.data) {
               client.sendFile(m.chat, v.url, v.type == 'mp4' ? Func.filename('mp4') : Func.filename('jpg'), `🍟 *Fetching* : ${((new Date - old) * 1)} ms`, m)
               await Func.delay(1500)
            }
         } else if (args[0].match('soundcloud.com')) {
            const json = await Api.neoxr('/soundcloud', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
               document: true
            })
         } else if (args[0].match('open.spotify.com') && /track/.test(args[0])) {
            const json = await Api.neoxr('/spotify', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            let caption = `乂  *S P O T I F Y*\n\n`
            caption += `	◦  *Title* : ${json.data.title}\n`
            caption += `	◦  *Artist* : ${json.data.artist.name}\n`
            caption += `	◦  *Duration* : ${json.data.duration}\n`
            caption += `	◦  *Source* : ${args[0]}\n\n`
            caption += global.footer
            client.sendMessageModify(m.chat, caption, m, {
               largeThumb: true,
               thumbnail: await Func.fetchBuffer(json.data.thumbnail)
            }).then(async () => {
               client.sendFile(m.chat, json.data.url, json.data.title + '.mp3', '', m, {
                  document: true,
                  APIC: await Func.fetchBuffer(json.data.thumbnail)
               })
            })
         } else if (args[0].match(/(x.com|twitter.com)/)) {
            const json = await Api.neoxr('/twitter', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            for (let i = 0; i < json.data.length; i++) {
               if (/jpg|mp4/.test(json.data[i].type)) {
                  client.sendFile(m.chat, json.data[i].url, `file.${json.data[i].type}`, '', m)
                  await Func.delay(1500)
               } else if (json.data[i].type == 'gif') {
                  client.sendFile(m.chat, json.data[i].url, 'file.mp4', m, {
                     gif: true
                  })
               }
            }
         } else if (args[0].match('sfile.mobi')) {
            const json = await Api.neoxr('/sfile', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            const chSize = Func.sizeLimit(json.data.size, users.premium ? env.max_upload : env.max_upload_free)
            const isOver = users.premium ? `💀 File size (${json.data.size}) exceeds the maximum limit.` : `⚠️ File size (${json.data.size}), you can only download files with a maximum size of ${env.max_upload_free} MB and for premium users a maximum of ${env.max_upload} MB.`
            if (chSize.oversize) return client.reply(m.chat, isOver, m)
            client.sendFile(m.chat, json.data.url, unescape(decode(json.data.filename)), '', m)
         } else if (args[0].match(/(snack|sck)/)) {
            const json = await Api.neoxr('/snackvid', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            client.sendFile(m.chat, json.data.url, unescape(decode(json.data.filename)), '', m)
         } else if (args[0].match('kraken')) {
            const json = await Api.neoxr('/kraken', {
               url: args[0]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            client.sendFile(m.chat, json.data.url, unescape(decode(json.data.filename)), '', m)
         } else {
            m.reply(explain(isPrefix, command))
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}

const explain = (isPrefix, command) => {
   return `*Example* : ${isPrefix + command} https://vm.tiktok.com/ZS2gsr27r/
You can download anything with just 1 command as long as the link is supported in the list below :

   ◦  Capcut *(Video, Template)*
   ◦  Douyin *(Video, Photo Slide)*
   ◦  Facebook *(Video)*
   ◦  Instagram *(Reel, Post, Story)*
   ◦  MediaFire *(All Extensions)*
   ◦  Pinterest *(Photo, Video, GIF)*
   ◦  Soundcloud *(Track)*
   ◦  Tiktok *(Video, Photo Slide)*
   ◦  Spotify *(Track)*
   ◦  SnackVideo *(Video)*
   ◦  Sfile *(All Extensions)*
   ◦  KrakenFiles *(All Extensions)*
   ◦  Pixeldrain *(Video)*
   ◦  Videy *(Video)*
   ◦  Twitter *(Video, Photo, GIF)*
   ◦  Youtube *(Video)*
   ◦  Threads *(Video, Photo)*

${global.footer}
   `
}