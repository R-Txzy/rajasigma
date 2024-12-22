exports.run = {
   usage: ['balance', 'pocket'],
   category: 'user info',
   async: async (m, {
      client,
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
         if (['pocket', 'dompet'].includes(command)) return client.reply(m.chat, `➠ Pocket : *${USD.format(users.pocket)}*\n\nPocket adalah dompet yang berisikan uang cash yang bisa di belanjakan langsung.`, m)
         if (['balance', 'saldo', 'atm'].includes(command)) return client.reply(m.chat, `➠ Balance : *${USD.format(users.balance)}*\n\nBalance adalah uang yang terdapat di Bank/ATM untuk menggunakannya kamu harus menariknya terlebih dahulu dengan perintah *${isPrefix}wd amount*`, m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}