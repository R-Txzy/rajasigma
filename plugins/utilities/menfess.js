exports.run = {
   usage: ['menfess'],
   hidden: ['delses', 'again', 'stop', 'confes', 'confess'],
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         global.db.menfess = global.db.menfess ? global.db.menfess : []
         if (['confess', 'confes'].includes(command)) {
            if (!text) return client.reply(m.chat, Func.example(isPrefix, command, '628xxxxx | asep'), m)
            const [jid, name] = text.split`|`
            if ((!jid || !name)) return client.reply(m.chat, Func.example(isPrefix, command, '628xxxxx | asep'), m)
            const p = (await client.onWhatsApp(jid))[0] || {}
            if (!p.exists) return client.reply(m.chat, Func.texted('bold', '🚩 Number not registered on WhatsApp.'), m)
            if (p.jid == m.sender) return client.reply(m.chat, Func.texted('bold', '🚩 Can\'t send massage to yourself.'), m)
            const exists = global.db.menfess.find(v => v.from === m.sender)
            if (exists) return client.reply(m.chat, Func.texted('bold', `🚩 Kamu sedang terlibat percakapan dengan @${exists.receiver.split`@`[0]} hapus sesi terlebih dahulu dengan perintah ${isPrefix}delses jika ingin membuka percakapan baru.`), m)
            const isReceiverOn = global.db.menfess.some(v => v.from === p.jid || v.receiver === p.jid)
            if (isReceiverOn) return client.reply(m.chat, Func.texted('bold', `🚩 Tidak bisa mengirim pesan ke nomor tersebut karena sedang melakukan percakapan dengan orang lain.`), m)
            client.reply(m.chat, Func.texted('bold', `✅ Sesi berhasil di buat silahkan mulai ketik atau kirim pesan apapun termasuk stiker, foto ,dll.`), m)
            global.db.menfess.push({
               _id: +new Date,
               from: m.sender,
               name,
               receiver: p.jid,
               msg: [],
               state: true,
               notification: false
            })
         } else if (command === 'delses') {
            const exists = global.db.menfess.find(v => v.from === m.sender)
            if (!exists) return
            Func.removeItem(global.db.menfess, exists)
            client.reply(m.chat, Func.texted('bold', `✅ Sesi berhasil di hapus.`), m)
         } else if (command === 'stop') {
            const exists = global.db.menfess.find(v => v.from === m.sender && v.state === true)
            if (!exists) return
            exists.state = false
            exists.notification = false
            client.reply(m.chat, Func.texted('bold', `✅ Percakapan berhasil ditutup.`), m).then(() => {
               client.reply(exists.receiver, Func.texted('bold', '🚩 Maaf, orang yang mengirimimu pesan telah menutup percakapan.'))
            })
         } else if (command === 'again') {
            const exists = global.db.menfess.find(v => v.from === m.sender && v.state === false)
            if (!exists) return
            exists.state = true
            client.reply(m.chat, Func.texted('bold', `Percakapan dengan @${exists.receiver.split`@`[0]} berhasil dibuka kembali.`), m)
         } else {
            let msg = `Buat sesi terlebih dahulu dengan format ${isPrefix}confess nomor | nama\n\n`
            msg += `Contoh : ${isPrefix}confess +62 858-8777-6722 | anonim\n\n`
            msg += `Berikut ini beberapa perintah yang bisa kamu gunakan :\n\n`
            msg += `➠ *${isPrefix}stop* ~ menutup percakapan\n`
            msg += `➠ *${isPrefix}again* ~ membuka kembali percakapan\n`
            msg += `➠ *${isPrefix}delses* ~ menghapus sesi menfess`
            m.reply(msg)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   private: true,
   restrict: true,
   cache: true,
   location: __filename
}