/*!
 * ArrestDB-js 0.0.0 (https://github.com/bign8/ArrestDB/tree/ng)
 * Author: bign8 (https://github.com/bign8)
 * Licensed under MIT (https://github.com/bign8/ArrestDB/blob/ng/LICENSE)
 */
angular.module('ArrestDB', []).

factory('ArrestDB', ['$http', 'ArrestDB_base', function ($http, ArrestDB_base) { // TODO: improve with browser data cashe
	var cleanup = function (result) { return result.data.hasOwnProperty('error') ? [] : result.data; };
	var rem_obj = function (item) {
		for (var i = 0, l = this.list.length; i < l; i++) if ( item[this.id] == this.list[i][this.id] ) {
			this.list.splice(i, 1);
			break;
		};
		return item;
	};
	var add_obj = function (item, data) {
		item[ this.id ] = data.success.insertID;
		this.list.push(item);
		return item;
	};
	var mod_obj = function (item, data) {
		if (data.hasOwnProperty('success')) for (var i = 0; i < this.list.length; i++) if (this.list[i][this.id] == item[this.id]) {
			this.list[i] = item;
			break;
		}
		return item;
	};
	var callback = function (data) {
		for (var i = 0; i < this.callbacks.length; i++) this.callbacks[i].call(this, data);
		return data;
	};
	var service = function(table, identifier, cb, suffix) {
		this.list = [];
		this.callbacks = [];
		this.table = table;
		this.id = identifier || (table + 'ID'); // standard convention (tablename + ID, ie: faq = faqID)
		this.all(suffix).then(angular.extend.bind(undefined, this.list)).then(callback.bind(this)).then(cb);
	};
	service.left_join = function (left, right) {
		var list = [];
		var manual_join = function (data) {
			if (!left.list.length) return angular.copy([], list); // don't waste time
			angular.copy(left.list, list);
			var map = {}; // O(n + m) join ( because of hash lookup O(n*ln(m)) )
			for (var i = 0, l = right.list.length; i < l; i++) map[ right.list[i][left.id] ] = right.list[i];
			for (var i = 0, l = list.length; i < l; i++) angular.extend( list[i], map[ list[i][left.id] ] || null );
			return data;
		};
		left.add_cb( manual_join );
		right.add_cb( manual_join );
		manual_join();
		return list;
	};
	service.left_join_many = function (left, right, id) {
		var manual_join = function (data) {
			if (!left.list.length || !right.list.length) return; // wasteing time
			var map = {}, O = undefined;
			for (var i = 0, l = right.list.length; i < l; i++) {
				O = right.list[ i ];
				if ( map.hasOwnProperty( O[left.id] ) ) map[ O[left.id] ].push( O[ id ] );
				else map[ O[left.id] ] = [ O[ id ] ];
			}
			for (var i = 0, l = left.list.length; i < l; i++) left.list[i][ id ] = map[ left.list[i][left.id] ] || [];
			return data;
		};
		left.add_cb( manual_join );
		right.add_cb( manual_join );
		manual_join();
	};
	service.prototype = {
		all: function (suffix) {
			return $http.get(ArrestDB_base + this.table + (suffix ? suffix : '')).then( cleanup.bind(this) ).then( angular.extend.bind(undefined, this.list) ).then( callback.bind(this) );
		},
		get: function (itemID, suffix) {
			return $http.get(ArrestDB_base + this.table + '/' + itemID + (suffix ? suffix : '')).then( cleanup.bind(this) ).then( callback.bind(this) );
		},
		set: function (item) {
			return $http.put(ArrestDB_base + this.table + '/' + item[ this.id ], item).then( cleanup.bind(this) ).then( mod_obj.bind(this, item) ).then( callback.bind(this) );
		},
		rem: function (item) {
			return $http.delete(ArrestDB_base + this.table + '/' + item[ this.id ]).then( cleanup.bind(this) ).then( rem_obj.bind(this, item) ).then( callback.bind(this) );
		},
		add: function (item) {
			return $http.post(ArrestDB_base + this.table, item).then( cleanup.bind(this) ).then( add_obj.bind(this, item) ).then( callback.bind(this) );
		},
		add_cb: function (cb) {
			this.callbacks.push(cb);
		},
		rem_cb: function (cb) {
			var idx = this.callbacks.indexOf(cb);
			if (idx >= 0) this.callbacks.splice(idx, 1);
		},
	};
	return service;
}]);