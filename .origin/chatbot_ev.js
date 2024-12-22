const axios = require('axios')
exports.run = {
   async: async (m, {
      client,
      body,
      chats,
      users,
      setting,
      isOwner,
      env,
      Func,
      Scraper
   }) => {
      try {
         global.db.chatbot = global.db.chatbot ? global.db.chatbot: []
         const history = global.db.chatbot.find(v => v.jid === m.sender)
         if (m.isGroup) {
            for (let jid of [...new Set([...(m.mentionedJid || [])])]) {
               if (jid != client.decodeJid(client.user.id)) continue
               if (!m.fromMe) {
                  const less = '@' + client.decodeJid(client.user.id).replace(/@.+/, '')
                  const text = body.replace(less, '').trim()
                  if (!text) return m.reply('?')
                  const completions = (history && history.completions) ? history.completions: []
                  const json = await chatbot(text, completions)
                  if (!json.status) return m.reply(json.msg)
                  if (history) {
                     history.completions = json.data.history
                  } else {
                     global.db.chatbot.push({
                        jid: m.sender,
                        completions: json.data.history
                     })
                  }
                  if (!json.status) return m.reply(json.msg)
                  m.reply(json.data.message)
               }
            }
         } else {
            if (!setting.chatbot || setting.except.includes(m.sender.replace(/@.+/, '')) || !/conversation|extended/.test(m.mtype)) return
            const completions = (history && history.completions) ? history.completions: []
            const json = await chatbot(body, completions)
            if (!json.status) return m.reply(json.msg)
            if (history) {
               history.completions = json.data.history
            } else {
               global.db.chatbot.push({
                  jid: m.sender,
                  completions: json.data.history
               })
            }
            if (!json.status) return m.reply(json.msg)
            m.reply(json.data.message)
         }
      } catch (e) {
         console.log(e)
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}

const chatbot = async (prompt, history = [], model) => {
   try {
      let form = new URLSearchParams
      form.append('prompt', prompt)
      form.append('history', JSON.stringify(history))
      const json = await (await axios.post('https://chat.nxr.my.id', form)).data
      return json
   } catch (e) {
      return {
         creator: global.creator,
         status: false,
         msg: e.message
      }
   }
}