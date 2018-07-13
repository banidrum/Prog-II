var express = require('express');
var app = express();

app.get('/users', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM users ORDER BY id DESC',function(err, rows, fields) {
			if (err) {
				req.flash('error', err)
				res.render('users/list', {
					title: 'Usuários',
					data: ''
				})
			} else {
				res.render('users/list', {
					title: 'Usuários',
					data: rows
				})
			}
		})
	})
})

app.get('/edit/(:id)', function(req, res, next){
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM users WHERE id = ' + req.params.id, function(err, rows, fields) {
			if(err) throw err

			// Se usuário não é encontrado
			if (rows.length <= 0) {
				req.flash('error', 'Usuário nao encontrado ' + req.params.id)
				res.redirect('/')
			}
			else {
				res.render('users/edit', {
					title: 'Editar usuário',
					data: rows[0],
					id: rows[0].id,
					name: rows[0].name,
					username: rows[0].username

				})
			}
		})
	})
})

app.put('/edit/(:id)', function(req, res, next) {
    req.assert('name', 'Nome é obrigatório').notEmpty()  // Valida nome
	  req.assert('username', 'username é obrigatório').notEmpty()  // Valida usuario

    var errors = req.validationErrors()

    if( !errors ) {  //Sem erros, passou da validação

		var user= {
				name: req.sanitize('name').escape().trim(),
				username: req.sanitize('username').escape().trim()
		}

		req.getConnection(function(error, conn) {
			conn.query('UPDATE users SET ? WHERE id = ' + req.params.id, user, function(err, result) {
				if (err) {
					req.flash('error', err)

					res.render('users/edit', {
						title: 'Edit Country',
						id: req.params.id,
						name: req.body.name,
						username: req.body.username

					})
				} else {
					req.flash('success', 'Data updated successfully!')

					res.render('users/edit', {
						title: 'Editar usuário',
						id: req.params.id,
						name: req.body.name,
				    username: req.body.username
					 })
				}
			})
		})
	}
	else {
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)

        res.render('users/edit', {
            title: 'Editar usuário ',
      id: req.params.id,
      name: req.body.name,
      username: req.body.username


        })
    }
})


app.delete('/delete/(:id)', function(req, res, next) {
	var user = { id: req.params.id }

	req.getConnection(function(error, conn) {
		conn.query('DELETE FROM users WHERE id = ' + req.params.id, user, function(err, result) {
			if (err) {
				req.flash('error', err)
				// Redireciona para a página principal
				res.redirect('/')
			} else {
				req.flash('sucesso', 'Usuário deletado com sucesso! id = ' + req.params.id)
				res.redirect('/')
			}
		})
	})
})

module.exports = app
