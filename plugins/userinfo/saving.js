exports.run = {
   usage: ['saving', 'withdraw'],
   hidden: ['nabung', 'wd', 'tarik'],
   use: 'amount',
   category: 'user info',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Func
   }) => {
      try {
         const USD = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
         })
         if (['saving', 'nabung'].includes(command)) {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, '5000'), m)
            if (users.pocket < 1) return client.reply(m.chat, Func.texted('bold', `🚩 Kamu tidak mempunyai uang.`), m)
            if (isNaN(args[0])) return client.reply(m.chat, Func.texted('bold', `🚩 Nominal harus berupa angka.`), m)
            if (args[0] < 5000) return client.reply(m.chat, Func.texted('bold', `🚩 Nominal untuk di simpan ke balance minimal $5000.`), m)
            if (args[0] > users.pocket) return client.reply(m.chat, Func.texted('bold', `🚩 Nominal melebihi batas jumlah uang yang kamu punya, cek dengan mengirimkan perintah ${isPrefix}pocket`), m)
            let ppn = parseInt(((5 / 100) * args[0]).toFixed(0))
            if ((ppn + parseInt(args[0])) > users.pocket) return client.reply(m.chat, Func.texted('bold', `🚩 Tidak bisa menyimpan uang ke Bank/ATM karena jumlah uangmu tidak mencukupi untuk membayar pajak.`), m)
            users.pocket -= parseInt(args[0]) + ppn
            users.balance += parseInt(args[0])
            let teks = `乂  *S A V I N G*\n\n`
            teks += `Berhasil menyimpan uang ke Bank/ATM sebesar ${USD.format(args[0])}\n\n`
            teks += `➠ *Total* : ${USD.format(global.db.users.find(v => v.jid == m.sender).balance)}\n`
            teks += `➠ *Fee* : ${USD.format(ppn)} [5%]\n`
            teks += `➠ *Serial Code* : NXR-${Func.makeId(10)}`
            client.reply(m.chat, teks, m)
         } else if (['wd', 'withdraw', 'tarik']) {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, '1000'), m)
            if (users.balance < 1) return client.reply(m.chat, Func.texted('bold', `🚩 Kamu tidak mempunyai saldo.`), m)
            if (isNaN(args[0])) return client.reply(m.chat, Func.texted('bold', `🚩 Nominal harus berupa angka.`), m)
            if (args[0] < 5000) return client.reply(m.chat, Func.texted('bold', `🚩 Nominal untuk di tarik minimal $5000`), m)
            if (args[0] > users.saving) return client.reply(m.chat, Func.texted('bold', `🚩 Nominal melebihi batas jumlah uang yang kamu punya, cek dengan mengirimkan perintah ${isPrefix}balance`), m)
            let ppn = parseInt(((5 / 100) * args[0]).toFixed(0))
            if ((ppn + parseInt(args[0])) > users.balance) return client.reply(m.chat, Func.texted('bold', `🚩 Tidak bisa menarik dari Bank/ATM karena jumlah uangmu tidak mencukupi untuk membayar pajak.`), m)
            users.balance -= parseInt(args[0]) + ppn
            users.pocket += parseInt(args[0])
            let teks = `乂  *W I T H D R A W*\n\n`
            teks += `Berhasil melakukan penarikan uang sebesar ${USD.format(args[0])}\n\n`
            teks += `➠ *Total* : ${USD.format(global.db.users.find(v => v.jid == m.sender).pocket)}\n`
            teks += `➠ *Fee* : ${USD.format(ppn)} [5%]\n`
            teks += `➠ *Serial Code* : ${Func.makeId(10)}`
            client.reply(m.chat, teks, m)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}