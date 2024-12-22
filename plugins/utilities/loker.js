exports.run = {
   usage: ['loker'],
   hidden: ['job'],
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
         client.job = client.job ? client.job : []
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'programmer'), m)
         const check = client.job.find(v => v.jid == m.sender)
         if (!check && !isNaN(text)) return m.reply(Func.texted('bold', `🚩 Your session has expired / does not exist, do another search using the keywords you want.`))
         if (check && !isNaN(text)) {
            if (Number(text) > check.results.length) return m.reply(Func.texted('bold', `🚩 Exceed amount of data.`))
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/job', {
               url: check.results[Number(text) - 1]
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            let p = `*${json.data.company.toUpperCase()}*\n\n`
            p += `◦ *Posisi* : ${json.data.position}\n`
            p += `◦ *Lolasi* : ${json.data.location}\n`
            p += `◦ *Waktu* : ${json.data.type}\n`
            p += `◦ *Gaji* : ${json.data.salary}\n\n`
            p += `乂 Syarat & Jobdesk\n\n`
            for(const v of json.data.information) {
               if (v != '\n\n') {
                  p += `- ${v}\n` 
               } else {
                  p += v.replace(/\n\n/g, '\n')
               }
            }
            p += `\n`
            p += `> Lamar lowongan ini? _${json.data.apply_url}_`
            p += '\n\n' + global.footer
            client.reply(m.chat, p, m)
         } else {
            client.sendReact(m.chat, '🕒', m.key)
            const json = await Api.neoxr('/job', {
               q: text
            })
            if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
            if (!check) {
               client.job.push({
                  jid: m.sender,
                  results: json.data.map(v => v.url),
                  created_at: new Date * 1
               })
            } else check.results = json.data.map(v => v.url)
            let p = `To showing job detail use this command *${isPrefix + command} number*\n`
            p += `*Example* : ${isPrefix + command} 1\n\n`
            json.data.map((v, i) => {
               p += `*${i+1}*. ${v.job}\n`
               p += `◦ *Perusahaan* : ${v.company}\n`
               p += `◦ *Lokasi* : ${v.location}\n`
               p += `◦ *Gaji* : ${v.salary}\n`
               p += `◦ *Publish* : ${v.publish}\n\n`
            }).join('\n\n')
            p += global.footer
            client.reply(m.chat, p, m)
         }
         setInterval(async () => {
            const session = client.job.find(v => v.jid == m.sender)
            if (session && new Date - session.created_at > env.timeout) {
               Func.removeItem(client.job, session)
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