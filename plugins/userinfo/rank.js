exports.run = {
   usage: ['rank'],
   category: 'user info',
   async: async (m, {
      client,
      participants,
      env,
      Func
   }) => {
      try {
         const point = global.db.users.sort((a, b) => b.point - a.point)
         const rank = point.map(v => v.jid)
         const show = Math.min(10, point.length)
         let teks = `乂  *G L O B A L - R A N K*\n\n`
         teks += `“You are ranked *${rank.indexOf(m.sender) + 1}* out of *${global.db.users.length}* users.”\n\n`
         teks += point.slice(0, show).map((v, i) => '– @' + v.jid.split `@` [0] + '\n    *💴  :  ' + Func.formatNumber(v.point) + '*\n    *🎗  :  ' + Func.level(v.point, env.multiplier)[0] + ' [ ' + Func.formatNumber(Func.level(v.point, env.multiplier)[3]) + ' / ' + Func.formatNumber(Func.level(v.point, env.multiplier)[1]) + ' ]*\n    *⚔️  :  ' + Func.role(Func.level(v.point, env.multiplier)[0]) + '*').join `\n\n`
         teks += `\n\n${global.footer}`
         client.reply(m.chat, teks, m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}