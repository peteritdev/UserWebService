'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const ApprovalMatrixApprover = sequelize.define( 'ms_approvalmatrixapprovers', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        approval_matrix_id: DataTypes.INTEGER,
        sequence: DataTypes.INTEGER,
        min_approver: DataTypes.INTEGER,

        is_delete: DataTypes.INTEGER,
        deleted_at: DataTypes.DATE,
        deleted_by: DataTypes.INTEGER,
        deleted_by_name: DataTypes.STRING,

        createdAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },
        created_by: DataTypes.INTEGER,
        created_by_name: DataTypes.STRING,

        updatedAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },
        updated_by: DataTypes.INTEGER,
        updated_by_name: DataTypes.STRING,
    } );

    ApprovalMatrixApprover.associate = function( models ){
        ApprovalMatrixApprover.belongsTo( models.ms_approvalmatrix, {
            foreignKey: 'approval_matrix_id',
            as: 'approval_matrix',
            onDelete: 'CASCADE',
        } );

        ApprovalMatrixApprover.hasMany( models.ms_approvalmatrixapproverusers, {
            foreignKey: 'approval_matrix_approver_id',
            as: 'approval_matrix_approver_user'
        } )
    }

    return ApprovalMatrixApprover;
}