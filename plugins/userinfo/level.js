exports.run = {
   usage: ['level'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      users,
      env,
      Func,
      Scraper
   }) => {
      try {
         client.sendReact(m.chat, '🕒', m.key)
         try {
            const url = await client.profilePictureUrl(m.sender, 'image')
            const result = await Scraper.uploadImageV3(await Func.fetchBuffer(url))
            var pic = result.data.url
         } catch {
            var pic = 'https://telegra.ph/file/8937de46430b0e4141a1c.jpg'
         }
         const point = global.db.users.sort((a, b) => b.point - a.point).map(v => v.jid)
         const json = await Api.neoxr('/leveling', {
            rank: point.indexOf(m.sender) + 1,
            level: Func.level(users.point, env.multiplier)[0],
            picture: pic,
            currentXp: users.point,
            requiredXp: Func.level(users.point, env.multiplier)[1],
            name: encodeURIComponent(m.pushName)
         })
         if (!json.status) return m.reply(Func.jsonFormat(json))
         client.sendFile(m.chat, json.data.url, '', ``, m)
      } catch (e) {
         console.log(e)
         m.reply(Func.jsonFormat(e))
      }
   },
   error: false,
   cache: true,
   location: __filename
}