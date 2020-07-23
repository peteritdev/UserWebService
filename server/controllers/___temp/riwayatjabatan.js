const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');

var env         = process.env.NODE_ENV || 'development';
var config      = require(__dirname + '/../config/config.json')[env];
var Sequelize   = require('sequelize');
const Op        = Sequelize.Op;
var sequelize   = new Sequelize(config.database, config.username, config.password, config);
/*const sequelize = require('sequelize');
const Op = sequelize.Op;*/

var config = require('../config/config.json');

const modelRiwayatJabatan = require('../models').user_history_jabatan;
const modelPangkat = require('../models').db_pangkat;
const modelUnor = require('../models').db_unor;
const modelUnorInduk = require('../models').db_unor_induk;
const modelInstansiKerja = require('../models').db_instansi_kerja;
const modelSatuanKerja = require('../models').db_satuan_kerja;
const modelEselon = require('../models').db_eselon;
const modelJabatanFungsional = require('../models').db_jabatan_fungsional;
const modelJabatanFungsionalUmum = require('../models').db_jabatan_fungsional_umum;
const modelUser = require('../models').users;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

const riwayatJabatanService = require('../service/riwayatjabatanservice.js');

const jsonFind = require('json-find');

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
                var type = req.query.type;

                var joData = [];
                
                libUtil.getDecrypted( req.query.id, function(decryptedId){

                    var modelJob;
                    var filterJob;

                    if( type == 'PENDING' ){
                        /*modelJob = modelJobExperiencePending;
                        filterJob = {
                            "user_id":decryptedId,
                            "approved": 0
                        };*/
                    }else{
                        modelJob = modelRiwayatJabatan;
                        filterJob = {
                            "user_id":decryptedId
                        };
                    }
                    return modelJob.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    '$jenisJabatan.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    '$instansiKerja.name$': {
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                }
                            ],
                            [Op.and]:[filterJob]
                        },
                        include:[
                            {
                                model: modelPangkat,
                                as: 'jenisJabatan'
                            },
                            {
                                model: modelInstansiKerja,
                                as: 'instansiKerja'
                            },
                            {
                                model: modelSatuanKerja,
                                as: 'satuanKerja'
                            },
                            {
                                model: modelUnor,
                                as: 'unor'
                            },
                            {
                                model: modelUnorInduk,
                                as: 'unorInduk'
                            },
                            {
                                model: modelEselon,
                                as: 'eselon'
                            },
                            {
                                model: modelJabatanFungsional,
                                as: 'jabatanFungsional'
                            },
                            {
                                model: modelJabatanFungsionalUmum,
                                as: 'jabatanFungsionalUmum'
                            }
                        ]
                    })
                    .then( data => {
                        modelJob.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        '$jenisJabatan.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        '$instansiKerja.name$': {
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    }
                                ],
                                [Op.and]:[filterJob]
                            },
                            include:[
                                {
                                    model: modelPangkat,
                                    as: 'jenisJabatan'
                                },
                                {
                                    model: modelInstansiKerja,
                                    as: 'instansiKerja'
                                },
                                {
                                    model: modelSatuanKerja,
                                    as: 'satuanKerja'
                                },
                                {
                                    model: modelUnor,
                                    as: 'unor'
                                },
                                {
                                    model: modelUnorInduk,
                                    as: 'unorInduk'
                                },
                                {
                                    model: modelEselon,
                                    as: 'eselon'
                                },
                                {
                                    model: modelJabatanFungsional,
                                    as: 'jabatanFungsional'
                                },
                                {
                                    model: modelJabatanFungsionalUmum,
                                    as: 'jabatanFungsionalUmum'
                                }
                            ],
                            limit: limit,
                            offset: offset,
                        })
                        .then( riwayatJabatan => {

                            for( var i = 0; i < riwayatJabatan.length; i++ ){

                                libUtil.getEncrypted( (riwayatJabatan[i].id).toString(), function(ecnryptedData){
                                    
                                    libUtil.getEncrypted( (riwayatJabatan[i].user_id).toString(), function(ecnryptedUserData){

                                        //var filePengalaman = '<a href="' + config.frontParam.filePath.pengalamanKerja + jobExperience[i].upload_pengalaman +'">Download</a>';
                                        var status = '';
                                        var navigation = '';

                                        if( riwayatJabatan[i].approved == 0 ){
                                            status = '<small class="label pull-left bg-yellow">Menunggu</small>';
                                            navigation = '<a href="#" data-toggle="modal" data-target="#modal-confirm-jobexperience" class="btn btn-success" name="link-approve-jobexperience" data="' + ecnryptedData + '|' + ecnryptedUserData + '"><i class="glyphicon glyphicon-ok"></i></a>' + 
                                                        '&nbsp;' + 
                                                        '<a href="#" data-toggle="modal" data-target="#modal-confirm-jobexperience" class="btn btn-danger" name="link-reject-jobexperience" data="' + ecnryptedData + '|' + ecnryptedUserData + '"><i class="glyphicon glyphicon-remove"></i></a>';
                                        }else{
                                            /*
                                            var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                              ecnryptedUserData + config.frontParam.separatorData +  
                                                              jobExperience[i].instansi + config.frontParam.separatorData + 
                                                              jobExperience[i].jabatan + config.frontParam.separatorData +  
                                                              jobExperience[i].tgl_mulai_thn + config.frontParam.separatorData + 
                                                              jobExperience[i].tgl_mulai_bln;
                                            status = '<small class="label pull-left bg-green">Aktif</small>';
                                            navigation = '<a href="#" data-toggle="modal" data-target="#modal-frm-job-experience" class="btn bg-navy" name="link-edit-jobexperience" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                            */
                                        }

                                        joData.push({
                                            index: (i+1),
                                            jenis_jabatan: {
                                                id: ( riwayatJabatan[i].jenisJabatan == null ? '' : riwayatJabatan[i].jenisJabatan.id ),
                                                name: ( riwayatJabatan[i].jenisJabatan == null ? '' : riwayatJabatan[i].jenisJabatan.name ),
                                            },
                                            instansi_kerja:{
                                                id: ( riwayatJabatan[i].instansiKerja == null ? '' : riwayatJabatan[i].instansiKerja.id ),
                                                name: ( riwayatJabatan[i].instansiKerja == null ? '' : riwayatJabatan[i].instansiKerja.name ),
                                            },
                                            satuan_kerja:{
                                                id: ( riwayatJabatan[i].satuanKerja == null ? '' : riwayatJabatan[i].satuanKerja.id ),
                                                name: ( riwayatJabatan[i].satuanKerja == null ? '' : riwayatJabatan[i].satuanKerja.name ),
                                            },
                                            unor:{
                                                id: ( riwayatJabatan[i].unor == null ? '' : riwayatJabatan[i].unor.id ),
                                                name: ( riwayatJabatan[i].unor == null ? '' : riwayatJabatan[i].unor.name ),
                                            },
                                            unor_induk:{
                                                id: ( riwayatJabatan[i].unorInduk == null ? '' : riwayatJabatan[i].unorInduk.id ),
                                                name: ( riwayatJabatan[i].unorInduk == null ? '' : riwayatJabatan[i].jenisJabatan.name ),
                                            },
                                            eselon:{
                                                id: ( riwayatJabatan[i].eselon == null ? '' : riwayatJabatan[i].eselon.id ),
                                                name: ( riwayatJabatan[i].eselon == null ? '' : riwayatJabatan[i].eselon.name ),
                                            },
                                            jabatan_fungsional:{
                                                id: ( riwayatJabatan[i].jabatanFungsional == null ? '' : riwayatJabatan[i].jabatanFungsional.id ),
                                                name: ( riwayatJabatan[i].jabatanFungsional == null ? '' : riwayatJabatan[i].jabatanFungsional.name ),
                                            },
                                            jabatan_fungsional_umum:{
                                                id: ( riwayatJabatan[i].jabatanFungsionalUmum == null ? '' : riwayatJabatan[i].jabatanFungsionalUmum.id ),
                                                name: ( riwayatJabatan[i].jabatanFungsionalUmum == null ? '' : riwayatJabatan[i].jabatanFungsionalUmum.name ),
                                            },
                                            tmt_jabatan: riwayatJabatan[i].tmt_jabatan,
                                            no_sk: riwayatJabatan[i].no_sk,
                                            tanggal_sk: riwayatJabatan[i].tanggal_sk,
                                            tmt_pelantikan: riwayatJabatan[i].tmt_pelantikan
                                                
                                        });

                                    });

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

    /*treeView(req,res){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var unorId = req.query.id;
                var joData = [];

                return modelUnor.findAll({
                    where: {
                        [Op.or]:[
                            {
                                id: 15
                            },
                            {
                                parent_id:{
                                    [Op.ne]:null
                                }
                            }
                        ]
                    },
                    order:[
                        ['parent_id', 'ASC']
                    ]
                })
                .then( data => {
                    for( let i = 0; i < data.length; i++ ){

                        modelRiwayatJabatan.findAll({
                            where:{
                                unor_id: data[i].id,
                                jabatan_fungsional_umum_id: 0
                            },
                            include: [
                                {
                                    model: modelUser,
                                    as: 'user'
                                },{
                                    model: modelUnor,
                                    as: 'unor'
                                }
                            ],
                            limit: 1,
                            order:[
                                ['tmt_jabatan', 'DESC']
                            ]
                        })
                        .then( dataRiwayatJabatan => {            
                            for( let j = 0; j < dataRiwayatJabatan.length; j++ ){
                                joData.push({
                                    id: dataRiwayatJabatan[j].unor.id,
                                    parentid: ( dataRiwayatJabatan[j].unor.parent_id == null ? '' : dataRiwayatJabatan[j].unor.parent_id),
                                    name: dataRiwayatJabatan[j].unor.name,
                                    nodeTitlePro: dataRiwayatJabatan[j].unor.name,
                                    nodeContentPro: dataRiwayatJabatan[j].user.name
                                });
                            }

                            var filteredTree = [];

                            // Generate the tree view
                            console.log(">>> TEST");
                            console.log(joData);
                            //var tree = libUtil.generateJSONTree( joData );

                            // Filter the json based on choosen id
                            var data = JSON.parse(JSON.stringify(tree), function(key, value) {                        
                                if ( value.id == unorId ) filteredTree.push(value); 
                                return value; })

                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "data": filteredTree
                            });

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);

                        } )
                        .catch( error => {
                            console.log(">>> Error : " + error);
                            //libUtil.writeLog("Error Create [RiwayatJabatanService.getAnggotaUnor] : " + error);
                        } );   
                        
                        
                        
                    }

                    

                } );

            }

        });

    },*/

    /*treeView(req,res){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var unorId = req.query.id;
                var joData = [];

                return modelUnor.findAll({
                    where: {
                        [Op.or]:[
                            {
                                id: 15
                            },
                            {
                                parent_id:{
                                    [Op.ne]:null
                                }
                            }
                        ]
                    },
                    order:[
                        ['parent_id', 'ASC']
                    ]
                })
                .then( data => {                   

                    for( let i = 0; i < data.length; i++ ){   
                        var sql = " SELECT u.id, u.name AS unor_name, u.parent_id, us.name AS user_name " + 
                                    " FROM db_unor u INNER JOIN user_history_jabatan uhj ON u.id = uhj.unor_id " + 
                                    " INNER JOIN users us ON uhj.user_id = us.id " +
                                    " WHERE uhj.unor_id = " + data[i].id + 
                                    " AND uhj.jabatan_fungsional_umum_id = 0 " + 
                                    " ORDER BY uhj.tmt_jabatan DESC " +
                                    " LIMIT 1 ";

                        joData.push(
                            riwayatJabatanService.getAnggotaUnor(data[i]).then( function( pXTest ){
                                //console.log(">>> DATA xxx: " + JSON.stringify(pXTest));
                                return JSON.stringify(pXTest);
                            })
                        );
                        /*if( xTest.length != 0 ){
                            console.log(">>> TEST 2 : " + JSON.parse(xTest));
                            joData.push(
                                xTest
                            );
                        }*/
                         /*joData.push(
                           sequelize.query(
                                sql, 
                                {
                                    type: sequelize.QueryTypes.SELECT
                                }
                            )
                            .then( data2 => {

                                if( data2.length != 0 ){                                   
                                    return data2;
                                }
                                
                            }) 
                            //riwayatJabatanService.getAnggotaUnor2(data[i])
                        );
                    }    
                    
                    console.log(">>> DATA: "+  joData);
                    
                    var filteredTree = [];
                    var tree = libUtil.generateJSONTree( joData );
                   
                    // Filter the json based on choosen id
                    var data = JSON.parse(JSON.stringify(tree), function(key, value) {                        
                        if ( value.id == unorId ) filteredTree.push(value); 
                        return value; })

                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "OK",
                        //"data": filteredTree
                    });

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                    

                } );

            }

        });

    }*/

    treeView(req,res){

        /*jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{*/
                var unorId = req.query.id;
                var joData = [];

                var sql = " SELECT uhj.id, u.id AS unor_id, u.`parent_id`, u.name AS unor_name, uhj.tmt_jabatan, us.id AS user_id, us.name AS user_name " + 
                          " FROM db_unor u INNER JOIN `user_history_jabatan` uhj ON u.id = uhj.unor_id " + 
                          " INNER JOIN users us ON uhj.user_id = us.id " +
                          " WHERE uhj.`jabatan_fungsional_umum_id` = 0 " + 
                          " AND uhj.unor_id = 15 " + 
                          " AND uhj.id = ( " +
                          "     SELECT uhj2.id " + 
                          "     FROM user_history_jabatan uhj2 " + 
                          "     WHERE uhj2.unor_id = uhj.unor_id " + 
                          "     AND uhj2.`jabatan_fungsional_umum_id` = 0" + 
                          "     ORDER BY tmt_jabatan DESC " + 
                          "     LIMIT 1 " + 
                          " ) " + 
                          " UNION " + 
                          " SELECT uhj.id, u.id AS unor_id, u.`parent_id`, u.name AS unor_name, uhj.tmt_jabatan, us.id AS user_id, us.name AS user_name " + 
                          " FROM db_unor u INNER JOIN `user_history_jabatan` uhj ON u.id = uhj.unor_id " + 
                          " INNER JOIN users us ON uhj.user_id = us.id " +
                          " WHERE uhj.`jabatan_fungsional_umum_id` = 0 " + 
                          " AND u.`parent_id` IS NULL " + 
                          " AND uhj.id = ( " +
                          "     SELECT uhj2.id " + 
                          "     FROM user_history_jabatan uhj2 " + 
                          "     WHERE uhj2.unor_id = uhj.unor_id " + 
                          "     AND uhj2.`jabatan_fungsional_umum_id` = 0" + 
                          "     ORDER BY tmt_jabatan DESC " + 
                          "     LIMIT 1 " + 
                          " ) UNION " +
                          " SELECT uhj.id, u.id AS unor_id, u.`parent_id`, u.name AS unor_name, uhj.tmt_jabatan, us.id AS user_id, us.name AS user_name " + 
                          " FROM db_unor u INNER JOIN `user_history_jabatan` uhj ON u.id = uhj.unor_id " + 
                          " INNER JOIN users us ON uhj.user_id = us.id " +
                          " WHERE uhj.`jabatan_fungsional_umum_id` = 0 " + 
                          " AND uhj.unor_id <> 15 AND u.`parent_id` IS NOT NULL " + 
                          " AND uhj.id = ( " +
                          "     SELECT uhj2.id " + 
                          "     FROM user_history_jabatan uhj2 " + 
                          "     WHERE uhj2.unor_id = uhj.unor_id " + 
                          "     AND uhj2.`jabatan_fungsional_umum_id` = 0" + 
                          "     ORDER BY tmt_jabatan DESC " + 
                          "     LIMIT 1 " +  
                          " ) ";

                return sequelize.query(
                    sql, 
                    {
                        type: sequelize.QueryTypes.SELECT
                    }
                )
                .then( data => {
                    for( let i = 0; i < data.length; i++ ){

                        joData.push({
                            id: data[i].unor_id,
                            parentid: ( data[i].parent_id == null ? '' : data[i].parent_id),
                            name: data[i].user_name,
                            title: "Kepala " + data[i].unor_name
                        });                       
                        
                    }     
                    var xParentUnorId = riwayatJabatanService.getUnorParent( unorId );
                    xParentUnorId.then( function( pParentUnorId ){

                        var filteredTree = [];
                        var tree = libUtil.generateJSONTree( joData );

                        // Filter the json based on choosen id
                        var data = JSON.parse(JSON.stringify(tree), function(key, value) {                        
                            if ( value.id == pParentUnorId ) filteredTree.push(value); 
                            return value; })

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data": filteredTree
                        });

                        res.setHeader('Content-Type','application/json');
                        res.setHeader('Access-Control-Allow-Origin','*');
                        res.status(201).send(joResult);
                    } );                    

                } );

            /*}

        });*/

    }

}
