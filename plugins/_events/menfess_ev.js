exports.run = {
   async: async (m, {
      client,
      body,
      isOwner,
      blockList,
      Func
   }) => {
      try {
         global.db.menfess = global.db.menfess ? global.db.menfess : []
         const isFrom = global.db.menfess.find(v => v.from === m.sender && v.state)
         if (!m.isGroup && isFrom) {
            const msg = `📩 You got *+1* menfess message from : *${isFrom.name.trim()}*`
            if (blockList.includes(isFrom.receiver)) return client.reply(m.chat, Func.texted('bold', '🚩 Tidak dapat mengirim pesan, nomor penerima terblokir oleh bot karena melakukan panggilan telpon/spam.'), m)
            if (!isFrom.notification) return client.reply(isFrom.receiver, msg).then(() => {
               isFrom.notification = true
               client.copyNForward(isFrom.receiver, m).then(async () => {
                  await Func.delay(1300)
                  await client.sendReact(m.chat, '✅', m.key)
               })
            })
            client.copyNForward(isFrom.receiver, m).then(async () => {
               await Func.delay(1300)
               await client.sendReact(m.chat, '✅', m.key)
            })
         }
         const isReceiver = global.db.menfess.find(v => v.receiver === m.sender && v.state)
         if (!m.isGroup && isReceiver) {
            if (blockList.includes(isReceiver.from)) return client.reply(m.chat, Func.texted('bold', '🚩 Tidak dapat mengirim pesan, nomor penerima terblokir oleh bot karena melakukan panggilan telpon/spam.'), m)
            client.copyNForward(isReceiver.from, m).then(async () => {
               await Func.delay(1300)
               await client.sendReact(m.chat, '✅', m.key)
            })
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}