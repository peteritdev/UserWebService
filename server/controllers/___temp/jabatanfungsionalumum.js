const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const dateFormat = require('dateformat');
var config = require('../config/config.json');
const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

const moment    = require('moment');
var env         = process.env.NODE_ENV || 'development';
var configEnv    = require(__dirname + '/../config/config.json')[env];
var config = require('../config/config.json');
var Sequelize   = require('sequelize');
const Op        = Sequelize.Op;
var sequelize   = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const promise   = require('promise');

const modelJabatanFungsionalUmum = require('../models').db_jabatan_fungsional_umum;

module.exports = {
    list(req,res){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var xKeyword = req.query.keyword;
				var xOffset = parseInt(req.query.offset);
				var xLimit = parseInt(req.query.limit);
                var xDraw = req.query.draw;
                var xId = req.query.id;

                var joData = [];
                var xStrSql = "";
                var xObjJSONWhere = {};

                if( req.query.keyword != "" ){
                    filterKeyword = " AND ( jfu.name LIKE '%" + xKeyword + "%' OR un.name LIKE '%" + xKeyword + "%' ) ";
                }

                xStrSql = " SELECT id,  ";

            }
        });
    }
}