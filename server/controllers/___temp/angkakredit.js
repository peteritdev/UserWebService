const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;

var config = require('../config/config.json');


const modelAngkaKredit = require('../models').user_history_angkakredit;

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

                    return modelAngkaKredit.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    no_sk:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    nama_jabatan:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                }
                            ],
                            [Op.and]:[{
                                "user_id":decryptedId
                            }]
                        }
                        
                    })
                    .then( data => {
                        modelAngkaKredit.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        no_sk:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        nama_jabatan:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    }
                                ],
                                [Op.and]:[{
                                    "user_id":decryptedId
                                }]
                            },                     
                            limit: limit,
                            offset: offset,
                        })
                        .then( angkaKredit => {

                            for( var i = 0; i < angkaKredit.length; i++ ){

                                libUtil.getEncrypted( (angkaKredit[i].id).toString(), function(ecnryptedData){                                    
                                    //libUtil.getEncrypted( (angkaKredit[i].user_id).toString(), function(ecnryptedUserData){

                                        var status = '';
                                        var navigationEdit = '';
                                        var navigationDetail = '';
                                        var navigationDelete = '';
                                        var linkUploadSK = '<a href="#" name="link-modal-upload-sk-angkakredit" class="btn btn-warning btn-md" data-toggle="modal" data-target="#modal-upload-sk-angkakredit" data-edit="' + ecnryptedData + '"><i class="glyphicon glyphicon-upload"></i></a>';
                                        var columnSKVal = '';

                                        var kreditUtama = 0;
                                        var kreditPenunjang = 0;
                                        var totalKredit = 0;

                                        if( angkaKredit[i].kredit_utama_baru !== "" && angkaKredit[i].kredit_utama_baru !== null ){
                                            kreditUtama = parseFloat( angkaKredit[i].kredit_utama_baru );
                                        }

                                        if( angkaKredit[i].kredit_penunjang_baru !== "" && angkaKredit[i].kredit_penunjang_baru !== null ){
                                            kreditPenunjang = parseFloat( angkaKredit[i].kredit_penunjang_baru );
                                        }

                                        totalKredit = kreditUtama + kreditPenunjang;

                                        /*var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                            ecnryptedUserData + config.frontParam.separatorData +  
                                                            hukdis[i].jenis_hukuman_id + config.frontParam.separatorData + 
                                                            hukdis[i].no_sk_hd + config.frontParam.separatorData + 
                                                            ( hukdis[i].tgl_sk_hd !== null && hukdis[i].tgl_sk_hd !== "" && hukdis[i].tgl_sk_hd !== "0000-00-00" ? dateFormat(hukdis[i].tgl_sk_hd, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                            ( hukdis[i].tmt_hd !== null && hukdis[i].tmt_hd !== "" && hukdis[i].tmt_hd !== "0000-00-00" ? dateFormat(hukdis[i].tmt_hd, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                            ( hukdis[i].masa_hukuman_tahun !== null ? hukdis[i].masa_hukuman_tahun : 0 ) + config.frontParam.separatorData + 
                                                            ( hukdis[i].masa_hukuman_bulan !== null ? hukdis[i].masa_hukuman_bulan : 0 ) + config.frontParam.separatorData + 
                                                            hukdis[i].no_pp + config.frontParam.separatorData + 
                                                            hukdis[i].alasan_hukuman + config.frontParam.separatorData + 
                                                            hukdis[i].keterangan;
                                        status = '<small class="label pull-left bg-green">Aktif</small>';
                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-edit-hukdis" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDetail = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-detail-hukdis" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-hukdis" class="btn bg-red" name="link-delete-hukdis" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';*/

                                        // Version 1 : 
                                        /*linkUploadSK = '<div class="btn-group">' + 
                                                       '    <button type="button" class="btn btn-default">Action</button>' +
                                                       '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' + 
                                                       '        <span class="caret"></span>' + 
                                                       '        <span class="sr-only">Toggle Dropdown</span>' + 
                                                       '    </button>' + 
                                                       '    <ul class="dropdown-menu" role="menu">' +
                                                       '        <li><a href="#" name="link-modal-upload-sk-angkakredit" data-toggle="modal" data-target="#modal-upload-sk-angkakredit" data-edit="' + ecnryptedData + '">Upload SK</a></li>';
                                        //<li><a href="#">Download SK</a></li>
                                        if( angkaKredit[i].file_sk != '' && angkaKredit[i].file_sk != null ){
                                            linkUploadSK += '<li><a href="' + config.frontParam.filePath.fileSKAngkaKredit + angkaKredit[i].file_sk + '">Download SK</a></li>';
                                        }                                        
                                        
                                        linkUploadSK += '   </ul>' +
                                                        '</div>';*/

                                        // Version 2 :                                         
                                        if( angkaKredit[i].file_sk != '' && angkaKredit[i].file_sk != null ){
                                            columnSKVal = '<a href="' + config.frontParam.filePath.fileSKAngkaKredit + angkaKredit[i].file_sk + '">' + angkaKredit[i].no_sk + '</a>';
                                        }else{
                                            columnSKVal = angkaKredit[i].no_sk
                                        } 

                                        joData.push({
                                            index: (i+1),
                                            no_sk: columnSKVal,
                                            tgl_sk:  ( angkaKredit[i].tgl_sk !== null && angkaKredit[i].tgl_sk !== "" && angkaKredit[i].tgl_sk !== "0000-00-00" ? dateFormat(angkaKredit[i].tgl_sk, "dd-mm-yyyy") : ""),                                            
                                            bln_mulai: angkaKredit[i].bln_mulai,
                                            thn_mulai: angkaKredit[i].thn_mulai,
                                            bln_selesai: angkaKredit[i].bln_selesai,
                                            thn_selesai: angkaKredit[i].thn_selesai,
                                            kredit_utama_baru: kreditUtama,
                                            kredit_penunjang_baru: kreditPenunjang,
                                            total_kredit: totalKredit ,
                                            nama_jabatan: angkaKredit[i].nama_jabatan,
                                            link_upload_sk:linkUploadSK
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

					modelAngkaKredit.update({
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