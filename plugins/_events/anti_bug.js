exports.run = {
   async: async (m, {
      client,
      body,
      Func
   }) => {
      try {
         /* for clear chat to work, in the session folder there must be an app-state-sync file */
         if (!m.isGroup && body && body.length > 3000) {
            client.chatModify({
               delete: true, lastMessages: [{
                  key: m.key, messageTimestamp: m.messageTimestamp
               }]
            }, m.chat).then(() => client.updateBlockStatus(m.chat, 'block'))
         }
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   private: true,
   cache: true,
   location: __filename
}