exports.run = {
   async: async (m, {
      client,
      body,
      users,
      Func
   }) => {
      try {
         // Verification Timeout
         setInterval(async () => {
            const expire = global.db.users.filter(v => new Date - v.codeExpire > 180000 && !v.verified)
            if (expire.length < 1) return
            for (let user of expire) {
               user.codeExpire = 0
               user.code = ''
               user.email = ''
               user.attempt = 0
            }
         }, 60_000)

         // Email Verification
         if (!m.isGroup && body && body.length == 6 && /\d{6}/.test(body) && !users.verified) {
            if (users.jid == m.sender && users.code != body.trim()) return client.reply(m.chat, Func.texted('bold', '🚩 Your verification code is wrong.'), m)
            if (new Date - users.codeExpire > 180000) return client.reply(m.chat, Func.texted('bold', '🚩 Your verification code has expired.'), m).then(() => {
               users.codeExpire = 0
               users.code = ''
               users.email = ''
               users.attempt = 0
            })
            return client.reply(m.chat, Func.texted('bold', `✅ Your number has been successfully verified (+50 Limit)`), m).then(() => {
               users.codeExpire = 0
               users.code = ''
               users.attempt = 0
               users.verified = true
               users.limit += 50
            })
         }
      } catch (e) {
         console.log(e)
         m.reply(Func.jsonFormat(e))
      }
   },
   error: false,
   private: true,
   cache: true,
   location: __filename
}