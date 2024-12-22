const axios = require('axios')
exports.run = {
   usage: ['fetch'],
   hidden: ['get'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      env,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, setting.cover), m)
         client.sendReact(m.chat, '🕒', m.key)
         if (args[0].match('github.com')) {
            let username = args[0].split(`/`)[3]
            let repository = args[0].split(`/`)[4]
            let zipball = 'https://api.github.com/repos/${username.trim()}/${repository.trim()}/zipball'
            client.sendFile(m.chat, zipball, `${repository}.zip`, '', m)
         } else {
            const fetch = await axios.get(args[0], {
               headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Referer": "https://www.google.com/",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
               }
            })
            const size = fetch.headers['content-length'] ? Func.formatSize(fetch.headers['content-length']) : '1 KB'
            const chSize = Func.sizeLimit(size, env.max_upload)
            if (chSize.oversize) return client.reply(m.chat, `💀 File size (${size}) exceeds the maximum limit, we can't download the file.`, m)
            if (/json/i.test(fetch.headers['content-type'])) return m.reply(Func.jsonFormat(fetch.data))
            if (/text/i.test(fetch.headers['content-type'])) return m.reply(fetch.data)
            client.sendFile(m.chat, args[0], '', '', m)
         }
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