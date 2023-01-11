'use strict';

module.exports = (sequelize, DataTypes) => {
	const ApprovalMatrix = sequelize.define(
		'ms_approvalmatrix',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			application_table_id: DataTypes.INTEGER,
			name: DataTypes.STRING,
			is_delete: DataTypes.INTEGER,
			deleted_at: DataTypes.DATE,
			deleted_by: DataTypes.INTEGER,
			deleted_by_name: DataTypes.STRING,

			company_id: DataTypes.INTEGER,
			company_name: DataTypes.STRING,
			department_id: DataTypes.INTEGER,
			department_name: DataTypes.STRING,

			ecatalogue_fpb_category_item: DataTypes.SMALLINT,

			createdAt: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('NOW()'),
				field: 'created_at'
			},
			created_by: DataTypes.INTEGER,
			created_by_name: DataTypes.STRING,

			updatedAt: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('NOW()'),
				field: 'created_at'
			},
			updated_by: DataTypes.INTEGER,
			updated_by_name: DataTypes.STRING
		},
		{
			tableName: 'ms_approvalmatrix'
		}
	);

	ApprovalMatrix.associate = function(models) {
		ApprovalMatrix.belongsTo(models.ms_applicationtables, {
			foreignKey: 'application_table_id',
			as: 'application_table',
			onDelete: 'CASCADE'
		});

		ApprovalMatrix.hasMany(models.ms_approvalmatrixapprovers, {
			foreignKey: 'approval_matrix_id',
			as: 'approval_matrix_approver',
			onDelete: 'CASCADE'
		});
	};

	return ApprovalMatrix;
};
