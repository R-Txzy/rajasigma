exports.run = {
   async: async (m, {
      client,
      body,
      prefixes,
      Func,
      env,
      groupSet,
      setting
   }) => {
      try {
         client.crate = client.crate ? client.crate : []
         setInterval(async () => {
            const session = client.crate.filter(v => Date.now() - v.created_at > env.timeout)
            if (session.length < 1) return
            for (let crate of session) {
               Func.removeItem(client.crate, crate)
            }
         }, 60_000)
         const reward = [{
            type: 'LIMIT',
            _r: Func.randomInt(1, 15)
         }, {
            type: 'POINT',
            _r: Func.randomInt(500, 500000)
         }, {
            type: 'MONEY',
            _r: Func.randomInt(100, 100)
         }, {
            type: 'ZONK_L',
            _r: Func.randomInt(1, 10)
         }, {
            type: 'ZONK_P',
            _r: Func.randomInt(500, 500000)
         }, {
            type: 'ZONK_M',
            _r: Func.randomInt(100, 100000)
         }]
         const id = Func.makeId(25)
         const exists = client.crate.find(v => v.jid === m.chat)
         if (!exists) return client.crate.push({
            _id: id,
            jid: m.chat,
            count: 1,
            reward: Func.random(reward),
            created_at: Date.now()
         })
         exists.count += 1
         let caption = `📦 Mystery box has been dropped, open it by sending *${prefixes[0]}open* with reply this message.\n\n`
         caption += `*ID-${exists._id}*`
         // every 5 chat in grupp you can open it
         if (groupSet.mysterybox && exists.count === 5) return client.sendFile(m.chat, 'https://i.ibb.co/jLbc6Zr/image.jpg', 'image.jpg', caption)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   group: true,
   cache: true,
   location: __filename
}