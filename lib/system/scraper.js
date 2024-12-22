const { Scraper } = new(require('@neoxr/wb'))
const axios = require('axios'),
   cheerio = require('cheerio'),
   FormData = require('form-data'),
   fetch = require('node-fetch'),
   { fromBuffer } = require('file-type')

Scraper.simsimiV2 = (text, lang) => {
   return new Promise(async resolve => {
      try {
         let form = new URLSearchParams
         form.append('text', text)
         form.append('lc', lang)
         const json = await (await axios.post('https://api.simsimi.vn/v1/simtalk', form, {
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
            }
         })).data
         if (json.status != 'success') return resolve({
            creator: global.creator,
            status: false,
            msg: 'Error !!'
         })
         resolve({
            creator: global.creator,
            status: true,
            msg: json.message
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })
}

Scraper.pornDetector = stream => new Promise(async resolve => {
   try {
      let form = new FormData()
      form.append('media', stream)
      form.append('models', 'nudity-2.1,weapon,alcohol,recreational_drug,medical,offensive,text-content,face-attributes,gore-2.0,text,violence,money,gambling');
      form.append('api_user', process.env.API_USER)
      form.append('api_secret', process.env.API_SECRET)
      const result = await axios.post('https://api.sightengine.com/1.0/check.json', form, {
         headers: form.getHeaders()
      })
      if (result.status == 200) {
         if (result.data.status == 'success') {
            if (result.data.nudity.sexual_activity >= 0.50 || result.data.nudity.suggestive >= 0.50 || result.data.nudity.erotica >= 0.50) return resolve({
               creator: global.creator,
               status: true,
               msg: `Nudity Content : ${(result.data.nudity.sexual_activity >= 0.50 ? result.data.nudity.sexual_activity * 100 : result.data.nudity.suggestive >= 0.50 ? result.data.nudity.suggestive * 100 :  result.data.nudity.erotica >= 0.50 ? result.data.nudity.erotica * 100 : 0)}%`
            })
            if (result.data.weapon > 0.50) return resolve({
               creator: global.creator,
               status: true,
               msg: `Provocative Content : ${result.data.weapon * 100}%`
            })
         } else return resolve({
            creator: global.creator,
            status: false
         })
      } else return resolve({
         creator: global.creator,
         status: false
      })
   } catch (e) {
      return resolve({
         creator: global.creator,
         status: false,
         msg: e.message
      })
   }
})

Scraper.quax = buffer => new Promise(async resolve => {
   try {
      const getExt = async buffer => {
         try {
            const { ext } = await require('file-type').fromBuffer(buffer)
            return ext ? ext : 'txt'
         } catch {
            return 'txt'
         }
      }
      let form = new FormData
      form.append('files[]', Buffer.from(buffer), `${Date.now()}.${await getExt(buffer)}`)
      const json = await (await axios.post('https://qu.ax/upload.php', form, {
         headers: {
            'Origin': 'https://qu.ax',
            'Referer': 'https://qu.ax/',
            ...form.getHeaders(),
            'user-agent': 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
         }
      })).data
      if (!json.success) return resolve({
         status: false,
         msg: `Upload failed!`
      })
      resolve({
         status: true,
         data: json.files[0]
      })
   } catch (e) {
      console.error(e)
      resolve({
         status: false,
         msg: e.message
      })
   }
})