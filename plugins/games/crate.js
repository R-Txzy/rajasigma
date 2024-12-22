exports.run = {
   usage: ['open'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      users,
      Func
   }) => {
      try {
         client.crate = client.crate ? client.crate : []
         if (!m.quoted) return m.reply(Func.texted('bold', '🚩 Reply the mystery box.'))
         if(!/ID[-]/.test(m.quoted.text)) return
         const id = m.quoted.text.split`ID-`[1].split`*`[0].trim()
         if (!id) return
         const exists = client.crate.find(v => v._id === id)
         if (!exists) return m.reply(Func.texted('bold', `🚩 Sorry, mystery box has been opened or is not available.`))
         if (exists.reward.type === 'LIMIT') {
            users.limit += exists.reward._r
            m.reply(`🎉 Congratulations! you got *${exists.reward._r}* limits.`).then(() => {
               Func.removeItem(client.crate, exists)
            })
         } else if (exists.reward.type === 'POINT') {
            users.point += exists.reward._r
            m.reply(`🎉 Congratulations! you got *${Func.formatter(exists.reward._r)}* points.`).then(() => {
               Func.removeItem(client.crate, exists)
            })
         } else if (exists.reward.type === 'MONEY') {
            users.pocket += exists.reward._r
            const USD = new Intl.NumberFormat('en-US', {
               style: 'currency',
               currency: 'USD',
               minimumFractionDigits: 0,
               maximumFractionDigits: 0
            })
            m.reply(`🎉 Congratulations! you got *${USD.format(exists.reward._r)}*.`).then(() => {
               Func.removeItem(client.crate, exists)
            })
         } else if (exists.reward.type === 'ZONK_L') {
            if (users.limit < exists.reward._r) {
               users.limit = 0
            } else {
               users.limit -= exists.reward._r
            }
            m.reply(`💀 Zonk! your limit is reduced : -${exists.reward._r} limits.`).then(() => {
               Func.removeItem(client.crate, exists)
            })
         } else if (exists.reward.type === 'ZONK_P') {
            if (users.point < exists.reward._r) {
               users.point = 0
            } else {
               users.point -= exists.reward._r
            }
            m.reply(`💀 Zonk! your point is reduced : -${Func.formatter(exists.reward._r)} points.`).then(() => {
               Func.removeItem(client.crate, exists)
            })
         } else if (exists.reward.type === 'ZONK_M') {
            if (users.pocket < exists.reward._r) {
               users.pocket = 0
            } else {
               users.pocket -= exists.reward._r
            }
            const USD = new Intl.NumberFormat('en-US', {
               style: 'currency',
               currency: 'USD',
               minimumFractionDigits: 0,
               maximumFractionDigits: 0
            })
            m.reply(`💀 Zonk! your money is reduced : -${USD.format(exists.reward._r)}.`).then(() => {
               Func.removeItem(client.crate, exists)
            })
         }
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   group: true,
   location: __filename
}