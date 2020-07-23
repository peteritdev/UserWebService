'use strict';

module.exports = ( sequelize, DataTypes ) => {
    const UserAttendance = sequelize.define( 'user_attendances', {
        id:{
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        attendance_date: DataTypes.DATE,
        clock_in: DataTypes.TIME,
        clock_out: DataTypes.TIME,

        geoloc_latitude_clockin: DataTypes.FLOAT,
        geoloc_langitude_clockin: DataTypes.FLOAT,
        geoloc_latitude_clockout: DataTypes.FLOAT,
        geoloc_langitude_clockout: DataTypes.FLOAT,

        healthy_check_status: DataTypes.INTEGER,
        healthy_check_desc: DataTypes.STRING,

        healthy_check_status_clockout: DataTypes.INTEGER,
        healthy_check_desc_clockout: DataTypes.STRING,

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
        tableName: 'user_attendances'
    } );

    return UserAttendance;
}