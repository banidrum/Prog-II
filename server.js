var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 3000;

var passport = require('passport');
var flash    = require('connect-flash');
var users = require("./app/users")

var methodOverride = require('method-override')

//Method override serve para usar métodos HTTP
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

//Arquivo de configuração para o banco

require('./config/passport')(passport); // pass passport for configuration

// Configuração do express
app.use(morgan('dev'));
app.use(cookieParser()); // Lê os cookies
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(express.static('imgs'));


app.set('view engine', 'ejs'); // EJS como template

// Necessário para o passport
app.use(session({
	secret: 'teste', // NÃO DEVE SER FEITO EM PRODUÇÃO
	resave: true,
	saveUninitialized: true
 } ));
app.use(passport.initialize());
app.use(passport.session()); // Session do login
app.use(flash()); // Retorna mensagens de erro/sucesso

app.use('/users', users);


//Rotas
require('./app/routes.js')(app, passport); // Carrega as rotas com o app e o passport

// Starta
app.listen(port);
console.log('Servidor iniciado na porta: ' + port);
