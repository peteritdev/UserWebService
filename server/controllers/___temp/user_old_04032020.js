const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const momentPrecise = require('moment-precise-range-plugin');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const passwordGenerator = require('generate-password');
const bcrypt = require('bcryptjs');
const dateFormat = require('dateformat');

var config = require('../config/config.json');

const modelUser = require('../models').users;
const modelUserPending = require('../models').users_pending;
const modelRole = require('../models').user_role;
const modelJenisKelamin = require('../models').db_jenis_kelamin;
const modelAgama = require('../models').db_agama;
const modelBank = require('../models').db_bank;
const modelDesa = require('../models').db_desa;
const modelGolongan = require('../models').db_golongan;
const modelJabatan = require('../models').db_jabatan;
const modelKenaikanGaji = require('../models').db_kenaikan_gaji;
const modelJenisPegawai = require('../models').db_jenis_pegawai;
const modelJenisTugas = require('../models').db_jenis_tugas;
const modelJobGrade = require('../models').db_job_grade;
const modelKabupaten = require('../models').db_kabupaten;
const modelKecamatan = require('../models').db_kecamatan;
const modelKedudukan = require('../models').db_kedudukan;
const modelKenaikanPangkat = require('../models').db_kenaikan_pangkat;
const modelKppn = require('../models').db_kppn;
const modelDiklat = require('../models').db_nama_diklat;
const modelPangkat = require('../models').db_pangkat;
const modelPrestasiDiklat = require('../models').db_prestasi_diklat;
const modelProvinsi = require('../models').db_provinsi;
const modelStatusKondisi = require('../models').db_status_kondisi;
const modelStatusPegawai = require('../models').db_status_pegawai;
const modelStatusPernikahan = require('../models').db_status_pernikahan;
const modelStlud = require('../models').db_stlud;
const modelTipePegawai = require('../models').db_tipe_pegawai;
const modelUnitKerja = require('../models').db_unit_kerja;

const modelKtua = require('../models').db_ktua;
const modelTaspen = require('../models').db_taspen;
const modelJabatanStruktural = require('../models').db_jabatan_struktural;
const modelInstansiInduk = require('../models').db_instansi_induk;
const modelSatuanKerjaInduk = require('../models').db_satuan_kerja_induk;
const modelKanreg = require('../models').db_kanreg;
const modelGolonganAkhir = require('../models').db_golongan_akhir;
const modelUnor = require('../models').db_unor;
const modelUnorInduk = require('../models').db_unor_induk;
const modelInstansiKerja = require('../models').db_instansi_kerja;
const modelSatuanKerja = require('../models').db_satuan_kerja;
const modelEselon = require('../models').db_eselon;
const modelJabatanFungsional = require('../models').db_jabatan_fungsional;
const modelJabatanFungsionalUmum = require('../models').db_jabatan_fungsional_umum;
const modelTingkatPendidikan = require('../models').db_tingkat_pendidikan;
const modelPendidikanJurusan = require('../models').db_pendidikan_jurusan;
const modelJenisPengadaan = require('../models').db_jenis_pengadaan;
const modelRiwayatJabatan = require('../models').user_history_jabatan;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');
const libNotif = require('../libraries/notification');

const userService = require('../service/userservice.js');

module.exports = {

	generatePassword( req, res ){

		var joResult;

		//var encPassword = md5( req.body.password + config.md5Key );
		bcrypt.genSalt( 10, function( err, salt ){
			bcrypt.hash( req.body.password, salt, function( err, hash ){
				joResult = JSON.stringify({
					"status_code": "00",
					"status_msg": "User successfully created",
					"password": hash
				});
				res.setHeader('Content-Type','application/json');
				res.status(200).send(joResult);
			});
		} );

	},

	login( req, res ){

		//var encPassword = md5( req.body.password + config.md5Key );


		return modelUser.findOne({
			where: {	
				nip: req.body.nip
			},
			include:[{
					model: modelRole,
					as: 'role'
				},{
					model: modelJenisKelamin,
					as: 'jenisKelamin'
				},{
					model: modelAgama,
					as: 'agama'
				},{
					model: modelStatusPernikahan,
					as: 'statusPernikahan'
				},{
					model: modelBank,
					as: 'bank'
				},{
					model: modelUnitKerja,
					as: 'unitKerja'
				},{
					model: modelTipePegawai,
					as: 'tipePegawai'
				},{
					model: modelStatusPegawai,
					as: 'statusPegawai'
				},{
					model: modelKppn,
					as: 'kppn'
				},{
					model: modelJenisPegawai,
					as: 'jenisPegawai'
				},{
					model: modelKedudukan,
					as: 'kedudukan'
				},{
					model: modelPangkat,
					as: 'pangkat'
				},{
					model: modelJabatan,
					as: 'jabatan'
				},{
					model: modelJobGrade,
					as: 'jobGrade'
				},{
					model: modelRiwayatJabatan,
					as: 'riwayatJabatan',
					order:[['tmt_jabatan','DESC']],
					limit:1
				}
			],
			
		})
		.then( data => {

			if( data == null ){
				var joResult = JSON.stringify({
					"status_code": "-99",
					"status_msg": "Username / Password not valid"
				});
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joResult);
			}else{

				bcrypt.compare( req.body.password, data.password, function(err,result) {
					libUtil.getEncrypted( (data.id).toString(), function( encryptedId ){
						if( result === true ){
							// Generate JWT Auth token
							let token = jwt.sign({nip: data.nip},
								config.secret,
								{expiresIn: '24h'});

							var joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "OK",
								"token":token,
								"data":{
									"id": data.id,
									"encrypted_id": encryptedId,
									"role":{
										"id": data.role_id,
										"name":data.role.name
									},
									"nip": data.nip,
									"name": data.name,
									"picture": data.picture,
									"gelar_depan": data.gelar_depan,
									"gelar_belakang": data.gelar_belakang,
									"tempat_lahir": data.tempat_lahir,
									"tanggal_lahir": data.tanggal_lahir,
									"jenis_kelamin":{
										"id": data.jenis_kelamin_id,
										"name": ( data.jenisKelamin == null ? '' : data.jenisKelamin.name )
									},
									"agama":{
										"id": data.agama_id,
										"name": ( data.agama == null ? '' : data.agama.name )
									},
									"status_pernikahan":{
										"id": data.status_pernikahan_id,
										"name": ( data.statusPernikahan == null ? '' : data.statusPernikahan.name )
									},
									"alamat_tinggal": data.alamat_tinggal,
									"alamat_ktp": data.alamat_ktp,
									"bank":{
										"id": data.bank_id,
										"name": ( data.bank == null ? '' : data.bank.name )
									},
									"rekening_gaji": data.rekening_gaji,
									"unit_kerja":{
										"id": data.unit_kerja_id,
										"name": ( data.unitKerja == null ? '' : data.unitKerja.name )
									},
									"tipe_pegawai":{
										"id": data.tipe_pegawai_id,
										"name": ( data.tipePegawai == null ? '' : data.tipePegawai.name )
									},
									"status_pegawai":{
										"id": data.status_pegawai_id,
										"name": ( data.statusPegawai == null ? '' : data.statusPegawai.name )
									},
									"tanggal_pensiun":data.tanggal_pensiun,
									"kppn":{
										"id": ( data.kppn == null ? '' : data.kppn.id ),
										"name": ( data.kppn == null ? '' : data.kppn.name )
									},
									"jenis_pegawai":{
										"id": data.jenis_pegawai_id,
										"name": ( data.jenisPegawai == null ? '' : data.jenisPegawai.name )
									},
									"kedudukan":{
										"id": data.kedudukan_id,
										"name": ( data.kedudukan == null ? '' : data.kedudukan.name )
									},
									"kartu_pegawai": data.kartu_pegawai,
									"askes_atau_bpjs": data.askes_atau_bpjs,
									"taspen": data.taspen,
									"no_npwp": data.no_npwp,
									"nik": data.nik,
									"telepon": data.telepon,
									"email": data.email,
									"pangkat":{
										"id": data.pangkat_id,
										"name": ( data.pangkat == null ? '' : data.pangkat.name )
									},
									"jabatan":{
										"id": data.jabatan_id,
										"name": ( data.jabatan == null ? '' : data.jabatan.name )
									},
									"tmt_pangkat": data.tmt_pangkat,
									"tmt_jabatan": data.tmt_jabatan,
									"file_kartu_pegawai": data.file_kartu_pegawai,
									"file_ktp": data.file_ktp,
									"file_kartu_keluarga": data.file_kartu_keluarga,
									"file_buku_tabungan": data.file_buku_tabungan,
									"file_npwp": data.file_npwp,
									"file_lhkpn": data.file_lhkpn,
									"file_askes_atau_bpjs": data.file_askes_atau_bpjs,
									"file_taspen": data.file_taspen,
									"file_akta_nikah": data.file_akta_nikah,
									"file_akta_cerai": data.file_akta_cerai,
									"job_grade":{
										"id": data.job_grade_id,
										"name": ( data.jobGrade == null ? '' : data.jobGrade.name )
									},
									"riwayat_jabatan_id": ( data.riwayatJabatan[0] == null ? '' : data.riwayatJabatan[0].unor_id ),
									"is_first_login": data.is_first_login

								}					
							});

							console.log(joResult);

							res.setHeader('Content-Type','application/json');
							res.status(200).send(joResult);
						}else{
							var joResult = JSON.stringify({
								"status_code": "-99",
								"status_msg": "Username / Password not valid"				
							});
							res.setHeader('Content-Type','application/json');
							res.status(200).send(joResult);
						}

					});

				});

				// Generate token : Manual Token
				//var token = crypto.randomBytes(16).toString('hex');
				//var tokenExpire = moment().add( config.token_expire, config.token_expire_unit ).format('YYYY-MM-DD HH:mm:ss');

				

				// Update token
				/*modelUser.update({
					token: token,
					expireToken: tokenExpire
				},{
					where:{
						userId: data.userId
					}
				});*/

				
			}
			
			
		} );
	},

	login2( req, res ){

		//var encPassword = md5( req.body.password + config.md5Key );


		return modelUser.findOne({
			where: {	
				nip: req.body.nip
			},
			include:[{
					model: modelRole,
					as: 'role'
				},{
					model: modelJenisKelamin,
					as: 'jenisKelamin'
				},{
					model: modelAgama,
					as: 'agama'
				},{
					model: modelStatusPernikahan,
					as: 'statusPernikahan'
				},{
					model: modelBank,
					as: 'bank'
				},{
					model: modelUnitKerja,
					as: 'unitKerja'
				},{
					model: modelTipePegawai,
					as: 'tipePegawai'
				},{
					model: modelStatusPegawai,
					as: 'statusPegawai'
				},{
					model: modelKppn,
					as: 'kppn'
				},{
					model: modelJenisPegawai,
					as: 'jenisPegawai'
				},{
					model: modelKedudukan,
					as: 'kedudukan'
				},{
					model: modelPangkat,
					as: 'pangkat'
				},{
					model: modelJabatan,
					as: 'jabatan'
				},{
					model: modelJobGrade,
					as: 'jobGrade'
				},{
					model: modelRiwayatJabatan,
					as: 'riwayatJabatan'
				}
			],
			limit: 1
		})
		.then( data => {

			if( data == null ){
				var joResult = JSON.stringify({
					"status_code": "-99",
					"status_msg": "Username / Password not valid"
				});
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joResult);
			}else{

				bcrypt.compare( req.body.password, data.password, function(err,result) {
					libUtil.getEncrypted( (data.id).toString(), function( encryptedId ){
						if( result === true ){
							// Generate JWT Auth token
							let token = jwt.sign({nip: data.nip},
								config.secret,
								{expiresIn: '24h'});

							var joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "OK",
								"token":token,
								"data":{
									"id": data.id,
									"encrypted_id": encryptedId,
									"role":{
										"id": data.role_id,
										"name":data.role.name
									},
									"nip": data.nip,
									"name": data.name,
									"picture": data.picture,
									"gelar_depan": data.gelar_depan,
									"gelar_belakang": data.gelar_belakang,
									"tempat_lahir": data.tempat_lahir,
									"tanggal_lahir": data.tanggal_lahir,
									"jenis_kelamin":{
										"id": data.jenis_kelamin_id,
										"name": ( data.jenisKelamin == null ? '' : data.jenisKelamin.name )
									},
									"agama":{
										"id": data.agama_id,
										"name": ( data.agama == null ? '' : data.agama.name )
									},
									"status_pernikahan":{
										"id": data.status_pernikahan_id,
										"name": ( data.statusPernikahan == null ? '' : data.statusPernikahan.name )
									},
									"alamat_tinggal": data.alamat_tinggal,
									"alamat_ktp": data.alamat_ktp,
									"bank":{
										"id": data.bank_id,
										"name": ( data.bank == null ? '' : data.bank.name )
									},
									"rekening_gaji": data.rekening_gaji,
									"unit_kerja":{
										"id": data.unit_kerja_id,
										"name": ( data.unitKerja == null ? '' : data.unitKerja.name )
									},
									"tipe_pegawai":{
										"id": data.tipe_pegawai_id,
										"name": ( data.tipePegawai == null ? '' : data.tipePegawai.name )
									},
									"status_pegawai":{
										"id": data.status_pegawai_id,
										"name": ( data.statusPegawai == null ? '' : data.statusPegawai.name )
									},
									"tanggal_pensiun":data.tanggal_pensiun,
									"kppn":{
										"id": ( data.kppn == null ? '' : data.kppn.id ),
										"name": ( data.kppn == null ? '' : data.kppn.name )
									},
									"jenis_pegawai":{
										"id": data.jenis_pegawai_id,
										"name": ( data.jenisPegawai == null ? '' : data.jenisPegawai.name )
									},
									"kedudukan":{
										"id": data.kedudukan_id,
										"name": ( data.kedudukan == null ? '' : data.kedudukan.name )
									},
									"kartu_pegawai": data.kartu_pegawai,
									"askes_atau_bpjs": data.askes_atau_bpjs,
									"taspen": data.taspen,
									"no_npwp": data.no_npwp,
									"nik": data.nik,
									"telepon": data.telepon,
									"email": data.email,
									"pangkat":{
										"id": data.pangkat_id,
										"name": ( data.pangkat == null ? '' : data.pangkat.name )
									},
									"jabatan":{
										"id": data.jabatan_id,
										"name": ( data.jabatan == null ? '' : data.jabatan.name )
									},
									"tmt_pangkat": data.tmt_pangkat,
									"tmt_jabatan": data.tmt_jabatan,
									"file_kartu_pegawai": data.file_kartu_pegawai,
									"file_ktp": data.file_ktp,
									"file_kartu_keluarga": data.file_kartu_keluarga,
									"file_buku_tabungan": data.file_buku_tabungan,
									"file_npwp": data.file_npwp,
									"file_lhkpn": data.file_lhkpn,
									"file_askes_atau_bpjs": data.file_askes_atau_bpjs,
									"file_taspen": data.file_taspen,
									"file_akta_nikah": data.file_akta_nikah,
									"file_akta_cerai": data.file_akta_cerai,
									"job_grade":{
										"id": data.job_grade_id,
										"name": ( data.jobGrade == null ? '' : data.jobGrade.name )
									},
									"riwayat_jabatan_id": ( data.riwayatJabatan == null ? '' : data.riwayatJabatan.unor_id )

								}					
							});
							res.setHeader('Content-Type','application/json');
							res.status(200).send(joResult);
						}else{
							var joResult = JSON.stringify({
								"status_code": "-99",
								"status_msg": "Username / Password not valid"				
							});
							res.setHeader('Content-Type','application/json');
							res.status(200).send(joResult);
						}

					});

				});

				// Generate token : Manual Token
				//var token = crypto.randomBytes(16).toString('hex');
				//var tokenExpire = moment().add( config.token_expire, config.token_expire_unit ).format('YYYY-MM-DD HH:mm:ss');

				

				// Update token
				/*modelUser.update({
					token: token,
					expireToken: tokenExpire
				},{
					where:{
						userId: data.userId
					}
				});*/

				
			}
			
			
		} );
	},
	
	forgotPassword( req, res ){ 		
		var account = req.body.nip;
		libUtil.isValidEmail( account, function( isValid ){
			/*If account using NIP*/
			if( true ){

				return modelUser.findOne({
					where:{
						nip: account
					}
				})
				.then( data => {
					if( data === null ){
						var joResult = JSON.stringify({
							"status_code": "-99",
							"status_msg": "NIP tidak ditemukan"
						});
						res.setHeader('Content-Type','application/json');
						res.status(400).send(joResult);
					}else{
						var newPassword = passwordGenerator.generate({
							length: 10,
							numbers: true,
							uppercase: true							
						});

						console.log(">>> NEW PASSWORD : " + newPassword);

						bcrypt.genSalt( 10, function( err, salt ){
							bcrypt.hash( newPassword, salt, function( err, hash ){
								libUtil.getCurrDateTime( function( currDate ){
									console.log(">>> CUR DATE : " + currDate);
									modelUser.update({
										password: hash,
										lastForgotPassword: currDate,
										is_first_login: 1
									},{
										where:{
											id: data.id
										}
									})
									.then( () => {
										var jData = JSON.stringify({
											"username": data.userName,
											"userlogin": data.userLogin,
											"password": newPassword
										});
		
										/*libNotif.constructForgotPasswordNotification_Email(2, JSON.parse(jData), function( jResultNotif ) {
											var joResult = JSON.stringify({
												"status_code": "00",
												"status_msg": "Password berhasil direset ulang dan akan segera dikirim ke email anda.",
												//"new_password": newPassword
											});
											res.setHeader('Content-Type','application/json');
											res.status(201).send(joResult);
										});*/
		
										var xNotifForgotPassword = libNotif.constructForgotPasswordNotification_Email( data.name, newPassword );
										xNotifForgotPassword.then(function(pNotifForgotPassword){

											var pAddQueue = {
												type: 1,
												to: data.email,
												cc: '',
												subject: pNotifForgotPassword.subject,
												body: pNotifForgotPassword.body
											}
											var xJsonAddQueue = libNotif.addToQueue(pAddQueue);
											xJsonAddQueue.then( function( pJsonResultAddQueue ){
												var joResult = JSON.stringify({
													"status_code": "00",
													"status_msg": "Password berhasil direset ulang dan akan segera dikirim ke email anda.",
													//"new_password": newPassword
												});
												res.setHeader('Content-Type','application/json');
												res.status(201).send(joResult);
											} );											
										});
										
									} );
								});
							});
						});
						
					}
				} )
				.catch( error => {
					console.log(">>> Error : " + error); 
				} );

			}	

		} );


		/*return modelUser.update({
			userPassword: encPassword,
			userLogin: req.body.userlogin,					
			email: req.body.email,
			status: req.body.status,
			modifiedUser: req.headers['x-id']

		},{
			where: {
				userId: req.body.user_id
			}
		})
		.then( () => {
			joResult = JSON.stringify({
						"status_code": "00",
						"status_msg": "User successfully updated"
					});
			res.setHeader('Content-Type','application/json');
			res.status(201).send(joResult);
		})
		.catch( error => res.status(400).send(error) );	*/

	},

	changePassword( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				var xOldPassword = req.body.old_password;
				var xNewPassword = req.body.new_password;

				libUtil.getDecrypted( req.body.id, function(decryptedId){

					modelUser.findOne({
						where: {	
							id: decryptedId
						}
					})
					.then( data => {
						if( data === null ){
							var joResult = JSON.stringify({
								"status_code": "-99",
								"status_msg": "ID tidak valid. Silahkan ulangi kembali."
							});
							res.setHeader('Content-Type','application/json');
							res.status(400).send(joResult);
						}else{

							bcrypt.compare( xOldPassword, data.password, function(err,result) {

								if( result === true ){
									bcrypt.genSalt( 10, function( err, salt ){
										bcrypt.hash( xNewPassword, salt, function( err, hash ){
											modelUser.update({
												password: hash,
												is_first_login: 0
											},{
												where:{
													id: decryptedId
												}
											})
											.then( () => {
												var joResult = JSON.stringify({
													"status_code": "00",
													"status_msg": "Password berhasil diubah.",
													//"new_password": newPassword
												});
												res.setHeader('Content-Type','application/json');
												res.status(201).send(joResult);
											})
											.catch( error => {
												var joResult = JSON.stringify({
													"status_code": "-99",
													"status_msg": "Error 1 <user.changePassword>: " + error
													//"new_password": newPassword
												});
												res.setHeader('Content-Type','application/json');
												res.status(500).send(joResult);
											} );
										});
									});
								}else{
									var joResult = JSON.stringify({
										"status_code": "-99",
										"status_msg": "Password lama tidak valid. Silahkan ulangi kembali."
									});
									res.setHeader('Content-Type','application/json');
									res.status(400).send(joResult);
								}

							});
						}
					} )
					.catch( error => {
						var joResult = JSON.stringify({
							"status_code": "-99",
							"status_msg": "Error 2 <user.changePassword>: " + error
							//"new_password": newPassword
						});
						res.setHeader('Content-Type','application/json');
						res.status(500).send(joResult);
					} );

					//bcrypt.compare( xOldPassword, data.password, function(err,result) {

					/*libUtil.getCurrDateTime(function(currTime){
						modelUser.update({
							cuti_tahunan_n: req.body.cuti_tahunan_n,
							cuti_tahunan_n_1: req.body.cuti_tahunan_n_1,
							cuti_tahunan_n_2: req.body.cuti_tahunan_n_2,
							cuti_ditangguhkan_n_plus_1: req.body.cuti_ditangguhkan_n_plus_1, 
							adjust_cuti_by: req.headers['x-id'],
							adjust_cuti_at: currTime
						},{
							where: {
								id: decryptedId
							}
						})
						.then( () => {
							var joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "Cuti Tahunan berhasil disimpan.",
								//"new_password": newPassword
							});
							res.setHeader('Content-Type','application/json');
							res.status(201).send(joResult);
						} );
					});*/
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
					return modelUser.findOne({
						where: {	
							id:decrypted
						},
						include:[{
								model: modelRole,
								as: 'role'
							},{
								model: modelAgama,
								as: 'agama'
							},{
								model: modelStatusPernikahan,
								as: 'statusPernikahan'
							},{
								model: modelBank,
								as: 'bank'
							},{
								model: modelUnitKerja,
								as: 'unitKerja'
							},{
								model: modelTipePegawai,
								as: 'tipePegawai'
							},{
								model: modelStatusPegawai,
								as: 'statusPegawai'
							},{
								model: modelKppn,
								as: 'kppn'
							},{
								model: modelJenisPegawai,
								as: 'jenisPegawai'
							},{
								model: modelKedudukan,
								as: 'kedudukan'
							},{
								model: modelPangkat,
								as: 'pangkat'
							},{
								model: modelJabatan,
								as: 'jabatan'
							},{
								model: modelJobGrade,
								as: 'jobGrade'
							},{
								model: modelKtua,
								as: 'ktua'
							},{
								model: modelTaspen,
								as: 'taspen'
							},{
								model: modelJabatanStruktural,
								as: 'jabatanStruktural'
							},{
								model: modelJabatanFungsional,
								as: 'jabatanFungsional'
							},{
								model: modelJabatanFungsionalUmum,
								as: 'jabatanFungsionalUmum'
							},{
								model: modelInstansiInduk,
								as: 'instansiInduk'
							},{
								model: modelSatuanKerjaInduk,
								as: 'satuanKerjaInduk'
							},{
								model: modelKanreg,
								as: 'kanreg'
							},{
								model: modelInstansiKerja,
								as: 'instansiKerja'
							},{
								model: modelSatuanKerja,
								as: 'satuanKerja'
							},{
								model: modelEselon,
								as: 'eselon'
							}/*,{
								model: modelUnor,
								as: 'unor'
							}*/,{
								model: modelUnorInduk,
								as: 'unorInduk'
							},{
								model: modelGolongan,
								as: 'golonganRuangAwal'
							},{
								model: modelGolonganAkhir,
								as: 'golonganRuangAkhir'
							},{
								model: modelTingkatPendidikan,
								as: 'tingkatPendidikan'
							},{
								model: modelPendidikanJurusan,
								as: 'pendidikanJurusan'
							},{
								model: modelJenisPengadaan,
								as: 'jenisPengadaan'
							},{
								model: modelRiwayatJabatan,
								as: 'riwayatJabatan',
								include:[{
									model: modelUnor,
									as: 'unor'
								}],
								order:[['tmt_jabatan','DESC']],
								limit:1
							}
						]
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

							// Perhitungan Masa Kerja 
							// Formula : Tgl Sekarang - TMT CPNS + PMK (Terakhir)
							var joUserPMK = userService.getMasaKerja( data.id );
							joUserPMK.then( function( pMasaKerja ){

								console.log(">>>> DATA PMK : " + pMasaKerja);

								var jPMK = JSON.parse( pMasaKerja );
								var jMasaKerja;
								var xTotalMasaKerjaTahun = 0;
								var xTotalMasaKerjaBulan = 0;								

								if(  data.tmt_cpns !== null && data.tmt_cpns !== "" && data.tmt_cpns !== "0000-00-00" && ( jPMK.masa_kerja_tahun != 0 || jPMK.masa_kerja_bulan != 0 ) ){
										
										var xFormattedTMTCPNS = moment(data.tmt_cpns);
										var xMasaKerja = moment.preciseDiff( xFormattedTMTCPNS, moment(), true );
										jMasaKerja = JSON.parse(JSON.stringify( xMasaKerja ));

										/*if( ( parseInt(jMasaKerja.months) + parseInt(jPMK.masa_kerja_bulan) ) > 12 ){
											var xMonthInYear = Math.tound( ( parseInt(jMasaKerja.months) + parseInt(jPMK.masa_kerja_bulan) ) / 12 );
											xTotalMasaKerjaTahun = ( parseInt(jMasaKerja.years) + parseInt(jPMK.masa_kerja_tahun) ) + xMonthInYear;
											xTotalMasaKerjaBulan = 
										}*/

										xTotalMasaKerjaTahun = parseInt(jMasaKerja.years) + parseInt(jPMK.masa_kerja_tahun);
										xTotalMasaKerjaBulan = parseInt(jMasaKerja.months) + parseInt(jPMK.masa_kerja_bulan);
								}else{
									var xFormattedTMTCPNS = moment(data.tmt_cpns);
									var xMasaKerja = moment.preciseDiff( xFormattedTMTCPNS, moment(), true );
									jMasaKerja = JSON.parse(JSON.stringify( xMasaKerja ));
									xTotalMasaKerjaTahun = parseInt(jMasaKerja.years);
									xTotalMasaKerjaBulan = parseInt(jMasaKerja.months);
								}

								console.log(">>> LENGTH : " + ( data.riwayatJabatan[0] == null ? 'NULL' : JSON.stringify(data.riwayatJabatan[0] )));

								var joResult = JSON.stringify({
									"status_code": "00",
									"status_msg": "OK",
									"data":{
										"id": data.id,
										"encrypted_id": req.query.id,
										"role":{
											"id": (data.role == null ? 0 : data.role_id ),
											"name":(data.role == null ? "" : data.role.name )
										},
										"nip": data.nip,
										"name": data.name,
										"picture": data.picture,
										"gelar_depan": data.gelar_depan,
										"gelar_belakang": data.gelar_belakang,
										"tempat_lahir": data.tempat_lahir,
										"tanggal_lahir": data.tanggal_lahir,
										"jenis_kelamin":{
											"id": data.jenis_kelamin_id,
											"name": ( data.jenis_kelamin_id == null ? '' : ( data.jenis_kelamin_id == 1 ? 'Pria' : ( data.jenis_kelamin_id == 2 ? 'Wanita' : '' ) )),
										},
										"agama":{
											"id": data.agama_id,
											"name": ( data.agama == null ? '' : data.agama.name),
										},
										"status_pernikahan":{
											"id": data.status_pernikahan_id,
											"name": ( data.statusPernikahan == null ? '' : data.statusPernikahan.name),
										},
										"alamat_tinggal": data.alamat_tinggal,
										"alamat_ktp": data.alamat_ktp,
										"kode_pos": data.kode_pos,
										"ktua":{
											"id": data.ktua_id,
											"name": ( data.ktua == null ? '' : data.ktua.name),
										},
										"bank":{
											"id": data.bank_id,
											"name": ( data.bank == null ? '' : data.bank.name),
										},
										"rekening_gaji": data.rekening_gaji,
										"unit_kerja":{
											"id": data.unit_kerja_id,
											"name": ( data.unitKerja == null ? '' : data.unitKerja.name),
										},
										"tipe_pegawai":{
											"id": data.tipe_pegawai_id,
											"name": ( data.tipePegawai == null ? '' : data.tipePegawai.name),
										},
										"status_pegawai":{
											"id": data.status_pegawai_id,
											"name": ( data.statusPegawai == null ? '' : data.statusPegawai.name),
										},
										"tanggal_pensiun":data.tanggal_pensiun,
										"kppn":{
											"id": ( data.kppn == null ? '' : data.kppn.id),
											"name": ( data.kppn == null ? '' : data.kppn.name),
										},
										"jenis_pegawai":{
											"id": ( data.jenisPegawai == null ? '' : data.jenisPegawai.jenis_pegawai_id),
											"name": ( data.jenisPegawai == null ? '' : data.jenisPegawai.name),
										},
										"kedudukan":{
											"id": ( data.kedudukan == null ? '' : data.kedudukan.kedudukan_id),
											"name": ( data.kedudukan == null ? '' : data.kedudukan.name),
										},
										"kartu_pegawai": data.kartu_pegawai,
										"askes_atau_bpjs": data.askes_atau_bpjs,
										"taspen": {
											"id": ( data.taspen == null ? '' : data.taspen.id),
											"name": ( data.taspen == null ? '' : data.taspen.name),
										},
										"no_npwp": data.no_npwp,
										"tgl_npwp": data.tgl_npwp,
										"nik": data.nik,
										"no_hp": data.no_hp,
										"telepon": data.telepon,
										"email": data.email,
										"pangkat":{
											"id": ( data.pangkat == null ? '' : data.pangkat.pangkat_id),
											"name": ( data.pangkat == null ? '' : data.pangkat.name),
										},
										"jabatan":{
											"id": ( data.jabatan == null ? '' : data.jabatan.jabatan_id),
											"name": ( data.jabatan == null ? '' : data.jabatan.name),
										},
										"jabatan_struktural":{
											"id": ( data.jabatanStruktural == null ? '' : data.jabatanStruktural.id),
											"name": ( data.jabatanStruktural == null ? '' : data.jabatanStruktural.name),
										},	
										"jabatan_fungsional":{
											"id": ( data.jabatanFungsional == null ? '' : data.jabatanFungsional.id),
											"name": ( data.jabatanFungsional == null ? '' : data.jabatanFungsional.name),
										},
										"jabatan_fungsional_umum":{
											"id": ( data.jabatanFungsionalUmum == null ? '' : data.jabatanFungsionalUmum.id),
											"name": ( data.jabatanFungsionalUmum == null ? '' : data.jabatanFungsionalUmum.name),
										},
										"lokasi_kerja": data.lokasi_kerja,
										"tmt_pangkat": data.tmt_pangkat,
										"tmt_jabatan": ( data.tmt_jabatan !== null && data.tmt_jabatan !== "" && data.tmt_jabatan !== "0000-00-00" ? dateFormat(data.tmt_jabatan, "dd-mm-yyyy") : ""),
	
										"tingkat_pendidikan": {
											"id": ( data.tingkatPendidikan == null ? '' : data.tingkatPendidikan.id),
											"name": ( data.tingkatPendidikan == null ? '' : data.tingkatPendidikan.name),
										},
										"pendidikan_jurusan":{
											"id": ( data.pendidikanJurusan == null ? '' : data.pendidikanJurusan.id),
											"name": ( data.pendidikanJurusan == null ? '' : data.pendidikanJurusan.name),
										},
										"tahun_lulus": data.tahun_lulus,
	
										"diktat_struktural": data.diktat_struktural,
										"instansi_induk":{
											"id": ( data.instansiInduk == null ? '' : data.instansiInduk.id),
											"name": ( data.instansiInduk == null ? '' : data.instansiInduk.name),
										},
										"satuan_kerja_induk":{
											"id": ( data.satuanKerjaInduk == null ? '' : data.satuanKerjaInduk.id),
											"name": ( data.satuanKerjaInduk == null ? '' : data.satuanKerjaInduk.name),
										},
										"kanreg":{
											"id": ( data.kanreg == null ? '' : data.kanreg.id),
											"code": ( data.kanreg == null ? '' : data.kanreg.code),
											"name": ( data.kanreg == null ? '' : data.kanreg.name),
										},
										"instansi_kerja":{
											"id": ( data.instansiKerja == null ? '' : data.instansiKerja.id),
											"name": ( data.instansiKerja == null ? '' : data.instansiKerja.name),
										},
										"instansi_kerja_kode_cepat": data.instansi_kerja_kode_cepat,
										"satuan_kerja":{
											"id": ( data.satuanKerja == null ? '' : data.satuanKerja.id),
											"name": ( data.satuanKerja == null ? '' : data.satuanKerja.name),
										},
										"masa_kerja_tahun":xTotalMasaKerjaTahun,
										"masa_kerja_bulan":xTotalMasaKerjaBulan,
										"eselon":{
											"id": ( data.eselon == null ? '' : data.eselon.id),
											"name": ( data.eselon == null ? '' : data.eselon.name),
										},
										"eselon_level": data.eselon_level,
										"tmt_eselon": ( data.tmt_eselon !== null && data.tmt_eselon !== "" && data.tmt_eselon !== "0000-00-00" ? dateFormat(data.tmt_eselon, "dd-mm-yyyy") : ""),
										"unor":{
											/*"id": ( data.unor == null ? '' : data.unor.id),
											"name": ( data.unor == null ? '' : data.unor.name),*/
											"id": ( data.riwayatJabatan[0] == null ? '' : data.riwayatJabatan[0].unor_id ),
											"name": ( data.riwayatJabatan[0] == null ? '-' : ( data.riwayatJabatan[0].unor_id == 0 ? '-' : data.riwayatJabatan[0].unor.name ) )
										},
										"unor_induk":{
											"id": ( data.unorInduk == null ? '' : data.unorInduk.id),
											"name": ( data.unorInduk == null ? '' : data.unorInduk.name),
										},
	
										"file_kartu_pegawai": data.file_kartu_pegawai,
										"file_ktp": data.file_ktp,
										"file_kartu_keluarga": data.file_kartu_keluarga,
										"file_buku_tabungan": data.file_buku_tabungan,
										"file_npwp": data.file_npwp,
										"file_lhkpn": data.file_lhkpn,
										"file_askes_atau_bpjs": data.file_askes_atau_bpjs,
										"file_taspen": data.file_taspen,
										"file_akta_nikah": data.file_akta_nikah,
										"file_akta_cerai": data.file_akta_cerai,
										"job_grade":{
											"id": ( data.jobGrade == null ? '' : data.jobGrade.job_grade_id),
											"name": ( data.jobGrade == null ? '' : data.jobGrade.name),
										},
	
										"golongan_ruang_id": data.golongan_ruang_id,
										"golongan_ruang_awal":{
											"id": ( data.golonganRuangAwal == null ? '' : data.golonganRuangAwal.id),
											"name": ( data.golonganRuangAwal == null ? '' : data.golonganRuangAwal.name),
										},
										"golongan_ruang_akhir":{
											"id": ( data.golonganRuangAkhir == null ? '' : data.golonganRuangAkhir.id),
											"name": ( data.golonganRuangAkhir == null ? '' : data.golonganRuangAkhir.name),
										},
										"tmt_golongan_akhir": data.tmt_golongan_akhir,
	
										"tmt_cpns": ( data.tmt_cpns !== null && data.tmt_cpns !== "" && data.tmt_cpns !== "0000-00-00" ? dateFormat(data.tmt_cpns, "dd-mm-yyyy") : ""),
										"tgl_sk_cpns": ( data.tgl_sk_cpns !== null && data.tgl_sk_cpns !== "" && data.tgl_sk_cpns !== "0000-00-00" ? dateFormat(data.tgl_sk_cpns, "dd-mm-yyyy") : ""),
										"no_sk_cpns": data.no_sk_cpns,
										"no_surat_dokter_cpns": data.no_surat_dokter_cpns,
										"tgl_surat_dokter_cpns": ( data.tgl_surat_dokter_cpns !== null && data.tgl_surat_dokter_cpns !== "" && data.tgl_surat_dokter_cpns !== "0000-00-00" ? dateFormat(data.tgl_surat_dokter_cpns, "dd-mm-yyyy") : ""),
										"tmt_pns": ( data.tmt_pns !== null && data.tmt_pns !== "" && data.tmt_pns !== "0000-00-00" ? dateFormat(data.tmt_pns, "dd-mm-yyyy") : ""),
										"tgl_sk_pns": ( data.tgl_sk_pns !== null && data.tgl_sk_pns !== "" && data.tgl_sk_pns !== "0000-00-00" ? dateFormat(data.tgl_sk_pns, "dd-mm-yyyy") : ""),
										"no_sk_pns": data.no_sk_pns,
										"no_surat_dokter_pns": data.no_surat_dokter_pns,
										"tgl_surat_dokter_pns": ( data.tgl_surat_dokter_pns !== null && data.tgl_surat_dokter_pns !== "" && data.tgl_surat_dokter_pns !== "0000-00-00" ? dateFormat(data.tgl_surat_dokter_pns, "dd-mm-yyyy") : ""),
										"no_sttpl": data.no_sttpl,
										"tgl_sttpl": ( data.tgl_sttpl !== null  && data.tgl_sttpl != "" ? dateFormat(data.tgl_sttpl, "dd-mm-yyyy") : ""),
										"tgl_surat_ket_dokter": ( data.tgl_surat_ket_dokter !== null && data.tgl_surat_ket_dokter !== "" && data.tgl_surat_ket_dokter !== "0000-00-00" ? dateFormat(data.tgl_surat_ket_dokter, "dd-mm-yyyy") : ""),
										"no_surat_ket_dokter": data.no_surat_ket_dokter,
										"jml_istri_suami": data.jml_istri_suami,
										"jml_anak": data.jml_anak,
										"no_surat_ket_bebas_narkoba": data.no_surat_ket_bebas_narkoba,
										"tgl_surat_ket_bebas_narkoba": ( data.tgl_surat_ket_bebas_narkoba !== null  && data.tgl_surat_ket_bebas_narkoba != "" ? dateFormat(data.tgl_surat_ket_bebas_narkoba, "dd-mm-yyyy") : ""),
										"skck": data.skck,
										"tgl_skck": ( data.tgl_skck !== null  && data.tgl_skck != "" ? dateFormat(data.tgl_skck, "dd-mm-yyyy") : ""),
										"akte_kelahiran": data.akte_kelahiran,
										"akte_meninggal": data.akte_meninggal,
										"tgl_meninggal": data.tgl_meninggal,
										"status_hidup": data.status_hidup,
	
										"jenis_pengadaan_id": data.jenis_pengadaan_id,
										"tgl_spmt": ( data.tgl_spmt !== null  && data.tgl_spmt != "" ? dateFormat(data.tgl_spmt, "dd-mm-yyyy") : ""),
										"no_spmt": data.no_spmt,
										"tgl_pertek_c2th": data.tgl_pertek_c2th,
										"no_pertek_c2th": data.no_pertek_c2th,
										"tgl_kep_pns_honorer": data.tgl_kep_pns_honorer,
										"no_kep_pns_honorer": data.no_kep_pns_honorer,
										"karis_karsu": data.karis_karsu,
										"jabatan_pengangkat_cpns": data.jabatan_pengangkat_cpns,
										"masa_kerja_tahun": xTotalMasaKerjaTahun,
										"masa_kerja_bulan": xTotalMasaKerjaBulan,
		
									}					
								});
	
								console.log(joResult);
	
								res.setHeader('Content-Type','application/json');
								res.status(200).send(joResult);
							} );

							

							
	
							// Generate token : Manual Token
							//var token = crypto.randomBytes(16).toString('hex');
							//var tokenExpire = moment().add( config.token_expire, config.token_expire_unit ).format('YYYY-MM-DD HH:mm:ss');
	
							
	
							// Update token
							/*modelUser.update({
								token: token,
								expireToken: tokenExpire
							},{
								where:{
									userId: data.userId
								}
							});*/
	
							
						}
						
						
					} );
				} );			

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

				//var encPassword = md5( req.body.password + config.md5Key );
				bcrypt.genSalt( 10, function( err, salt ){
					bcrypt.hash( req.body.password, salt, function( err, hash ){

				return modelUser
					.findOrCreate({
						where:{
							nip: req.body.nip
						},
						defaults: {
							role_id: req.body.role_id,
							nip: req.body.nip,
							password: hash,
							status: 1,
							createdUser: parseInt(req.headers['x-id'])
						}
					})
					.spread( (user, created) => {
						if( created ){
							joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "User successfully created"
							});
						}else{
							joResult = JSON.stringify({
								"status_code": "-99",
								"status_msg": "Userlogin has already taken. Please use another userlogin."
							});
						}
						res.setHeader('Content-Type','application/json');
						res.status(201).send(joResult);
					} )
					/*.then( data => res.status(201).send( data ) )*/
					.catch( error => res.status(400).send(error) );

					} );
				} );				

			}

		});

	},

	update( req, res ){
		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
				libUtil.getCurrDateTime(function(currTime){
					return modelUserPending
						.create({
							user_id: req.headers['x-id'],
							request_update_time: currTime,
							telepon: req.body.telepon,
							email: req.body.email,
							alamat_tinggal: req.body.alamat_tinggal,
							alamat_ktp: req.body.alamat_ktp,
							file_kartu_pegawai: req.body.file_kartu_pegawai,
							file_ktp: req.body.file_ktp,
							file_kartu_keluarga: req.body.file_kartu_keluarga,
							file_buku_tabungan: req.body.file_buku_tabungan,
							file_npwp: req.body.file_npwp,
							file_lhkpn: req.body.file_lhkpn,
							file_askes_atau_bpjs: req.body.file_askes_atau_bpjs,
							file_taspen: req.body.taspen,
							file_akta_nikah: req.body.akta_nikah,
							file_akta_cerai: req.body.akta_cerai,
							status: 0
						})
						.then( () => {
							joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "Perubahan data anda berhasil disimpan. Silahkan tunggu konfirmasi dari Admin."
							});
							res.setHeader('Content-Type','application/json');
							res.status(201).send(joResult);
						} )
						.catch( error => res.status(400).send(error) );
				});
			}
		});
	},

	checkUserPending( req, res ){
		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				libUtil.getDecrypted( req.query.id, function(decrypted){

					return modelUserPending.findOne({
						where: {	
							user_id: decrypted,
							status: 0
						},
						include:[{
							model: modelUser,
							as: 'oldUserData'
						}]					
					})
					.then( data => {
	
						if( data == null ){
							var joResult = JSON.stringify({
								"status_code": "-99",
								"status_msg": "No pending updated."
							});
							res.setHeader('Content-Type','application/json');
							res.status(400).send(joResult);
						}else{
							var joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "OK",
								"new_data":{
									"request_update_time": data.request_update_time,
									"telepon":data.telepon,
									"email": data.email,
									"alamat_tinggal": data.alamat_tinggal,
									"alamat_ktp":data.alamat_ktp
								},
								"old_data":{
									"telepon":data.oldUserData.telepon,
									"email": data.oldUserData.email,
									"alamat_tinggal": data.oldUserData.alamat_tinggal,
									"alamat_ktp":data.oldUserData.alamat_ktp
								}
							});
							res.setHeader('Content-Type','application/json');
							res.status(201).send(joResult);
						}
						
					})
					.catch( error => res.status(400).send(error) );

				});

			}
		});
	},

	approveUpdate( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				libUtil.getCurrDateTime(function(currTime){
					//console.log("USER ID :" + req.body.id);
					libUtil.getDecrypted( req.body.id, function(decrypted){

						return modelUserPending.findOne({
							where:{
								user_id: decrypted
							}
						})
						.then( data => {
							if( data == null ){
								joResult = JSON.stringify({
									"status_code": "-99",
									"status_msg": "User not found"
								});
								res.setHeader('Content-Type','application/json');
								res.status(400).send(joResult);
							}else{

								if( req.body.type == 'REJECT' ){
									modelUserPending.update({
										status: -1,
										confirm_time: currTime,
										user_confirm: req.headers['x-id'] 				
									},{
										where: {
											user_id: data.user_id,
											status: 0
										}
									})
									.then( () => {

										modelUser.update({
											status: 1,				
										},{
											where: {
												id: data.user_id
											}
										})
										.then( () => {
											joResult = JSON.stringify({
												"status_code": "00",
												"status_msg": "User successfully rejected"
											});
											res.setHeader('Content-Type','application/json');
											res.status(201).send(joResult);
										})
										.catch( error => res.status(400).send(error) );
									})
									.catch( error => res.status(400).send(error) );
								}else if( req.body.type == 'APPROVE' ){
									modelUser.update({
										alamat_tinggal: data.alamat_tinggal,
										alamat_ktp: data.alamat_ktp,
										telepon: data.telepon,
										email: data.email,
										status: 1, 
										approved_user_id: req.headers['x-id'],
										updatedAt: currTime
					
									},{
										where: {
											id: data.user_id
										}
									})
									.then( () => {
										modelUserPending.update({
											status: 1,
											confirm_time: currTime,
											user_confirm: req.headers['x-id'] 				
										},{
											where: {
												user_id: data.user_id
											}
										})
										.then( () => {
											joResult = JSON.stringify({
												"status_code": "00",
												"status_msg": "User successfully approved"
											});
											res.setHeader('Content-Type','application/json');
											res.status(400).send(joResult);
										})
										.catch( error => res.status(400).send(error) );
									})
									.catch( error => res.status(400).send(error) );
								}
								
							}
						} )
						.catch( error => res.status(400).send(error) );

					});
				});					

			}

		});
	},

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
				var type = req.query.type;

				var joData = [];
				var qRole;				

				if( type == 1 ){
					qRole = {
						"role": 2
					}
				}else if( type == 2 ){
					qRole = {
						"role": 0
					}
				}

				return modelUser.findAndCountAll({
					where: {
						[Op.or]:[
							{
								name: {
									[Op.like]:'%' + keyword + '%'
								}
							}, 
							{	
								nip: {
									[Op.like]:'%' + keyword + '%'
								}
							}
						],
						[Op.and]:[
							{
								role_id: {
									[Op.notIn]:[0,3]
								}
							}
						]
					},
				})
				.then( data => {

					modelUser.findAll({
						where: {
							[Op.or]:[
								{
									name: {
										[Op.like]:'%' + keyword + '%'
									}
								}, 
								{	
									nip: {
										[Op.like]:'%' + keyword + '%'
									}
								}
							],
							[Op.and]:[
								{
									role_id: {
										[Op.notIn]:[0,3]
									}
								}
							]
						},				
						include:[{
								model: modelRole,
								as: 'role'
							},{
								model: modelJenisKelamin,
								as: 'jenisKelamin'
							},{
								model: modelAgama,
								as: 'agama'
							},{
								model: modelStatusPernikahan,
								as: 'statusPernikahan'
							},{
								model: modelBank,
								as: 'bank'
							},{
								model: modelUnitKerja,
								as: 'unitKerja'
							},{
								model: modelTipePegawai,
								as: 'tipePegawai'
							},{
								model: modelStatusPegawai,
								as: 'statusPegawai'
							},{
								model: modelKppn,
								as: 'kppn'
							},{
								model: modelJenisPegawai,
								as: 'jenisPegawai'
							},{
								model: modelKedudukan,
								as: 'kedudukan'
							},{
								model: modelPangkat,
								as: 'pangkat'
							},{
								model: modelJabatan,
								as: 'jabatan'
							},{
								model: modelJobGrade,
								as: 'jobGrade'
							}
						],
						limit: limit,
						offset: offset,
					})
					.then( user => {
						for( var i = 0; i < user.length; i++ ){

							/*Status Display*/
							/*var classStatus, classLabel, statusDisplay;
							if( user[i].status == 1 ){
								classStatus = 'bg-green';
								classLabel = 'Active';
							}else{
								classStatus = 'bg-red';
								classLabel = 'Not Active';
							}
							statusDisplay = '<small class="label pull-left ' + classStatus + '">' + classLabel + '</small>';
							*/
							/*Edit Button*/
							/*var btnLink, btnDelete, editData;
							editData = user[i].userId + 'Þ' + 
									   user[i].roleId + 'Þ' + 
									   user[i].userName + 'Þ' + 
									   user[i].userLogin + 'Þ' + 
									   user[i].email + 'Þ' + 
									   user[i].status;
							zbtnLink = '<a href="#" class="btn bg-olive" data-toggle="modal" data-target="#modal-form" data-edit="' + editData + '" name="link-edit">' + 
									  '	<span class="glyphicon glyphicon-edit fa-1x"></span>' + 
									  '</a>&nbsp;';
							btnDelete = '<a href="#" class="btn bg-red" name="link-delete" data-toggle="modal" data-target="#modal-confirm-delete" data-edit="' + user[i].userId + '">' + 
                    					' <span class="glyphicon glyphicon-remove fa-1x"></span>' + 
										'</a>';*/
							libUtil.getEncrypted( (user[i].id).toString(), function( encryptedData ){
								var linkNip = '<a href="' + config.frontParam.baseUrl + '/profile?id=' + encryptedData + '">' + user[i].nip + '</a>';
								var linkConfirm = '';
								var linkSelectUser = '';
								var dataLinkSelectUser = '';
								var dataLinkStatusUser = '';
								var dataLinkAnnualLeave = '';
								var linkNonActiveEmployee = '<a href="#" name="link-modal-nonactive-employee" class="btn btn-danger btn-md" data-toggle="modal" data-target="#modal-form-nonactive-employee" data="' + encryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';
								var linkDosier = '<a href="#" name="link-modal-dosier" class="btn bg-navy btn-md" data-toggle="modal" data-target="#modal-dosier" data="' + encryptedData + '"><i class="glyphicon glyphicon-inbox"></i></a>';
								var linkAdjustAnualLeave = '';
								var statusLabel = '';
								var pathFileSK = '';

								if( user[i].status == 0 ){
									linkConfirm = '<a href="#" name="link-modal-confirm-update" class="btn btn-primary btn-md" data-toggle="modal" data-target="#modal-update-data-pending" data="' + encryptedData + '"><i class="glyphicon glyphicon-check"></i></a>';
								}else{
									linkConfirm = '';
								} 

								dataLinkSelectUser = encryptedData + config.frontParam.separatorData + 
													 user[i].name + config.frontParam.separatorData + 
													 ( user[i].tgl_menikah !== null && user[i].tgl_menikah !== "" && user[i].tgl_menikah !== "0000-00-00" ? dateFormat(user[i].tgl_menikah, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
													 ( user[i].akte_menikah == null ? '' : user[i].akte_menikah ) + config.frontParam.separatorData + 
													 ( user[i].tgl_meninggal !== null && user[i].tgl_meninggal !== "" && user[i].tgl_meninggal !== "0000-00-00" ? dateFormat(user[i].tgl_meninggal, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
													 ( user[i].akte_meninggal == null ? '' : user[i].akte_meninggal ) + config.frontParam.separatorData + 
													 ( user[i].tgl_cerai !== null && user[i].tgl_cerai !== "" && user[i].tgl_cerai !== "0000-00-00" ? dateFormat(user[i].tgl_cerai, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
													 ( user[i].akte_cerai == null ? '' : user[i].akte_cerai ) + config.frontParam.separatorData + 
													 ( user[i].statusPernikahan !== null ? user[i].statusPernikahan.name : '' ) ;
													 
								linkSelectUser = '<a href="#" class="btn btn-primary btn-md" data="' + dataLinkSelectUser + '" name="link-select-user">Pilih</a>';
								
								dataLinkAnnualLeave = encryptedData + config.frontParam.separatorData + 
													  user[i].cuti_tahunan_n + config.frontParam.separatorData + 
													  user[i].cuti_tahunan_n_1 + config.frontParam.separatorData + 
													  user[i].cuti_tahunan_n_2;
								linkAdjustAnualLeave = '<a href="#" name="link-modal-adjust-anual-leave" class="btn btn-primary btn-md" data-toggle="modal" data-target="#modal-form-adjust-anual-leave" data="' + dataLinkAnnualLeave + '"><i class="glyphicon glyphicon-hourglass"></i></a>';

								// User Status
								//14=>Pensiun,15=>Pindah Instansi,12=>Pemberhentian
								if( user[i].status == 0 ){

									if( user[i].type_non_aktif == 14 ){
										pathFileSK = config.frontParam.filePath.fileSKPensiun + user[i].file_sk_non_aktif;
									}else if( user[i].type_non_aktif == 15 ){
										pathFileSK = config.frontParam.filePath.fileSKPindahInstansi + user[i].file_sk_non_aktif;
									}else if( user[i].type_non_aktif == 12 ){
										pathFileSK = config.frontParam.filePath.fileSKPemberhentian + user[i].file_sk_non_aktif;
									}
									

									dataLinkStatusUser = user[i].type_non_aktif + config.frontParam.separatorData + 
														 user[i].no_sk_non_aktif + config.frontParam.separatorData + 
														 ( user[i].tgl_sk_non_aktif !== null && user[i].tgl_sk_non_aktif !== "" && user[i].tgl_sk_non_aktif !== "0000-00-00" ? dateFormat(user[i].tgl_sk_non_aktif, "dd-mm-yyyy") : "") + config.frontParam.separatorData +
														 ( user[i].file_sk_non_aktif !== "" ? pathFileSK : "" ) + config.frontParam.separatorData + 
														 ( user[i].tgl_efektif_non_aktif !== null && user[i].tgl_efektif_non_aktif !== "" && user[i].tgl_efektif_non_aktif !== "0000-00-00" ? dateFormat(user[i].tgl_efektif_non_aktif, "dd-mm-yyyy") : "") + config.frontParam.separatorData +
														 ( user[i].file_sk_non_aktif !== "" ? user[i].file_sk_non_aktif : "" );
									statusLabel = '<a href="#" name="link-detail-nonactive-employee" class="btn btn-md pull-right" data-toggle="modal" data-target="#modal-form-nonactive-employee" data="' + dataLinkStatusUser + '">';

									if( user[i].type_non_aktif == 14 ){
										statusLabel += '<span class="pull-right badge bg-yellow">PENSIUN</span></a>';
									}else if( user[i].type_non_aktif == 15 ){
										statusLabel += '<span class="pull-right badge bg-purple">PINDAH INSTANSI</span></a>';
									}else if( user[i].type_non_aktif == 12 ){
										statusLabel += '<span class="pull-right badge bg-red">PEMBERHENTIAN</span></a>';
									}
								}else{
									statusLabel = '';
									statusLabel = '<span class="pull-right badge bg-green">AKTIF</span>';
								}								

								joData.push({
									index: (i+1),
									nip: linkNip,
									name: user[i].name,
									nik: user[i].nik,
									pangkat: ( user[i].pangkat == null ? '' : user[i].pangkat.name),
									jabatan: ( user[i].jabatan == null ? '' : user[i].jabatan.name),
									unit_kerja: ( user[i].unitKerja == null ? '' : user[i].unitKerja.name),
									navigation: linkConfirm,
									tempat_lahir: user[i].tempat_lahir,
									tanggal_lahir: user[i].tanggal_lahir,
									jenis_kelamin: ( user[i].jenis_kelamin_id == 1 ? 'Pria' : ( user[i].jenis_kelamin_id == 2 ? 'Wanita' : '' ) ),
									btn_select_user: linkSelectUser,
									status_pernikahan:{
										id: user[i].status_pernikahan_id,
										name: ( user[i].statusPernikahan == null ? '' : user[i].statusPernikahan.name),
									},
									tgl_menikah: user[i].tgl_menikah,
									tgl_meninggal: user[i].tgl_meninggal,
									akte_meninggal: user[i].akte_meninggal,
									tgl_cerai: user[i].tgl_cerai,
									akte_cerai: user[i].akte_cerai,
									link_nonactive: linkNonActiveEmployee,
									link_adjust_leave: linkAdjustAnualLeave,
									link_action: linkAdjustAnualLeave + "&nbsp;" + linkDosier + "&nbsp;" + linkNonActiveEmployee,
									status_label: statusLabel
									/*,
									link_edit: ( btnLink + btnDelete )*/
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

			}

		});

	},

	delete( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				var userId = req.body.user_id;

				return modelUser.findAll({
					where:{
						userId: userId
					}
				})
				.then( data => {
					if( data != null ){

						modelUser.destroy({
							where: {
								userId: userId
							}
						})
						.then( dataDelete => {

							joResult = JSON.stringify({
								'status_code': '00',
								'status_msg': 'Data successfully deleted'
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
				} )
			}

		});

	},

	uploadPhoto( req, res ){
		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
				libUtil.getDecrypted( req.body.id, function(decryptedId){
					return modelUser.update({
						picture: req.body.photo
					},{
						where:{
							id: decryptedId
						}
					})
					.then( () => {
						joResult = JSON.stringify({
							"status_code": "00",
							"status_msg": "Upload foto berhasil."
						});
						res.setHeader('Content-Type','application/json');
						res.status(201).send(joResult);
					} )
					.catch( error => res.status(400).send(error) );
				});
			}
		});
	},

	changeToNonActive( req, res ){
		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
				libUtil.getCurrDateTime(function(currTime){
					libUtil.getDecrypted( req.body.user_id, function(decryptedId){
						return modelUser
							.update({
								type_non_aktif: req.body.type_id,
								no_sk_non_aktif: req.body.no_sk,
								tgl_sk_non_aktif: ( req.body.tgl_sk != "" && req.body.tgl_sk != "0000-00-00" ? libUtil.parseToFormattedDate( req.body.tgl_sk ) : "0000-00-00"),
								file_sk_non_aktif: req.body.file_sk,
								tgl_efektif_non_aktif: ( req.body.tgl_efektif != "" && req.body.tgl_efektif != "0000-00-00" ? libUtil.parseToFormattedDate( req.body.tgl_efektif ) : "0000-00-00"),
								status: 0
							},{
								where:{
									id: decryptedId
								}
							})
							.then( () => {
								joResult = JSON.stringify({
									"status_code": "00",
									"status_msg": "Perubahan data anda berhasil disimpan."
								});
								res.setHeader('Content-Type','application/json');
								res.status(201).send(joResult);
							} )
							.catch( error => res.status(400).send(error) );
					});
				});
			}
		});
	},

	adjustAnualLeave( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
				libUtil.getDecrypted( req.body.user_id, function(decryptedId){
					libUtil.getCurrDateTime(function(currTime){
						modelUser.update({
							cuti_tahunan_n: ( req.body.cuti_tahunan_n == '' ? 0 : parseInt(req.body.cuti_tahunan_n) ),
							cuti_tahunan_n_1: ( req.body.cuti_tahunan_n_1 == '' ? 0 : parseInt(req.body.cuti_tahunan_n_1) ),
							cuti_tahunan_n_2: ( req.body.cuti_tahunan_n_2 == '' ? 0 : parseInt(req.body.cuti_tahunan_n_2) ),
							cuti_ditangguhkan_n_plus_1: ( req.body.cuti_ditangguhkan_n_plus_1 == '' ? 0 : parseInt(req.body.cuti_ditangguhkan_n_plus_1) ),
							adjust_cuti_by: req.headers['x-id'],
							adjust_cuti_at: currTime
						},{
							where: {
								id: decryptedId
							}
						})
						.then( () => {
							var joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "Cuti Tahunan berhasil disimpan.",
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

	getAnualLeaveInfo( req, res ){
		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				libUtil.getDecrypted( req.query.id, function(decryptedId){

					return modelUser.findOne({
						where: {	
							id: decryptedId
						}				
					})
					.then( data => {
	
						if( data == null ){
							var joResult = JSON.stringify({
								"status_code": "-99",
								"status_msg": "Data tidak ditemukan."
							});
							res.setHeader('Content-Type','application/json');
							res.status(400).send(joResult);
						}else{
							var joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "OK",
								"cuti_tahunan_n": data.cuti_tahunan_n, 
								"cuti_tahunan_n_1": data.cuti_tahunan_n_1,
								"cuti_tahunan_n_2": data.cuti_tahunan_n_2, 
								"cuti_ditangguhkan": data.cuti_ditangguhkan_n_plus_1
							});
							console.log(">>> RESULT sss : " + joResult);
							res.setHeader('Content-Type','application/json');
							res.status(201).send(joResult); 
						}
						
					})
					.catch( error => res.status(400).send(error) );

				});

			}
		});
	}

}