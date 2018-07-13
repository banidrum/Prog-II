module.exports = function(app, passport) {

	//Landing
	app.get('/', function(req, res) {
		res.render('index.ejs'); //
	});

	//Formulário de login
	app.get('/login', function(req, res) {

		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	//Processa o formulário
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile',
            failureRedirect : '/login',
            failureFlash : true
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

//Registro
	app.get('/register', function(req, res) {

		res.render('register.ejs', { message: req.flash('signupMessage') });
	});


	app.post('/register', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/register',
		failureFlash : true
	}));

	//Sessão do perfil de usuário
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/about', function(req, res){
		res.render("about");
	});

	app.get('/contato', function(req, res){
		res.render('contato');
	});

	app.get('/users', function(req, res){
		res.render("users/list");
	});



};



function isLoggedIn(req, res, next) {


	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
