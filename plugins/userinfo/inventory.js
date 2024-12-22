exports.run = {
   usage: ['inventory'],
   category: 'user info',
   async: async (m, {
      client,
      users,
      Func
   }) => {
      try {
         users.inventory.fishing = users.inventory.fishing ? users.inventory.fishing : []
         users.inventory.farming = users.inventory.farming ? users.inventory.farming : []
         users.inventory.hunting = users.inventory.hunting ? users.inventory.hunting : []
         if (users.inventory.fishing.length < 1 && users.inventory.farming.length < 1 && users.inventory.hunting.length < 1) return m.reply(Func.texted('bold', `🚩 Maaf, kamu tidak mempunyai item apapun di dalam inventory.`))
         let p = `乂  *I N V E N T O R Y*\n\n`
         p += `“Berikut ini adalah koleksi item yang bisa kamu jual untuk mendapatkan uang, uang yang kamu dapat bisa digunakan untuk membeli premium, limit, dll.”\n\n`
         p += `+ ${Func.Styles('Fishing')} :\n\n`
         p += (users.inventory.fishing.length < 1) ? 'Item kosong' : users.inventory.fishing.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Func.ucword(v.name)} : ${Func.formatter(v.count)}`).join('\n')
         p += `\n\n`
         p += `+ ${Func.Styles('Farming')} :\n\n`
         p += (users.inventory.farming.length < 1) ? 'Item kosong' : users.inventory.farming.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Func.ucword(v.name)} : ${Func.formatter(v.count)}`).join('\n')
         p += `\n\n`
         p += `+ ${Func.Styles('Hunting')} :\n\n`
         p += (users.inventory.hunting.length < 1) ? 'Item kosong' : users.inventory.hunting.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Func.ucword(v.name)} : ${Func.formatter(v.count)}`).join('\n')
         p += `\n\n${global.footer}`
         m.reply(p)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}