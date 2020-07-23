'use strict';
module.exports = ( sequelize, DataTypes ) => {

    const Skpensiun = sequelize.define('user_sk_pensiun',{

        id: {
            type: DataTypes.INTEGER,
    	    primaryKey: true,
    	    autoIncrement: true
        },

        user_id: DataTypes.INTEGER,
        no_bkn: DataTypes.STRING,
        tgl_bkn: DataTypes.DATE,
        no_sk_pensiun: DataTypes.STRING,
        tgl_pensiun: DataTypes.DATE,
        tmt_pensiun: DataTypes.DATE,
        golongan_id: DataTypes.INTEGER,
        masa_kerja_thn: DataTypes.STRING,
        masa_kerja_bln: DataTypes.STRING,
        unit_kerja_id: DataTypes.INTEGER,
        approved: DataTypes.INTEGER,

        createdAt:{
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at'
        },

        updatedAt:{
            type: DataTypes.DATE,
            field: 'updated_at'
        },
    },{
        tableName: 'user_sk_pensiun'
    });

    return Skpensiun;

};