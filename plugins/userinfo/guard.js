exports.run = {
   usage: ['guard'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      users,
      Func
   }) => {
      if (users.point < 1) return client.reply(m.chat, `🚩 You don't have guards`, m)
      client.reply(m.chat, Func.texted('bold', `🚩 You have ${Func.formatNumber(users.guard)} guards.`), m)
   },
   error: false
}