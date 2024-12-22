require('events').EventEmitter.defaultMaxListeners = 100
const { Baileys, Function: Func } = new (require('@neoxr/wb'))
const canvafy = require('canvafy'),
   fs = require('fs'),
   env = JSON.parse(fs.readFileSync('./config.json', 'utf-8'))
const cache = new (require('node-cache'))({
   stdTTL: env.cooldown
})

exports.run = {
   usage: ['jadibot'],
   use: 'number',
   category: 'bot hosting',
   async: async (m, {
      client: parent,
      text,
      isPrefix,
      command,
      env,
      Func
   }) => {
      try {
         global.db.bots = global.db.bots ? global.db.bots : []
         if (!text) return parent.reply(m.chat, Func.example(isPrefix, command, '62858111111'), m)
         const p = (await parent.onWhatsApp(text))[0] || {}
         if (!p.exists) return parent.reply(m.chat, Func.texted('bold', '🚩 Number not registered on WhatsApp.'), m)
         if ((global.db.bots.some(v => v.jid === parent.decodeJid(p.jid)) || global.db.bots.some(v => v.jid === parent.decodeJid(m.sender)) || global.db.bots.some(v => v.sender === parent.decodeJid(m.sender)) || global.db.bots.some(v => v.jid === parent.decodeJid(m.sender))) && global.db.bots.length > 0) return m.reply(Func.texted('bold', `🚩 Number already hosted.`))
         m.react('🕒')
         parent.tryConnect = parent.tryConnect ? parent.tryConnect : []
         if (!global.db.bots.some(v => v.jid === parent.decodeJid(p.jid) && v.sender === m.sender) && global.db.bots.length >= 5) return m.reply(Func.texted('bold', `🚩 Sorry, slots are full.`))
         if (/jadibot/.test(command) && global.db.bots.some(v => v.sender === p.jid && v.is_connected)) return m.reply(`✅ Your bot is connected.`)
         if (/jadibot/.test(command) && parent.decodeJid(parent.user.id) != env.pairing.number + '@s.whatsapp.net') return m.reply(`🪸 Chat the main bot here : https://wa.me/${env.pairing.number}?text=jadibot`)
         var credsExists = global.db.bots.find(v => v.sender === p.jid && !v.is_connected && v.session)
         var sessionPath = credsExists ? credsExists.sender.split('@')[0] : p.jid.split('@')[0]
         if (credsExists && !fs.existsSync(`./${env.bot_hosting.session_dir}/${sessionPath}`)) {
            fs.mkdirSync(`./${env.bot_hosting.session_dir}/${sessionPath}`)
         }

         if (parent.tryConnect.length > 0 && parent.tryConnect.some(v => v.jid === m.sender)) return m.reply(`❌ Previous request has not been completed.`)
         parent.tryConnect.push({
            jid: m.sender,
            retry: 0
         })

         const client = new Baileys({
            type: '--neoxr-v1',
            plugsdir: 'plugins',
            sf: `${env.bot_hosting.session_dir}/${sessionPath}`,
            online: true,
            version: env.pairing.version
         }, {
            pairing: {
               state: true,
               number: parent.decodeJid(p.jid).split`@`[0]
            }
         })

         client.on('connect', async json => {
            let text = `乂  *L O G I N*\n\n`
            text += `1. On Whatsapp homepage press *( ⋮ )* in the upper right corner and select *Linked Devices*.\n`
            text += `2. Tap "Link with phone number instead"\n`
            text += `3. Enter this code : *${json.code}*\n`
            text += `4. Code will expire in 60 seconds.\n\n`
            text += global.footer
            let tr = parent.tryConnect.find(v => v.jid === m.sender)
            if (!tr) return
            tr.retry++
            if (json.constructor.name === 'Object' && json.code) return parent.sendFile(m.chat, fs.readFileSync('./media/image/thumb.jpg'), '', text, m).then(async () => {
               await Func.delay(60_000)
               if (global.db.bots.find(v => v.jid === p.jid && v.is_connected)) return
               m.reply(`❌ Pairing code expired.`).then(() => {
                  clearTimeout(json.timeout)
                  client.sock.end()
               })
               Func.removeItem(parent.tryConnect, tr)
               fs.rmSync(`./${env.bot_hosting.session_dir}/${sessionPath}`, {
                  recursive: true,
                  force: true
               })
            })
         })

         client.on('error', async error => {
            if (error.message === 'Bad session file') return
            if ( // have to delete the session
               error.message === 'Device logged out' ||
               error.message === 'Multi device mismatch' ||
               error.message === 'Method not allowed'
            ) {
               parent.reply(m.chat, error.message).then(() => {
                  client.sock.end()
                  Func.removeItem(global.db.bots, global.db.bots.find(v => v.jid === p.jid))
                  if (fs.existsSync(`./${env.bot_hosting.session_dir}/${sessionPath}`)) {
                     fs.rmSync(`./${env.bot_hosting.session_dir}/${sessionPath}`, {
                        recursive: true,
                        force: true
                     })
                  }
               })
            }
         })

         client.on('ready', async () => {
            require('../../lib/system/config'), require('../../lib/system/baileys'), require('../../lib/system/functions'), require('../../lib/system/scraper')
            m.reply(`✅ Your WhatsApp account has successfully connected.`).then(() => {
               parent.reply(env.owner + '@c.us', `📩 New bot connected : @${parent.decodeJid(p.jid).replace(/@.+/, '')}`)
               if (credsExists) {
                  credsExists.is_connected = true
                  credsExists.last_connect = new Date * 1
               }
               let tr = parent.tryConnect.find(v => v.jid === m.sender)
               if (!tr) return
               Func.removeItem(parent.tryConnect, tr)
            })
            let isBot = global.db.bots.find(v => v.jid == parent.decodeJid(p.jid))
            if (isBot) {
               isBot.is_connected = true
               isBot.last_connect = new Date * 1
            } else {
               global.db.bots.push({
                  jid: parent.decodeJid(p.jid),
                  sender: m.sender,
                  last_connect: new Date * 1,
                  is_connected: true,
                  session: fs.existsSync(`./${env.bot_hosting.session_dir}/${sessionPath}`) ? true : false,
                  data: {}
               })
            }
         })

         client.on('message', ctx => require('../../handler')(client.sock, ctx))

         /* print deleted message object */
         client.on('message.delete', ctx => {
            const sock = client.sock
            if (!ctx || ctx.origin.fromMe || ctx.origin.isBot) return
            if (cache.has(ctx.origin.sender) && cache.get(ctx.origin.sender) === 1) return
            cache.set(ctx.origin.sender, 1)
            if (Object.keys(ctx.delete.message) < 1) return
            if (ctx.origin.isGroup && global.db.groups.some(v => v.jid == ctx.origin.chat) && global.db.groups.find(v => v.jid == ctx.origin.chat).antidelete) return sock.copyNForward(ctx.origin.chat, ctx.delete)
         })

         client.on('group.add', async ctx => {
            const sock = client.sock
            const text = `Thanks +tag for joining into +grup group.`
            if (!global.db) return
            const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
            try {
               var pic = await sock.profilePictureUrl(ctx.member, 'image')
               if (!pic) {
                  var pic = 'https://qu.ax/uPqo.jpg'
               }
            } catch {
               var pic = 'https://qu.ax/uPqo.jpg'
            }

            /* localonly to remove new member when the number not from indonesia */
            if (groupSet && groupSet.localonly) {
               if (global.db.users.some(v => v.jid == ctx.member) && !global.db.users.find(v => v.jid == ctx.member).whitelist && !ctx.member.startsWith('62') || !ctx.member.startsWith('62')) {
                  sock.reply(ctx.jid, Func.texted('bold', `Sorry @${ctx.member.split`@`[0]}, this group is only for indonesian people and you will removed automatically.`))
                  sock.updateBlockStatus(member, 'block')
                  return await Func.delay(2000).then(() => sock.groupParticipantsUpdate(ctx.jid, [ctx.member], 'remove'))
               }
            }

            const welcome = await new canvafy.WelcomeLeave()
               .setAvatar(pic)
               .setBackground('image', 'https://qu.ax/NAuSj.jpeg')
               .setTitle('Welcome')
               .setDescription(`Welcome to ${ctx.subject}, please read the rules and enjoy your stay.`)
               .setBorder('#2a2e35')
               .setAvatarBorder('#2a2e35')
               .setOverlayOpacity(0.3)
               .build()

            const txt = (groupSet && groupSet.text_welcome ? groupSet.text_welcome : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`)
            if (groupSet && groupSet.welcome) sock.sendMessageModify(ctx.jid, txt, null, {
               largeThumb: true,
               thumbnail: welcome,
               url: global.db.setting.link
            })
         })

         client.on('group.remove', async ctx => {
            const sock = client.sock
            const text = `Good bye +tag :)`
            if (!global.db) return
            const groupSet = global.db.groups.find(v => v.jid == ctx.jid)
            try {
               var pic = await sock.profilePictureUrl(ctx.member, 'image')
               if (!pic) {
                  var pic = 'https://qu.ax/uPqo.jpg'
               }
            } catch {
               var pic = 'https://qu.ax/uPqo.jpg'
            }

            const leave = await new canvafy.WelcomeLeave()
               .setAvatar(pic)
               .setBackground('image', 'https://qu.ax/NAuSj.jpeg')
               .setTitle('Leave')
               .setDescription(`Good bye.`)
               .setBorder('#2a2e35')
               .setAvatarBorder('#2a2e35')
               .setOverlayOpacity(0.3)
               .build()

            const txt = (groupSet && groupSet.text_left ? groupSet.text_left : text).replace('+tag', `@${ctx.member.split`@`[0]}`).replace('+grup', `${ctx.subject}`)
            if (groupSet && groupSet.welcome) sock.sendMessageModify(ctx.jid, txt, null, {
               largeThumb: true,
               thumbnail: leave,
               url: global.db.setting.link
            })
         })

         client.on('caller', ctx => {
            if (typeof ctx === 'boolean') return
            client.sock.updateBlockStatus(ctx.jid, 'block')
         })
      } catch (e) {
         parent.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}