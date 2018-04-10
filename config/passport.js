var LocalStrategy   = require('passport-local').Strategy;
var md5 = require('md5');

module.exports = function(passport, connection) {

    passport.serializeUser(function(user, done) {
		done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
		connection.query("select * from users where id = "+id,function(err,rows){	
			done(err, rows[0]);
		});
    });
	
    passport.use('local-signup', new LocalStrategy({
        
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) {

        connection.query("select * from users where username = '"+username+"'",function(err,rows){
			console.log(rows);
			console.log("above row object");
			if (err)
                return done(err);
			 if (rows.length) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

                var newUserMysql = new Object();
				
				newUserMysql.username    = username;
                newUserMysql.password = password; // use the generateHash function in our user model
			
				var insertQuery = "INSERT INTO users ( username, password ) values ('" + username +"','"+ password +"')";
					console.log(insertQuery);
				connection.query(insertQuery,function(err,rows){
				newUserMysql.id = rows.insertId;
				
				return done(null, newUserMysql);
				});	
            }	
		});
    }));


    passport.use('local-login', new LocalStrategy({
        
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, username, password, done) {
        console.log("IN response");

         connection.query("SELECT * FROM `users` WHERE `username` = '" + username + "'",function(err,rows){
			if (err)
                return done(err);
			 if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            } 
			
            if (!( rows[0].password == md5(password)))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
			
            return done(null, rows[0]);			
		
		});
		


    }));

};