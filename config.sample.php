<?php

// Users can be authenticated other ways, but this uses sesisons (will need to modify ArrestDB_Security::whitelist(...) if want to change)
if (session_id() == '') session_start();

$dsn = '';

class ArrestDB_Custom {
	public static function RUN() {
		// ArrestDB::Serve('GET', '/(custom)/(#num)', function($table, $id) {
		// 	return ArrestDB::Reply('Custom Response ' . $id);
		// });
	}
}

// Proposed user table column (store authenticated in session): access, type int
// My Convention (can be changed as desired)
//     0: Global
//     1: User
//     2: Admin
class ArrestDB_Security {

	// No value in whitelist assumes disabled call
	private static $WHITELIST = array(
		// 'table_name_1' => array(
		// 	'0' => array(
		// 		'actions' => array('GET'),
		// 		'fields'  => array('field_1', 'field_2'),
		// 	),
		// 	'1' => array(
		// 		'actions' => array('GET', 'PUT', 'POST'),
		// 		'fields'  => array('field_1', 'field_2', 'semi_secret_field'),
		// 	),
		// 	'2' => array(
		// 		'actions' => array('GET', 'PUT', 'POST', 'DELETE'),
		// 		'fields'  => array('field_1', 'field_2', 'semi_secret_field', 'super_secret_field'),
		// 	),
		// ),
		// 'table_name_2' => array(
		// 	'0' => array(
		// 		'actions' => array('GET'),
		// 		'fields'  => array('field_1', 'field_2'),
		// 	),
		// 	'1' => array(
		// 		'actions' => array('GET', 'PUT', 'POST'),
		// 		'fields'  => array('field_1', 'field_2', 'semi_secret_field'),
		// 	),
		// 	'2' => array(
		// 		'actions' => array('GET', 'PUT', 'POST', 'DELETE'),
		// 		'fields'  => array('field_1', 'field_2', 'semi_secret_field', 'super_secret_field'),
		// 	),
		// ),
	);

	public static function whitelist($table, $area) {
		$access = @$_SESSION['user']['access'];

		$result = array();
		if (array_key_exists($table, self::$WHITELIST)) {
			$access = isset($access) ? intval($access) : 0 ;

			// decrementing until we find 0 or some form of security
			while ( !array_key_exists($access, self::$WHITELIST[ $table ]) && $access > 0 ) $access--;

			// Make sure we didn't hit rock bottom
			if ( array_key_exists($access, self::$WHITELIST[ $table ]) ) $result = self::$WHITELIST[ $table ][ $access ][ $area ];
		}
		return $result;
	}
}
