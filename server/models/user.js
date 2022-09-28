'use strict';
module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('ms_users', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		employee_id: DataTypes.INTEGER,
		name: DataTypes.STRING,
		username: DataTypes.STRING,
		password: DataTypes.STRING,
		type: DataTypes.INTEGER,
		email: DataTypes.STRING,
		status: DataTypes.INTEGER,
		is_first_login: DataTypes.INTEGER,
		verified_at: DataTypes.DATE,
		forgot_password_at: DataTypes.DATE,
		google_token: DataTypes.STRING,
		google_token_expire: DataTypes.BIGINT,
		google_token_id: DataTypes.STRING,
		register_with: DataTypes.STRING,
		vendor_id: DataTypes.INTEGER,
		sanqua_company_id: DataTypes.INTEGER,
		user_level_id: DataTypes.INTEGER,
		fcm_token: DataTypes.STRING,
		fcm_token_web: DataTypes.STRING,
		fcm_token_expedition: DataTypes.STRING,
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
		},
		createdUser: {
			type: DataTypes.INTEGER,
			field: 'created_by'
		},
		updatedAt: {
			type: DataTypes.DATE,
			field: 'updated_at'
		},
		modifiedUser: {
			type: DataTypes.INTEGER,
			field: 'updated_by'
		}
	});

	User.associate = function(models) {
		User.belongsTo(models.ms_companies, {
			foreignKey: 'sanqua_company_id',
			onDelete: 'CASCADE',
			as: 'company'
		});

		// User.belongsTo( models.ms_userlevels, {
		//   foreignKey: 'user_level_id',
		//   onDelete: 'CASCADE',
		//   as: 'user_level',
		// } );

		User.belongsToMany(models.ms_userlevels, {
			through: 'ms_useruserlevels',
			as: 'user_level',
			foreignKey: 'user_id'
		});
	};

	return User;
};
