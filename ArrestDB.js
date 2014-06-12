

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

	// Update client copy of list
	var update_all = function (data) { // this.list = data; While maintaining reference to this.list
		while (this.list.length) this.list.pop();
		for (var i = 0, l = data.length; i < l; i++) this.list[i] = data[i];
		return this.list;
	};
	var update_get = function (data) {
		if (data.length) return data; // WTF is this
		for (var i = 0, len = this.list.length, target = data[this.id]; i < len; i++) 
			if (target == this.list[i][this.id]) this.list[i] = data;
		return data;
	};
	var update_set = function (data) {
		// TODO
		return data;
	};
	var update_rem = function (data) {
		// TODO
		return data;
	};
	var update_add = function (data) {
		// TODO
		return data;
	};

	// service declaration
	var service = function (table, identifier) {
		if (!table) throw new Error('Table is Required');
		this.table = table;
		this.id = identifier || (table + 'ID');
		global_map.hasOwnProperty(table) ? this.list = global_map[table] : global_map[table] = this.list ;
	};

	// service.left_join // TODO

	// service.left_join_many // TODO: return hash map on each item of many to one ties

	service.prototype = {
		all: function () {
			return http('GET', base + this.table).then( update_all.bind(this) );
		},
		get: function (value, field) {
			// TODO: lookup in local list if available (return Promise.resolve('found result'))
			return http('GET', base + this.table + ( field ? '/' + field : '' ) + '/' + value).then( update_get.bind(this) );
		},
		set: function (item) {
			return http('PUT', base + this.table + '/' + item[this.id], item); // .then(/* manage list (set) */);
		},
		rem: function (item) {
			return http('DELETE', base + this.table + '/' + item[this.id]); // .then(/* manage list (rem) */);
		},
		add: function (item) {
			return http('POST', base + this.table, item); // .then(/* manage list (add) */);
		},
		list: [],
	};

	return service;
}();
