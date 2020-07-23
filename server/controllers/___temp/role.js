const modelRole = require('../models').ms_roles;

module.exports = {
	save( req, res ){
		return modelRole
			.create({
				roleName: req.body.role_name,
				//status: 1,
				createUser: req.headers['x-id']
			})
			.then( modelRole => res.status(201).send( modelRole ) )
			.catch( error => res.status(400).send(error) );
	},

	getDropDown( req, res ){

		var joData = [];
		var joResult;
		
		return modelRole
			.findAll()
			.then( data => {

				for( var i = 0; i < data.length; i++ ){
					joData.push({
						role_id: data[i].roleId,
						role_name: data[i].roleName
					});
				}

				var joResult = JSON.stringify({
					"err_code": "00",
					"err_msg": "OK",
					"data": joData
				});

				res.setHeader('Content-Type', 'application/json');
				res.status(201).send(joResult);

			} )

	}
};