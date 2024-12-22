const fs = require('fs')
exports.run = {
   usage: ['listbot', 'botinfo', 'logout'],
   category: 'bot hosting',
   async: async (m, {
      client,
      command,
      env,
      Func
   }) => {
      try {
         if (command === 'listbot') {
            global.db.bots = global.db.bots ? global.db.bots : []
            if (!global.db.bots.length) return client.reply(m.chat, Func.texted('bold', `🚩 No bots connected.`), m)
            let p = `乂  *L I S T B O T*\n\n`
            global.db.bots.map((v, i) => {
               p += `*${i + 1}. ${sensorNumber(client.decodeJid(v.jid).replace(/@.+/, ''))}*\n`
               p += `◦ *Name* : ${global.db.users.find(x => x.jid === v.jid) ? global.db.users.find(x => x.jid === v.jid).name : 'No Name'}\n`
               p += `◦ *Last Connect* : ${timeAgo(v.last_connect)}\n`
               p += `◦ *Connected* : ${v.is_connected ? '✅' : '❌'}\n\n`
            }).join('\n\n')
            p += global.footer
            client.reply(m.chat, p, m)
         } else if (command === 'botinfo') {
            if (!global.db.bots.length) return client.reply(m.chat, Func.texted('bold', `🚩 No bots connected.`), m)
            const fn = global.db.bots.find(v => v.jid === client.decodeJid(client.user.id))
            if (!fn) return client.reply(m.chat, Func.texted('bold', `🚩 No information for this bot.`), m)
            let p = `乂  *B O T I N F O*\n\n`
            p += `   ◦ *JID* : @${fn.jid.replace(/@.+/, '')}\n`
            p += `   ◦ *Name* : ${global.db.users.find(x => x.jid === fn.jid) ? global.db.users.find(x => x.jid === fn.jid).name : 'No Name'}\n`
            p += `   ◦ *Last Connect* : ${timeAgo(fn.last_connect)}\n\n`
            p += global.footer
            client.reply(m.chat, p, m)
         } else if (command === 'logout') {
            if (!global.db.bots.length) return client.reply(m.chat, Func.texted('bold', `🚩 No bots connected.`), m)
            const fn = global.db.bots.find(v => v.sender === m.sender && v.jid === client.decodeJid(client.user.id))
            if (!fn) {
               const check = global.db.bots.find(v => v.jid === client.decodeJid(client.user.id)) ? global.db.bots.find(v => v.jid === client.decodeJid(client.user.id)) : false
               const msg = check ? `🚩 This command only for @${check.sender.replace(/@.+/, '')}` : `🚩 You can't access this feature.`
               client.reply(m.chat, Func.texted('bold', msg), m)
               return
            }
            Func.removeItem(global.db.bots, fn)
            client.reply(m.chat, Func.texted('bold', `✅ Bot disconnected (Logout).`), m).then(() => {
               client.logout('Logout')
               if (fs.existsSync(`./${env.bot_hosting.session_dir}/${fn.jid.replace(/@.+/, '')}`)) fs.rmSync(`./${env.bot_hosting.session_dir}/${fn.jid.replace(/@.+/, '')}`, {
                  recursive: true,
                  force: true
               })
            })
         }
      } catch (e) {
         client.reply(m.chat, Func.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}

const sensorNumber = phoneNumber => {
   const strNumber = phoneNumber.toString()
   if (strNumber.length <= 6) {
      return phoneNumber
   }
   const firstPart = strNumber.slice(0, 3)
   const lastPart = strNumber.slice(-3)
   const stars = '×'.repeat(strNumber.length - 6)
   return `${firstPart}${stars}${lastPart}`
}

const timeAgo = timestamp => {
   const now = Date.now()
   const seconds = Math.floor((now - timestamp) / 1000)

   let interval = Math.floor(seconds / 31536000)
   if (interval >= 1) {
      return interval === 1 ? `${interval} year ago` : `${interval} years ago`
   }

   interval = Math.floor(seconds / 2592000)
   if (interval >= 1) {
      return interval === 1 ? `${interval} month ago` : `${interval} months ago`
   }

   interval = Math.floor(seconds / 86400)
   if (interval >= 1) {
      return interval === 1 ? `${interval} day ago` : `${interval} days ago`
   }

   interval = Math.floor(seconds / 3600)
   if (interval >= 1) {
      return interval === 1 ? `${interval} hour ago` : `${interval} hours ago`
   }

   interval = Math.floor(seconds / 60); // Detik dalam 1 menit
   if (interval >= 1) {
      return interval === 1 ? `${interval} minute ago` : `${interval} minutes ago`
   }

   return seconds < 30 ? 'Just now' : `${seconds} seconds ago`
}