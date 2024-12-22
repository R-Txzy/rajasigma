exports.run = {
   async: async (m, {
      client,
      body,
      prefixes,
      env,
      Func
   }) => {
      try {
         var id = m.chat
         var reward = Func.randomInt(env.min_reward, env.max_reward)
         client.pg = client.pg ? client.pg : {}
         if (Object.values(client.pg).length > 0) {
            const jid = m.update ? m.update.pollUpdates[0].pollUpdateMessageKey.participant : null
            if (!jid) return
            let users = global.db.users.find(v => v.jid === jid)
            let json = JSON.parse(JSON.stringify(client.pg[id][1]))
            if (['Timeout', ''].includes(body)) return !0
            if (body.split `.` [0].trim() == json.answer.toUpperCase()) {
               client.sendMessage(m.chat, {
                  delete: {
                     remoteJid: m.chat,
                     fromMe: true,
                     id: client.pg[id][0].id,
                     participant: client.decodeJid(client.user.id)
                  }
               })
               let tm = `Soal *"${json.question}"* dijawab benar oleh @${client.decodeJid(jid).replace(/@.+/, '')} (+ ${Func.formatNumber(reward)} Point)\n\n`
               tm += '✅ ' + client.pg[id][2].find(v => v.startsWith(json.answer)) + '\n\n'
               tm += `*Penjelasan* : ${json.explanation}`
               client.reply(m.chat, tm)
               users.point += reward
               if (client.pg[id]) clearTimeout(client.pg[id][3])
               delete client.pg[id]
            } else {
               if (users.point === 0) {
                  let tm = `❌ Dari soal *"${json.question}"* @${client.decodeJid(jid).replace(/@.+/, '')} menjawab *${body}* jawaban yang benar adalah :\n\n`
                  tm += client.pg[id][2].find(v => v.startsWith(json.answer)) + '\n\n'
                  tm += `*Penjelasan* : ${json.explanation}`
                  client.reply(m.chat, tm).then(() => {
                     client.sendMessage(m.chat, {
                        delete: {
                           remoteJid: m.chat,
                           fromMe: true,
                           id: client.pg[id][0].id,
                           participant: client.decodeJid(client.user.id)
                        }
                     })
                     if (client.pg[id]) clearTimeout(client.pg[id][3])
                     delete client.pg[id]
                  })
               } else {
                  users.point < reward ? users.point = 0 : users.point -= reward
                  let tm = `❌ Dari soal *"${json.question}"* @${client.decodeJid(jid).replace(/@.+/, '')} (- ${Func.formatNumber(reward)}) menjawab *${body}* jawaban yang benar adalah :\n\n`
                  tm += client.pg[id][2].find(v => v.startsWith(json.answer)) + '\n\n'
                  tm += `*Penjelasan* : ${json.explanation}`
                  client.reply(m.chat, tm)
                  client.sendMessage(m.chat, {
                     delete: {
                        remoteJid: m.chat,
                        fromMe: true,
                        id: client.pg[id][0].id,
                        participant: client.decodeJid(client.user.id)
                     }
                  })
                  await Func.delay(1500)
                  if (client.pg[id]) clearTimeout(client.pg[id][3])
                  delete client.pg[id]
               }
            }
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   game: true,
   cache: true,
   location: __filename
}