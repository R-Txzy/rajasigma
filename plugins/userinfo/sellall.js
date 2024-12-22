exports.run = {
   usage: ['sellall'],
   category: 'user info',
   async: async (m, {
      client,
      users,
      Func
   }) => {
      try {
         const fishingItems = [{
            emoji: '🦐',
            name: 'udang',
            price: Func.randomInt(1, 10)
         }, {
            emoji: '🦀',
            name: 'kepiting',
            price: Func.randomInt(1, 20)
         }, {
            emoji: '🦈',
            name: 'hiu',
            price: Func.randomInt(5, 50)
         }, {
            emoji: '🐬',
            name: 'lumba lumba',
            price: Func.randomInt(4, 45)
         }, {
            emoji: '🐡',
            name: 'ikan buntal',
            price: Func.randomInt(1, 15)
         }, {
            emoji: '🐙',
            name: 'gurita',
            price: Func.randomInt(2, 20)
         }, {
            emoji: '🐟',
            name: 'gurame',
            price: Func.randomInt(1, 10)
         }, {
            emoji: '🐠',
            name: 'gabus',
            price: Func.randomInt(1, 10)
         }, {
            emoji: '🦑',
            name: 'cumi cumi',
            price: Func.randomInt(1, 10)
         }]
         const farmingItems = [{
            emoji: '🍇',
            name: 'anggur',
            price: Func.randomInt(1, 30)
         }, {
            emoji: '🍉',
            name: 'semangka',
            price: Func.randomInt(1, 20)
         }, {
            emoji: '🍊',
            name: 'jeruk',
            price: Func.randomInt(1, 7)
         }, {
            emoji: '🍒',
            name: 'ceri',
            price: Func.randomInt(1, 15)
         }, {
            emoji: '🌽',
            name: 'jagung',
            price: Func.randomInt(1, 7)
         }, {
            emoji: '🥕',
            name: 'wortel',
            price: Func.randomInt(1, 20)
         }, {
            emoji: '🍆',
            name: 'terong',
            price: Func.randomInt(1, 5)
         }, {
            emoji: '🍅',
            name: 'tomat',
            price: Func.randomInt(1, 10)
         }, {
            emoji: '🥒',
            name: 'ketimun',
            price: Func.randomInt(1, 10)
         }, {
            emoji: '🍎',
            name: 'apel',
            price: Func.randomInt(1, 20)
         }, {
            emoji: '🥭',
            name: 'mangga',
            price: Func.randomInt(1, 30)
         }, {
            emoji: '🍓',
            name: 'stoberi',
            price: Func.randomInt(1, 30)
         }, {
            emoji: '🥑',
            name: 'alpukat',
            price: Func.randomInt(1, 15)
         }, {
            emoji: '🪴',
            name: 'ganja',
            price: Func.randomInt(1, 70)
         }]
         const huntingItems = [{
            emoji: '🐖',
            name: 'babi',
            price: Func.randomInt(100, 200)
         }, {
            emoji: '🐗',
            name: 'babi hutan',
            price: Func.randomInt(300, 500)
         }, {
            emoji: '🐏',
            name: 'kambing gunung',
            price: Func.randomInt(500, 700)
         }, {
            emoji: '🐑',
            name: 'domba',
            price: Func.randomInt(200, 300)
         }, {
            emoji: '🐄',
            name: 'sapi',
            price: Func.randomInt(300, 500)
         }, {
            emoji: '🐂',
            name: 'kerbau',
            price: Func.randomInt(300, 500)
         }, {
            emoji: '🐐',
            name: 'kambing',
            price: Func.randomInt(100, 300)
         }, {
            emoji: '🐘',
            name: 'gajah',
            price: Func.randomInt(500, 2000)
         }, {
            emoji: '🐪',
            name: 'unta',
            price: Func.randomInt(400, 1000)
         }]
         const USD = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
         })
         users.inventory.fishing = users.inventory.fishing ? users.inventory.fishing : []
         users.inventory.farming = users.inventory.farming ? users.inventory.farming : []
         users.inventory.hunting = users.inventory.hunting ? users.inventory.hunting : []
         if (users.inventory.fishing.length < 1 && users.inventory.farming.length < 1 && users.inventory.hunting < 1) return m.reply(Func.texted('bold', `🚩 Maaf, kamu tidak mempunyai item apapun di dalam inventory.`))
         let totalFish = []
         fishingItems.map(v => {
            const item = users.inventory.fishing.filter(x => x.count > 0).find(x => x.name == v.name)
            if (item) {
               totalFish.push({
                  ...item,
                  total: v.price * item.count
               })
               item.count = 0
            }
         })
         const isTotalFish = (totalFish.length > 0) ? totalFish.map(v => v.total).reduce((acc, cur) => acc + cur) : 0
         const isCountFish = (totalFish.length > 0) ? totalFish.map(v => v.count).reduce((acc, cur) => acc + cur) : 0
         let totalFarm = []
         farmingItems.map(v => {
            const item = users.inventory.farming.filter(x => x.count > 0).find(x => x.name == v.name)
            if (item) {
               totalFarm.push({
                  ...item,
                  total: v.price * item.count
               })
               item.count = 0
            }
         })
         const isTotalFarm = (totalFarm.length > 0) ? totalFarm.map(v => v.total).reduce((acc, cur) => acc + cur) : 0
         const isCountFarm = (totalFarm.length > 0) ? totalFarm.map(v => v.count).reduce((acc, cur) => acc + cur) : 0
         let totalHunt = []
         huntingItems.map(v => {
            const item = users.inventory.hunting.filter(x => x.count > 0).find(x => x.name == v.name)
            if (item) {
               totalHunt.push({
                  ...item,
                  total: v.price * item.count
               })
               item.count = 0
            }
         })
         const isTotalHunt = (totalHunt.length > 0) ? totalHunt.map(v => v.total).reduce((acc, cur) => acc + cur) : 0
         const isCountHunt = (totalHunt.length > 0) ? totalHunt.map(v => v.count).reduce((acc, cur) => acc + cur) : 0
         if (isTotalFish < 1 && isTotalFarm < 1 && isTotalHunt < 1) return m.reply(Func.texted('bold', `🚩 Maaf, kamu tidak mempunyai item apapun untuk di jual.`))
         let p = `乂  *F A K T U R*\n\n`
         p += `“Faktur penjualan seluruh item yang kamu punya di dalam inventory.”\n\n`
         p += `+ ${Func.Styles('Fishing')} :\n\n`
         p += (totalFish.length < 1) ? 'Item kosong' : totalFish.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Func.ucword(v.name)} : ${USD.format(v.total)}`).join('\n')
         p += `\n`
         p += `—\n`
         p += `Total : *${USD.format(isTotalFish)}*\n\n`
         p += `+ ${Func.Styles('Farming')} :\n\n`
         p += (totalFarm.length < 1) ? 'Item kosong' : totalFarm.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Func.ucword(v.name)} : ${USD.format(v.total)}`).join('\n')
         p += `\n`
         p += `—\n`
         p += `Total : *${USD.format(isTotalFarm)}*\n\n`
         p += `+ ${Func.Styles('Hunting')} :\n\n`
         p += (totalHunt.length < 1) ? 'Item kosong' : totalHunt.sort((a, b) => b.name - a.name).map((v, i) => `◦  [ ${v.emoji} ]  ${Func.ucword(v.name)} : ${USD.format(v.total)}`).join('\n')
         p += `\n`
         p += `—\n`
         p += `Total : *${USD.format(isTotalHunt)}*\n\n`
         p += `✅ Berhasil menjual *${Func.formatter(isCountFish + isCountFarm + isCountHunt)}* item dengan total : *${USD.format(Number(isTotalFish + isTotalFarm + isTotalHunt))}*`
         m.reply(p).then(() => users.pocket += Number(isTotalFish + isTotalFarm + isTotalHunt))
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}