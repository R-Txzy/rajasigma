exports.run = {
   usage: ['sell'],
   use: 'item',
   category: 'user info',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
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
         if (!text) return m.reply(Func.example(isPrefix, command, 'kepiting'))
         const item = text.toLowerCase()
         if (fishingItems.map(v => v.name).includes(item) && users.inventory.fishing.length < 1) return m.reply(`🚩 Tidak ada ikan untuk dijual.\n\n> Kirim *${isPrefix}fishing* untuk memancing.`)
         if (farmingItems.map(v => v.name).includes(item) && users.inventory.farming.length < 1) return m.reply(`🚩 Tidak ada buah untuk dijual.\n\n> Kirim *${isPrefix}farming* untuk bertani.`)
         if (huntingItems.map(v => v.name).includes(item) && users.inventory.hunting.length < 1) return m.reply(`🚩 Tidak ada hewan untuk dijual.\n\n> Kirim *${isPrefix}hunting* untuk berburu.`)
         const items = users.inventory.fishing.concat(users.inventory.farming).concat(users.inventory.hunting).find(v => v.name == item)
         if (!items) return m.reply(Func.texted('bold', `🚩 Item tidak ada.`))
         if (items.count < 1) return m.reply(Func.texted('italic', `🚩 Maaf, kamu tidak mempunyai ${Func.ucword(items.name)}.`))
         const fromItems = fishingItems.concat(farmingItems).concat(huntingItems).find(v => v.name === item)
         m.reply(`✅ Berhasil menjual *${Func.formatter(items.count)} ${Func.ucword(items.name)}* (${items.emoji}) dengan total : ${USD.format(Number(items.count * fromItems.price))}`).then(() => {
            users.pocket += Number(items.count * fromItems.price)
            items.count = 0
         })
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}