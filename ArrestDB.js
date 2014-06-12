

var ArrestDB = function () {
	var base = './';
	var global_map = {}; // hashmap of all created tables (singleton-ish)

	// Check if ArrestDB response status (reject if necessary)
	var check_valid = function (data) {
		return new Promise(function (resolve, reject) {
			try {
				data = JSON.parse(data);
				if (data.hasOwnProperty('error')) reject( new Error(data.error) );
				else resolve( data );
			} catch (e) {
				reject(e);
			}
		});
	};

	// Promise wrapped XMLHttpRequest()
	var http = function (method, url, data) {
		return new Promise(function (resolve, reject) {
			var req = new XMLHttpRequest();
			req.open(method, url);
			req.onload = function () {
				if (req.status == 200) resolve( req.response );
				else reject( new Error(req.statusText) );
			};
			req.onerror = reject;
			req.send(data);
		}).then( check_valid ); // Add ArrestDB validity checker
	};

	// service declaration
	var service = function (table, identifier) {
		if (!table) throw new Error('Table is Required');
		this._callbacks = [];
		this.table = table;
		this.id = identifier || (table + 'ID');
		global_map.hasOwnProperty(table) ? this.list = global_map[table] : global_map[table] = this.list ;
	};

	// service.left_join // TODO

	// service.left_join_many // TODO: return hash map on each item of many to one ties

	service.prototype = {
		all: function () {
			return http('GET', base + this.table); // .then(/* manage list (all) */).then(/* call callbacks */);
		},
		get: function (value, field) {
			// TODO: lookup in local list if available (return Promise.resolve('found result'))
			return http('GET', base + this.table + ( field ? '/' + field : '' ) + '/' + value); // .then(/* manage list (get) */).then(/* call callbacks */);
		},
		set: function (item) {
			return http('PUT', base + this.table + '/' + item[this.id], item); // .then(/* manage list (set) */).then(/* call callbacks */);
		},
		rem: function (item) {
			return http('DELETE', base + this.table + '/' + item[this.id]); // .then(/* manage list (rem) */).then(/* call callbacks */);
		},
		add: function (item) {
			return http('POST', base + this.table, item); // .then(/* manage list (add) */).then(/* call callbacks */);
		},
		list: [],

		// Old, dumb callbacks
		add_cb: function (c) {
			this._callbacks.push(cb);
		},
		rem_cb: function (cb) {
			var idx = this._callbacks.indexOf(cb);
			if (idx >= 0) this._callbacks.splice(idx, 1);
		},

		// // Callbacks
		// cb: {
		// 	any: callbacks('any'), // assign add and rem
		// 	all: callbacks('all'),
		// 	get: callbacks('get'),
		// 	set: callbacks('set'),
		// 	rem: callbacks('rem'),
		// 	add: callbacks('add'),
		// }
		// var callbacks = function (area) {
		// 	var add = function () {

		// 	};
		// 	var rem = function () {

		// 	};
		// };
	};

	return service;
}();
