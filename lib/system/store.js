module.exports = store => {
	try {
	    store.fromJSON(JSON.parse(global.db.memoryStore))
	} catch {
		global.db.memoryStore = global.db.memoryStore ? global.db.memoryStore : JSON.stringify(store.toJSON())
		store.fromJSON(JSON.parse(global.db.memoryStore))
	}
}