exports.run = {
   usage: ['bcr', 'bc', 'bcgc', 'bcv', 'bcgcv'],
   use: 'text or reply media',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command,
      setting,
      Func
   }) => {
      try {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         let chatJid = global.db.chats.filter(v => v.jid.endsWith('.net')).map(v => v.jid)
         let groupJid = global.db.groups.map(v => v.jid)
         let receiverJid = setting.receiver.length != 0 ? setting.receiver.map(v => v + '@c.us') : []
         const id = (command == 'bc' || command == 'bcv') ? chatJid : command == 'bcr' ? receiverJid : groupJid
         if (id.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Error, ID does not exist.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         if (text) {
            for (let jid of id) {
               await Func.delay(1500)
               const member = (command == 'bcgc' || command == 'bcgcv')
                  ? global.db.groups.find(v => v.jid === jid)
                     ? Object.entries(global.db.groups.find(v => v.jid === jid).member).map(([jid,_]) => jid)
                     : []
                  : []
               await client.sendMessageModify(jid, text, null, {
                  netral: true,
                  title: global.botname,
                  thumbnail: await Func.fetchBuffer('https://telegra.ph/file/aa76cce9a61dc6f91f55a.jpg'),
                  largeThumb: true,
                  url: setting.link,
                  mentions: command == 'bcgc' ? member : []
               })
            }
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : 'groups'}`), m)
         } else if (/image\/(webp)/.test(mime)) {
            for (let jid of id) {
               await Func.delay(1500)
               const member = (command == 'bcgc' || command == 'bcgcv')
               ? global.db.groups.find(v => v.jid === jid)
                  ? Object.entries(global.db.groups.find(v => v.jid === jid).member).map(([jid,_]) => jid)
                  : []
               : []
               let media = await q.download()
               await client.sendSticker(jid, media, null, {
                  packname: '© neoxr.js',
                  author: '',
                  mentions: command == 'bcgc' ? member : []
               })
            }
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : 'groups'}`), m)
         } else if (/video|image\/(jpe?g|png)/.test(mime)) {
            for (let jid of id) {
               await Func.delay(1500)
               const member = (command == 'bcgc' || command == 'bcgcv')
               ? global.db.groups.find(v => v.jid === jid)
                  ? Object.entries(global.db.groups.find(v => v.jid === jid).member).map(([jid,_]) => jid)
                  : []
               : []
               let media = await q.download()
               await client.sendFile(jid, media, '', q.text ? '乂  *B R O A D C A S T*\n\n' + q.text : '', null, {
                  netral: true
               }, command == 'bcgc' ? {
                     contextInfo: {
                        mentionedJid: member
                     }
                  } : command == 'bcgcv' ? {
                     viewOnce: true,
                     contextInfo: {
                        mentionedJid: member
                     }
                  } : command == 'bcv' ? {
                     viewOnce: true
                  } : {})
            }
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : 'groups'}`), m)
         } else if (/audio/.test(mime)) {
            for (let jid of id) {
               await Func.delay(1500)
               const member = (command == 'bcgc' || command == 'bcgcv')
               ? global.db.groups.find(v => v.jid === jid)
                  ? Object.entries(global.db.groups.find(v => v.jid === jid).member).map(([jid,_]) => jid)
                  : []
               : []
               let media = await q.download()
               await client.sendFile(jid, media, '', '', null, {
                  netral: true
               }, command == 'bcgc' ? {
                     ptt: q.ptt,
                     contextInfo: {
                        mentionedJid: member
                     }
                  } : command == 'bcgcv' ? {
                     viewOnce: true,
                     contextInfo: {
                        mentionedJid: member
                     }
                  } : {})
            }
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : 'groups'}`), m)
         } else client.reply(m.chat, Func.texted('bold', `🚩 Media / text not found or media is not supported.`), m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true
}