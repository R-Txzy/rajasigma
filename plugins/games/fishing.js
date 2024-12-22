exports.run = {
   usage: ['fishing'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      users,
      Func
   }) => {
      try {
         client.fishing = client.fishing ? client.fishing : {}
         users.inventory.fishing = users.inventory.fishing ? users.inventory.fishing : []
         if (users.inventory.fishing.length < 1) users.inventory.fishing = [{
            emoji: '🦐',
            name: 'udang',
            count: 0
         }, {
            emoji: '🦀',
            name: 'kepiting',
            count: 0
         }, {
            emoji: '🦈',
            name: 'hiu',
            count: 0
         }, {
            emoji: '🐬',
            name: 'lumba lumba',
            count: 0
         }, {
            emoji: '🐡',
            name: 'ikan buntal',
            count: 0
         }, {
            emoji: '🐙',
            name: 'gurita',
            count: 0
         }, {
            emoji: '🐟',
            name: 'gurame',
            count: 0
         }, {
            emoji: '🐠',
            name: 'gabus',
            count: 0
         }, {
            emoji: '🦑',
            name: 'cumi cumi',
            count: 0
         }]
         const USD = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
         })
         if (typeof client.fishing[m.sender] == 'undefined') client.fishing[m.sender] = {}
         if (typeof client.fishing[m.sender] != 'undefined' && client.fishing[m.sender].state) return m.reply(Func.texted('bold', `🚩 Silahkan tunggu hasil tangkapan dari pancingan sebelumnya.`))
         const timer = 1000 * Func.randomInt(1, 5)
         client.sendReact(m.chat, '🪝', m.key).then(() => {
            client.fishing[m.sender].state = true
            client.fishing[m.sender].started_at = new Date * 1
            client.fishing[m.sender].ended_at = timer
         })
         await Func.delay(timer)
         const random_result = Func.randomInt(1, 70)
         const random_fish = Func.random(users.inventory.fishing)
         if (/(hiu|lumba)/.test(random_fish.name)) {
            const percent = Number(10)
            const fined = parseInt(((percent / 100) * users.pocket).toFixed(0))
            let p = `乂  *F I S H I N G*\n\n`
            p += `Selamat, kamu berhasil menangkap *${Func.ucword(random_fish.name)}* sebanyak *${random_result}* ekor.\n\n`
            p += `${random_fish.emoji.repeat(random_result)}\n\n`
            p += `Kamu di denda -${USD.format(fined)} [${percent}%] karena menangkap hewan yang dilindungi oleh pemerintah.`
            m.reply(p).then(() => {
               users.pocket -= fined
               random_fish.count += random_result
               client.fishing[m.sender].state = false
               client.fishing[m.sender].started_at = 0
               client.fishing[m.sender].ended_at = 0
            })
         } else {
            let p = `乂  *F I S H I N G*\n\n`
            p += `Selamat, kamu berhasil menangkap *${Func.ucword(random_fish.name)}* sebanyak *${random_result}* ekor.\n\n`
            p += `${random_fish.emoji.repeat(random_result)}\n\n`
            p += `Kamu bisa mendapatkan uang dengan menjual hasil tangkapan menggunakan perintah *${isPrefix}sell ${random_fish.name}*`
            m.reply(p).then(() => {
               random_fish.count += random_result
               client.fishing[m.sender].state = false
               client.fishing[m.sender].started_at = 0
               client.fishing[m.sender].ended_at = 0
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