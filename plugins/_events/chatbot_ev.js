const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai')
const { GoogleAIFileManager } = require('@google/generative-ai/server')
const fs = require('fs')
const extension = require('file-type').fromBuffer
const mime = require('mime-types')
const axios = require('axios')
const FormData = require('form-data')
const bytes = require('bytes')
const parse = require('file-type').fromBuffer

exports.run = {
   async: async (m, {
      client,
      body,
      users,
      setting,
      env,
      Func,
      Scraper
   }) => {
      try {
         // clear first send : => db.autoai = []
         global.db.autoai = global.db.autoai ? global.db.autoai : []
         var session = global.db.autoai.find(v => v.jid === m.sender)
         if (!session) {
            global.db.autoai.push({
               jid: m.sender,
               history: []
            })
            var session = global.db.autoai.find(v => v.jid === m.sender)
         }

         if (m.sender != client.decodeJid(client.user.id) && !setting.except.includes(m.sender.replace(/@.+/, '')) && /conversation|extended|video|image|audio/.test(m.mtype)) {
            if (setting.chatbot && !m.isGroup && !env.evaluate_chars.some(v => body.startsWith(v))) {
               if (users.limit < 1) return client.reply(m.chat, Func.texted('bold', `🚩 Your limit is not enough to use this feature.`), m)
               await client.sendReact(m.chat, '🕒', m.key)
               const q = m.quoted ? m.quoted : m
               const mime = (q.msg || q).mimetype
               const max_size = '5MB'

               switch (true) {
                  // video & image (jpg/png)
                  case /video|image\/(jpe?g|png)/.test(mime): {
                     if ((q.msg || q).fileLength.low >= bytes(max_size)) return client.reply(m.chat, Func.texted('bold', `🚩 Maximum media size is 5 MB.`), m)
                     if (!body || (body && typeof body != 'string')) return
                     const buffer = await q.download()
                     const cdn = await upload(buffer)
                     if (!cdn.status) return
                     const json = await wrapAI(body, cdn.data.url, session.history || [])
                     if (!json.status) return client.reply(m.chat, Func.texted('bold', `❌ ${json.msg}`), m)
                     client.sendFromAI(m.chat, json.data.message, m).then(async () => {
                        session.history = json.data.history
                        users.limit -= 1
                     })
                  }
                     break

                  // audio
                  case /audio/.test(mime): {
                     if ((q.msg || q).fileLength.low >= bytes(max_size)) return client.reply(m.chat, Func.texted('bold', `🚩 Maximum media size is 5 MB.`), m)
                     if (!body || (body && typeof body != 'string')) return
                     const buffer = await q.download()
                     const cdn = await upload(buffer)
                     if (!cdn.status) return
                     const json = await wrapAI(body, cdn.data.url, session.history || [])
                     if (!json.status) return client.reply(m.chat, Func.texted('bold', `❌ ${json.msg}`), m)
                     client.sendFromAI(m.chat, json.data.message, m).then(async () => {
                        session.history = json.data.history
                        users.limit -= 1
                     })
                  }
                     break

                  // document
                  case /document/.test(q.mtype): {
                     if (q.fileLength.low >= bytes(max_size)) return client.reply(m.chat, Func.texted('bold', `🚩 Maximum media size is 5 MB.`), m)
                     const buffer = await q.download()
                     const cdn = await upload(buffer)
                     if (!cdn.status) return
                     const json = await wrapAI(body, cdn.data.url, session.history || [])
                     if (!json.status) return client.reply(m.chat, Func.texted('bold', `❌ ${json.msg}`), m)
                     client.sendFromAI(m.chat, json.data.message, m).then(async () => {
                        session.history = json.data.history
                        users.limit -= 1
                     })
                  }
                     break

                  // text
                  default: {
                     if (/conversation|extended/.test(m.mtype) && body && typeof body === 'string') {
                        const json = await wrapAI(body, null, session.history || [])
                        if (!json.status) return client.reply(m.chat, Func.texted('bold', `❌ ${json.msg}`), m)
                        client.sendFromAI(m.chat, json.data.message, m).then(async () => {
                           session.history = json.data.history
                           users.limit -= 1
                        })
                     }
                  }
               }
            }
         }
      } catch (e) {
         console.log(e)
         // client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   private: true,
   cache: true,
   location: __filename
}

class Utils {
   isUrl = url => {
      try {
         new URL(url)
         return true
      } catch {
         return false
      }
   }

   toBuffer = async i => {
      try {
         const file = Buffer.isBuffer(i) ? i : this.isUrl(i) ? await (await axios.get(i, {
            responseType: 'arraybuffer'
         })).data : null
         return Buffer.from(file)
      } catch (e) {
         return null
      }
   }

   randomString = length => {
      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < length; i++) {
         const randomIndex = Math.floor(Math.random() * characters.length)
         result += characters[randomIndex]
      }
      return result
   }
}

class Gemini extends Utils {
   constructor(apiKey) {
      super()
      this.apiKey = apiKey
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.fileManager = new GoogleAIFileManager(this.apiKey)
      this.model = this.genAI.getGenerativeModel({
         model: 'gemini-1.5-flash'
      })
      this.generationConfig = {
         temperature: 1,
         topP: 0.95,
         topK: 40,
         maxOutputTokens: 8192,
         responseMimeType: 'text/plain'
      }
   }

   uploadToGemini = (url, mimeType) => new Promise(async resolve => {
      const buffer = await this.toBuffer(url)
      if (!buffer) return resolve({
         status: false,
         message: 'File not found'
      })
      if (buffer.length > 5242880) return resolve({
         status: false,
         msg: 'File too large, max 5MB'
      })
      mimeType = mimeType || await (await extension(buffer))?.mime || 'text/plain'
      const fname = `${this.randomString(16)}.${mime.extension(mimeType)}`
      fs.writeFileSync(fname, buffer)
      const uploadResult = await this.fileManager.uploadFile(fname, {
         mimeType,
         displayName: fname,
      })
      fs.unlinkSync(fname)
      const file = uploadResult.file
      resolve({
         status: true,
         data: {
            file, url
         }
      })
   })

   waitForFilesActive = async (files) => {
      // console.log("Waiting for file processing...");
      for (const name of files.map((file) => file.name)) {
         let file = await this.fileManager.getFile(name)
         while (file.state === "PROCESSING") {
            process.stdout.write(".")
            await new Promise((resolve) => setTimeout(resolve, 10_000))
            file = await this.fileManager.getFile(name)
         }
         if (file.state !== "ACTIVE") {
            console.log(`File ${file.name} failed to process`);
         }
      }
      // console.log("...all files ready\n");
   }

   session = (histories = []) => {
      const chatSession = this.model.startChat({
         generationConfig: this.generationConfig,
         // safetySettings: Adjust safety settings
         // See https://ai.google.dev/gemini-api/docs/safety-settings
         history: [...new Set(histories)]
      })
      return chatSession
   }

   historyManager = array => {
      if (array.length >= 8) {
         array.splice(0, 2)
      }

      if (array[0]?.role === 'model') {
         array.splice(0, 1)
      }
      
      return array
   }

   chat = (prompt, history = []) => new Promise(async resolve => {
      try {
         let histories = history.length > 0 ? history : []
         histories.push({
            role: 'user',
            parts: [{
               text: prompt
            }]
         })

         var is_history = this.historyManager(histories)
         var result = await this.session(is_history).sendMessage(prompt)
         is_history.push(result.response.candidates[0].content)

         if (!result.response.text()) return resolve({
            status: false,
            msg: 'No response from AI'
         })

         resolve({
            status: true,
            data: {
               history: [...new Set(is_history)],
               question: prompt,
               message: result.response.text().replace(/\*\*/g, '*').trim()
            }
         })
      } catch (e) {
         resolve({
            status: false,
            msg: e.message
         })
      }
   })

   file = (file, prompt, history = []) => new Promise(async resolve => {
      try {
         const drive = await this.uploadToGemini(file)
         if (!drive.status) return resolve(drive)
         const files = [drive.data.file]
         await this.waitForFilesActive(files)
         let histories = history.length > 0 ? history : []
         histories.push({
            role: 'user',
            parts: [{
               fileData: {
                  mimeType: files[0].mimeType,
                  fileUri: files[0].uri
               }
            }, {
               text: prompt
            }]
         })

         var is_history = this.historyManager(histories)
         var result = await this.session(is_history).sendMessage(prompt || '.')
         is_history.push(result.response.candidates[0].content)

         if (!result.response.text()) return resolve({
            status: false,
            msg: 'No response from AI'
         })

         resolve({
            status: true,
            data: {
               file: drive.data.url,
               question: prompt,
               history: [...new Set(is_history)],
               message: result.response.text().replace(/\*\*/g, '*').trim()
            }
         })
      } catch (e) {
         console.log(e)
         resolve({
            status: false,
            msg: e.message
         })
      }
   })
}

const wrapAI = (prompt, file, history = []) => new Promise(async resolve => {
   try {
      const AI = new Gemini(process.env.GOOGLE_API) // initialize
      if (file) {
         var json = await AI.file(file, prompt, history || [])
      } else {
         var json = await AI.chat(prompt, history || [])
      }
      resolve(json)
   } catch (e) {
      resolve({
         creator: global.creator,
         status: false,
         msg: e.message
      })
   }
})

const upload = (i, extension) => new Promise(async (resolve, reject) => {
   try {
      if (!Buffer.isBuffer(i) && !util.isUrl(i)) return resolve({
         status: false,
         msg: 'only buffer and url formats are allowed'
      })
      const file = Buffer.isBuffer(i) ? i : util.isUrl(i) ? await (await axios.get(i, {
         responseType: 'arraybuffer'
      })).data : null
      let form = new FormData
      try {
         var { ext } = await parse(file)
      } catch (e) {
         var ext = 'txt'
      }
      form.append('someFiles', Buffer.from(file), 'file.' + (extension || ext))
      const json = await (await axios.post('https://s.neoxr.eu/api/upload', form, {
         headers: {
            ...form.getHeaders()
         }
      })).data
      resolve(json)
   } catch (e) {
      resolve({
         creator: global.creator,
         status: false,
         msg: e.message
      })
   }
})