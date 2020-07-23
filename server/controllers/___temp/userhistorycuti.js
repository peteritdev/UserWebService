const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const momentPrecise = require('moment-precise-range-plugin');
const passwordGenerator = require('generate-password');
const bcrypt = require('bcryptjs');
const dateFormat = require('dateformat');

const moment    = require('moment');
var env         = process.env.NODE_ENV || 'development';
var configEnv    = require(__dirname + '/../config/config.json')[env]; 
var config = require('../config/config.json');
var Sequelize   = require('sequelize');
const Op        = Sequelize.Op;
var sequelize   = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const promise   = require('promise');

const modelUserHistoryCuti = require( '../models' ).user_history_cuti;
const modelTujuanJabatan = require('../models').db_tujuan_jabatan;
const modelJenisCuti = require('../models').db_jenis_cuti;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');
const libNotif = require('../libraries/notification.js');
const libSetting = require('../libraries/setting.js');

module.exports = {

    list(req,res){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var type = req.query.type;
                var keyword = req.query.keyword;
				var xOffset = parseInt(req.query.offset);
				var xLimit = parseInt(req.query.limit);
                var draw = req.query.draw;
                var xId = req.query.id;
                var xJenisCuti = req.query.jenis_cuti;
                var xTglMulaiCuti = "";
                var xTglBerakhirCuti = "";
                var xLeaveStatus = req.query.status;

                var joData = [];

                //1=>Disetujui, 2=>Perubahan, 3=>Ditangguhkan, 4=>Tidak Disetujui
                var statusAtasanPejabat = ['Menunggu', 'Disetujui', 'Perubahan', 'Ditangguhkan', 'Tidak Disetujui'];
                var labelStatusAtasanPejabat = ['yellow', 'green', 'aqua', 'aqua', 'red'];

                //1=>Diterima, 2=>Dibatalkan, 0=>Pending
                var statusAdmin = ['Menunggu', 'Diterima', 'Dibatalkan'];
                var labelColorStatusAdmin = ['yellow', 'green', 'red'];

                if( req.query.tgl_mulai != null && req.query.tgl_mulai != "" ){
					xTglMulaiCuti = libUtil.parseToFormattedDate( req.query.tgl_mulai );
                }

                if( req.query.tgl_berakhir != null && req.query.tgl_berakhir != "" ){
					xTglBerakhirCuti = libUtil.parseToFormattedDate( req.query.tgl_berakhir );
                }                    
                

                libUtil.getDecrypted( req.query.id, function(decryptedId){

                    var strSql;
                    var strSqlCount;
                    var filterJob;
                    var filterJenisCuti = "";
                    var filterStatusLeave = "";
                    var filterTglCuti = "";
                    var filterUser = "";
                    var filterKeyword = "";
                    var orderCol = "";
                    var orderDir = "";

                    var objJSONWhere = {};

                    if( xJenisCuti != "" ){
                        filterJenisCuti = " AND jenis_cuti_id = :cutiId";
                        objJSONWhere.cutiId = xJenisCuti
                    }

                    if( xLeaveStatus != "" ){
                        filterStatusLeave = " AND status_admin_kepegawaian = :statusAdmin ";
                        objJSONWhere.statusAdmin = xLeaveStatus;
                    }                    

                    if( xTglMulaiCuti != "" && xTglBerakhirCuti != "" ){
                        
                        filterTglCuti = " AND ( ( tgl_mulai <= :tglMulai AND tgl_berakhir >= :tglBerakhir ) OR " + 
                                             "       ( tgl_mulai >= :tglMulai AND tgl_mulai <= :tglBerakhir ) OR " + 
                                             "       ( tgl_berakhir >= :tglMulai AND tgl_berakhir <= :tglBerakhir ) OR " + 
                                             "       ( tgl_mulai >= :tglMulai AND tgl_berakhir <= :tglBerakhir ) )" ;
                        objJSONWhere.tglMulai = xTglMulaiCuti;
                        objJSONWhere.tglBerakhir = xTglBerakhirCuti;
                    }      

                    if( req.query.keyword != "" ){
                        filterKeyword = " AND ( uh.nama_pegawai LIKE '%" + keyword + "%' OR uh.no_reference LIKE '%" + keyword + "%' ) ";
                    }

                    //console.log(">>> ROLE : " + req.query.role_id);
                    if( req.query.role_id != 1 && req.query.role_id != 3 ){
                        filterUser = " AND uh.user_id = :userId ";
                        objJSONWhere.userId = decryptedId;
                    }
                    
                    if( req.query.order_col != "" && req.query.order_dir != "" ){

                        if( req.query.order_col == 1 ){
                            orderCol = " ORDER BY nama_pegawai " + req.query.order_dir;
                        }else if( req.query.order_col == 3 ){
                            orderCol = " ORDER BY tgl_mulai " + req.query.order_dir;
                        }else if( req.query.order_col == 7 ){
                            orderCol = " ORDER BY uh.created_at " + req.query.order_dir;
                        }else{
                            orderCol = " ORDER BY uh.created_at DESC";
                        }

                        
                    }else{
                        orderCol = " ORDER BY uh.created_at DESC";
                    }

                    objJSONWhere.userId = decryptedId;
                    
                    strSql = " SELECT uh.id, " +
                             "        uh.user_id, " +  
                             "        uh.nama_pegawai, " +  
                             "        uh.nip, " +  
                             "        uh.no_reference, " + 
                             "        uh.tujuan_jabatan_id, " + 
                             "        tj.name AS tujuan_jabatan_name, " + 
                             "        uh.jenis_cuti_id, " + 
                             "        jc.name AS jenis_cuti_name, " + 
                             "        DATE_FORMAT(uh.tgl_mulai,'%d-%m-%Y') AS tgl_mulai_cuti, " + 
                             "        DATE_FORMAT(uh.tgl_berakhir,'%d-%m-%Y') AS tgl_berakhir_cuti, " + 
                             "        uh.lama_cuti AS lama_cuti, " +
                             "        uh.alasan_cuti AS alasan_cuti, " + 
                             "        uh.pertimbangan_atasan_langsung, " + 
                             "        uh.keputusan_pejabat, " + 
                             "        uh.status_admin_kepegawaian, " + 
                             "        DATE_FORMAT(uh.created_at,'%d-%m-%Y %H:%i:%s') AS created_at_cuti " + 
                             " FROM user_history_cuti uh INNER JOIN db_tujuan_jabatan tj ON uh.tujuan_jabatan_id = tj.id " + 
                             "      INNER JOIN db_jenis_cuti jc ON jc.id = uh.jenis_cuti_id " + 
                             " WHERE (1=1) AND uh.user_id IS NOT NULL " + filterJenisCuti + filterStatusLeave + filterTglCuti + filterUser + filterKeyword + orderCol + 
                             " LIMIT " + xOffset + "," + xLimit;

                    strSqlCount = " SELECT COUNT(0) AS num_row " + 
                                  " FROM user_history_cuti uh INNER JOIN db_tujuan_jabatan tj ON uh.tujuan_jabatan_id = tj.id " + 
                                  "      INNER JOIN db_jenis_cuti jc ON jc.id = uh.jenis_cuti_id " + 
                                  " WHERE (1=1) AND uh.user_id IS NOT NULL " + filterJenisCuti + filterStatusLeave + filterTglCuti + filterUser + filterKeyword;

                    console.log( ">>> STR SQL : " + strSql );

                    return sequelize.query( strSqlCount, {
                        replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                    } )
                    .then( data => {

                        sequelize.query( strSql, {
                            replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                        })
                        .then( historyCuti => {
                            for( var i = 0; i < historyCuti.length; i++ ){
    
                                libUtil.getEncrypted( (historyCuti[i].id).toString(), function(encryptedId){
                                    
                                    libUtil.getEncrypted( (historyCuti[i].user_id).toString(), function(ecnryptedUserData){
    
                                        //var filePengalaman = '<a href="' + config.frontParam.filePath.pengalamanKerja + jobExperience[i].upload_pengalaman +'">Download</a>';
                                        var statusPertimbanganAtasanLangsung = '';
                                        var statusKeputusanPejabat = '';
                                        var labelStatusAdmin = '';
                                        var navigation = '';
                                        var linkNoRef = '';
                                        var dataLinkConfirm = '';
    
                                        linkNoRef = '<a href="' + config.frontParam.baseUrl + '/leave/generateForm/' + encryptedId + '" target="_blank">' + historyCuti[i].no_reference + '</a>';
    
                                        dataLinkConfirm = encryptedId + config.frontParam.separatorData +   
                                                              historyCuti[i].no_reference + config.frontParam.separatorData + 
                                                              historyCuti[i].nip + config.frontParam.separatorData + 
                                                              historyCuti[i].nama_pegawai + config.frontParam.separatorData + 
                                                              historyCuti[i].tgl_mulai_cuti + config.frontParam.separatorData + 
                                                              historyCuti[i].tgl_berakhir_cuti + config.frontParam.separatorData + 
                                                              historyCuti[i].lama_cuti + config.frontParam.separatorData + 
                                                              historyCuti[i].alasan_cuti; 

                                        if( historyCuti[i].status_admin_kepegawaian == 0  ){                     
                                            
                                            statusPertimbanganAtasanLangsung = '<small class="label pull-left bg-' + labelStatusAtasanPejabat[0] + '">' + statusAtasanPejabat[0] + '</small>';
                                            statusKeputusanPejabat = '<small class="label pull-left bg-' + labelStatusAtasanPejabat[0] + '">' + statusAtasanPejabat[0] + '</small>';
                                            labelStatusAdmin = '<small class="label pull-left bg-' + labelColorStatusAdmin[0] + '">' + statusAdmin[0] + '</small>';
                                            
                                            if( req.query.role_id == 1 || req.query.role_id == 3 ){
                                                navigation = '<a href="#" data-toggle="modal" data-target="#modal-form-receive-request-leave" name="link-confirm-leave-request" data="' + dataLinkConfirm + '">Terima</a>&nbsp;|&nbsp;' + 
                                                             '<a href="#" data-toggle="modal" data-target="#modal-confirm-cancel-leave" name="link-confirm-cancel-leave" data="' + encryptedId + '">Tolak</a>';
                                            }
                                            
                                        }else{
                                            
                                            statusPertimbanganAtasanLangsung = '<small class="label pull-left bg-' + labelStatusAtasanPejabat[historyCuti[i].pertimbangan_atasan_langsung] + '">' + statusAtasanPejabat[historyCuti[i].pertimbangan_atasan_langsung] + '</small>';
                                            statusKeputusanPejabat = '<small class="label pull-left bg-' + labelStatusAtasanPejabat[historyCuti[i].keputusan_pejabat] + '">' + statusAtasanPejabat[historyCuti[i].keputusan_pejabat] + '</small>';
                                            labelStatusAdmin = '<small class="label pull-left bg-' + labelColorStatusAdmin[historyCuti[i].status_admin_kepegawaian] + '">' + statusAdmin[historyCuti[i].status_admin_kepegawaian] + '</small>';
                                            
                                            if( historyCuti[i].status_admin_kepegawaian == 1 ){
                                                navigation = '<a href="#" data-toggle="modal" data-target="#modal-confirm-cancel-leave" name="link-confirm-cancel-leave" data="' + encryptedId + '">Batal</a>&nbsp';
                                                
                                                if( req.query.role_id == 1 || req.query.role_id == 3 ){
                                                    navigation += '<a href="#" data-toggle="modal" data-target="#modal-form-change-request-leave" name="link-change-leave-request" data="' + dataLinkConfirm + '">Ubah</a>';
                                                }
                                            }
                                            
                                        }
    
                                        joData.push({
                                            index: (i+1),
                                            no_reference: linkNoRef,
                                            nama_pegawai: historyCuti[i].nama_pegawai,
                                            jenis_cuti: {
                                                id: historyCuti[i].jenis_cuti_id,
                                                name: historyCuti[i].jenis_cuti_name
                                            },
                                            tgl_cuti: historyCuti[i].tgl_mulai_cuti,
                                            lama_cuti: historyCuti[i].lama_cuti,
                                            pertimbangan_atasan_langsung: statusPertimbanganAtasanLangsung,
                                            keputusan_pejabat: statusKeputusanPejabat,
                                            created_at: historyCuti[i].created_at_cuti,
                                            navigation: navigation,
                                            status_admin: labelStatusAdmin
                                        });
    
                                    });
    
                                } );
    
                            }          
                            
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "data": joData,
                                "recordsTotal": data[0].num_row,
                                "recordsFiltered": data[0].num_row,
                                "draw": draw
                            });
    
                            console.log(">>> RESULT : " + joResult);
    
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        } );

                    } );                                    
                                     
                });
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
                libUtil.getDecrypted( req.query.id, function(decrypted){

                    return modelUserHistoryCuti.findOne({
                        where:{
                            id: decrypted
                        },
                        include:[{
                            model: modelTujuanJabatan,
                            as: 'tujuanJabatan'
                        },{
                            model: modelJenisCuti,
                            as: 'jenisCuti'
                        }]
                    })
                    .then( data => {
                        if( data == null ){
							var joResult = JSON.stringify({
								"status_code": "-99",
								"status_msg": "User not found"
							});
							res.setHeader('Content-Type','application/json');
							res.status(400).send(joResult);
						}else{

                            libUtil.getEncrypted( (data.user_id).toString(), function(encryptedUserId){
                                var joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "OK",
                                    "no_reference": data.no_reference,
                                    "tujuan_jabatan": {
                                        "id": ( data.tujuanJabatan == null ? 0: data.tujuanJabatan.id ),
                                        "name": ( data.tujuanJabatan == null ? 0: data.tujuanJabatan.name )
                                    },
                                    "user_id": encryptedUserId,
                                    "nama_pegawai": data.nama_pegawai,
                                    "nip": data.nip,
                                    "jabatan": data.jabatan,
                                    "masa_kerja": data.masa_kerja,
                                    "unit_kerja": data.unit_kerja,
                                    "jenis_cuti":{
                                        "id": ( data.jenisCuti == null ? 0: data.jenisCuti.id ),
                                        "name": ( data.jenisCuti == null ? 0: data.jenisCuti.name )
                                    },
                                    "catatan_cuti": data.catatan_cuti,
                                    "alasan_cuti": data.alasan_cuti,
                                    "lama_cuti": data.lama_cuti,
                                    "tgl_mulai": ( data.tgl_mulai !== null && data.tgl_mulai !== "" && data.tgl_mulai !== "0000-00-00" ? dateFormat(data.tgl_mulai, "dd-mm-yyyy") : ""),
                                    "tgl_berakhir": ( data.tgl_berakhir !== null && data.tgl_berakhir !== "" && data.tgl_berakhir !== "0000-00-00" ? dateFormat(data.tgl_berakhir, "dd-mm-yyyy") : ""),
                                    "alamat_cuti": data.alamat_cuti,
                                    "telp": data.telp,
                                    "status_admin_kepegawaian": data.status_admin_kepegawaian,
                                    "pertimbangan_atasan_langsung": data.pertimbangan_atasan_langsung,
                                    "keputusan_pejabat": data.pertimbangan_atasan_langsung
                                });

                                res.setHeader('Content-Type','application/json');
                                res.status(200).send(joResult);

                            });
                        }
                    } );

                });
            }

        });

    },
    
    getLastNoteLeaveType( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

            var xJenisCuti = req.query.jenis_cuti;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                libUtil.getDecrypted( req.query.id, function(decryptedId){
                    libUtil.getDecrypted( req.query.user_id, function(decryptedUserId){

                        return sequelize.query( "SELECT catatan_cuti FROM user_history_cuti WHERE jenis_cuti_id = :cutiId AND id <> :id AND user_id = :userId ORDER BY created_at DESC LIMIT 1", 
                                        { replacements: { cutiId: xJenisCuti, id: decryptedId, userId: decryptedUserId }, type: sequelize.QueryTypes.SELECT } )
                        .then( data => {
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "catatan_cuti": ( data.length == 0 ? '' : data[0].catatan_cuti )
                            }); 
                            console.log(joResult);
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        });
                    });
                });

            }   

        });
    },
    
    save( req, res ){

        /*jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

            var xNoReference = '';

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{*/

            var xAllowLeave = false;    

            var xTglMulai = "";
            if( req.body.tgl_mulai != null && req.body.tgl_mulai != "" ){
                xTglMulai = libUtil.parseToFormattedDate( req.body.tgl_mulai );
            }

            var xTglBerakhir = "";
            if( req.body.tgl_berakhir != null && req.body.tgl_berakhir != "" ){
                xTglBerakhir = libUtil.parseToFormattedDate( req.body.tgl_berakhir );
            }

            libUtil.getCurrDateTime(function(currTime){

                // Check available balance
                sequelize.query( " SELECT (cuti_tahunan_n + cuti_tahunan_n_1 + cuti_tahunan_n_2) AS total_leave FROM users u WHERE id = :id ", { replacements: { id: req.body.user_id },type: sequelize.QueryTypes.SELECT } )
                    .then( balance => {

                        if( req.body.jenis_cuti_id == 1 ){
                            if( balance[0].total_leave > req.body.lama_cuti ){
                                xAllowLeave = true;
                            }else{
                                xAllowLeave = false;
                            }
                        }else{
                            xAllowLeave = true;
                        }

                        if( xAllowLeave ){ 
                            
                            // Generate No Reference
                            sequelize.query( "SELECT fc_generate_transaction_number() AS ref_no", { type: sequelize.QueryTypes.SELECT } )
                            .then( data => {
                                return modelUserHistoryCuti
                                    .create( {
                                        no_reference: data[0].ref_no,
                                        no_reference_batal_dari: req.body.no_reference_batal_dari,
                                        tujuan_jabatan_id: req.body.tujuan_jabatan_id,
                                        user_id: req.body.user_id,
                                        nama_pegawai: req.body.nama_pegawai,
                                        nip: req.body.nip,
                                        jabatan: req.body.jabatan,
                                        masa_kerja: req.body.masa_kerja,
                                        unit_kerja: req.body.unit_kerja,
                                        jenis_cuti_id: req.body.jenis_cuti_id,
                                        catatan_cuti: req.body.catatan_cuti,
                                        alasan_cuti: req.body.alasan_cuti,
                                        lama_cuti: req.body.lama_cuti,
                                        tgl_mulai: xTglMulai,
                                        tgl_berakhir: xTglBerakhir,
                                        alamat_cuti: req.body.alamat_cuti,
                                        telp: req.body.telp,
                                        createdAt: currTime
                                    } )
                                    .then( data => {

                                        try{
                                            // Construct message notif to admin's email
                                            var xJsonMsgNotif = libNotif.constructLeaveNotification_Email(data.id);
                                            xJsonMsgNotif.then( function( pJsonMsgNotif ){

                                                // Get admin info
                                                var xJsonAdminEmail = libSetting.getSettingByCode( '2000' );
                                                xJsonAdminEmail.then( function( pJsonSetting ){

                                                    if( pJsonSetting.status_code == '00' ){
                                                        
                                                        var xDestination = libUtil.parseSettingValue( pJsonSetting.value );
                                                        xDestination.then( function( pDestination ){
                                                            console.log(">>> TO : " + pDestination.to);
                                                            console.log(">>> CC : " + pDestination.cc);
                                                            var pAddQueue = {
                                                                type: 1,
                                                                to: pDestination.to,
                                                                cc: pDestination.cc,
                                                                subject: pJsonMsgNotif.subject,
                                                                body: pJsonMsgNotif.body
                                                            }
                                                            var xJsonAddQueue = libNotif.addToQueue(pAddQueue);
                                                            xJsonAddQueue.then( function( pJsonResultAddQueue ){
                                                                console.log(">>> xJsonAddQueue: " + JSON.stringify(pJsonResultAddQueue));
                                                            } );
                                                        } );      
                                                    }                                                

                                                } );

                                                joResult = JSON.stringify({
                                                    "status_code": "00",
                                                    "status_msg": "Data Cuti berhasil disimpan. Silahkan download form cuti yang telah diisi."
                                                });
                                                res.setHeader('Content-Type','application/json');
                                                res.status(201).send(joResult);
                                            } );
                                        }catch(e){
                                            libUtil.writeLog("Error [userhistorycuti.save] : " + error);
                                        }
                                        
                                    } );
                            });

                        }else{
                            joResult = JSON.stringify({
                                "status_code": "-99",
                                "status_msg": "Total cuti melebih saldo cuti."
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }

                    } );
                
            });


            /*}

        });*/

    },

    updateStatusLeave( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

            var xNoReference = '';

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{  
                libUtil.getDecrypted( req.body.id, function(decryptedId){
                    libUtil.getCurrDateTime(function(currTime){

                        var xTglMulai = "";
                        if( req.body.tgl_mulai != null && req.body.tgl_mulai != "" ){
                            xTglMulai = libUtil.parseToFormattedDate( req.body.tgl_mulai );
                        }

                        var xTglBerakhir = "";
                        if( req.body.tgl_berakhir != null && req.body.tgl_berakhir != "" ){
                            xTglBerakhir = libUtil.parseToFormattedDate( req.body.tgl_berakhir );
                        }

                        return modelUserHistoryCuti.update({
                            status_admin_kepegawaian: 1,
                            admin_yang_menerima: req.body.admin_id,
                            tgl_admin_menerima: currTime,
                            pertimbangan_atasan_langsung: req.body.pertimbangan_atasan_langsung,
                            keputusan_pejabat: req.body.keputusan_pejabat,
                            catatan_cuti: req.body.catatan_cuti,
                            updated_at: currTime,

                            tgl_mulai: xTglMulai,
                            tgl_berakhir: xTglBerakhir,
                            lama_cuti:( req.body.lama_cuti == '' ? 0 : req.body.lama_cuti)
                        },{
                            where: {
                                id: decryptedId
                            }
                        })
                        .then( () => {
                            var joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "Data cuti berhasil diterima.",
                                //"new_password": newPassword
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        } );
                        
                    });
                });
            }

        });

    },

    cancelLeave( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

            var xNoReference = '';

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{  
                libUtil.getDecrypted( req.body.id, function(decryptedId){
                    libUtil.getCurrDateTime(function(currTime){
                        return modelUserHistoryCuti.update({
                            status_admin_kepegawaian: 2,
                            admin_yang_membatalkan: req.headers['X-ID'],
                            tgl_admin_batal: currTime,
                            alasan_admin_batal: ''
                        },{
                            where: {
                                id: decryptedId
                            }
                        })
                        .then( () => {
                            var joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "Data cuti berhasil dibatalkan.",
                                //"new_password": newPassword
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        } );
                        
                    });
                });
            }

        });

    },

    deleteLeave( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

            var xNoReference = '';

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{  
                libUtil.getDecrypted( req.body.id, function(decryptedId){
                    libUtil.getCurrDateTime(function(currTime){
                        return modelUserHistoryCuti.update({
                            status_admin_kepegawaian: 2
                        },{
                            where: {
                                id: decryptedId
                            }
                        })
                        .then( () => {
                            var joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "Data cuti berhasil dibatalkan.",
                                //"new_password": newPassword
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        } );
                        
                    });
                });
            }

        });

    },

    changeLeave( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

            var xNoReference = '';

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var strSql = ' CALL sp_change_leave( :pId, :pTglMulai, :pTglBerakhir, :pLamaCuti ) ';

                libUtil.getDecrypted( req.body.id, function(decryptedId){

                    var xTglMulai = "";
                    if( req.body.tgl_mulai != null && req.body.tgl_mulai != "" ){
                        xTglMulai = libUtil.parseToFormattedDate( req.body.tgl_mulai );
                    }

                    var xTglBerakhir = "";
                    if( req.body.tgl_berakhir != null && req.body.tgl_berakhir != "" ){
                        xTglBerakhir = libUtil.parseToFormattedDate( req.body.tgl_berakhir );
                    }

                    var xLamaCuti = req.body.lama_cuti;

                    const data = sequelize.query(strSql, {
                        replacements: {
                            pId: decryptedId, pTglMulai: xTglMulai, pTglBerakhir: xTglBerakhir, pLamaCuti: xLamaCuti
                        }
                    });
                    var joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "Data cuti berhasil diubah."
                    });
                    res.setHeader('Content-Type', 'application/json');
                    res.status(201).send(joResult);
                });
            }
        });

    }

}