"use strict";
require('./lib/system/config.js'), require('events').EventEmitter.defaultMaxListeners = 100
const { Baileys, Function: Func } = new (require('@neoxr/wb'))
const fs = require('fs'),
   canvafy = require('canvafy'),
   env = require('config.json')
const cache = new (require('node-cache'))({
   stdTTL: env.cooldown
})

module.exports = async (jid, client) => {
   const p = (await client.onWhatsApp(jid))[0] || {}
   const credsExists = global.db.bots.find(v => v.jid === p.jid && !v.is_connected && v.session)
   const sessionPath = credsExists ? credsExists.jid.split('@')[0] : p.jid.split('@')[0]
   if (credsExists && !fs.existsSync(`./${env.bot_hosting.session_dir}/${sessionPath}/creds.json`)) {
      client.reply(p.jid, `❌ Session file not found, try again.`).then(() => {
         fs.rmSync(`./${env.bot_hosting.session_dir}/${p.jid.replace(/@.+/, '')}`, {
            recursive: true,
            force: true
         })
         Func.removeItem(global.db.bots, global.db.bots.find(v => v.jid === p.jid))
      })
      return
   } else {
      client.tryConnect = client.tryConnect ? client.tryConnect : []
      client.tryConnect.push({
         jid: p.jid,
         retry: 0
      })

      const connect = new Baileys({
         type: '--neoxr-v1',
         plugsdir: 'plugins',
         sf: `${env.bot_hosting.session_dir}/${jid.split('@')[0]}`,
         online: true,
         version: env.pairing.version
      }, {
         setup: env.setup,
         browser: ['Ubuntu', 'Firefox', '20.0.00']
      })

      /* print error */
      connect.once('error', async error => {
         await Func.delay(1000)
         if (error.message === 'Bad session file') return
         if ( // have to delete the session
            error.message === 'Device logged out' ||
            error.message === 'Multi device mismatch' ||
            error.message === 'Method not allowed'
         ) {
            client.reply(p.jid, error.message).then(() => {
               connect.sock.end()
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

      connect.once('connect', async json => {
         let tr = client.tryConnect.find(v => v.jid === jid)
         if (!tr) return
         tr.retry++
         if (json.constructor.name === 'Object' && json.code) {
            await Func.delay(60_000)
            if (tr.retry >= 1) {
               if (global.db.bots.find(v => v.jid === p.jid && v.is_connected)) return
               console.log(`❌ Pairing code expired, try again.`)
               Func.removeItem(client.tryConnect, tr)
               await Func.delay(1500)
               connect.sock.end()
               if (fs.existsSync(`./${env.bot_hosting.session_dir}/${sessionPath}`)) {
                  fs.rmSync(`./${env.bot_hosting.session_dir}/${sessionPath}`, {
                     recursive: true,
                     force: true
                  })
               }
            }
         }
      })

      /* bot is connected */
      connect.once('ready', async () => {
         if (credsExists) {
            credsExists.is_connected = true
            credsExists.last_connect = new Date * 1
         }
         let tr = client.tryConnect.find(v => v.jid === p.jid)
         if (!tr) return
         Func.removeItem(client.tryConnect, tr)
         let isBot = global.db.bots.find(v => v.jid == client.decodeJid(p.jid))
         if (isBot) {
            isBot.is_connected = true
            isBot.last_connect = new Date * 1
         } else {
            global.db.bots.push({
               jid: client.decodeJid(p.jid),
               sender: p.jid,
               last_connect: new Date * 1,
               is_connected: true,
               session: fs.existsSync(`./${env.bot_hosting.session_dir}/${sessionPath}`) ? true : false,
               data: {}
            })
         }
      })

      /* print all message object */
      connect.register('message', ctx => {
         require('./lib/system/baileys')(connect.sock)
         require('./lib/system/functions')
         require('./lib/system/scraper')
         require('./handler')(connect.sock, ctx)
      })

      /* print deleted message object */
      connect.register('message.delete', ctx => {
         const sock = connect.sock
         if (!ctx || ctx.origin.fromMe || ctx.origin.isBot) return
         if (cache.has(ctx.origin.sender) && cache.get(ctx.origin.sender) === 1) return
         cache.set(ctx.origin.sender, 1)
         if (Object.keys(ctx.delete.message) < 1) return
         if (ctx.origin.isGroup && global.db.groups.some(v => v.jid == ctx.origin.chat) && global.db.groups.find(v => v.jid == ctx.origin.chat).antidelete) return sock.copyNForward(ctx.origin.chat, ctx.delete)
      })

      connect.register('group.add', async ctx => {
         const sock = connect.sock
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

      connect.register('group.remove', async ctx => {
         const sock = connect.sock
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

      connect.register('caller', ctx => {
         if (typeof ctx === 'boolean') return
         connect.sock.updateBlockStatus(ctx.jid, 'block')
      })
   }
}