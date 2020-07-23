const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const dateFormat = require('dateformat');
var config = require('../config/config.json');

modelNews = require( '../models' ).news;
modelUser = require( '../models' ).users;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

    list( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var keyword = req.query.keyword;
				var offset = parseInt(req.query.offset);
				var limit = parseInt(req.query.limit);
                var draw = req.query.draw;
                var xRoleId = req.query.id;
                
                var joData = [];

                if( xRoleId == 1 || xRoleId == 3 ){
                    return modelNews.findAndCountAll({
                        where: {
                            [Op.or]:[
                                {
                                    title:{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    content:{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                }
                            ]
                        },
                        include: [
                            {
                                model: modelUser,
                                as: 'user'
                            }
                        ]
                    })
                    .then( data => {
                        modelNews.findAll({
                            where: {
                                [Op.or]:[
                                    {
                                        title:{
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        content:{
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    }
                                ]
                            },
                            include: [
                                {
                                    model: modelUser,
                                    as: 'user'
                                }
                            ],
                            order:[['effective_date','ASC']]
                        })
                        .then( news => {
                            for( let i = 0; i < news.length; i++ ){
                                libUtil.getEncrypted( (news[i].id).toString(), function( encryptedData ){
            
                                    var linkDetail = '<a href="#" class="btn bg-green" name="link-detail-news" data-toggle="modal" data-target="#modal-detail-news" data="' + encryptedData + '" data-type="detail"><span class="glyphicon glyphicon-search fa-1x"></span></a>';
                                    var linkEdit = '<a href="#" class="btn bg-blue" name="link-edit-news" data-toggle="modal" data-target="#modal-news-form" data="' + encryptedData + '" data-type="edit"><span class="glyphicon glyphicon-pencil fa-1x"></span></a>';
                                    var linkDelete = '<a href="#" class="btn bg-red" name="link-delete-news" data-toggle="modal" data-target="#modal-confirm-delete-news" data="' + encryptedData + '"><span class="glyphicon glyphicon-remove fa-1x"></span></a>';

                                    joData.push({                                    
                                        post_date: news[i].createdAt,
                                        title: news[i].title,
                                        effective_date: news[i].effective_date,
                                        expire_at: news[i].expire_at,
                                        post_by: ( news[i].user == null ? '-' : news[i].user.name ),
                                        navigation: linkDetail + '&nbsp;' + linkEdit + '&nbsp;' + linkDelete
                                    });
                                    
                                });                               
                                
                            }

                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "data": joData,
                                "recordsTotal": data.count,
                                "recordsFiltered": data.count,
                                "draw": draw
                            });

                            console.log(joResult);
    
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);

                        } );
                    } );
                }else{
                    joResult = JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Anda tidak memiliki akses ke halaman ini."
                    });

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                }

                
            }
        });
    },

    detail( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var xId = req.query.id;
                var xRoleId = req.query.role_id;
                
                var joData = [];

                if( xRoleId == 1 || xRoleId == 3 ){

                    libUtil.getDecrypted( (xId).toString(), function( decryptedId ){
                        return modelNews.findOne({
                            where: {
                                id: decryptedId
                            },
                            include: [
                                {
                                    model: modelUser,
                                    as: 'user'
                                }
                            ]
                        })
                        .then( data => {

                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "post_date": data.createdAt,
                                "title": data.title,
                                "content": data.content,
                                "effective_date": data.effective_date,
                                "expire_at": data.expire_at,
                                "status": data.status,
                                "post_by": ( data.user == null ? '-' : data.user.name )
                            });

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        } );

                    });
                }else{
                    joResult = JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Anda tidak memiliki akses ke halaman ini."
                    });

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                }

                
            }
        });
    },

    save( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var xRoleId = req.body.role_id;
                
                var joData = [];

                if( xRoleId == 1 || xRoleId == 3 ){

                    if( req.body.act == 'add' ){
                        console.log(">>> LOG : Add");
                        return modelNews
                            .findOrCreate({
                                where:{
                                    title: req.body.title
                                },
                                defaults:{
                                    content: req.body.content,
                                    effective_date: req.body.effective_date,
                                    expire_at: req.body.expire_at,
                                    status: req.body.status
                                }

                            })
                            .spread( (news, created) => {
                                if( created ){
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "News berhasil disimpan."
                                    });
                                }else{
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "News tidak dapat duplikat"
                                    });
                                }

                                res.setHeader('Content-Type','application/json');
                                res.status(201).send(joResult);
                            } );
                    }else{
                        console.log(">>> LOG : Edit");
                        var xId = req.body.id;
                        libUtil.getDecrypted( (xId).toString(), function( decryptedId ){
                            return modelNews.update({
                                title: req.body.title,
                                content: req.body.content,
                                effective_date: req.body.effective_date,
                                expire_at: req.body.expire_at,
                                status: req.body.status
                            },{
                                where: {
                                    id: decryptedId
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "News berhasil disimpan"
                                });
                                res.setHeader('Content-Type','application/json');
                                res.status(201).send(joResult);
                            } );
                        });
                    }
                    

                }else{
                    joResult = JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Anda tidak memiliki akses ke halaman ini."
                    });

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                }
            }
        });
    },

    delete( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var newsId = req.body.id;

                libUtil.getDecrypted( req.body.id, function( decryptedId ){

                    return modelUser.findAll({
                        where:{
                            id: decryptedId
                        }
                    })
                    .then( data => {
                        if( data != null ){
    
                            modelNews.destroy({
                                where: {
                                    id: decryptedId
                                }
                            })
                            .then( dataDelete => {
    
                                joResult = JSON.stringify({
                                    'status_code': '00',
                                    'status_msg': 'News berhasil dihapus'
                                });
                                res.setHeader('Content-Type','application/json');
                                res.status(404).send(joResult);
    
                            } )
                            
                        }else{
                            joResult = JSON.stringify({
                                'status_code': '-99',
                                'status_msg': 'Data not found.'
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }
                    } );

                } );
				
            }
        });
    }

}