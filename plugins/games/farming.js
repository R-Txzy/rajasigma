exports.run = {
   usage: ['farming'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      users,
      Func
   }) => {
      try {
         client.farming = client.farming ? client.farming : {}
         users.inventory.farming = users.inventory.farming ? users.inventory.farming : []
         if (users.inventory.farming.length < 1) users.inventory.farming = [{
            emoji: '🍇',
            name: 'anggur',
            count: 0
         }, {
            emoji: '🍉',
            name: 'semangka',
            count: 0
         }, {
            emoji: '🍊',
            name: 'jeruk',
            count: 0
         }, {
            emoji: '🍒',
            name: 'ceri',
            count: 0
         }, {
            emoji: '🌽',
            name: 'jagung',
            count: 0
         }, {
            emoji: '🥕',
            name: 'wortel',
            count: 0
         }, {
            emoji: '🍆',
            name: 'terong',
            count: 0
         }, {
            emoji: '🍅',
            name: 'tomat',
            count: 0
         }, {
            emoji: '🥒',
            name: 'ketimun',
            count: 0
         }, {
            emoji: '🍎',
            name: 'apel',
            count: 0
         }, {
            emoji: '🥭',
            name: 'mangga',
            count: 0
         }, {
            emoji: '🍓',
            name: 'stoberi',
            count: 0
         }, {
            emoji: '🥑',
            name: 'alpukat',
            count: 0
         }, {
            emoji: '🪴',
            name: 'ganja',
            count: 0
         }]
         const USD = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
         })
         if (typeof client.farming[m.sender] == 'undefined') client.farming[m.sender] = {}
         if (typeof client.farming[m.sender] != 'undefined' && client.farming[m.sender].state) return m.reply(Func.texted('bold', `🚩 Saat ini kamu sedang bertani.`))
         const timer = 1000 * Func.randomInt(1, 5)
         client.sendReact(m.chat, '🪓', m.key).then(() => {
            client.farming[m.sender].state = true
            client.farming[m.sender].started_at = new Date * 1
            client.farming[m.sender].ended_at = timer
         })
         await Func.delay(timer)
         const random_result = Func.randomInt(1, 70)
         const random_vegfruit = Func.random(users.inventory.farming)
         if (/(ganja)/.test(random_vegfruit.name)) {
            const percent = Number(10)
            const fined = parseInt(((percent / 100) * users.pocket).toFixed(0))
            let p = `乂  *F A R M I N G*\n\n`
            p += `Dari bertani kamu memanen *${Func.ucword(random_vegfruit.name)}* sebanyak *${random_result}* buah.\n\n`
            p += `${random_vegfruit.emoji.repeat(random_result)}\n\n`
            p += `Kamu di denda -${USD.format(fined)} [${percent}%] karena menanam tanaman ilegal.`
            m.reply(p).then(() => {
               users.pocket -= fined
               random_vegfruit.count += random_result
               client.farming[m.sender].state = false
               client.farming[m.sender].started_at = 0
               client.farming[m.sender].ended_at = 0
            })
         } else {
            let p = `乂  *F A R M I N G*\n\n`
            p += `Dari bertani kamu memanen *${Func.ucword(random_vegfruit.name)}* sebanyak *${random_result}* buah.\n\n`
            p += `${random_vegfruit.emoji.repeat(random_result)}\n\n`
            p += `Kamu bisa mendapatkan uang dengan menjual hasil bertani menggunakan perintah *${isPrefix}sell ${random_vegfruit.name}*`
            m.reply(p).then(() => {
               random_vegfruit.count += random_result
               client.farming[m.sender].state = false
               client.farming[m.sender].started_at = 0
               client.farming[m.sender].ended_at = 0
            })
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   group: true,
   limit: true,
   game: true
}