'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const ApprovalMatrixDocument = sequelize.define( 'tr_approvalmatrixdocuments', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        // approval_matrix_approver_id: DataTypes.INTEGER,
        document_id: DataTypes.INTEGER,
        document_no: DataTypes.STRING,
        sequence: DataTypes.INTEGER,
        min_approver: DataTypes.INTEGER,
        total_approved: DataTypes.INTEGER,

        is_delete: DataTypes.INTEGER,
        table_name: DataTypes.STRING,
        application_name: DataTypes.STRING,
        application_id: DataTypes.INTEGER,

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

    ApprovalMatrixDocument.associate = function( models ){
        ApprovalMatrixDocument.hasMany(models.tr_approvalmatrixdocumentusers, {
            foreignKey: 'approval_matrix_document_id',
            as: 'approval_matrix_document_user',
            onDelete: 'CASCADE',
        });
    }

    return ApprovalMatrixDocument;
}