const moment = require('moment-timezone')
exports.run = {
	async: async (m, {
		client,
		body,
		setting,
		isOwner,
		env,
		Func
	}) => {
		try {
			if (body && env.evaluate_chars.some(v => body.startsWith(v)) || body && Func.socmed(body) || !/conversation|extended|interactiveResponseMessage/.test(m.mtype)) return
			setting.dial = setting.dial ? setting.dial : []
			const content = setting.dial.sort((a, b) => a.created_at - b.created_at)[Number(body) - 1]
			if (content && !setting.lock) {
				// if (!isOwner) return m.reply(global.status.owner)
				let p = `*${content.title.toUpperCase()}*\n`
				p += `*Updated* : ${moment(content.updated_at).format('DD/MM/YYYY HH:mm:ss')} WIB\n\n`
				p += content.response
				m.reply(p)
			}
		} catch (e) {
			console.log(e)
			client.reply(m.chat, Func.jsonFormat(e), m)
		}
	},
	error: false,
	private: true,
	cache: true,
	location: __filename
}