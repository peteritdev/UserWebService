'use strict';
module.exports = ( sequelize, DataTypes ) => {
    const Kursus = sequelize.define( 'users_pendidikan_non_formal', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        code: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        tipe_kursus_id: DataTypes.INTEGER,
        jenis_kursus_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        penyelenggara: DataTypes.STRING,
        tgl_mulai: DataTypes.DATE,
        tgl_selesai: DataTypes.STRING,
        lama_kursus: DataTypes.INTEGER,
        tahun_kursus: DataTypes.INTEGER,
        no_piagam: DataTypes.STRING,
        createdAt:{
			type: DataTypes.DATE,
			defaultValue: sequelize.literal('NOW()'),
			field: 'created_at'
        },
        created_user:DataTypes.INTEGER,
        updatedAt:{
			type: DataTypes.DATE,
			field: 'updated_at'
        },
        updated_user:DataTypes.INTEGER
    },{
        tableName: 'users_pendidikan_non_formal'
    } );

    Kursus.associate = function( models ){
        Kursus.belongsTo( models.db_tipe_kursus,{
            foreignKey: 'tipe_kursus_id',
            onDelete: 'CASCADE',
            as: 'tipeKursus'
        } );

        Kursus.belongsTo(models.db_jenis_kursus,{
            foreignKey: 'jenis_kursus_id',
            onDelete: 'CASCADE',
            as: 'jenisKursus'
        });
    }

    return Kursus;
}