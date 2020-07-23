'use strict';

module.exports = ( sequelize, DataTypes ) => {
    const DP3 = sequelize.define( 'user_history_dp3', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        pangkat_id: DataTypes.INTEGER,
        tahun: DataTypes.INTEGER,
        kesetiaan:DataTypes.INTEGER,
        kesetiaan_desc: DataTypes.STRING,
        tanggung_jawab: DataTypes.INTEGER,
        tanggung_jawab_desc: DataTypes.STRING,
        kejujuran: DataTypes.INTEGER,
        kejujuran_desc : DataTypes.STRING,
        prakarsa: DataTypes.INTEGER,
        prakarsa_desc: DataTypes.STRING,
        prestasi_kerja: DataTypes.INTEGER,
        prestasi_kerja_desc: DataTypes.STRING,
        ketaatan: DataTypes.INTEGER,
        ketaatan_desc: DataTypes.STRING,
        kerjasama: DataTypes.INTEGER,
        kerjasama_desc: DataTypes.STRING,
        kepemimpinan: DataTypes.INTEGER,
        kepemimpinan_desc: DataTypes.STRING,
        jumlah: DataTypes.INTEGER,
        nilai_rata_rata: DataTypes.DECIMAL,
        nilai_desc: DataTypes.STRING,
        pejabat_penilai_id: DataTypes.INTEGER,
        atasan_pejabat_penilai_id: DataTypes.INTEGER,
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
        tableName: 'user_history_dp3'
    } );

    DP3.associate = function ( models ){
        DP3.belongsTo( models.db_pangkat, {
            foreignKey: 'pangkat_id',
            onDelete: 'CASCADE',
            as: 'pangkat'
        } );

        DP3.belongsTo( models.users, {
            foreignKey: 'pejabat_penilai_id',
            onDelete: 'CASCADE',
            as: 'pejabatPenilai'
        } );

        DP3.belongsTo( models.users, {
            foreignKey: 'atasan_pejabat_penilai_id',
            onDelete: 'CASCADE',
            as: 'atasanPejabatPenilai'
        } );
    }

    return DP3;
}