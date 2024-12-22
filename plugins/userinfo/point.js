exports.run = {
   usage: ['point'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      users,
      Func
   }) => {
      try {
         if (users.point < 1) return client.reply(m.chat, `🚩 You don't have points, to get points send *${isPrefix}claim*`, m)
         client.reply(m.chat, Func.texted('bold', `🚩 You have ${Func.h2k(users.point)} (${Func.formatNumber(users.point)}) points.`), m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}