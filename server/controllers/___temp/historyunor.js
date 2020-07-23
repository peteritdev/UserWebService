const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;

var config = require('../config/config.json');


const modelHistoryUnor = require('../models').user_history_unor;
const modelUnor = require('../models').db_unor;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

    list(req,res){
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
                var id = req.query.id;

                var joData = [];
                
                libUtil.getDecrypted( req.query.id, function(decryptedId){

                    return modelHistoryUnor.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    '$unor.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    no_sk:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    prosedur_asal:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                }
                            ],
                            [Op.and]:[{
                                "user_id":decryptedId
                            }]
                        },
                        include:[
                            {
                                model: modelUnor,
                                as: 'unor'
                            }
                        ]
                    })
                    .then( data => {
                        modelHistoryUnor.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        '$unor.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        no_sk:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        prosedur_asal:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    }
                                ],
                                [Op.and]:[{
                                    "user_id":decryptedId
                                }]
                            },
                            include:[
                                {
                                    model: modelUnor,
                                    as: 'unor'
                                }
                            ],                     
                            limit: limit,
                            offset: offset,
                        })
                        .then( historyUnor => {

                            for( var i = 0; i < historyUnor.length; i++ ){

                                libUtil.getEncrypted( (historyUnor[i].id).toString(), function(ecnryptedData){                                    
                                    //libUtil.getEncrypted( (historyUnor[i].user_id).toString(), function(ecnryptedUserData){

                                        /*var status = '';
                                        var navigationEdit = '';
                                        var navigationDetail = '';
                                        var navigationDelete = '';

                                        var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                            ecnryptedUserData + config.frontParam.separatorData +  
                                                            profesi[i].profesi_id + config.frontParam.separatorData + 
                                                            profesi[i].penyelenggara + config.frontParam.separatorData +
                                                            profesi[i].tahun_lulus;
                                        status = '<small class="label pull-left bg-green">Aktif</small>';
                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-edit-profesi" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDetail = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-detail-profesi" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-profesi" class="btn bg-red" name="link-delete-profesi" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';*/

                                        var linkUploadSK = '<a href="#" name="link-modal-upload-sk-unor" class="btn btn-warning btn-md" data-toggle="modal" data-target="#modal-upload-sk-unor" data-edit="' + ecnryptedData + '"><i class="glyphicon glyphicon-upload"></i></a>';
                                        var columnSKVal = '';
                                        /*linkUploadSK = '<a href="#" name="link-modal-upload-sk-unor" class="btn btn-warning btn-md" data-toggle="modal" data-target="#modal-upload-sk-unor" data-edit="' + ecnryptedData + '"><i class="glyphicon glyphicon-upload"></i></a>';
                                        if( historyUnor[i].file_sk != '' && historyUnor[i].file_sk != null ){
                                            linkUploadSK = linkUploadSK + ' <a href="' + config.frontParam.filePath.fileSKUnor + historyUnor[i].file_sk + '" class="btn btn-primary btn-md"><i class="glyphicon glyphicon-download"></i>&nbsp;Download</button>';
                                        }*/
                                        
                                        // Version 1:
                                        /*linkUploadSK = '<div class="btn-group">' + 
                                                       '    <button type="button" class="btn btn-default">Action</button>' +
                                                       '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' + 
                                                       '        <span class="caret"></span>' + 
                                                       '        <span class="sr-only">Toggle Dropdown</span>' + 
                                                       '    </button>' + 
                                                       '    <ul class="dropdown-menu" role="menu">' +
                                                       '        <li><a href="#" name="link-modal-upload-sk-unor" data-toggle="modal" data-target="#modal-upload-sk-unor" data-edit="' + ecnryptedData + '">Upload SK</a></li>';
                                        //<li><a href="#">Download SK</a></li>
                                        if( historyUnor[i].file_sk != '' && historyUnor[i].file_sk != null ){
                                            linkUploadSK += '<li><a href="' + config.frontParam.filePath.fileSKUnor + historyUnor[i].file_sk + '">Download SK</a></li>';
                                        }                                        
                                        
                                        linkUploadSK += '   </ul>' +
                                                        '</div>';*/

                                        // Version 2 :                                         
                                        if( historyUnor[i].file_sk != '' && historyUnor[i].file_sk != null ){
                                            columnSKVal = '<a href="' + config.frontParam.filePath.fileSKUnor + historyUnor[i].file_sk + '">' + historyUnor[i].no_sk + '</a>';
                                        }else{
                                            columnSKVal = historyUnor[i].no_sk
                                        }

                                        joData.push({
                                            index: (i+1),
                                            unor: {
                                                id: ( historyUnor[i].unor !== null ? historyUnor[i].unor.id : 0 ),
                                                name: ( historyUnor[i].unor !== null ? historyUnor[i].unor.name : "" )
                                            },
                                            no_sk: columnSKVal,
                                            tgl_sk: ( historyUnor[i].tgl_sk !== null && historyUnor[i].tgl_sk !== "" && historyUnor[i].tgl_sk !== "0000-00-00" ? dateFormat(historyUnor[i].tgl_sk, "dd-mm-yyyy") : ""),
                                            prosedur_asal: historyUnor[i].prosedur_asal,
                                            link_upload_sk: linkUploadSK
                                        });

                                    //});

                                } );

                            }          
                            
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "data": joData,
                                "recordsTotal": data.count,
                                "recordsFiltered": data.count,
                                "draw": draw
                            });

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);

                        } );                        

                    } );
                });
                                     
                
            }
        });
    },

    uploadSK( req, res ){
		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
				libUtil.getDecrypted( req.body.id, function(decryptedId){                   

					modelHistoryUnor.update({
						file_sk: req.body.file_name
					},{
						where:{
							id: decryptedId
						}
					})
					.then( () => {
						joResult = JSON.stringify({
							"status_code": "00",
							"status_msg": "Upload file SK berhasil."
						});
						res.setHeader('Content-Type','application/json');
						res.status(201).send(joResult);
					} )
					.catch( error => res.status(400).send(error) );
				});
			}
		});
	}

    
}