exports.run = {
   usage: ['film'],
   hidden: ['movie'],
   use: 'query',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      env,
      Func
   }) => {
      try {
         client.film = client.film ? client.film : []
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'lathi'), m)
         const check = client.film.find(v => v.jid == m.sender)
         if (!check && !isNaN(text)) return m.reply(Func.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))
         if (check && !isNaN(text)) {
            if (Number(text) > check.results.length) return m.reply(Func.texted('bold', `🚩 Exceed amount of data.`))
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/film-get', {
               url: check.results[Number(text) - 1]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            let caption = `乂  *F I L M*\n\n`
            for (let key in json.data) {
               if (!/thumbnail/.test(key)) caption += `  ◦ *${Func.ucword(key)}* : ${json.data[key]}\n`
            }
            if (json.stream) {
               caption += `\n乂  *S T R E A M*\n\n`
               caption += json.stream.map(v => `◦ *${v.server.toLowerCase()}* : ${v.url} (${v.quality})`).join('\n\n')
            }
            if (json.download) {  
               caption += `\n\n乂  *D O W N L O A D*\n\n`
               caption += json.download.map(v => `◦ *${v.provider}* : ${v.url}`).join('\n')
            }
            caption += '\n\n' + global.footer
            client.sendFile(m.chat, json.data.thumbnail, 'image.jpg', caption, m)
         } else {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/film', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            if (!check) {
               client.film.push({
                  jid: m.sender,
                  results: json.data.map(v => v.url),
                  created_at: new Date * 1
               })
            } else check.results = json.data.map(v => v.url)
            let p = `To showing film use this command *${isPrefix + command} number*\n`
            p += `*Example* : ${isPrefix + command} 1\n\n`
            json.data.map((v, i) => {
               p += `*${i+1}*. ${v.title}\n`
               p += `◦ *Director* : ${v.directors}\n`
               p += `◦ *Actors* : ${v.actors}\n\n`
            }).join('\n\n')
            p += global.footer
            client.reply(m.chat, p, m)
         }
         setInterval(async () => {
            const session = client.film.find(v => v.jid == m.sender)
            if (session && new Date - session.created_at > env.timeout) {
               Func.removeItem(client.film, session)
            }
         }, 60_000)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}