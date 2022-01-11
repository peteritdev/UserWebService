'use strict';

module.exports = (sequelize, DataTypes) => {
	const ThirdPartyUser = sequelize.define('ms_thirdpartyusers', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		name: DataTypes.STRING,
		client_id: DataTypes.STRING,
		client_secret: DataTypes.STRING,
		whitelist_ip: DataTypes.STRING,
		port: DataTypes.INTEGER,

		refresh_token: DataTypes.STRING,
		access_token: DataTypes.STRING,

		status: DataTypes.INTEGER,
		is_delete: DataTypes.INTEGER,
		deleted_at: DataTypes.DATE,
		deleted_by: DataTypes.INTEGER,
		deleted_by_name: DataTypes.STRING,

		createdAt: {
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
		},
		created_by: DataTypes.INTEGER,
		created_by_name: DataTypes.STRING,
		updatedAt: {
			type: DataTypes.DATE,
			field: 'updated_at'
		},
		updated_by: DataTypes.INTEGER,
		updated_by_name: DataTypes.STRING
	});

	return ThirdPartyUser;
};
