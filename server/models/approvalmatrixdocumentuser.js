'use strict'

module.exports = ( sequelize, DataTypes ) => {
    const ApprivalMatrixDocumentUser = sequelize.define( 'tr_approvalmatrixdocumentusers', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        approval_matrix_document_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        user_name: DataTypes.STRING,
        status: DataTypes.INTEGER, //0: Pending, 1: Approve, -1: Reject

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

    ApprivalMatrixDocumentUser.associate = function( models ){
        ApprivalMatrixDocumentUser.belongsTo( models.tr_approvalmatrixdocuments, {
            foreignKey: 'approval_matrix_document_id',
            as: 'approval_matrix_document',
            onDelete: 'CASCADE',
        } );

        ApprivalMatrixDocumentUser.belongsTo( models.ms_users, {
            foreignKey: 'user_id',
            as: 'user',
            onDelete: 'CASCADE',
        } );
    }

    return ApprivalMatrixDocumentUser;
}