'use strict';

const sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	const LogClientApplicationAuthorization = sequelize.define('log_clientapplicationauthorizations', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		client_application_id: DataTypes.INTEGER,
		client_id: DataTypes.STRING,
		state: DataTypes.STRING,
		code: DataTypes.STRING,
		token: DataTypes.STRING,
		refresh_token: DataTypes.STRING,
		code_expire_in: DataTypes.INTEGER,
		scope: DataTypes.STRING,
		email: DataTypes.STRING,

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

	LogClientApplicationAuthorization.associate = function(models) {
		LogClientApplicationAuthorization.belongsTo(models.ms_clientapplications, {
			foreignKey: 'client_application_id',
			as: 'client_application',
			onDelete: 'CASCADE'
		});
	};

	return LogClientApplicationAuthorization;
};
