module.exports = function(app, passport) {

	app.get('/', function(req, res) {

		var msg = req.flash('loginMessage')[0];
		
		res.render('login',{layout:'login',message: msg});
	});


	
	// process the login form
	app.post('/', passport.authenticate('local-login', {
            successRedirect : '/orders',
            failureRedirect : '/',
            failureFlash : true 
		}),
        function(req, res) {
            if (req.body.remember_me) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        
		res.redirect('/');
    });

};
