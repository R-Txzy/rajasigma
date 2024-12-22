const { Function: Func, Logs, Scraper, Cooldown, Spam, InvCloud } = new (require('@neoxr/wb'))
const env = require('./config.json')
const cron = require('node-cron')
const cache = new (require('node-cache'))({
   stdTTL: env.cooldown
})

const cooldown = new Cooldown(env.cooldown)
const spam = new Spam({
   RESET_TIMER: env.cooldown,
   HOLD_TIMER: env.timeout,
   PERMANENT_THRESHOLD: env.permanent_threshold,
   NOTIFY_THRESHOLD: env.notify_threshold,
   BANNED_THRESHOLD: env.banned_threshold
})

module.exports = async (client, ctx) => {
   var { store, m, body, prefix, plugins, commands, args, command, text, prefixes, core } = ctx
   try {
      require('./lib/system/schema')(m, env), InvCloud(store, env, client)
      const groupSet = global.db.groups.find(v => v.jid === m.chat)
      const chats = global.db.chats.find(v => v.jid === m.chat)
      const users = global.db.users.find(v => v.jid === m.sender)
      const setting = global.db.setting
      const isOwner = [env.owner, ...setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const isModerator = setting.moderators.map(v => v + '@s.whatsapp.net').includes(m.sender) || isOwner
      const isPrem = users && users.premium
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      const participants = m.isGroup ? groupMetadata ? groupMetadata.participants : [] : [] || []
      const adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      const isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:`[0]) + '@s.whatsapp.net') : false
      const blockList = typeof await (await client.fetchBlocklist()) != 'undefined' ? await (await client.fetchBlocklist()) : []
      const isSpam = spam.detection(client, m, {
         prefix, command, commands, users, cooldown,
         show: 'all', // choose 'all' or 'command-only'
         banned_times: users.ban_times
      })

      // exception disabled plugin
      var plugins = Object.fromEntries(Object.entries(plugins).filter(([name, _]) => !setting.pluginDisable.includes(name)))

      // remove client bot
      if (m.isGroup && global.db.bots.length > 0) {
         let member = participants.map(v => client.decodeJid(v.id))
         let bot = global.db.bots.some(v => v.jid === client.decodeJid(m.sender))
         if (!m.fromMe && member.includes(env.pairing.number + '@s.whatsapp.net') && bot) {
            if (isBotAdmin) return m.reply(Func.texted('bold', `🚩 Client bots cannot be in the same group as the main bot.`)).then(async () => await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
            if (!isBotAdmin) return m.reply(Func.texted('bold', `🚩 Client bots cannot be in the same group as the main bot.`))
         }
      }

      // stories reaction
      client.storyJid = client.storyJid ? client.storyJid : []
      if (m.chat.endsWith('broadcast') && !client.storyJid.includes(m.sender) && m.sender != client.decodeJid(client.user.id)) client.storyJid.push(m.sender)
      if (m.chat.endsWith('broadcast') && [...new Set(client.storyJid)].includes(m.sender) && !/protocol/.test(m.mtype)) {
         await client.sendMessage('status@broadcast', {
            react: {
               text: Func.random(['🤣', '🥹', '😂', '😋', '😎', '🤓', '🤪', '🥳', '😠', '😱', '🤔']),
               key: m.key
            }
         }, {
            statusJidList: [m.sender]
         })
      }

      // File Traffic
      if (m.fromMe && /audio|video|sticker|image|document/.test(m.mtype)) setting.outbound += m.msg.fileLength.low
      if (!m.fromMe && /audio|video|sticker|image|document/.test(m.mtype)) setting.inbound += m.msg.fileLength.low
      if (!setting.online) client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) {
         client.sendPresenceUpdate('available', m.chat)
         client.readMessages([m.key])
      }
      if (m.isGroup && !isBotAdmin) {
         groupSet.antibot = false
         groupSet.localonly = false
         groupSet.restrict = false
      }
      if (m.isGroup) groupSet.activity = new Date() * 1
      if (users) {
         users.name = m.pushName
         users.lastseen = new Date() * 1
      }
      if (chats) {
         chats.chat += 1
         chats.lastseen = new Date * 1
      }
      if (!setting.multiprefix) setting.noprefix = false
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Func.jsonFormat(m), m)
      if (!m.fromMe && m.isGroup && groupSet.antibot && m.isBot && isBotAdmin && !isOwner) return m.reply(Func.texted('bold', `🚩 No other bots are allowed here.`)).then(async () => await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
      if (m.isGroup && !groupSet.stay && (new Date * 1) >= groupSet.expired && groupSet.expired != 0) {
         return client.reply(m.chat, Func.texted('italic', '🚩 Bot time has expired and will leave from this group, thank you.', null, {
            mentions: participants.map(v => v.id)
         })).then(async () => {
            groupSet.expired = 0
            await Func.delay(2000).then(() => client.groupLeave(m.chat))
         })
      }
      if (users && (new Date * 1) >= users.expired && users.expired != 0) {
         return client.reply(users.jid, Func.texted('italic', '🚩 Your premium package has expired, thank you for buying and using our service.')).then(async () => {
            users.premium = false
            users.expired = 0
            users.limit = env.limit
         })
      }
      if (m.isGroup && !m.isBot && users && users.afk > -1) {
         client.reply(m.chat, `You are back online after being offline for : ${Func.texted('bold', Func.toTime(new Date - users.afk))}\n\n• ${Func.texted('bold', 'Reason')}: ${users.afkReason ? users.afkReason : '-'}`, m)
         users.afk = -1
         users.afkReason = ''
      }
      cron.schedule('00 00 * * *', () => {
         setting.lastReset = new Date * 1
         global.db.users.filter(v => v.limit < env.limit && !v.premium).map(v => v.limit = env.limit)
         global.db.users.filter(v => v.limit_game < env.limit_game && !v.premium).map(v => v.limit_game = env.limit_game)
         Object.entries(global.db.statistic).map(([_, prop]) => prop.today = 0)
      }, {
         scheduled: true,
         timezone: process.env.TZ
      })
      if (m.isGroup && !m.fromMe) {
         let now = new Date() * 1
         if (!groupSet.member[m.sender]) {
            groupSet.member[m.sender] = {
               lastseen: now,
               warning: 0
            }
         } else {
            groupSet.member[m.sender].lastseen = now
         }
      }
      // anti spam media (sticker, video & image)
      if (m.isGroup && groupSet.restrict && isBotAdmin && /video|image|sticker/.test(m.mtype) && isSpam && /(BANNED|NOTIFY|TEMPORARY)/.test(isSpam.state)) return client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      if (setting.antispam && isSpam && /(BANNED|NOTIFY|TEMPORARY)/.test(isSpam.state)) return client.reply(m.chat, Func.texted('bold', `🚩 ${isSpam.msg}`), m)
      if (setting.antispam && isSpam && /HOLD/.test(isSpam.state)) return
      if (body && !setting.self && core.prefix != setting.onlyprefix && commands.includes(core.command) && !setting.multiprefix && !env.evaluate_chars.includes(core.command)) return client.reply(m.chat, `🚩 *Incorrect prefix!*, this bot uses prefix : *[ ${setting.onlyprefix} ]*\n\n➠ ${setting.onlyprefix + core.command} ${text || ''}`, m)
      const matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
      }

      const trigger = body && prefix && commands.includes(command)
         || body && !prefix && commands.includes(command) && setting.noprefix
         || body && !prefix && commands.includes(command) && env.evaluate_chars.includes(command)

      if (trigger) {
         if (setting.error.includes(command)) return client.reply(m.chat, Func.texted('bold', `🚩 Command _${(prefix ? prefix : '') + command}_ disabled.`), m)
         if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         if (commands.includes(command)) {
            users.hit += 1
            users.usebot = new Date() * 1
            Func.hitstat(command, m.sender)
         }
         const is_commands = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))
         for (let name in is_commands) {
            const cmd = is_commands[name].run
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            if (!turn && !turn_hidden) continue
            if ((m.fromMe && m.isBot) || /broadcast|newsletter/.test(m.chat) || /edit/.test(m.mtype)) continue
            if (setting.self && !isOwner && !m.fromMe) continue
            const exception = ['owner', 'menfess', 'verify', 'payment', 'premium', 'buyprem', 'sewa', 'exec']
            if (m.isGroup && groupSet && groupSet.adminonly && !isAdmin && !exception.includes(name)) continue
            if (!m.isGroup && !exception.includes(name) && chats && !isPrem && !isOwner && !users.banned && new Date() * 1 - chats.lastreply < env.timeout && setting.groupmode) continue
            if (!m.isGroup && !exception.includes(name) && chats && !isPrem && !isOwner && !users.banned && setting.groupmode) {
               if (chats && new Date() * 1 - chats.lastreply > env.timeout) {
                  const message = setting._msg.replace('+name', m.pushName).replace('+tag', `@${client.decodeJid(m.sender).split`@`[0]}`)
                  const rules = (setting.rules != '-') ? setting.rules.replace('+name', m.pushName).replace('+tag', `@${client.decodeJid(m.sender).split`@`[0]}`) : false
                  if (!m.isGroup && setting._style === 1) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.reply(m.chat, message, m).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules, m)
                     })
                  } else if (!m.isGroup && setting._style === 2) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.sendMessageModify(m.chat, message + '\n\n' + global.footer, m, {
                        ads: false,
                        largeThumb: true,
                        thumbnail: 'https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg',
                        url: global.db.setting.link
                     }).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules, m)
                     })
                  } else if (!m.isGroup && setting._style === 3) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.sendProgress(m.chat, message, m).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules, m)
                     })
                  } else if (!m.isGroup && setting._style === 4) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.sendFDoc(m.chat, message).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules, m)
                     })
                  } else if (!m.isGroup && setting._style === 5) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.sendMessageVerify(m.chat, message, 'Customer Support', m).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules)
                     })
                  }
               }
               continue
            }

            // Email Verification
            if (!exception.includes(name) && !m.isGroup && users && !users.banned && !users.verified && setting.verify) users.attempt += 1
            const teks = `⚠️ *[ ${users.attempt} / 5 ]* Verifikasi nomor dengan menggunakan email, 1 email untuk memverifikasi 1 nomor WhatsApp. Silahkan ikuti step by step berikut :\n\n– *STEP 1*\nGunakan perintah *${prefix ? prefix : ''}reg <email>* untuk mendapatkan kode verifikasi melalui email.\nContoh : *${prefix ? prefix : ''}reg neoxrbot@gmail.com*\n\n– *STEP 2*\nBuka email dan cek pesan masuk atau di folder spam, setelah kamu mendapat kode verifikasi silahkan kirim kode tersebut kepada bot.\n\n*Note* :\nMengabaikan pesan ini sebanyak *5x* kamu akan di banned dan di blokir, untuk membuka banned dan blokir dikenai biaya sebesar Rp. 10,000`
            if (users && !users.banned && !users.verified && (users.attempt >= 5) && setting.verify) {
               client.reply(m.isGroup ? m.sender : m.chat, Func.texted('bold', `🚩 [ ${users.attempt} / 5 ] : Kamu mengabaikan pesan verifikasi tapi tenang masih ada bot lain kok, banned thanks. (^_^)`), m).then(() => {
                  users.banned = true
                  users.attempt = 0
                  users.code = ''
                  users.codeExpire = 0
                  users.email = ''
                  client.updateBlockStatus(m.sender, 'block')
               })
               continue
            }
            if (!exception.includes(name) && !m.isGroup && users && !users.banned && !users.verified && setting.verify) {
               client.sendMessageModify(m.chat, teks, m, {
                  largeThumb: true,
                  thumbnail: await Func.fetchBuffer('https://telegra.ph/file/31601aee3fdf941bebbc4.jpg')
               })
               continue
            }
            if (!['me', 'owner', 'exec'].includes(name) && users && (users.banned || new Date - users.ban_temporary < env.timeout)) continue
            if (m.isGroup && !['activation', 'groupinfo'].includes(name) && groupSet.mute) continue
            if (cmd.cache && cmd.location) {
               let file = require.resolve(cmd.location)
               Func.reload(file)
            }
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.moderator && !isModerator) {
               client.reply(m.chat, global.status.moderator, m)
               continue
            }
            if (cmd.restrict && !isPrem && !isOwner && text && new RegExp('\\b' + setting.toxic.join('\\b|\\b') + '\\b').test(text.toLowerCase())) {
               client.reply(m.chat, `⚠️ You violated the *Terms & Conditions* of using bots by using blacklisted keywords, as a penalty for your violation being blocked and banned.`, m).then(() => {
                  users.banned = true
                  client.updateBlockStatus(m.sender, 'block')
               })
               continue
            }
            if (cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               continue
            }
            if (cmd.limit && !cmd.game && users.limit < 1) {
               const msg = `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plans.`
               m.reply(msg).then(() => users.premium = false)
               continue
            }
            if (cmd.limit && !cmd.game && users.limit > 0) {
               const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit >= limit) {
                  users.limit -= limit
               } else {
                  client.reply(m.chat, Func.texted('bold', `⚠️ Your limit is not enough to use this feature.`), m)
                  continue
               }
            }
            if (cmd.limit && cmd.game && users.limit_game < 1) {
               client.reply(m.chat, `⚠️ You reached the game limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plan.`, m).then(() => users.premium = false)
               continue
            }
            if (cmd.limit && cmd.game && users.limit_game > 0) {
               const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit_game >= limit) {
                  users.limit_game -= limit
               } else {
                  client.reply(m.chat, Func.texted('bold', `⚠️ Your game limit is not enough to play this game.`), m)
                  continue
               }
            }
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (cmd.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            if (cmd.game && !setting.games) {
               client.reply(m.chat, global.status.gameSystem, m)
               continue
            }
            if (cmd.game && Func.level(users.point, env.multiplier)[0] >= 50) {
               client.reply(m.chat, global.status.gameLevel, m)
               continue
            }
            if (cmd.game && m.isGroup && !groupSet.game) {
               client.reply(m.chat, global.status.gameInGroup, m)
               continue
            }
            cmd.async(m, {
               client,
               args,
               text,
               isPrefix: prefix,
               prefixes,
               command,
               groupMetadata,
               participants,
               users,
               chats,
               groupSet,
               setting,
               isOwner,
               isModerator,
               isAdmin,
               isBotAdmin,
               plugins,
               blockList,
               env,
               ctx,
               store,
               Func,
               Scraper
            })
            break
         }
      } else {
         const is_events = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => !prop.run.usage))
         for (let name in is_events) {
            let event = is_events[name].run
            if ((m.fromMe && m.isBot) || /broadcast|newsletter/.test(m.chat)) continue
            if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (m.isGroup && groupSet && groupSet.adminonly && !isAdmin && !['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name)) continue
            if (setting.self && !['menfess_ev', 'anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(event.pluginName) && !isOwner && !m.fromMe) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && users && (users.banned || new Date - users.ban_temporary < env.timeout)) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && groupSet && groupSet.mute) continue
            if (!m.isGroup && !['menfess_ev', 'chatbot', 'auto_download', 'dial_ev'].includes(name) && chats && !isPrem && !isOwner && !users.banned && new Date() * 1 - chats.lastreply < env.timeout) continue
            if (!m.isGroup && setting.groupmode && (!global.db.menfess.some(v => v.from === m.sender) && !global.db.menfess.some(v => v.receiver === m.sender)) && !['system_ev', 'menfess_ev', 'chatbot', 'auto_download', 'dial_ev'].includes(name) && !isPrem && !isOwner) {
               if (chats && new Date() * 1 - chats.lastreply > env.timeout) {
                  const message = setting._msg.replace('+name', m.pushName).replace('+tag', `@${client.decodeJid(m.sender).split`@`[0]}`)
                  const rules = (setting.rules != '-') ? setting.rules.replace('+name', m.pushName).replace('+tag', `@${client.decodeJid(m.sender).split`@`[0]}`) : false
                  if (!m.isGroup && setting._style === 1) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.reply(m.chat, message, m).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules, m)
                     })
                  } else if (!m.isGroup && setting._style === 2) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.sendMessageModify(m.chat, message + '\n\n' + global.footer, m, {
                        ads: false,
                        largeThumb: true,
                        thumbnail: setting.cover
                     }).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules, m)
                     })
                  } else if (!m.isGroup && setting._style === 3) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.sendProgress(m.chat, message, m).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules, m)
                     })
                  } else if (!m.isGroup && setting._style === 4) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.sendFDoc(m.chat, message).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules, m)
                     })
                  } else if (!m.isGroup && setting._style === 5) {
                     if (setting.except.includes(client.decodeJid(m.chat).split`@`[0])) return
                     chats.lastreply = new Date * 1
                     client.sendMessageVerify(m.chat, message, 'Customer Support', m).then(async () => {
                        await Func.delay(1500)
                        if (rules) return client.reply(m.chat, rules)
                     })
                  }
               }
               continue
            }
            if (event.cache && event.location) {
               let file = require.resolve(event.location)
               Func.reload(file)
            }
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.moderator && !isModerator) continue
            if (event.group && !m.isGroup) continue
            if (!event.game && event.limit && users.limit < 1 && body && Func.generateLink(body) && Func.generateLink(body).some(v => Func.socmed(v))) return m.reply(`⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plans.`).then(() => {
               users.premium = false
               users.expired = 0
            })
            if (event.game && event.limit && users.limit_game < 1 && body) return client.reply(m.chat, `⚠️ You reached the game limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plan or buy it with points use *${prefixes[0]}buygl* command.`, m)
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            if (event.download && body && Func.socmed(body) && !setting.autodownload && Func.generateLink(body) && Func.generateLink(body).some(v => Func.socmed(v))) continue
            if (event.download && body && !isPrem && setting.autodownload && Func.generateLink(body) && Func.generateLink(body).some(v => Func.socmed(v))) return client.sendMessage(m.chat, {
               delete: {
                  remoteJid: m.chat,
                  fromMe: isBotAdmin ? false : true,
                  id: m.id,
                  participant: m.sender
               }
            }).then(() => {
               m.reply(`⚠️ Auto download is only for premium users, use command to download️.`)
            })
            if (event.game && !setting.games) continue
            if (event.game && Func.level(users.point, env.multiplier)[0] >= 50) continue
            if (event.game && m.isGroup && !groupSet.game) continue
            event.async(m, {
               client,
               body,
               prefixes,
               groupMetadata,
               participants,
               users,
               chats,
               groupSet,
               setting,
               isOwner,
               isModerator,
               isAdmin,
               isBotAdmin,
               plugins,
               blockList,
               env,
               ctx,
               store,
               Func,
               Scraper
            })
         }
      }
   } catch (e) {
      if (/(rate|overlimit|timeout|users)/ig.test(e.message)) return
      console.log(e)
      // if (!m.fromMe) return m.reply(Func.jsonFormat(new Error('neoxr-bot encountered an error :' + e)))
   }
   Func.reload(require.resolve(__filename))
}