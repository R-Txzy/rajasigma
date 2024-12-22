const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
exports.run = {
   usage: ['common'],
   use: 'mention or reply',
   category: 'group',
   async: async (m, {
      client,
      text,
      isPrefix,
      Func
   }) => {
      let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
      if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Mention or reply chat target.`), m)
      if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
      if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid format.`), m)
      try {
         if (text) {
            var user = number + '@s.whatsapp.net'
         } else if (m.quoted.sender) {
            var user = m.quoted.sender
         } else if (m.mentionedJid) {
            var user = number + '@s.whatsapp.net'
         }
      } catch (e) {} finally {
         let arr = [],
            rows = []
         let groups = Object.values(await client.groupFetchAllParticipating())
         for (let group of groups) {
            let participants = group.participants || []
            if (participants.some(u => u.id == user)) arr.push(group)
         }
         if (arr.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 No groups with bots.`), m)
         let caption = `Bot and @${user.replace(/@.+/,'')} are in same *${arr.length}* groups\n\n`
         arr.map((x, i) => {
            let v = global.db.groups.find(v => v.jid == x.id)
            if (v) {
               caption += `›  *${(i + 1)}.* ${x.subject}\n`
               caption += `   *💳* : ${x.id.split`@`[0]}\n`
               caption += `${v.stay ? '   FOREVER' : (v.expired == 0 ? '   NOT SET' : '   ' + Func.timeReverse(v.expired - new Date() * 1))} | ${x.participants.length} | ${(v.mute ? 'OFF' : 'ON')} | ${moment(v.activity).format('DD/MM/YY HH:mm:ss')}\n\n`
            } else {
               global.db.groups.push({
                  jid: x.id,
                  activity: new Date * 1,
                  antibot: true,
                  antiporn: true,
                  antidelete: true,
                  antilink: false,
                  antivirtex: false,
                  autoreply: false,
                  captcha: false,
                  filter: false,
                  game: true,
                  left: false,
                  localonly: false,
                  mute: false,
                  viewonce: false,
                  autosticker: true,
                  member: {},
                  text_left: '',
                  text_welcome: '',
                  welcome: true,
                  expired: 0,
                  stay: false
               })
            }
         })
         caption += `${global.footer}`
         m.reply(caption)
      }
   },
   error: false,
   cache: true,
   private: true,
   location: __filename
}