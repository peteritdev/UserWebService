'use strict'
module.exports = ( sequelize, DataTypes ) => {
    const JenisJabatanSKP = sequelize.define( 'db_skp_jenisjabatan', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        name: DataTypes.STRING,
        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
        },
        updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
		}
    },{
        tableName: 'db_skp_jenisjabatan'
    } );

    return JenisJabatanSKP;
}