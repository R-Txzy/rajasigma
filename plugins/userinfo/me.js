exports.run = {
   usage: ['me'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      blockList,
      env,
      Func
   }) => {
      let user = global.db.users.find(v => v.jid == m.sender)
      let _own = [...new Set([env.owner, ...global.db.setting.owners])]
      const USD = new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
         minimumFractionDigits: 0,
         maximumFractionDigits: 0
      })
      var pic = await client.profilePictureUrl(m.sender, 'image')
      let blocked = blockList.includes(m.sender) ? true : false
      let now = new Date() * 1
      let lastseen = (user.lastseen == 0) ? 'Never' : Func.toDate(now - user.lastseen)
      let usebot = (user.usebot == 0) ? 'Never' : Func.toDate(now - user.usebot)
      let caption = `乂  *U S E R - P R O F I L E*\n\n`
      caption += `	◦  *Name* : ${m.pushName}\n`
      caption += `	◦  *Pocket* : ${USD.format(user.pocket)}\n`
      caption += `	◦  *Balance* : ${USD.format(user.balance)}\n`
      caption += `	◦  *Point* : ${Func.formatNumber(user.point)}\n`
      caption += `	◦  *Guard* : ${Func.formatNumber(user.guard)}\n`
      caption += `	◦  *Limit* : ${Func.formatNumber(user.limit)}\n`
      caption += `	◦  *Limit Game* : ${Func.formatNumber(user.limit_game)}\n`
      caption += `	◦  *Level* : ${Func.level(user.point, env.multiplier)[0]} (${Func.role(Func.level(user.point, env.multiplier)[0])})\n`
      caption += `	◦  *Hitstat* : ${Func.formatNumber(user.hit)}\n`
      caption += `	◦  *Warning* : ${((m.isGroup) ? (typeof global.db.groups.find(v => v.jid == m.chat).member[m.sender] != 'undefined' ? global.db.groups.find(v => v.jid == m.chat).member[m.sender].warning : 0) + ' / 5' : user.warning + ' / 5')}\n\n`
      caption += `乂  *U S E R - S T A T U S*\n\n`
      caption += `	◦  *Blocked* : ${(blocked ? '√' : '×')}\n`
      caption += `	◦  *Banned* : ${(new Date - user.ban_temporary < env.timeout) ? Func.toTime(new Date(user.ban_temporary + env.timeout) - new Date()) + ' (' + ((env.timeout / 1000) / 60) + ' min)' : user.banned ? '√' : '×'}\n`
      caption += `	◦  *Use In Private* : ${(global.db.chats.map(v => v.jid).includes(m.sender) ? '√' : '×')}\n`
      caption += `	◦  *Premium* : ${(user.premium ? '√' : '×')}\n`
      caption += `	◦  *Expired* : ${user.expired == 0 ? '-' : Func.timeReverse(user.expired - new Date() * 1)}\n`
      caption += `	◦  *Verified* : ${(user.verified ? '√' : '×')}\n\n`
      caption += global.footer
      client.sendMessageModify(m.chat, caption, m, {
         largeThumb: true,
         thumbnail: pic ? await Func.fetchBuffer(pic) : await Func.fetchBuffer('./media/image/default.jpg')
      })
   },
   error: false,
   cache: true,
   location: __filename
}