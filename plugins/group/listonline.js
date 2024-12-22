exports.run = {
   usage: ['listonline'],
   hidden: ['here'],
   category: 'group',
   async: async (m, {
      client,
      store,
      Func
   }) => {
      let online = [...Object.keys(store.presences[m.chat])]
      if (online.length < 1) return m.reply(Func.texted('bold', `🚩 The system does not detect members who are online.`))
      client.reply(m.chat, online.map(v => '◦  @' + v.replace(/@.+/, '')).join('\n'), m)
   },
   error: false,
   group: true
}