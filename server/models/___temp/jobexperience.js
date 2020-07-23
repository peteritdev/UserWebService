'use strict'
module.exports = (sequelize, DataTypes) => {
    const JobExperience = sequelize.define('user_history_job_experience',{
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        user_id: DataTypes.INTEGER,
        tgl_mulai_kerja: DataTypes.DATE,
        instansi: DataTypes.STRING,
        jabatan: DataTypes.STRING,
        tgl_mulai_thn: DataTypes.STRING,
        tgl_mulai_bln: DataTypes.STRING,
        approved: DataTypes.INTEGER,
        upload_pengalaman: DataTypes.STRING,
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
        tableName: 'user_history_job_experience'
    });

    JobExperience.associate = function( models ){
        JobExperience.belongsTo( models.users, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
            as: 'user'
        } );
    };

    return JobExperience;
}