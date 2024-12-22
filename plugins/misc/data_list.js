exports.run = {
	usage: ['listban', 'listprem', 'listblock', 'listmod', 'listowner', 'listtoxic'],
	category: 'miscs',
	async: async (m, {
		client,
		command,
		isOwner,
		isModerator,
		env,
		blockList,
		setting,
		Func
	}) => {
		if (command === 'listban') {
			const data = global.db.users.filter(v => v.banned)
			if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
			let text = `乂  *L I S T B A N*\n\n`
			text += data.map((v, i) => {
				if (i == 0) {
					return `┌  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
				} else if (i == data.length - 1) {
					return `└  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
				} else {
					return `│  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
				}
			}).join('\n')
			m.reply(text + '\n\n' + global.footer)
		} else if (command === 'listprem') {
			if (!isOwner) return m.reply(global.status.owner)
			const data = global.db.users.filter(v => v.premium)
			if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
			let text = `乂  *L I S T P R E M*\n\n`
			text += data.map((v, i) => {
				if (i == 0) {
					return `┌  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
				} else if (i == data.length - 1) {
					return `└  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
				} else {
					return `│  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
				}
			}).join('\n')
			m.reply(text + '\n\n' + global.footer)
		} else if (command === 'listblock') {
			if (blockList.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
			let text = `乂  *L I S T B L O C K*\n\n`
			text += blockList.map((v, i) => {
				if (i == 0) {
					return `┌  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
				} else if (i == blockList.length - 1) {
					return `└  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
				} else {
					return `│  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
				}
			}).join('\n')
			m.reply(text + '\n\n' + global.footer)
		} else if (command === 'listmod') {
			if (!isModerator) return m.reply(global.status.owner)
			const data = global.db.setting.moderators
			if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
			let text = `乂  *L I S T M O D*\n\n`
			text += data.map((v, i) => {
				if (i == 0) {
					return `┌  ◦  @${v}`
				} else if (i == data.length - 1) {
					return `└  ◦  @${v}`
				} else {
					return `│  ◦  @${v}`
				}
			}).join('\n')
			m.reply(text + '\n\n' + global.footer)
		} else if (command === 'listowner') {
			if (!isModerator) return m.reply(global.status.owner)
			const data = [client.decodeJid(client.user.id).replace(/@.+/, ''), env.owner, ...setting.owners]
			if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
			let text = `乂  *L I S T O W E R*\n\n`
			text += data.map((v, i) => {
				if (i == 0) {
					return `┌  ◦  @${v}`
				} else if (i == data.length - 1) {
					return `└  ◦  @${v}`
				} else {
					return `│  ◦  @${v}`
				}
			}).join('\n')
			m.reply(text + '\n\n' + global.footer)
		}  else if (command === 'listtoxic') {
			if (setting.toxic.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
			const data = setting.toxic.sort((a, b) => a.localeCompare(b))
			let text = `乂  *L I S T O X I C*\n\n`
			text += data.map((v, i) => {
				if (i == 0) {
					return `┌  ◦  ${v}`
				} else if (i == data.length - 1) {
					return `└  ◦  ${v}`
				} else {
					return `│  ◦  ${v}`
				}
			}).join('\n')
			m.reply(text + '\n\n' + global.footer)
		}
	},
	error: false,
	cache: true,
	location: __filename
}