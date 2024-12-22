exports.run = {
   usage: ['+limit', '+point', '+guard', '+limitgame'],
   use: '@tag amount',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (m.quoted) {
            if (m.quoted.isBot) return client.reply(m.chat, Func.texted('bold', `🚩 Cannot be done to bot.`), m)
            if (!args || !args[0]) return client.reply(m.chat, Func.texted('bold', `🚩 Provide the amount to be added.`), m)
            const p = await client.onWhatsApp(m.quoted.sender)
            if (p.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
            const jid = client.decodeJid(p[0].jid)
            const number = jid.replace(/@.+/, '')
            if (isNaN(args[0])) return client.reply(m.chat, Func.texted('bold', `🚩 The amount must be a number.`), m)
            const amount = parseInt(args[0])
            const type = command === '+limit' ? 'limit' : command === '+point' ? 'point' : command === '+guard' ? 'guard' : 'limit_game'
            global.db.users.find(v => v.jid === jid)[type] += amount
            let teks = `Cheat users type : “${type.toUpperCase().replace(/[_]/g, ' ')}”\n\n`
            teks += `➠ *Amout* : ${Func.formatNumber(amount)}\n`
            teks += `➠ *Total* : ${Func.formatNumber(global.db.users.find(v => v.jid === jid)[type])}\n`
            teks += `➠ *Target* : @${number}`
            client.reply(m.chat, teks, m)
         } else if (m.mentionedJid.length > 0) {
            console.log(args)
            if (!args || !args[1]) return client.reply(m.chat, Func.texted('bold', `🚩 Provide the nominal balance to be transferred.`), m)
            if (isNaN(args[1])) return client.reply(m.chat, Func.texted('bold', `🚩 The amount must be a number.`), m)
            const p = await client.onWhatsApp(m.mentionedJid[0])
            if (p.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
            const jid = client.decodeJid(p[0].jid)
            const number = jid.replace(/@.+/, '')
            // if (isNaN(args[0])) return client.reply(m.chat, Func.texted('bold', `🚩 The amount must be a number.`), m)
            const amount = parseInt(args[1])
            const type = command === '+limit' ? 'limit' : command === '+point' ? 'point' : command === '+guard' ? 'guard' : 'limit_game'
            global.db.users.find(v => v.jid === jid)[type] += amount
            let teks = `Cheat users type : “${type.toUpperCase().replace(/[_]/g, ' ')}”\n\n`
            teks += `➠ *Amout* : ${Func.formatNumber(amount)}\n`
            teks += `➠ *Total* : ${Func.formatNumber(global.db.users.find(v => v.jid === jid)[type])}\n`
            teks += `➠ *Target* : @${number}`
            client.reply(m.chat, teks, m)
         } else {
            let teks = `• *Example* :\n\n`
            teks += `${isPrefix + command} @0 50\n`
            teks += `${isPrefix + command} 50 (reply chat target)`
            client.reply(m.chat, teks, m)
         }
      } catch (e) {
         m.reply(Func.jsonFormat(e))
      }
   },
   error: false,
   owner: true
}