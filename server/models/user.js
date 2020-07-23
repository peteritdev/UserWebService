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
    
    is_first_login: DataTypes.INTEGER,
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