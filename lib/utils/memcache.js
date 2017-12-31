export default class MemCache {
	constructor(opts) {
		this.defaultTTL = (opts && opts.ttl) || 300000;
		this.store = this.store.bind(this);
		this.get = this.get.bind(this);
		this._items = {};
	}
	getKey(obj) {
		switch (typeof obj) {
			case "string":
				return obj;
			case "object":
				return JSON.stringify(obj);
			case "undefined":
				throw "Key cannot be null";
		}
	}
	hasKey(key) {
		return this._items.hasOwnProperty(this.getKey(key));
	}
	get(key) {
		let _key = this.getKey(key);
		return (this._items[_key] && this._items[_key].value) || undefined;
	}
	store(key, value, ttl = this.defaultTTL) {
		let _key = this.getKey(key);
		if (this._items[_key]) {
			clearTimeout(this._items[_key].handle);
		}
		let handle = setTimeout(this.remove.bind(this, _key), ttl);
		this._items[_key] = { value, handle };
	}
	remove(key) {
		delete this._items[key];
	}
}
