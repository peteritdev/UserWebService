'use strict';

const sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	const LogClientApplicationState = sequelize.define('log_clientapplicationstates', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		client_application_id: DataTypes.INTEGER,
		state: DataTypes.STRING,
		scope: DataTypes.STRING,

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

	LogClientApplicationState.associate = function(models) {
		LogClientApplicationState.belongsTo(models.ms_clientapplications, {
			foreignKey: 'client_application_id',
			as: 'client_application',
			onDelete: 'CASCADE'
		});
	};

	return LogClientApplicationState;
};
