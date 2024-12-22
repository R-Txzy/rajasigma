exports.run = {
   usage: ['everyone'],
   use: 'text (optional)',
   category: 'admin tools',
   async: async (m, {
      client,
      text,
      participants,
      Func
   }) => {
      try {
         let member = participants.map(v => v.id)
         client.reply(m.chat, `@120363213090624121@g.us ${text}`, null, {
            contextInfo: {
               mentionedJid: member,
               groupMentions: [{
                  'groupJid': '120363213090624121@g.us',
                  'groupSubject': 'everyone'
               }]
            }
         })
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   admin: true,
   group: true
}