module.exports = function (app, connection) {
	var md5 = require('md5');

	var request = {};
	var aColumns = [];
	var a = [];
	var sIndexColumn = '*';
	var sTable = 'orderview';

	var async = require('async');
	var dateFormat = require('dateformat');

	app.get('/dashboard', function (req, res) {
		var msg = req.flash('loginMessage')[0];
		res.render('dashboard', { layout: 'dashboard', message: msg });
	});

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/locations', function (req, res) {
		sql = "SELECT * FROM locations";
		connection.query(sql, function (err, results) {
			var msg = req.flash('orderMessage')[0];
			res.render('locations/locations', { layout: 'dashboard', message: msg, orders: results });
		});
	});

	app.get('/locations/add', function (req, res) {
		res.render('locations/add', { layout: 'dashboard' });
	});

	app.post('/locations/add', function (req, res) {
		var sql = "INSERT INTO locations SET `init` = '" + req.body.code + "', `sum` = '" + req.body.sum + "', `name` = '" + req.body.name + "', `street` = '" + req.body.street + "', `city` = '" + req.body.city + "', `person` = '" + req.body.person_name + "', `phone` = '" + req.body.phone_no + "', `fax` = '" + req.body.fax + "'";
		connection.query(sql);
		req.flash('message', 'Location added successfully');
		res.redirect('/locations');
	});

	app.get('/locations/edit/:id', function (req, res) {
		var sql = "SELECT * FROM locations WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			res.render('locations/edit', { layout: 'dashboard', result: results });
		});
	});

	app.post('/locations/edit/:id', function (req, res) {
		sql = "UPDATE locations SET `init` = '" + req.body.code + "', `sum` = '" + req.body.sum + "', `name` = '" + req.body.name + "', `street` = '" + req.body.street + "', `city` = '" + req.body.city + "', `person` = '" + req.body.person_name + "', `phone` = '" + req.body.phone_no + "', `fax` = '" + req.body.fax + "' WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('message', 'Location updated successfully');
			res.redirect('/locations');
		});
	});

	app.get('/locations/delete/:id', function (req, res) {
		sql = "DELETE FROM locations WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('message', 'Location deleted successfully');
			res.redirect('/locations');
		});
	});

	app.get('/components', function (req, res) {
		sql = "SELECT * FROM products ORDER BY `id` DESC";
		connection.query(sql, function (err, results) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('components/components', { layout: 'dashboard', message: msg, orders: results, part_nos: all_pn });
			});
		});
	});

	app.post('/components', function (req, res) {
		if (req.body.part_no == 'all') {
			var sql = "SELECT * FROM products ORDER BY `id` DESC";
		} else {
			var sql = "SELECT * FROM products WHERE `pn` LIKE '" + req.body.part_no + "%' ORDER BY `id` DESC";
		}
		connection.query(sql, function (err, results) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('components/components', { layout: 'dashboard', message: msg, orders: results, part_no: req.body.part_no, part_nos: all_pn });
			});
		});
	});

	app.get('/orders', function (req, res) {
		var msg = req.flash('orderMessage')[0];
		var sql = "SELECT * FROM orderview WHERE status != 4 AND ordered >= DATE(NOW()) - INTERVAL 7 DAY ORDER BY `id` DESC";
		connection.query(sql, function (err, rows) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('order/index', { layout: 'dashboard', orders: rows, message: msg, part_nos: all_pn });
			});
		});
	});

	app.get('/jma-orders', function (req, res) {
		var sql = "SELECT * FROM jmaview WHERE status != 4 AND ordered >= DATE(NOW()) - INTERVAL 7 DAY ORDER BY `id` DESC";
		connection.query(sql, function (err, rows) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('jma-order/index', { layout: 'dashboard', orders: rows, message: msg, part_nos: all_pn });
			});
		});
	});

	app.get('/warranties', function (req, res) {
		var msg = req.flash('orderMessage')[0];
		var sql = "SELECT * FROM warrantyview WHERE status != 4 AND ordered >= DATE(NOW()) - INTERVAL 7 DAY ORDER BY `id` DESC";
		connection.query(sql, function (err, rows) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('warranties/index', { layout: 'dashboard', orders: rows, message: msg, part_nos: all_pn });
			});
		});
	});

	app.get('/complete-orders', function (req, res) {
		var msg = req.flash('orderMessage')[0];
		connection.query("SELECT * FROM orderview WHERE `status` = 4 ORDER BY `id` DESC", function (err, rows) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('complete/complete', { layout: 'dashboard', orders: rows, message: msg, part_nos: all_pn });
			});
		});
	});

	app.get('/complete-jma-orders', function (req, res) {
		var msg = req.flash('orderMessage')[0];
		connection.query("SELECT * FROM jmaview WHERE `status` = 4 ORDER BY `id` DESC", function (err, rows) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('complete/jma-orders-complete', { layout: 'dashboard', orders: rows, message: msg, part_nos: all_pn });
			});
		});
	});

	app.get('/complete-warranties', function (req, res) {
		var msg = req.flash('orderMessage')[0];
		connection.query("SELECT * FROM warrantyview WHERE `status` = 4 ORDER BY `id` DESC", function (err, rows) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('complete/complete-warranties', { layout: 'dashboard', orders: rows, message: msg, part_nos: all_pn });
			});
		});
	});

	app.get('/orders/add', function (req, res) {
		res.render('order/add', { layout: 'dashboard' });
	});

	app.get('/jma-orders/add', function (req, res) {
		res.render('jma-order/add', { layout: 'dashboard' });
	});

	app.get('/warranties/add', function (req, res) {
		res.render('warranties/add', { layout: 'dashboard' });
	});

	app.get('/components/add', function (req, res) {
		res.render('components/add', { layout: 'dashboard' });
	});

	app.post('/orders/add', function (req, res) {
		for (var i = 0; i < req.body.pn.length; i++) {
			order_date = req.body.order_date[i].split("-");
			new_order_date = order_date[2] + "-" + order_date[0] + "-" + order_date[1];
			due_date = req.body.due_date[i].split("-");
			new_due_date = due_date[2] + "-" + due_date[0] + "-" + due_date[1];
			ship_date = req.body.ship_date[i].split("-");
			new_ship_date = ship_date[2] + "-" + ship_date[0] + "-" + ship_date[1];
			sql = "INSERT INTO orders SET n_comp = 1, status = 2, po = '" + req.body.po + "', pn = '" + req.body.pn[i] + "', qty = '" + req.body.qty[i] + "', location = '" + req.body.location[i] + "', ordered = '" + new_order_date + "', comment = '" + req.body.comment[i] + "', due = '" + new_due_date + "', shipped = '" + new_ship_date + "', freight_bill = ''";
			connection.query(sql);
		}
		req.flash('orderMessage', 'Order added successfully');
		res.redirect('/orders');
	});

	app.post('/orders/search', function (req, res) {
		if (req.body.start_date == "" && req.body.end_date == "" && req.body.part_no == "") {
			req.flash('orderMessage', 'Please select a filter option');
			res.redirect('/orders');
		} else {
			sub_total = 0;
			var start_date = req.body.start_date.split("-");
			var new_start_date = start_date[2] + "-" + start_date[0] + "-" + start_date[1];
			var end_date = req.body.end_date.split("-");
			var new_end_date = end_date[2] + "-" + end_date[0] + "-" + end_date[1];

			var sql = "SELECT * FROM orderview WHERE 1";
			if (req.body.start_date != "") {
				sql += " AND `ordered` >= '" + new_start_date + "'";
			}
			if (req.body.end_date != "") {
				sql += " AND `ordered` <= '" + new_end_date + "'";
			}
			if (req.body.part_no != "") {
				sql += " AND `pn` LIKE '" + req.body.part_no + "%'";
			}
			sql += " ORDER BY `id` DESC";

			connection.query(sql, function (err, rows) {
				for (i in rows) {
					sub_total += parseInt(rows[i].price);
				}
				connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
					res.render('order/index', { layout: 'dashboard', orders: rows, start_date: req.body.start_date, end_date: req.body.end_date, part_no: req.body.part_no, sub_total: sub_total, part_nos: all_pn });
				});
			});
		}
	});

	app.post('/components/add', function (req, res) {
		sql = "INSERT INTO products SET pn = '" + req.body.pn + "', description = '" + req.body.description + "', price = '" + req.body.price + "', j = '" + req.body.code + "'";
		connection.query(sql);
		req.flash('orderMessage', 'Products added successfully');
		res.redirect('/components');
	});

	app.post('/orders/complete', function (req, res) {
		if (req.body.start_date == "" && req.body.end_date == "" && req.body.part_no == "") {
			req.flash('message', 'Please select a filter option');
			res.redirect('/complete-orders');
		} else {
			var start_date = req.body.start_date.split("-");
			var new_start_date = start_date[2] + "-" + start_date[0] + "-" + start_date[1];
			var end_date = req.body.end_date.split("-");
			var new_end_date = end_date[2] + "-" + end_date[0] + "-" + end_date[1];

			var sql = "SELECT * FROM orderview WHERE `status` = 4";
			if (req.body.start_date != "") {
				sql += " AND `ordered` >= '" + new_start_date + "'";
			}
			if (req.body.end_date != "") {
				sql += " AND `ordered` <= '" + new_end_date + "'";
			}
			if (req.body.part_no != "") {
				sql += " AND `pn` LIKE '" + req.body.part_no + "%'";
			}
			sql += " ORDER BY `id` DESC";

			connection.query(sql, function (err, rows) {
				connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
					res.render('complete/complete', { layout: 'dashboard', orders: rows, start_date: req.body.start_date, end_date: req.body.end_date, part_no: req.body.part_no, part_nos: all_pn });
				});
			});
		}
	});

	app.post('/jma-orders/complete', function (req, res) {
		if (req.body.start_date == "" && req.body.end_date == "" && req.body.part_no == "") {
			req.flash('message', 'Please select a filter option');
			res.redirect('/complete-jma-orders');
		} else {
			var start_date = req.body.start_date.split("-");
			var new_start_date = start_date[2] + "-" + start_date[0] + "-" + start_date[1];
			var end_date = req.body.end_date.split("-");
			var new_end_date = end_date[2] + "-" + end_date[0] + "-" + end_date[1];

			var sql = "SELECT * FROM jmaview WHERE `status` = 4";
			if (req.body.start_date != "") {
				sql += " AND `ordered` >= '" + new_start_date + "'";
			}
			if (req.body.end_date != "") {
				sql += " AND `ordered` <= '" + new_end_date + "'";
			}
			if (req.body.part_no != "") {
				sql += " AND `pn` LIKE '" + req.body.part_no + "%'";
			}
			sql += " ORDER BY `id` DESC";

			connection.query(sql, function (err, rows) {
				connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
					res.render('complete/jma-orders-complete', { layout: 'dashboard', orders: rows, start_date: req.body.start_date, end_date: req.body.end_date, part_no: req.body.part_no, part_nos: all_pn });
				});
			});
		}
	});

	app.post('/warranties/complete', function (req, res) {
		if (req.body.start_date == "" && req.body.end_date == "" && req.body.part_no == "") {
			req.flash('message', 'Please select a filter option');
			res.redirect('/complete-warranties');
		} else {
			var start_date = req.body.start_date.split("-");
			var new_start_date = start_date[2] + "-" + start_date[0] + "-" + start_date[1];
			var end_date = req.body.end_date.split("-");
			var new_end_date = end_date[2] + "-" + end_date[0] + "-" + end_date[1];

			var sql = "SELECT * FROM warrantyview WHERE `status` = 4";
			if (req.body.start_date != "") {
				sql += " AND `ordered` >= '" + new_start_date + "'";
			}
			if (req.body.end_date != "") {
				sql += " AND `ordered` <= '" + new_end_date + "'";
			}
			if (req.body.part_no != "") {
				sql += " AND `pn` LIKE '" + req.body.part_no + "%'";
			}
			sql += " ORDER BY `id` DESC";

			connection.query(sql, function (err, rows) {
				connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
					res.render('complete/complete-warranties', { layout: 'dashboard', orders: rows, start_date: req.body.start_date, end_date: req.body.end_date, part_no: req.body.part_no, part_nos: all_pn });
				});
			});
		}
	});

	app.post('/jma-orders/search', function (req, res) {
		if (req.body.start_date == "" && req.body.end_date == "" && req.body.part_no == "") {
			req.flash('message', 'Please select a filter option');
			res.redirect('/jma-orders/');
		} else {
			var start_date = req.body.start_date.split("-");
			var new_start_date = start_date[2] + "-" + start_date[0] + "-" + start_date[1];
			var end_date = req.body.end_date.split("-");
			var new_end_date = end_date[2] + "-" + end_date[0] + "-" + end_date[1];
			var sub_total = 0;

			var sql = "SELECT * FROM jmaview WHERE 1";
			if (req.body.start_date != "") {
				sql += " AND `ordered` >= '" + new_start_date + "'";
			}
			if (req.body.end_date != "") {
				sql += " AND `ordered` <= '" + new_end_date + "'";
			}
			if (req.body.part_no != "") {
				sql += " AND `pn` LIKE '" + req.body.part_no + "%'";
			}
			sql += " ORDER BY `id` DESC";

			connection.query(sql, function (err, rows) {
				for (i in rows) {
					sub_total += parseInt(rows[i].price);
				}
				connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
					res.render('jma-order/index', { layout: 'dashboard', orders: rows, start_date: req.body.start_date, end_date: req.body.end_date, part_no: req.body.part_no, sub_total: sub_total, part_nos: all_pn });
				});
			});
		}
	});

	app.post('/warranties/filter', function (req, res) {
		var start_date = req.body.start_date.split("-");
		var new_start_date = start_date[2] + "-" + start_date[1] + "-" + start_date[0];
		var end_date = req.body.end_date.split("-");
		var new_end_date = end_date[2] + "-" + end_date[1] + "-" + end_date[0];
		connection.query("SELECT * FROM warrantyview WHERE `ordered` >= '" + new_start_date + "' AND `ordered` <= '" + new_end_date + "' ORDER BY `id` DESC", function (err, rows) {
			res.render('warranties/filtered_warranties_list', { layout: 'dashboard', orders: rows, start_date: req.body.start_date,end_date: req.body.end_date });
		});
	});

	app.post('/warranties/filter_part', function (req, res) {
		connection.query("SELECT * FROM warrantyview WHERE `pn` LIKE '%" + req.body.part_no + "%' ORDER BY `id` DESC", function (err, rows) {
			res.render('warranties/filtered_warranties_list', { layout: 'dashboard', orders: rows, part_no: req.body.part_no });
		});
	});

	app.post('/warranties/add', function (req, res) {
		for (var i = 0; i < req.body.pn.length; i++) {
			order_date = req.body.order_date[i].split("-");
			new_order_date = order_date[2] + "-" + order_date[0] + "-" + order_date[1];
			due_date = req.body.due_date[i].split("-");
			new_due_date = due_date[2] + "-" + due_date[0] + "-" + due_date[1];
			ship_date = req.body.ship_date[i].split("-");
			new_ship_date = ship_date[2] + "-" + ship_date[0] + "-" + ship_date[1];
			ret_date = req.body.ret_date[i].split("-");
			new_ret_date = ret_date[2] + "-" + ret_date[0] + "-" + ret_date[1];
			rep_date = req.body.rep_date[i].split("-");
			new_rep_date = rep_date[2] + "-" + rep_date[0] + "-" + rep_date[1];
			ready_date = req.body.ready_date[i].split("-");
			new_ready_date = ready_date[2] + "-" + ready_date[0] + "-" + ready_date[1];
			var sql = "INSERT INTO warranties SET po = '" + req.body.po + "', pn = '" + req.body.pn[i] + "', qty = '" + req.body.qty[i] + "', location = '" + req.body.location[i] + "', ordered = '" + new_order_date + "', comment = '" + req.body.comment[i]+ "', itemcomment = '" + req.body.details[i]+ "', due = '" + new_due_date + "', shipped = '" + new_ship_date + "', returned = '" + new_ret_date + "', reported = '" + new_rep_date + "', ready = '" + new_ready_date + "', freight_bill = '" + req.body.f_bill[i] + "', serial_no = '" + req.body.serial_no[i] + "', invoice_status = '" + req.body.invoice_status + "'";
			if (req.body.f_bill[i] != '') {
				sql += ", status = 3";
			} else {
				sql += ", status = 2";
			}
			connection.query(sql);
		}
		req.flash('orderMessage', 'Warranties added successfully');
		res.redirect('/warranties');
	});

	app.post('/warranties/search', function (req, res) {
		var start_date = req.body.start_date.split("-");
		var new_start_date = start_date[2] + "-" + start_date[0] + "-" + start_date[1];
		var end_date = req.body.end_date.split("-");
		var new_end_date = end_date[2] + "-" + end_date[0] + "-" + end_date[1];
		var sub_total = 0;
	  
		var sql = "SELECT * FROM warrantyview WHERE 1";
		if (req.body.start_date != "") {
	 		sql += " AND `ordered` >= '" + new_start_date + "'";
		}
		if (req.body.end_date != "") {
	 		sql += " AND `ordered` <= '" + new_end_date + "'";
		}
		if (req.body.part_no != "") {
	 		sql += " AND `pn` LIKE '" + req.body.part_no + "%'";
		}
		sql += " ORDER BY `id` DESC";
	  
		connection.query(sql, function (err, rows) {
			for (i in rows) { 
				sub_total += parseInt(rows[i].price);
			}
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				res.render('warranties/index', { layout: 'dashboard', orders: rows, start_date: req.body.start_date, end_date: req.body.end_date, part_no: req.body.part_no, sub_total: sub_total, part_nos: all_pn });
			});
		});
   	});

   	app.post('/jma-orders/add', function (req, res) {
		for (var i = 0; i < req.body.pn.length; i++) {
			order_date = req.body.order_date[i].split("-");
			new_order_date = order_date[2] + "-" + order_date[0] + "-" + order_date[1];
			due_date = req.body.due_date[i].split("-");
			new_due_date = due_date[2] + "-" + due_date[0] + "-" + due_date[1];
			core_ret_date = req.body.core_ret_date[i].split("-");
			new_core_ret_date = core_ret_date[2] + "-" + core_ret_date[0] + "-" + core_ret_date[1];
			//sql = "INSERT INTO jma_orders SET gid = 0, status = 0, po = '" + req.body.po + "', customer = '" + req.body.customer[i] + "', pn = '" + req.body.pn[i]  + "', ordered = '" + new_order_date + "', due = '" + new_due_date + "', qty = '" + req.body.qty[i] + "', jmapo = '" + req.body.jmapo[i] + "', serial = '" + req.body.serial_no[i] + "'";
			sql = "INSERT INTO jma_orders SET gid = 0, n_comp = 1, status = 2, jmapo = '" + req.body.jmapo + "', po = '" + req.body.po + "', pn = '" + req.body.pn[i] + "', qty = '" + req.body.qty[i] + "', location = '" + req.body.location[i] + "', customer = '" + req.body.customer[i] + "', ordered = '" + new_order_date + "', shipping_cost = '" + req.body.s_cost[i] + "', comment = '" + req.body.comment[i] + "', due = '" + new_due_date + "', core_returned = '" + new_core_ret_date + "', freight_bill = ''";
			connection.query(sql);
		}
		req.flash('orderMessage', 'JMA Order added successfully');
		res.redirect('/jma-orders');
	});

	app.get('/get-product-no', function (req, res) {
		request = req.query;
		connection.query("SELECT pn FROM products WHERE pn LIKE '%" + request['term'] + "%' ORDER BY pn LIMIT 15", function (err, results) {
			if (err) {
				console.log(err);
			}
			var row = [];
			for (i in results) {
				row.push({ "label": results[i].pn, "value": results[i].pn })
			}
			res.send(row);
		});
	});

	/* app.get('/get-location', function (req, res) {
		request = req.query;
		//res.send("SELECT sum FROM locations WHERE sum LIKE '%" + request['term'] + "%' ORDER BY sum LIMIT 15");
		//connection.query("SELECT sum FROM locations WHERE sum LIKE '%" + request['term'] + "%' ORDER BY sum LIMIT 15", function (err, results) {
			connection.query("SELECT * FROM locations", function (err, results) {
			if (err) {
				console.log(err);
			}
			var row = [];
			for (i in results) {
				row.push({ "label": results[i].street + "," + results[i].city + "," + results[i].sum, "value": results[i].sum })
			}
			res.send(row);
		});
	}); */

	app.post('/get-location-order', function (req, res) {
		//res.send("SELECT sum FROM locations WHERE sum LIKE '%" + request['term'] + "%' ORDER BY sum LIMIT 15");
		//connection.query("SELECT sum FROM locations WHERE sum LIKE '%" + request['term'] + "%' ORDER BY sum LIMIT 15", function (err, results) {
		if (req.body.ln != "") {
			var sql = "SELECT DISTINCT(o.location), l.* FROM orders o, locations l WHERE l.sum = o.location AND o.po LIKE '" + req.body.ln + "%'";
			connection.query(sql, function (err, results) {
				if (err) {
					console.log(err);
				}
				var row = [];
				for (i in results) {
					row.push({ "label": results[i].street + ", " + results[i].city + ", " + results[i].sum, "value": results[i].sum, "manager": results[i].person })
				}
				res.send(row);
			});
		} else {
			res.send(new Array());
		}
	});

	app.get('/get-part_no', function (req, res) {
		//res.send("SELECT sum FROM locations WHERE sum LIKE '%" + request['term'] + "%' ORDER BY sum LIMIT 15");
		//connection.query("SELECT sum FROM locations WHERE sum LIKE '%" + request['term'] + "%' ORDER BY sum LIMIT 15", function (err, results) {
		connection.query("SELECT DISTINCT(pn) FROM products", function (err, results) {
			if (err) {
				console.log(err);
			}
			var row = [];
			for (i in results) {
				row.push({ "label": results[i].pn, "value": results[i].pn})
			}
			res.send(row);
		});
	});

	app.post('/get-location-warranty', function (req, res) {
		//res.send("SELECT sum FROM locations WHERE sum LIKE '%" + request['term'] + "%' ORDER BY sum LIMIT 15");
		//connection.query("SELECT sum FROM locations WHERE sum LIKE '%" + request['term'] + "%' ORDER BY sum LIMIT 15", function (err, results) {
		if (req.body.ln != "") {
			var sql = "SELECT DISTINCT(o.location), l.* FROM warranties o, locations l WHERE l.sum = o.location AND o.po LIKE '" + req.body.ln + "%'";
			connection.query(sql, function (err, results) {
				if (err) {
					console.log(err);
				}
				var row = [];
				for (i in results) {
					row.push({ "label": results[i].street + ", " + results[i].city + ", " + results[i].sum, "value": results[i].sum, "manager": results[i].person })
				}
				res.send(row);
			});
		} else {
			res.send(new Array());
		}
	});

	app.get('/orders/packing/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE orders SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		sql = "SELECT p.description, p.pn, o.po, o.qty, o.ordered, o.location, l.name, l.street, l.city, l.person, l.phone, l.fax FROM products p, orders o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id1'] + "' AND o.id = '" + req.params['id3'] + "'";
		connection.query(sql, function (err, results) {
			order_date = results[0].ordered;
			person_name = results[0].person;
			name = results[0].name;
			street = results[0].street;
			city = results[0].city;
			phone = results[0].phone;
			fax = results[0].fax;
			res.render('order/printingview', { layout: 'dashboard', orders: results, order_date: order_date, person_name: person_name,name: name, street: street, city: city, phone: phone, fax: fax, f_bill: req.params['id2'], order_id: req.params['id1'] });
		});
	});

	app.get('/orders/invoice/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE orders SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		var sql1 = "SELECT max(invoice_no) as max_inv FROM orders";
		connection.query(sql1, function (err, max_res) {
			var sql2 = "SELECT invoice_no FROM orders WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql2, function (err, inv_res) {
				var new_inv;
				if (inv_res[0].invoice_no == 0) {
					new_inv = max_res[0].max_inv + 1;
				}
				else {
					new_inv = inv_res[0].invoice_no;
				}
				var sql3 = "UPDATE orders SET invoice_no = '" + new_inv + "' WHERE id = '" + req.params['id3'] + "'";
				connection.query(sql3, function(req3, res3) {
					sql = "SELECT p.price, p.description, p.pn, o.po, o.qty, o.ordered, o.due, o.location, o.invoice_no, l.sum, l.name, l.street, l.city, l.person, l.phone, l.fax, l.tax_status FROM products p, orders o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id1'] + "' AND o.id = '" + req.params['id3'] + "'";
					connection.query(sql, function (err, results) {
						sub_total = 0;
						total_taxed_value = 0;
						float = 0;
						number_of_components = results.length;
						for (i in results) {
							sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
						}
						if (results[0].sum == 'Arkansas') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						else if(results[0].tax_status == '1') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						order_date = results[0].ordered;
						bill_date = results[0].due;
						person_name = results[0].person;
						name = results[0].name;
						street = results[0].street;
						city = results[0].city;
						phone = results[0].phone;
						fax = results[0].fax;
						invoice_no = results[0].invoice_no;
						res.render('order/invoiceview', { layout: 'dashboard', total_taxed_value: total_taxed_value, number_of_components:number_of_components, float: float, orders: results, sub_total: parseFloat(sub_total).toFixed(2), order_date: order_date, bill_date: bill_date, person_name: person_name, name: name, street: street, city: city, phone: phone, fax: fax, invoice_no: invoice_no, f_bill: req.params['id2'], order_id: req.params['id1'], id: req.params['id3'] });
					});
				});
			});
		});
	});

	app.get('/orders/delivery/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE orders SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		var sql1 = "SELECT max(invoice_no) as max_inv FROM orders";
		connection.query(sql1, function (err, max_res) {
			var sql2 = "SELECT invoice_no FROM orders WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql2, function (err, inv_res) {
				var new_inv;
				if (inv_res[0].invoice_no == 0) {
					new_inv = max_res[0].max_inv + 1;
				} else {
					new_inv = inv_res[0].invoice_no;
				}
				var sql3 = "UPDATE orders SET invoice_no = '" + new_inv + "' WHERE id = '" + req.params['id3'] + "'";
				connection.query(sql3, function (req3, res3) {
					sql = "SELECT p.price, p.description, p.pn, o.po, o.qty, o.ordered, o.due, o.location, o.invoice_no, l.sum, l.name, l.street, l.city, l.person, l.phone, l.fax, l.tax_status FROM products p, orders o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id1'] + "' AND o.id = '" + req.params['id3'] + "'";
					connection.query(sql, function (err, results) {
						sub_total = 0;
						total_taxed_value = 0;
						float = 0;
						number_of_components = results.length;
						for (i in results) {
							sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
						}
						if (results[0].sum == 'Arkansas') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						else if(results[0].tax_status == '1') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						order_date = results[0].ordered;
						bill_date = results[0].due;
						person_name = results[0].person;
						name = results[0].name;
						street = results[0].street;
						city = results[0].city;
						phone = results[0].phone;
						fax = results[0].fax;
						invoice_no = results[0].invoice_no;
						res.render('order/deliveryview', { layout: 'dashboard', total_taxed_value: total_taxed_value, number_of_components:number_of_components, float: float, orders: results, sub_total: parseFloat(sub_total).toFixed(2), order_date: order_date, bill_date: bill_date, person_name: person_name, name: name, street: street, city: city, phone: phone, fax: fax, invoice_no: invoice_no, f_bill: req.params['id2'], order_id: req.params['id1'], id: req.params['id3'] });
					});
				});
			});
		});
	});

	app.get('/orders/preview/:id', function (req, res) {
		sql = "SELECT p.price, p.pn, o.po, o.qty, o.ordered, o.location, l.sum, l.name, l.street, l.city, l.person, l.phone, l.fax  FROM products p, orders o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			sub_total = 0;
			for (i in results) {
				sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
			}
			order_date = results[0].ordered;
			person_name = results[0].person;
			name = results[0].name;
			street = results[0].street;
			city = results[0].city;
			res.render('order/preview', { layout: 'dashboard', orders: results, sub_total: sub_total, order_date: order_date, person_name: person_name, name: name, street: street, city: city, order_id: req.params['id'] });
		});
	});

	app.get('/orders/build_sheet', function (req, res) {
		var arr1 = {};
		var colour = {};
		var sum = 0;
		//sql = "SELECT distinct pn FROM orderview  WHERE ordered >= DATE(NOW()) - INTERVAL 7 DAY";
		//sql ="SELECT pn FROM orderview WHERE pn IN (SELECT distinct pn FROM orderview WHERE ordered >= DATE(NOW()) - INTERVAL 7 DAY) GROUP BY description";
		sql = "SELECT * FROM orderview WHERE `status` != 4 AND pn IN (SELECT distinct pn FROM orderview WHERE ordered >= DATE(NOW()) - INTERVAL 7 DAY) ORDER BY id DESC";
		connection.query(sql, function (err, results1) {
			for (i in results1) {
				if (arr1[results1[i].description] == undefined)
					arr1[results1[i].description] = {};
				arr1[results1[i].description][i] = results1[i];
			}
			for (x in arr1) {
				sum = 0;
				for (y in arr1[x]) {
					sum += parseInt(arr1[x][y].qty);
				}
				arr1[x]['qty'] = sum;
			}
			res.render('order/build_sheet', { layout: 'dashboard', orders: arr1 });
		});
	});

	app.get('/jma-orders/build_sheet', function (req, res) {
		var arr1 = {};
		var colour = {};
		var sum = 0;
		//sql = "SELECT distinct pn FROM jmaview WHERE ordered >= DATE(NOW()) - INTERVAL 7 DAY";
		//sql ="SELECT pn FROM orderview WHERE pn IN (SELECT distinct pn FROM orderview WHERE ordered >= DATE(NOW()) - INTERVAL 7 DAY) GROUP BY description";
		sql = "SELECT * FROM jmaview WHERE `status` != 4 AND pn IN (SELECT distinct pn FROM jmaview WHERE ordered >= DATE(NOW()) - INTERVAL 7 DAY) ORDER BY id DESC";
		connection.query(sql, function (err, results1) {
			for (i in results1) {
				if (arr1[results1[i].description] == undefined)
					arr1[results1[i].description] = {};
				arr1[results1[i].description][i] = results1[i];
			}
			for (x in arr1) {
				sum = 0;
				for (y in arr1[x]) {
					sum += parseInt(arr1[x][y].qty);
				}
				arr1[x]['qty'] = sum;
			}
			res.render('jma-order/build_sheet', { layout: 'dashboard', orders: arr1 });
		});
	});
	
	app.get('/jma-orders/packing/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE jma_orders SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		//sql = "SELECT p.description, p.pn, o.po, o.qty, o.ordered, o.location, l.name, l.street, l.city, l.person, l.phone, l.fax FROM products p, jma_orders o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id1'] + "'";
		sql = "SELECT p.description, p.pn, o.po, o.qty, o.ordered, o.location, l.name, l.street, l.city, l.person, l.phone, l.fax FROM products p INNER JOIN jma_orders o ON o.pn = p.pn LEFT OUTER JOIN locations l ON l.sum = o.location WHERE o.po = '" + req.params['id1'] + "'";
		connection.query(sql, function (err, results) {
			order_date = results[0].ordered;
			//person_name = results[0].customer;
			person_name = results[0].person;
			name = results[0].name;
			street = results[0].street;
			city = results[0].city;
			phone = results[0].phone;
			fax = results[0].fax;
			res.render('jma-order/printingview', { layout: 'dashboard', orders: results, order_date: order_date, person_name: person_name,name: name, street: street, city: city, phone: phone, fax: fax, f_bill: req.params['id2'], order_id: req.params['id1'] });
		});
	});

	app.get('/jma-orders/invoice/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE jma_orders SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		var sql1 = "SELECT max(invoice_no) as max_inv FROM jma_orders";
		connection.query(sql1, function (err, max_res) {
			var sql2 = "SELECT invoice_no FROM jma_orders WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql2, function (err, inv_res) {
				var new_inv;
				if (inv_res[0].invoice_no == 0) {
					new_inv = max_res[0].max_inv + 1;
				} else {
					new_inv = inv_res[0].invoice_no;
				}
				var sql3 = "UPDATE jma_orders SET invoice_no = '" + new_inv + "' WHERE id = '" + req.params['id3'] + "'";
				connection.query(sql3, function (req3, res3) {
					sql = "SELECT p.price, p.description, p.pn, o.po, o.jmapo, o.qty, o.ordered, o.due, o.location, o.customer, o.shipping_cost, o.invoice_no FROM products p INNER JOIN jma_orders o ON o.pn = p.pn WHERE o.po = '" + req.params['id1'] + "' AND o.id = '" + req.params['id3'] + "'";
					connection.query(sql, function (err, results) {
						sub_total = 0;
						total_taxed_value = 0;
						float = 0;
						number_of_components = results.length;
						for (i in results) {
							sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
						}
						sub_total += parseFloat(results[0].shipping_cost);
						var str = results[0].location;
						var tax_stat = str.toLowerCase().indexOf("ar");
						if (tax_stat != -1) {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						/*else if(results[0].tax_status == '1') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}*/
						order_date = results[0].ordered;
						bill_date = results[0].due;
						person_name = results[0].customer;
						//name = results[0].name;
						// street = results[0].street;
						// city = results[0].city;
						// phone = results[0].phone;
						// fax = results[0].fax;
						location = results[0].location;
						invoice_no = results[0].invoice_no;
						shipping_cost = parseFloat(results[0].shipping_cost).toFixed(2);
						res.render('jma-order/invoiceview', { layout: 'dashboard', total_taxed_value: total_taxed_value, number_of_components: number_of_components, float: float, orders: results, jma_po: results[0].jmapo, sub_total: parseFloat(sub_total).toFixed(2), order_date: order_date, bill_date: bill_date, person_name: person_name, location: location, shipping_cost: shipping_cost, invoice_no: invoice_no, f_bill: req.params['id2'], order_id: req.params['id1'], id: req.params['id3'] });
					});
				});
			});
		});
	});

	app.get('/jma-orders/delivery/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE jma_orders SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		var sql1 = "SELECT max(invoice_no) as max_inv FROM jma_orders";
		connection.query(sql1, function (err, max_res) {
			var sql2 = "SELECT invoice_no FROM jma_orders WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql2, function (err, inv_res) {
				var new_inv;
				if (inv_res[0].invoice_no == 0) {
					new_inv = max_res[0].max_inv + 1;
				} else {
					new_inv = inv_res[0].invoice_no;
				}
				var sql3 = "UPDATE jma_orders SET invoice_no = '" + new_inv + "' WHERE id = '" + req.params['id3'] + "'";
				connection.query(sql3, function (req3, res3) {
					sql = "SELECT p.price, p.description, p.pn, o.po, o.jmapo, o.qty, o.ordered, o.due, o.location, o.customer, o.shipping_cost, o.invoice_no FROM products p INNER JOIN jma_orders o ON o.pn = p.pn WHERE o.po = '" + req.params['id1'] + "' AND o.id = '" + req.params['id3'] + "'";
					connection.query(sql, function (err, results) {
						sub_total = 0;
						total_taxed_value = 0;
						float = 0;
						number_of_components = results.length;
						for (i in results) {
							sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
						}
						sub_total += parseFloat(results[0].shipping_cost);
						var str = results[0].location;
						var tax_stat = str.toLowerCase().indexOf("ar");
						if (tax_stat != -1) {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						/*else if(results[0].tax_status == '1') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}*/
						order_date = results[0].ordered;
						bill_date = results[0].due;
						person_name = results[0].customer;
						//name = results[0].name;
						// street = results[0].street;
						// city = results[0].city;
						// phone = results[0].phone;
						// fax = results[0].fax;
						location = results[0].location;
						invoice_no = results[0].invoice_no;
						shipping_cost = parseFloat(results[0].shipping_cost).toFixed(2);
						res.render('jma-order/deliveryview', { layout: 'dashboard', total_taxed_value: total_taxed_value, number_of_components: number_of_components, float: float, orders: results, jma_po: results[0].jmapo, sub_total: parseFloat(sub_total).toFixed(2), order_date: order_date, bill_date: bill_date, person_name: person_name, location: location, shipping_cost: shipping_cost, invoice_no: invoice_no, f_bill: req.params['id2'], order_id: req.params['id1'], id: req.params['id3'] });
					});
				});
			});
		});
	});

	app.get('/jma-orders/preview/:id', function (req, res) {
		sql = "SELECT p.price, p.pn, o.po, o.qty, o.ordered, o.customer FROM products p, jma_orders o WHERE o.pn = p.pn AND o.po = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			sub_total = 0;
			for (i in results) {
				sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
			}
			order_date = results[0].ordered;
			customer = results[0].customer;
			res.render('jma-order/preview', { layout: 'dashboard', orders: results, sub_total: sub_total, order_date: order_date, customer: customer, order_id: req.params['id'] });
		});
	});

	app.get('/warranties/preview/:id', function (req, res) {
		sql = "SELECT p.price, p.pn, o.po, o.qty, o.ordered, o.location, l.name, l.street, l.city, l.person FROM products p, warranties o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			sub_total = 0;
			for (i in results) {
				sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
			}
			order_date = results[0].ordered;
			person_name = results[0].person;
			name = results[0].name;
			street = results[0].street;
			city = results[0].city;
			res.render('warranties/preview', { layout: 'dashboard', orders: results, sub_total: sub_total, order_date: order_date, person_name: person_name, name: name, street: street, city: city, order_id: req.params['id'] });
		});
	});

	app.get('/warranties/packing/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE warranties SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		sql = "SELECT p.description, p.pn, o.po, o.qty, o.ordered, o.location, l.name, l.street, l.city, l.person, l.phone, l.fax FROM products p, warranties o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id1'] + "' AND o.id = '" + req.params['id3'] + "'";
		connection.query(sql, function (err, results) {
			order_date = results[0].ordered;
			person_name = results[0].person;
			name = results[0].name;
			street = results[0].street;
			city = results[0].city;
			phone = results[0].phone;
			fax = results[0].fax;
			res.render('warranties/printingview', { layout: 'dashboard', orders: results, order_date: order_date, person_name: person_name, name: name, street: street, city: city, phone: phone, fax: fax, f_bill: req.params['id2'], order_id: req.params['id1'] });
		});
	});

	app.get('/warranties/invoice/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE warranties SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		var sql1 = "SELECT max(invoice_no) as max_inv FROM warranties";
		connection.query(sql1, function (err, max_res) {
			var sql2 = "SELECT invoice_no FROM warranties WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql2, function (err, inv_res) {
				var new_inv;
				if (inv_res[0].invoice_no == 0) {
					new_inv = max_res[0].max_inv + 1;
				} else {
					new_inv = inv_res[0].invoice_no;
				}
				var sql3 = "UPDATE warranties SET invoice_no = '" + new_inv + "' WHERE id = '" + req.params['id3'] + "'";
				connection.query(sql3, function (req3, res3) {
					sql = "SELECT p.price, p.description, p.pn, o.po, o.qty, o.ordered, o.due, o.location, o.invoice_no, l.sum, l.name, l.street, l.city, l.person, l.phone, l.fax, l.tax_status FROM products p, warranties o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id1'] + "' AND o.id = '" + req.params['id3'] + "'";
					connection.query(sql, function (err, results) {
						sub_total = 0;
						total_taxed_value = 0;
						float = 0;
						number_of_components = results.length;
						for (i in results) {
							sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
						}
						if (results[0].sum == 'Arkansas') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						else if(results[0].tax_status == '1') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						order_date = results[0].ordered;
						bill_date = results[0].due;
						person_name = results[0].person;
						name = results[0].name;
						street = results[0].street;
						city = results[0].city;
						phone = results[0].phone;
						fax = results[0].fax;
						invoice_no = results[0].invoice_no;
						res.render('warranties/invoiceview', { layout: 'dashboard', total_taxed_value: total_taxed_value, number_of_components: number_of_components, float: float, orders: results, sub_total: parseFloat(sub_total).toFixed(2), order_date: order_date, bill_date: bill_date, person_name: person_name, name: name, street: street, city: city, phone: phone, fax: fax, invoice_no: invoice_no, f_bill: req.params['id2'], order_id: req.params['id1'], id: req.params['id3'] });
					});
				});
			});
		});
	});

	app.get('/warranties/delivery/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE warranties SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		var sql1 = "SELECT max(invoice_no) as max_inv FROM warranties";
		connection.query(sql1, function (err, max_res) {
			var sql2 = "SELECT invoice_no FROM warranties WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql2, function (err, inv_res) {
				var new_inv;
				if (inv_res[0].invoice_no == 0) {
					new_inv = max_res[0].max_inv + 1;
				} else {
					new_inv = inv_res[0].invoice_no;
				}
				var sql3 = "UPDATE warranties SET invoice_no = '" + new_inv + "' WHERE id = '" + req.params['id3'] + "'";
				connection.query(sql3, function (req3, res3) {
					sql = "SELECT p.price, p.description, p.pn, o.po, o.qty, o.ordered, o.due, o.location, o.invoice_no, l.sum, l.name, l.street, l.city, l.person, l.phone, l.fax, l.tax_status FROM products p, warranties o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id1'] + "' AND o.id = '" + req.params['id3'] + "'";
					connection.query(sql, function (err, results) {
						sub_total = 0;
						total_taxed_value = 0;
						float = 0;
						number_of_components = results.length;
						for (i in results) {
							sub_total += parseInt(results[i].qty) * parseInt(results[i].price);
						}
						if (results[0].sum == 'Arkansas') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						else if(results[0].tax_status == '1') {
							float = 1;
							total_taxed_value = parseFloat(sub_total + (sub_total * 8.5) / 100).toFixed(2);
						}
						order_date = results[0].ordered;
						bill_date = results[0].due;
						person_name = results[0].person;
						name = results[0].name;
						street = results[0].street;
						city = results[0].city;
						phone = results[0].phone;
						fax = results[0].fax;
						invoice_no = results[0].invoice_no;
						res.render('warranties/deliveryview', { layout: 'dashboard', total_taxed_value: total_taxed_value, number_of_components: number_of_components, float: float, orders: results, sub_total: parseFloat(sub_total).toFixed(2), order_date: order_date, bill_date: bill_date, person_name: person_name, name: name, street: street, city: city, phone: phone, fax: fax, invoice_no: invoice_no, f_bill: req.params['id2'], order_id: req.params['id1'], id: req.params['id3'] });
					});
				});
			});
		});
	});

	app.get('/warranties/honored/:id1/:id2?/:id3', function (req, res) {
		/*if (req.params['id2'] != undefined) {
			var sql1 = "UPDATE warranties SET gid = 1, status = 3 WHERE id = '" + req.params['id3'] + "'";
			connection.query(sql1);
		}*/
		sql = "SELECT p.price, p.description, p.pn, o.po, o.qty, o.ordered, o.location, l.name, l.street, l.city, l.person, l.phone, l.fax FROM products p, warranties o, locations l WHERE l.sum = o.location AND o.pn = p.pn AND o.po = '" + req.params['id1'] + "'";
		connection.query(sql, function (err, results) {
			sub_total = 0;
			total_taxed_value = 0;
			float = 0;
			number_of_components = results.length;
			order_date = results[0].ordered;
			bill_date = results[0].due;
			person_name = results[0].person;
			name = results[0].name;
			street = results[0].street;
			city = results[0].city;
			phone = results[0].phone;
			fax = results[0].fax;
			res.render('warranties/invoiceview', { layout: 'dashboard', total_taxed_value: total_taxed_value, number_of_components: number_of_components, float: float, orders: results, sub_total: sub_total, order_date: order_date, bill_date: bill_date, person_name: person_name, name: name, street: street, city: city, phone: phone, fax: fax, f_bill: req.params['id2'], order_id: req.params['id1'] });
		});
	});

	app.get('/jma-orders/edit/:id', function (req, res) {
		//var sql = "SELECT * FROM jma_orders j, locations l WHERE j.location = l.sum AND j.id = '" + req.params['id'] + "'";
		var sql = "SELECT * FROM jma_orders j LEFT OUTER JOIN locations l ON j.location = l.sum WHERE j.id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			res.render('jma-order/edit', { layout: 'dashboard', results: results, jmaorder_id: req.params['id'] });
		});
	});

	app.get('/orders/edit/:id', function (req, res) {
		var sql = "SELECT * FROM orders o, locations l WHERE o.location = l.sum AND o.id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			res.render('order/edit', { layout: 'dashboard', results: results, order_id: req.params['id'] });
		});
	});

	app.get('/orders/complete-list', function (req, res) {
		var sql = "SELECT * FROM orderview WHERE `status` = 4 AND ordered >= DATE(NOW()) - INTERVAL 7 DAY ORDER BY `id` DESC";
		connection.query(sql, function (err, results) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('complete/complete', { layout: 'dashboard', orders: results, message: msg, part_nos: all_pn });
			});
		});
	});

	app.get('/jma-orders/complete-list', function (req, res) {
		var sql = "SELECT * FROM jmaview WHERE `status` = 4 AND ordered >= DATE(NOW()) - INTERVAL 7 DAY ORDER BY `id` DESC";
		connection.query(sql, function (err, results) {
			connection.query("SELECT DISTINCT(pn) FROM products", function (err, all_pn) {
				var msg = req.flash('orderMessage')[0];
				res.render('complete/jma-orders-complete', { layout: 'dashboard', orders: results, message: msg, part_nos: all_pn });
			});
		});
	});

	app.get('/components/edit/:id', function (req, res) {
		connection.query("SELECT * FROM products WHERE id = '" + req.params['id'] + "'", function (err, results) {
			res.render('components/edit', { layout: 'dashboard', results: results });
		});
	});

	app.post('/complete_order', function (req, res) {
		connection.query("UPDATE orders SET `status` = 4 WHERE id = '" + req.body.id + "'", function (err, results) {
			var float = 1;
			sendJSON(res, 200, float);
			//res.render('order/edit', { layout: 'dashboard', results: results });
		});
	});

	app.post('/complete_jma_order', function (req, res) {
		connection.query("UPDATE jma_orders SET `status` = 4 WHERE id = '" + req.body.id + "'", function (err, results) {
			var float = 1;
			sendJSON(res, 200, float);
			//res.render('order/edit', { layout: 'dashboard', results: results });
		});
	});

	app.post('/complete_warranties_order', function (req, res) {
		connection.query("UPDATE warranties SET `status` = 4 WHERE id = '" + req.body.id + "'", function (err, results) {
			var float = 1;
			sendJSON(res, 200, float);
			//res.render('order/edit', { layout: 'dashboard', results: results });
		});
	});

	app.get('/warranties/edit/:id', function (req, res) {
		sql = "SELECT * FROM warranties w, locations l WHERE w.location = l.sum AND w.id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			res.render('warranties/edit', { layout: 'dashboard', results: results, warr_id: req.params['id'] });
		});
	});

	app.post('/jma-orders/edit/:id', function (req, res) {
		order_date = req.body.order_date.split("-");
		new_order_date = order_date[2] + "-" + order_date[0] + "-" + order_date[1];
		due_date = req.body.due_date.split("-");
		new_due_date = due_date[2] + "-" + due_date[0] + "-" + due_date[1];
		core_ret_date = req.body.core_ret_date.split("-");
		new_core_ret_date = core_ret_date[2] + "-" + core_ret_date[0] + "-" + core_ret_date[1];
		sql = "UPDATE jma_orders SET pn = '" + req.body.pn + "', jmapo = '" + req.body.jmapo + "', customer = '" + req.body.customer + "', location = '" + req.body.location + "', freight_bill = '" + req.body.f_bill + "', ordered = '" + new_order_date + "', due = '" + new_due_date + "', core_returned = '" + new_core_ret_date + "', qty = '" + req.body.qty + "', shipping_cost = '" + req.body.s_cost + "', n_comp = '" + req.user.id + "'";
		if (req.body.curr_status != 4 && req.body.f_bill != '') {
			sql += ", status = 3";
		}
		sql += " WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'JMA order updated successfully');
			if (req.body.curr_status == 4) {
				res.redirect('/complete-jma-orders');
			} else {
				res.redirect('/jma-orders');
			}
		});
	});

	app.post('/orders/edit/:id', function (req, res) {
		order_date = req.body.order_date.split("-");
		new_order_date = order_date[2] + "-" + order_date[0] + "-" + order_date[1];
		due_date = req.body.due_date.split("-");
		new_due_date = due_date[2] + "-" + due_date[0] + "-" + due_date[1];
		ship_date = req.body.ship_date.split("-");
		new_ship_date = ship_date[2] + "-" + ship_date[0] + "-" + ship_date[1];
		sql = "UPDATE orders SET pn = '" + req.body.pn + "', freight_bill = '" + req.body.f_bill + "', ordered = '" + new_order_date + "', due = '" + new_due_date + "', shipped = '" + new_ship_date + "', qty = '" + req.body.qty + "', n_comp = '" + req.user.id + "'";
		if (req.body.curr_status != 4 && req.body.f_bill != '') {
			sql += ", status = 3";
		}
		sql += " WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'Order updated successfully');
			if (req.body.curr_status == 4) {
				res.redirect('/complete-orders');
			} else {
				res.redirect('/orders');
			}
		});
	});

	app.post('/components/edit/:id', function (req, res) {
		sql = "UPDATE products SET pn = '" + req.body.pn + "', description = '" + req.body.description + "', price = '" + req.body.price + "', j = '" + req.body.code + "' WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'Product updated successfully');
			res.redirect('/components');
		});
	});

	app.post('/warranties/edit/:id', function (req, res) {
		sql = "UPDATE warranties SET invoice_status = '" + req.body.invoice_status + "', serial_no = '" + req.body.serial_no + "', comment = '" + req.body.comment + "', itemcomment = '" + req.body.itemcomment + "', freight_bill = '" + req.body.f_bill + "', pn = '" + req.body.pn + "', qty = '" + req.body.qty + "', n_comp = '" + req.user.id + "'";
		if (req.body.ready != 'invalid date') {
			ready_date = req.body.ready.split("-");
			new_ready_date = ready_date[2] + "-" + ready_date[0] + "-" + ready_date[1];
			sql += ", ready = '" + new_ready_date + "'";
		}
		if (req.body.reported != 'invalid date') {
			reported_date = req.body.reported.split("-");
			new_reported_date = reported_date[2] + "-" + reported_date[0] + "-" + reported_date[1];
			sql += ", reported = '" + new_reported_date + "'";
		}
		if (req.body.shipped != 'invalid date') {
			shipped_date = req.body.shipped.split("-");
			new_shipped_date = shipped_date[2] + "-" + shipped_date[0] + "-" + shipped_date[1];
			sql += ", shipped = '" + new_shipped_date + "'";
		}
		if (req.body.returned != 'invalid date') {
			returned_date = req.body.returned.split("-");
			new_returned_date = returned_date[2] + "-" + returned_date[0] + "-" + returned_date[1];
			sql += ", returned = '" + new_returned_date + "'";
		}
		if (req.body.order_date != 'invalid date') {
			order_date = req.body.order_date.split("-");
			new_order_date = order_date[2] + "-" + order_date[0] + "-" + order_date[1];
			sql += ", ordered = '" + new_order_date + "'";
		}
		if (req.body.due_date != 'invalid date') {
			due_date = req.body.due_date.split("-");
			new_due_date = due_date[2] + "-" + due_date[0] + "-" + due_date[1];
			sql += ", due = '" + new_due_date + "'";
		}
		if (req.body.curr_status != 4 && req.body.f_bill != '') {
			sql += ", status = 3";
		}
		sql += " WHERE id = '" + req.params['id'] + "'";

		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'Warranty updated successfully');
			if (req.body.curr_status == 4) {
				res.redirect('/complete-warranties');
			} else {
				res.redirect('/warranties');
			}
		});
	});

	app.get('/orders/delete/:id', function (req, res) {
		sql = "DELETE FROM orders WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'Order deleted successfully');
			res.redirect('/orders');
		});
	});

	app.get('/components/delete/:id', function (req, res) {
		sql = "DELETE FROM products WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'Product deleted successfully');
			res.redirect('/components');
		});
	});

	app.get('/jma-orders/delete/:id', function (req, res) {
		sql = "DELETE FROM jma_orders WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'JMA order deleted successfully');
			res.redirect('/jma-orders');
		});
	});

	app.get('/warranties/delete/:id', function (req, res) {
		sql = "DELETE FROM warranties WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'Warranties deleted successfully');
			res.redirect('/warranties');
		});
	});

	app.get('/users', function (req, res) {
		sql = "SELECT * FROM users WHERE role = 2";
		connection.query(sql, function (err, users) {
			var msg = req.flash('userMessage')[0];
			res.render('users/index', { layout: 'dashboard', users: users, message: msg });
		});
	});

	app.get('/users/add', function (req, res) {
		res.render('users/add', { layout: 'dashboard' });
	});

	app.get('/users/edit/:id', function (req, res) {
		connection.query("SELECT * FROM users WHERE id = '" + req.params['id'] + "'", function (err, result) {
			res.render('users/edit', { layout: 'dashboard', result: result });
		});
	});

	app.post('/add-user-ajax', function (req, res) {
		connection.query("SELECT id FROM users WHERE username = '" + req.body.username + "'", function (err, user) {
			if (err) {
				res.send("0");
			}
			if (user.length === 0) {
				let f_name = req.body.first_name;
				let l_name = req.body.last_name;
				let u_name = req.body.username;
				let passwd = req.body.password;
				connection.query("CALL user_registration('" + f_name + "','" + l_name + "','" + u_name + "','" + passwd + "')", function (err, response) {
					req.flash('userMessage', 'User added successfully');
					res.send("2");
				});
			}
			else {
				res.send("1");
			}
		});
	});

	app.post('/edit-user-ajax', function (req, res) {
		connection.query("SELECT * FROM users WHERE username = '" + req.body.username + "' AND id != '" + req.body.user_id + "'", function (err, result) {
			if (err) {
				res.send("0");
			}
			if (result.length === 0) {
				connection.query("UPDATE users SET first_name = '" + req.body.first_name + "', last_name = '" + req.body.last_name + "', username = '" + req.body.username + "' WHERE id = '" + req.body.user_id + "'", function (err, user) {
					req.flash('userMessage', 'User updated successfully');
					res.send("2");
				});
			}
			else {
				res.send("1");
			}
		});
	});

	app.get('/users/delete/:id', function (req, res) {
		sql = "DELETE FROM users WHERE id = '" + req.params['id'] + "'";
		connection.query(sql, function (err, results) {
			req.flash('orderMessage', 'User deleted successfully');
			res.redirect('/users');
		});
	});

	app.get('/users/change_password/:id', function (req, res) {
		connection.query("SELECT * FROM users WHERE id = '" + req.params['id'] + "'", function (err, result) {
			res.render('users/change_pass', { layout: 'dashboard', result: result });
		});
	});

	app.post('/change-pass-ajax', function (req, res) {
		connection.query("SELECT * FROM users WHERE id = '" + req.body.id + "'", function (err, result) {
			if (md5(req.body.oldpassword) == result[0]['password']) {
				connection.query("UPDATE users SET password = '" + md5(req.body.newpassword) + "' WHERE id = '" + req.body.id + "'", function (err, user) {
					res.send("2");
				});
			}
			else {
				res.send("0");
			}
		});
	});

	app.post('/update-order-invoice', function (req, res) {
		connection.query("SELECT count(invoice_no) as count FROM orders WHERE invoice_no = '" + req.body.value + "'", function (err1, res1) {
			if (res1[0].count > 0) {
				res.send("0");
			} else {
				var sql = "UPDATE orders SET invoice_no = '" + req.body.value + "' WHERE id = '" + req.body.id + "'";
				connection.query(sql, function (err, result) {
					if (!err) {
						res.send("1");
					}
				});
			}
		});
	});

	app.post('/update-jmaorder-invoice', function (req, res) {
		connection.query("SELECT count(invoice_no) as count FROM jma_orders WHERE invoice_no = '" + req.body.value + "'", function (err1, res1) {
			if (res1[0].count > 0) {
				res.send("0");
			} else {
				var sql = "UPDATE jma_orders SET invoice_no = '" + req.body.value + "' WHERE id = '" + req.body.id + "'";
				connection.query(sql, function (err, result) {
					if (!err) {
						res.send("1");
					}
				});
			}
		});
	});

	app.post('/update-warranties-invoice', function (req, res) {
		connection.query("SELECT count(invoice_no) as count FROM warranties WHERE invoice_no = '" + req.body.value + "'", function (err1, res1) {
			if (res1[0].count > 0) {
				res.send("0");
			} else {
				var sql = "UPDATE warranties SET invoice_no = '" + req.body.value + "' WHERE id = '" + req.body.id + "'";
				connection.query(sql, function (err, result) {
					if (!err) {
						res.send("1");
					}
				});
			}
		});
	});

	app.post('/update-location', function (req, res) {
		let id = req.body.id;
		let value = req.body.value;
		let class_name = req.body.class_name;
		sql = "UPDATE locations SET " + class_name + " = '" + value + "' WHERE id = '" + id + "'";
		connection.query(sql, function (err, result) {
			if (!err) {
				res.send("1");
			}
		});
	});

	app.post('/update-components', function (req, res) {
		let id = req.body.id;
		let value = req.body.value;
		let class_name = req.body.class_name;
		sql = "UPDATE products SET " + class_name + " = '" + value + "' WHERE id = '" + id + "'";
		connection.query(sql, function (err, result) {
			if (!err) {
				res.send("1");
			}
		});
	});

	function sendJSON(res, httpCode, body) {
		var response = JSON.stringify(body);
		res.send(httpCode, response);
	}
};
