'use strict';

module.exports = (sequelize, DataTypes) => {
	const UserUserLevel = sequelize.define('ms_useruserlevels', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: DataTypes.INTEGER,
		user_level_id: DataTypes.INTEGER,
		status: DataTypes.INTEGER,
		is_delete: DataTypes.INTEGER,
		deleted_at: DataTypes.DATE,
		deleted_by: DataTypes.INTEGER,
		deleted_by_name: DataTypes.STRING,
		allowed_company: DataTypes.JSON,

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

	UserUserLevel.associate = function(models) {
		UserUserLevel.belongsTo(models.ms_users, {
			foreignKey: 'user_id',
			as: 'user',
			onDelete: 'CASCADE'
		});

		UserUserLevel.belongsTo(models.ms_userlevels, {
			foreignKey: 'user_level_id',
			as: 'user_level',
			onDelete: 'CASCADE'
		});
	};

	return UserUserLevel;
};
