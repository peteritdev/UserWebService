'use strict';
module.exports = (sequelize, DataTypes) => {
    const JobExperiencePending = sequelize.define('user_history_job_experience_pending',{

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
        upload_pengalaman: DataTypes.STRING,

        ref_id: DataTypes.INTEGER,
        approved: DataTypes.INTEGER,
        approved_user_id: DataTypes.INTEGER,
        
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
        tableName:'user_history_job_experience_pending'
    });

    JobExperiencePending.associate = function(models){
        JobExperiencePending.belongsTo(models.users,{
            foreignKey: 'user_id',
            onDelete:'CASCADE',
            as: 'user'
        });

        JobExperiencePending.belongsTo(models.user_history_job_experience,{
            foreignKey: 'ref_id',
            onDelete:'CASCADE',
            as: 'jobExperience'
        });
    }

    return JobExperiencePending;
}