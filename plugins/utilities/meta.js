/* Meta AI (Beta)
 * ID : Fitur ini hanya sementara karena web www.meta.ai belum sepenuhnya stabil dan sewaktu waktu data payload bisa berubah + low response.
 * EN : This feature is only temporary because the www.meta.ai website is not yet completely stable and at any time the payload data can change + the response is low.
 */

exports.run = {
   usage: ['meta'],
   use: 'prompt',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      Func
   }) => {
      try {
         // client.meta = client.meta ? client.meta : []
         global.db.meta = global.db.meta ? global.db.meta : {}
         if (!text) return client.reply(m.chat, Func.texted('bold', `🚩 Please provide a prompt.`), m)
         client.sendReact(m.chat, '🕒', m.key)
         // if (client.meta.includes(m.sender)) return client.reply(m.chat, Func.texted('bold', `🚩 Please wait for the previous request to finish.`), m)
         // if (!client.meta.includes(m.sender)) {
         //    client.meta.push(m.sender)
         // }
         if (global.db.meta[m.sender]) {
            const json = await Api.neoxr('/meta', {
               q: encodeURIComponent(text),
               session: global.db.meta[m.sender].session
            })
            if (!json.status) return client.reply(m.chat, Func.texted('bold', `🚩 ${json.msg}`), m).then(() => {
               // client.meta.splice(client.meta.indexOf(m.sender), 1)
            })
            if (json?.data?.message) return m.reply(json.data.message)
            if (json?.data?.media) {
               for (let image of json.data.media) {
                  client.sendFile(m.chat, image.uri, '', `*ID* : ${image.id}`, m)
                  await Func.delay(1100)
               }
               // client.meta.splice(client.meta.indexOf(m.sender), 1)
            }
         } else {
            global.db.meta[m.sender] = {}
            const json = await Api.neoxr('/meta', {
               q: encodeURIComponent(text)
            })
            if (!json.status) return client.reply(m.chat, Func.texted('bold', `🚩 ${json.msg}`), m).then(() => {
               // client.meta.splice(client.meta.indexOf(m.sender), 1)
            })
            if (json?.data?.message) return m.reply(json.data.message).then(() => {
               global.db.meta[m.sender].session = json.data.session
            })
            if (json?.data?.media) {
               for (let image of json.data.media) {
                  client.sendFile(m.chat, image.uri, '', `*ID* : ${image.id}`, m)
                  await Func.delay(1100)
               }
               global.db.meta[m.sender].session = json.data.session
               // client.meta.splice(client.meta.indexOf(m.sender), 1)
            }
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}