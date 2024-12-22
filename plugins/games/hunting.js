exports.run = {
   usage: ['hunting'],
   hidden: ['hunt', 'berburu'],
   category: 'games',
   async: async (m, {
      client,
      isPrefix,
      users,
      Func
   }) => {
      try {
         client.hunting = client.hunting ? client.hunting : {}
         users.inventory.hunting = users.inventory.hunting ? users.inventory.hunting : []
         if (users.inventory.hunting.length < 1) users.inventory.hunting = [{
            emoji: '🐖',
            name: 'babi',
            count: 0
         }, {
            emoji: '🐗',
            name: 'babi hutan',
            count: 0
         }, {
            emoji: '🐏',
            name: 'kambing gunung',
            count: 0
         }, {
            emoji: '🐑',
            name: 'domba',
            count: 0
         }, {
            emoji: '🐄',
            name: 'sapi',
            count: 0
         }, {
            emoji: '🐂',
            name: 'kerbau',
            count: 0
         }, {
            emoji: '🐐',
            name: 'kambing',
            count: 0
         }, {
            emoji: '🐘',
            name: 'gajah',
            count: 0
         }, {
            emoji: '🐪',
            name: 'unta',
            count: 0
         }]
         const USD = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
         })
         if (typeof client.hunting[m.sender] == 'undefined') client.hunting[m.sender] = {}
         if (typeof client.hunting[m.sender] != 'undefined' && client.hunting[m.sender].state) return m.reply(Func.texted('bold', `🚩 Silahkan tunggu hasil tangkapan dari pancingan sebelumnya.`))
         const timer = 1000 * Func.randomInt(1, 5)
         client.sendReact(m.chat, '🗡️', m.key).then(() => {
            client.hunting[m.sender].state = true
            client.hunting[m.sender].started_at = new Date * 1
            client.hunting[m.sender].ended_at = timer
         })
         await Func.delay(timer)
         const random_result = Func.randomInt(1, 70)
         const random_animal = Func.random(users.inventory.hunting)
         if (/(gunung|gajah)/.test(random_animal.name)) {
            const percent = Number(10)
            const fined = parseInt(((percent / 100) * users.pocket).toFixed(0))
            let p = `乂  *H U N T I N G*\n\n`
            p += `Selamat, kamu berhasil memburu *${Func.ucword(random_animal.name)}* sebanyak *${random_result}* ekor.\n\n`
            p += `${random_animal.emoji.repeat(random_result)}\n\n`
            p += `Kamu di denda -${USD.format(fined)} [${percent}%] karena memburu hewan yang dilindungi oleh pemerintah.`
            m.reply(p).then(() => {
               users.pocket -= fined
               random_animal.count += random_result
               client.hunting[m.sender].state = false
               client.hunting[m.sender].started_at = 0
               client.hunting[m.sender].ended_at = 0
            })
         } else {
            let p = `乂  *H U N T I N G*\n\n`
            p += `Selamat, kamu berhasil memburu *${Func.ucword(random_animal.name)}* sebanyak *${random_result}* ekor.\n\n`
            p += `${random_animal.emoji.repeat(random_result)}\n\n`
            p += `Kamu bisa mendapatkan uang dengan menjual hasil buruan menggunakan perintah *${isPrefix}sell ${random_animal.name}*`
            m.reply(p).then(() => {
               random_animal.count += random_result
               client.hunting[m.sender].state = false
               client.hunting[m.sender].started_at = 0
               client.hunting[m.sender].ended_at = 0
            })
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   group: true,
   limit: true,
   game: true,
   cache: true,
   location: __filename
}