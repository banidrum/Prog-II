var LocalStrategy   = require('passport-local').Strategy;

// Carrega o modelo de usuario
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {

    //Configuração do passport

    // Determina o que deve ser armazenado na sessão
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Encontra o usuário no banco
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

  //Validação da entrada do usuário

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
          },
        function(req, username, password, done) {
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    //Se não existe, cria um novo usuário
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)  // Criptografa a senha
                    };

                    var insertQuery = "INSERT INTO users (username, password ) values (?, ?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    //Login

    passport.use(
        'local-login',
        new LocalStrategy({
            // Cria uma nova estratégia do passport
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true //
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Usuário nao encontrado.'));
                }

                // Se a senha está errada
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Senha errada.')); //

                return done(null, rows[0]);
            });
        })
    );
};
