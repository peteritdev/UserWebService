'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('ms_users', {
    id: {
    	type: DataTypes.INTEGER,
    	primaryKey: true,
    	autoIncrement: true
    },
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    type: DataTypes.INTEGER,
    email: DataTypes.STRING,
    status: DataTypes.INTEGER,
    is_first_login: DataTypes.INTEGER,
    verified_at: DataTypes.DATE,
    forgot_password_at: DataTypes.DATE,
    google_token: DataTypes.STRING,
    google_token_expire: DataTypes.BIGINT,
    google_token_id: DataTypes.STRING,
    register_with: DataTypes.STRING,
    createdAt:{
    	type: DataTypes.DATE,
    	defaultValue: sequelize.literal('NOW()'),
    	field: 'created_at'
    },
    createdUser:{
    	type: DataTypes.INTEGER,
    	field: 'created_by'
    },
    updatedAt:{
    	type: DataTypes.DATE,
    	field: 'updated_at'
    },
    modifiedUser:{
    	type: DataTypes.INTEGER,
    	field: 'updated_by'
    }
  });
  return User;
};