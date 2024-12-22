const moment = require('moment-timezone')
exports.run = {
   usage: ['groups'],
   category: 'miscs',
   async: async (m, {
      client,
      isPrefix,
      Func
   }) => {
      const groups = Object.entries(await client.groupFetchAllParticipating()).slice(0).map(entry => entry[1])
      let caption = `乂  *G R O U P - L I S T*\n\n`
      caption += `*“Bot has joined into ${groups.length} groups, send _${isPrefix}gc_ or _${isPrefix}gcopt_ to show all setup options.”*\n\n`
      let i = 1
      for (const x of groups) {
         let v = global.db.groups.find(v => v.jid === x.id)
         if (v) {
            caption += `›  *${(i++)}.* ${x.subject}\n`
            caption += `   *💳* : ${x.id.split`@`[0]}\n`
            caption += `${v.stay ? '   FOREVER': (v.expired == 0 ? '   NOT SET': '   ' + Func.timeReverse(v.expired - new Date() * 1))} | ${x.participants.length} | ${(v.mute ? 'OFF': 'ON')} | ${moment(v.activity).format('DD/MM/YY HH:mm:ss')}\n\n`
         } else {
            global.db.groups.push({
               jid: x.id,
               activity: 0,
               antibot: true,
               antiporn: false,
               antidelete: true,
               antilink: false,
               antivirtex: false,
               autoreply: false,
               adminonly: false,
               filter: false,
               game: true,
               mysterybox: true,
               left: false,
               localonly: false,
               mute: false,
               viewonce: false,
               autosticker: true,
               restrict: true,
               member: {},
               text_left: '',
               text_welcome: '',
               welcome: true,
               expired: 0,
               stay: false
            })
         }
      }
      caption += `${global.footer}`
      m.reply(caption)
   },
   cache: true,
   location: __filename
}