const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
const bcrypt = require('bcrypt');
const CryptoLib = require('peters-cryptolib');
const _groupBy = require('json-groupby');
const fs = require('fs');

var env = process.env.NODE_ENV || 'localhost';
var config = require(__dirname + '/../config/config.json')[env];

// Model
const modelUser = require('../models').ms_users;

//Repository
const UserRepository = require('../repository/userrepository.js');
const userRepoInstance = new UserRepository();

// Services
const NotificationService = require('../services/notificationservice.js');
const _notificationServiceInstance = new NotificationService();

const _cryptoLib = new CryptoLib();

// Utility
const Util = require('peters-globallib-v2');
const _utilInstance = new Util();
const UtilSecurity = require('../utils/security.js');
const utilSecureInstance = new UtilSecurity();
const GoogleUtil = require('../utils/googleutil.js');
const google_utilInstance = new GoogleUtil();
const JwtUtil = require('../utils/jwtutil.js');
const jwt_utilInstance = new JwtUtil();

const LocalUtil = require('../utils/globalutility.js');
const { updateFCMToken } = require('../controllers/user');
const _localUtilInstance = new LocalUtil();

class UserService {
	constructor() {}

	async list(param) {
		var joResult = {};
		var joArrData = [];

		var xResultList = await userRepoInstance.list(param);

		if (xResultList.data.count > 0) {
			joResult.status_code = '00';
			joResult.status_msg = 'OK';
			joResult.recordsTotal = xResultList.count;
			joResult.recordsFiltered = xResultList.count;
			joResult.draw = param.draw;

			var xRows = xResultList.data.rows;

			for (var index in xRows) {
				let xUserLevel = [];
				let xApplicationArr = [];
				for (var j in xRows[index].user_level) {
					xUserLevel.push({
						id: xRows[index].user_level[j].id,
						name: xRows[index].user_level[j].name,
						application:
							xRows[index].user_level[j].application != null
								? xRows[index].user_level[j].application.name
								: ''
					});
				}

				let xApplicationTemp = JSON.parse(JSON.stringify(_groupBy(xUserLevel, [ 'application' ])));
				for (var key in xApplicationTemp) {
					xApplicationArr.push(key);
				}

				joArrData.push({
					id: await _utilInstance.encrypt(xRows[index].id.toString(), config.cryptoKey.hashKey),
					name: xRows[index].name,
					// user_level: xRows[index].user_level == null ? null : xRows[index].user_level,
					user_level: xUserLevel,
					application: xApplicationArr,
					email: xRows[index].email,
					company_id: xRows[index].company != null ? xRows[index].company.id : null,
					company_name: xRows[index].company != null ? xRows[index].company.name : '',
					status: xRows[index].status
				});
			}

			joResult.data = joArrData;
		} else {
			joResult.status_code = '00';
			joResult.status_msg = 'OK';
			joResult.recordsTotal = xResultList.count;
			joResult.recordsFiltered = xResultList.count;
			joResult.draw = param.draw;
			joResult.data = joArrData;
		}

		return joResult;
	}

	async dropDownList(param) {
		var joResult = {};
		var joArrData = [];

		var xResultList = await userRepoInstance.list(param);

		if (xResultList.data.count > 0) {
			joResult.status_code = '00';
			joResult.status_msg = 'OK';

			var xRows = xResultList.data.rows;

			for (var index in xRows) {
				joArrData.push({
					id: xRows[index].id,
					name: xRows[index].name,
					email: xRows[index].email
				});
			}

			joResult.data = joArrData;
		} else {
			joResult.status_code = '-99';
			joResult.status_msg = 'Data not found';
			joResult.data = joArrData;
		}

		return joResult;
	}

	async doRegister(param) {
		var joResult;
		var result = await userRepoInstance.isEmailExists(param.email);
		var xClearPassword = '';
		var xNotificationRegistration = {};

		if (result == null) {
			console.log(`>>> param: ${JSON.stringify(param)}`);
			// await _utilInstance.writeLog(`UserService.doRegister`, `>>> param: ${JSON.stringify(param)}`, 'error');
			joResult = await userRepoInstance.registerUser(param);

			if (joResult.status_code == '00') {
				xClearPassword = joResult.clear_password;
				delete joResult.clear_password;
				var resultNotify = null;

				//Prepare to send notification if registration method using conventional
				if (param.method == 'conventional') {
					if (param.type == 1) {
						param.status = 1;

						var xParamNotif = {
							name: param.name,
							email: param.email,
							password: xClearPassword
						};
						// This line used for notify to user that his/her account already created and inform them the login information
						xNotificationRegistration = await _notificationServiceInstance.sendNotification_NewEmployeeRegister(
							xParamNotif
						);
					} else if (param.type == 2) {
						var notifyParam = {
							email: param.email,
							id: joResult.created_id,
							name: param.name
						};
						resultNotify = await _utilInstance.axiosRequest(
							config.api.notification.emailVerification,
							'POST',
							notifyParam
						);
					}
				}

				return JSON.stringify({
					status_code: '00',
					status_msg: joResult.status_msg,
					data: param,
					result_check_email: result,
					result_add: joResult,
					result_send_email_verification: resultNotify !== null ? resultNotify.data : null,
					result_notif_registration: xNotificationRegistration
				});
			}
		} else {
			// Note: This line is only for firsttime import, not for publish
			// By: Peter
			// At: 21/09/2022
			if (param.mode == 'import') {
				// Update by employee_id
				let xParamUpdate = {
					id: result.id,
					employee_id: param.employee_id
				};
				let xResultUpdate = await userRepoInstance.save_new(xParamUpdate, 'update');
				console.log(`>>> employee_id: ${param.employee_id}`);
				console.log(`>>> xResultUpdate: ${JSON.stringify(xResultUpdate)}`);
			}
			return JSON.stringify({
				status_code: '-99',
				status_msg: 'Email already registered',
				data: param
			});
		}
	}

	async nonActiveByEmployeeId(pParam) {
		var xJoResult = {};
		var xFlagProcess = false;
		var xDecId = null;

		try {
			if (pParam.hasOwnProperty('employee_id')) {
				if (pParam.employee_id != '') {
					xDecId = await _utilInstance.decrypt(pParam.employee_id, config.cryptoKey.hashKey);
					if (xDecId.status_code == '00') {
						pParam.employee_id = xDecId.decrypted;
						xFlagProcess = true;
					} else {
						xJoResult = xDecId;
					}
				}
			}

			if (xFlagProcess) {
				let xParamUpdate = {
					id: pParam.employee_id,
					status: -1,
					act: 'update_from_employee'
				};
				xJoResult = await userRepoInstance.save_new(xParamUpdate, 'update_by_employee_id');
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <UserService.nonActive>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async save(param) {
		var joResult;
		var checkDuplicateResult = await userRepoInstance.isEmailExists(param.email);
		var flagProcess = true;
		var flagExistEmail = true;
		var xDec = null;
		var xCheckEmail = null;
		var xCheckEmployeeId = null;

		if (
			(param.act == 'add' && checkDuplicateResult == null) ||
			param.act == 'update' ||
			param.act == 'update_from_employee'
		) {
			if (param.act == 'update' || param.act == 'update_from_employee') {
				if (param.act == 'update') {
					xDec = await _utilInstance.decrypt(param.id, config.cryptoKey.hashKey);
				} else if (param.act == 'update_from_employee') {
					xDec = await _utilInstance.decrypt(param.employee_id, config.cryptoKey.hashKey);
				}

				param.id = parseInt(xDec.decrypted);

				// Check existing email
				xCheckEmail = await userRepoInstance.isEmailExists(param.email);

				// Check existing employee
				if (param.act == 'update_from_employee') {
					xCheckEmployeeId = await userRepoInstance.getUserByEmployeeId(xDec.decrypted);
				}

				if (param.act == 'update') {
					if (xCheckEmail != null) {
						// Jika ditemukan email yng sama
						if (xCheckEmail.id != param.id) {
							// Jika user yang melakukan update tidak sama dengan pemilik email
							flagExistEmail = false;
						}
					}
				} else if (param.act == 'update_from_employee') {
					if (xCheckEmail != null) {
						// Jika ditemukan email yng sama
						if (xCheckEmail.employee_id != param.id) {
							// Jika user yang melakukan update tidak sama dengan pemilik email
							flagExistEmail = false;
						}
					}
				}
			}

			console.log('>>> Param : ' + JSON.stringify(param));
			console.log('>>> flagExistEmail : ' + flagExistEmail);

			if (
				((param.act == 'update' || param.act == 'update_from_employee') && xDec.status_code == '00') ||
				param.act == 'add'
			) {
				if (!flagExistEmail) {
					flagProcess = false;
					joResult = {
						status_code: '-99',
						status_msg: 'Email already exists'
					};
				} else {
					if (param.act == 'update_from_employee' && xCheckEmployeeId == null) {
						// Jika ada update employee di attendance system dan di oAuth tidak ada maka insert manual
						param.act = 'add_from_employee';
						param.employee_id = xDec.decrypted;
					} else {
						if (param.hasOwnProperty('user_id')) {
							var xDecUserId = await _utilInstance.decrypt(param.user_id, config.cryptoKey.hashKey);
							if (xDecUserId.status_code == '00') {
								param.user_id = xDecUserId.decrypted;
							} else {
								flagProcess = false;
								joResult = xDecUserId;
							}
						}
					}
				}
			} else {
				flagProcess = false;
				joResult = xDec;
			}

			console.log('>>> JO Result : ' + JSON.stringify(joResult));

			if (flagProcess) joResult = await userRepoInstance.save(param);
		} else {
			joResult = {
				status_code: '01',
				status_msg: 'Data already exist in database'
			};
		}

		return joResult;
	}

	async doVerifyAccount(param) {
		var decryptedVerificationCode = await _utilInstance.decrypt(param.code, config.cryptoKey.hashKey);
		if (decryptedVerificationCode.status_code == '00') {
			var splittedDecryptedCode = decryptedVerificationCode.decrypted.split(config.frontParam.separatorData);
			var email = splittedDecryptedCode[0];
			var id = splittedDecryptedCode[1];
			var verify = await userRepoInstance.verifyVerificationCode(email, id);
			if (verify == null) {
				return JSON.stringify({
					status_code: '-99',
					status_msg: 'Code verification not valid'
				});
			} else {
				var verifyResult = await userRepoInstance.activateUser(id);
				if (verifyResult.status_code == '00') {
					return JSON.stringify({
						status_code: '00',
						status_msg: "You've susscessfully verified your account. Now you can login to your homepage"
					});
				}
			}
		} else {
			return JSON.stringify({
				status_code: '-99',
				status_msg: 'Invalid formula of code verification',
				err_msg: decryptedVerificationCode.status_msg
			});
		}
	}

	async doLogin(param) {
		// console.log('>>> Start validation isEmailExists...');
		// console.log('>>> Username : ' + config.username);
		// console.log('>>> Password : ' + config.password);
		// console.log('>>> IP : ' + config.host);
		// console.log('>>> Port : ' + config.port);
		// console.log('>>> Param : ' + JSON.stringify(param));
		// console.log(__dirname);
		console.log(`>>> Param Login : ${JSON.stringify(param)}`);
		let xPrivateKey = fs.readFileSync(__dirname + '/../../private.pem');

		if (param.device == 'mobile' || param.device == 'web') {
			var validateEmail = await userRepoInstance.isEmailExists(param.email);
			// console.log(`>>> End validation isEmailExists...: ${JSON.stringify(validateEmail)}`);
			var xFlagProcess = false;
			var xJoResult = {};

			if (validateEmail != null) {
				if (validateEmail.status == -1) {
					return JSON.stringify({
						status_code: '-99',
						status_msg: 'Sory, your account has been non active. Please contact MIS Department.'
					});
				} else {
					var validatePassword = await bcrypt.compare(param.password, validateEmail.password);
					if (validatePassword) {
						// Check if this user has privilege based on assigned application_id
						if (param.application_id != '') {
							// Check if administrator
							var xTempFilterAdministrator = validateEmail.user_level.filter(
								(x) => x.application.id == 1
							);
							if (xTempFilterAdministrator.length == 0) {
								// Check if non administrator

								console.log(`>>> Non Administrator :`);
								console.log(`>>> validateEmail : ${JSON.stringify(validateEmail)}`);
								console.log(`>>> param.application_id : ${param.application_id}`);

								var xTempFilter = validateEmail.user_level.filter(
									(x) => x.application.id == param.application_id
								);
								if (xTempFilter.length == 0) {
									return JSON.stringify({
										status_code: '-99',
										status_msg: "You don't have privilege to access this page"
									});
								}
							}
						} else {
							xFlagProcess = false;
							return JSON.stringify({
								status_code: '-99',
								status_msg: 'You need to supply application id to use this api'
							});
						}

						if (true) {
							// Generate JWT Token
							let token = '';
							let xTokenRefresh = '';
							let xUUID = await _utilInstance.generateUUID4();
							if (param.device == 'mobile' || param.device == 'web') {
								token = jwt.sign(
									{
										email: param.email,
										id: validateEmail.id,
										device: param.device == '' ? 'web' : param.device,
										uuid: xUUID,
										scope: 'access_token'
									},
									// config.secret,
									xPrivateKey,
									{
										expiresIn:
											param.device == 'mobile'
												? config.login.expireToken.mobile
												: config.login.expireToken.web,
										algorithm: 'RS256'
									}
								);

								// Generate Refresh token
								xTokenRefresh = jwt.sign(
									{
										email: param.email,
										id: validateEmail.id,
										device: param.device == '' ? 'web' : param.device,
										uuid: xUUID,
										scope: 'refresh_token'
									},
									// config.secret,
									xPrivateKey,
									{
										expiresIn: config.login.expireRefreshToken,
										algorithm: 'RS256'
									}
								);
							}

							// Get Employee Info
							var xEmployeeId =
								validateEmail.employee_id != null
									? await _utilInstance.encrypt(
											validateEmail.employee_id.toString(),
											config.cryptoKey.hashKey
										)
									: 0;
							var xUrlAPI = config.api.employeeService.getEmployeeInfo;
							// Version 1:
							// var xUrlQuery = '/' + xEmployeeId;

							// Version 2:
							var xUrlQuery = '/' + xEmployeeId;
							console.log(`>>> xUrlAPI: ${xUrlAPI}`);
							var xEmployeeInfo = await _utilInstance.axiosRequest(xUrlAPI + xUrlQuery, {
								headers: {
									'x-token': token,
									'x-method': 'conventional',
									'x-device': param.device
								}
							});

							// console.log(`>>> Employee Info : ${JSON.stringify(xEmployeeInfo)}`);

							await _utilInstance.writeLog(
								'xEmployeeInfo',
								`>>> xEmployeeInfo : ${JSON.stringify(xEmployeeInfo)}`,
								'debug'
							);

							if (xEmployeeInfo) {
								if (xEmployeeInfo.status_code == '00') {
									// console.log(`>>> xEmployeeInfo: ${JSON.stringify(xEmployeeInfo)}`);
									if (xEmployeeInfo.token_data.status_code == '00') {
										console.log(
											`>>> xEmployeeInfo.token_data.data.app_status: ${xEmployeeInfo.token_data
												.data.app_status}`
										);

										//if (xEmployeeInfo.token_data.data.app_status == 1) {
										if (param.device == 'mobile') {
											//if (param.hasOwnProperty('device_id')) {

											console.log(`>>> param.device_id: ${param.device_id}`);
											console.log(
												`>>> xEmployeeInfo.token_data.data.device_id : ${xEmployeeInfo
													.token_data.data.device_id}`
											);

											if (param.device_id != '' && param.device_id != null) {
												if (xEmployeeInfo.token_data.data.app_status == 1) {
													if (xEmployeeInfo.token_data.data.device_id != param.device_id) {
														xJoResult = {
															status_code: '-99',
															status_msg: 'You not allowed to login using current device.'
														};
													} else {
														xFlagProcess = true;
													}
												} else {
													// Check if device_id already use or not
													var xUrlQuery = `${config.api.employeeService
														.baseUrl}/info?device_id=${param.device_id}`;
													console.log(`>>> URL : ${xUrlQuery}`);
													var xEmployeeInfoByDevice = await _utilInstance.axiosRequest(
														xUrlQuery,
														{
															headers: {
																'x-token': token,
																'x-method': 'conventional',
																'x-device': param.device
															}
														}
													);

													if (xEmployeeInfoByDevice.status_code == '00') {
														if (xEmployeeInfoByDevice.token_data.status_code == '00') {
															xJoResult = {
																status_code: '-99',
																status_msg:
																	'You not allowed to login using current device.'
															};
														} else {
															xFlagProcess = true;
														}
													}
												}
											} else {
												xFlagProcess = true;
											}
											// } else {
											// 	xFlagProcess = true;
											// }
										} else {
											xFlagProcess = true;
										}
										// } else {
										// 	xFlagProcess = true;
										// }
									} else {
										console.log(`>>> Stuck Here 1...: ${JSON.stringify(xEmployeeInfo)}`);
									}
								} else {
									console.log(`>>> Stuck Here 2 : ${JSON.stringify(xEmployeeInfo)}`);
								}
							} else {
								console.log(`>>> Stuck Here 3...`);
							}

							console.log(`>>> xFlagProcess : ${xFlagProcess}`);

							// if (xFlagProcess) {
							if (xFlagProcess) {
								let xEmployeeDetail =
									xEmployeeInfo.status_code == '00' ? xEmployeeInfo.token_data.data : null;
								delete xEmployeeInfo.token_data.data.enc_key;
								return JSON.stringify({
									status_code: '00',
									status_msg: 'Login successfully',
									token: token,
									refresh_token: xTokenRefresh,

									user_id:
										validateEmail.id != null
											? await _utilInstance.encrypt(
													validateEmail.id.toString(),
													config.cryptoKey.hashKey
												)
											: 0,
									level: validateEmail.user_level,
									vendor_id:
										validateEmail.vendor_id != null
											? await _utilInstance.encrypt(
													validateEmail.vendor_id.toString(),
													config.cryptoKey.hashKey
												)
											: 0,
									user_type: validateEmail.type,
									sanqua_company_id:
										xEmployeeInfo.token_data.data.company != null
											? xEmployeeInfo.token_data.data.company.id
											: null,
									sanqua_company_name:
										xEmployeeInfo.token_data.data.company != null
											? xEmployeeInfo.token_data.data.company.alias
											: '',
									username: validateEmail.name,
									employee_id: xEmployeeId,
									employee: xEmployeeDetail,
									notification_via_fcm: validateEmail.notification_via_fcm,
									notification_via_email: validateEmail.notification_via_email,
									notification_via_wa: validateEmail.notification_via_wa,
									notification_via_telegram: validateEmail.notification_via_telegram
								});
							} else {
								return JSON.stringify(xJoResult);
							}
						}
					} else {
						return JSON.stringify({
							status_code: '-99',
							status_msg: 'Email or password not valid.'
						});
					}
				}
			} else {
				return JSON.stringify({
					status_code: '-99',
					status_msg: 'Email or password not valid!'
				});
			}
		} else {
			return JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter device not valid'
			});
		}
	}

	async doLogin_GoogleID(param) {
		/*var validateEmail = await userRepoInstance.isEmailExists( param.email );
        if( validateEmail != null ){
            var validatePassword = await bcrypt.compare(param.password, validateEmail.password);
            if( validatePassword ){

                //Generate JWT Token
                let token = jwt.sign({email:param.email,id:validateEmail.id},config.secret,{expiresIn:config.login.expireToken});

                return JSON.stringify({
                    "status_code": "00",
                    "status_msg": "Login successfully",
                    "token": token
                });
            }else{
                return JSON.stringify({
                    "status_code": "-99",
                    "status_msg": "Email or password not valid"
                });
            }
        }else{
            return JSON.stringify({
                "status_code": "-99",
                "status_msg": "Email or password not valid"
            });
        }*/
		var urlGoogle = await google_utilInstance.urlGoogle();
		return JSON.stringify({
			status_code: '00',
			status_msg: 'OK',
			url: urlGoogle
		});
	}

	async doParseQueryString_Google(param) {
		var joResult = {};
		try {
			// Get Token for access the account
			var joQuery = await _utilInstance.parseQueryString(param.code);
			var joToken = await google_utilInstance.getToken(joQuery.code);

			// Get user detail using token
			var paramReq = {
				url: 'https://www.googleapis.com/oauth2/v2/userinfo',
				method: 'get',
				headers: {
					//'Authorization': `Bearer ya29.a0AfH6SMCJ9FSMIHY3vjSVlBH9v7_g5F-yjQUcNcnxCuqZAouo0Yt-B-8PtkNPs0cNtRt3zgw56e6M4yphprh0D5u1sts9iFIOzbUOeDc_Kz1hpILAJXRcsYeSwEdyIXQIydD5sp_HdT8hDeQ6CUgn7bMOWBZKuUN3M98`,
					Authorization: `Bearer ` + joToken.access_token
				}
			};

			var joResultAccountInfo = await _utilInstance.axiosRequest(
				config.login.oAuth2.google.urlUserInfo,
				paramReq
			);
			var paramRegister = {
				name: joResultAccountInfo.data.name,
				email: joResultAccountInfo.data.email,
				password: '',
				method: 'google',
				google_token: joToken.access_token,
				google_token_expire: joToken.expiry_date,
				google_token_id: joToken.id_token
			};

			var joResultRegister = await this.doRegister(paramRegister);

			if (joResultRegister.status_code == '00') {
				joResult = joResultRegister;
			} else {
				var joResultUpdateToken = await userRepoInstance.updateGoogleToken(
					joResultAccountInfo.data.email,
					joToken.access_token,
					joToken.id_token,
					joToken.expiry_date
				);
				joResult = joResultUpdateToken;
			}
		} catch (err) {
			joResult = {
				status_code: '-99',
				status_msg: 'Error parse ',
				err_msg: err.response
			};
		}

		return joResult;
	}

	async doForgotPassword(param) {
		var validateEmail = await userRepoInstance.isEmailExists(param.email);
		if (validateEmail != null) {
			//Using JWT
			let token = jwt.sign(
				{ email: param.email, id: validateEmail.id, phrase: 'FORGOTPASSWORD' },
				config.secret,
				{ expiresIn: config.login.expireToken }
			);
			var forgotPasswordCode = token;
			//var forgotPasswordCode = "FORGOTPASSWORD" + config.frontParam.separatorData + param.email + config.frontParam.separatorData + validateEmail.id + config.frontParam.separatorData + token;
			//forgotPasswordCode = await _utilInstance.encrypt(forgotPasswordCode);
			var verificationLink = config.frontParam.forgotPasswordLink;
			verificationLink = verificationLink.replace('#VERIFICATION_CODE#', forgotPasswordCode);

			//Prepare parameter and send to notification service
			var notifyParam = {
				email: param.email,
				name: validateEmail.name,
				verification_link: verificationLink
			};
			var resultNotify = await _utilInstance.axiosRequestPost(
				config.api.notification.forgotPassword,
				notifyParam
			);

			if (resultNotify.status_code == '00') {
				//Update status in database
				var resultUpdate = await userRepoInstance.forgotPassword(param.email);

				if (resultUpdate.status_code == '00') {
					return JSON.stringify({
						status_code: '00',
						status_msg: 'OK',
						result_send_email_verification: resultNotify.data
					});
				} else {
					return JSON.stringify({
						status_code: '-99',
						status_msg: 'Update status forgot password failed',
						result_send_email_verification: resultNotify.data
					});
				}
			}
		}
	}

	async doForgotPasswordWithGenerateNew(param) {
		var validateEmail = await userRepoInstance.isEmailExists(param.email);
		if (validateEmail != null) {
			//Generate new Password
			var xNewPassword = await _utilInstance.generateRandomPassword();

			//Prepare parameter and send to notification service
			var notifyParam = {
				email: param.email,
				name: validateEmail.name,
				new_password: xNewPassword
			};

			var resultNotify = await _utilInstance.axiosRequestPost(
				config.api.notification.forgotPassword,
				'',
				notifyParam
			);

			if (resultNotify.status_code == '00') {
				//Update status in database
				var resultUpdate = await userRepoInstance.forgotPassword(
					param.email,
					await utilSecureInstance.generateEncryptedPassword(xNewPassword),
					'generate_new_password'
				);

				if (resultUpdate.status_code == '00') {
					if (param.hasOwnProperty('user_id')) {
						return JSON.stringify({
							status_code: '00',
							status_msg: 'Password has been successfully sent'
							// "result_send_email_verification": resultNotify.data
						});
					} else {
						return JSON.stringify({
							status_code: '00',
							status_msg:
								'New password has sent to your email. Please check and use that password for login.'
							// "result_send_email_verification": resultNotify.data
						});
					}
				} else {
					return JSON.stringify({
						status_code: '-99',
						status_msg: 'Update status forgot password failed'
						// "result_send_email_verification": resultNotify.data
					});
				}
			}
		} else {
			return JSON.stringify({
				status_code: '-99',
				status_msg: 'Email not found'
			});
		}
	}

	async doVerifyForgotPasswordCode(param) {
		var decryptedVerificationCode = await _utilInstance.decrypt(param.code, config.cryptoKey.hashKey);
		if (decryptedVerificationCode.status_code == '00') {
			var splittedDecryptedCode = decryptedVerificationCode.decrypted.split(config.frontParam.separatorData);
			var prefix = splittedDecryptedCode[0];
			var email = splittedDecryptedCode[1];
			var id = splittedDecryptedCode[2];
			var verify = await userRepoInstance.verifyVerificationCode(email, id);

			if (prefix == 'FORGOTPASSWORD') {
				if (verify == null) {
					return JSON.stringify({
						status_code: '-99',
						status_msg: 'Code verification not valid'
					});
				} else {
					return JSON.stringify({
						status_code: '00',
						status_msg: 'Please input your new password',
						id: await _utilInstance.encrypt(id, config.cryptoKey.hashKey)
					});
				}
			} else {
				return JSON.stringify({
					status_code: '-99',
					status_msg: 'Invalid formula of code verification'
				});
			}
		} else {
			return JSON.stringify({
				status_code: '-99',
				status_msg: 'Invalid formula of code verification',
				err_msg: decryptedVerificationCode.status_msg
			});
		}
	}

	async doVerifyForgotPasswordCode_JWT(param) {
		var response = await utilSecureInstance.verifyToken(param.code);
		if (response.status_code == '00') {
			var prefix = response.decoded.phrase;
			var email = response.decoded.email;
			var id = response.decoded.id;
			var verify = await userRepoInstance.verifyVerificationCode(email, id);

			if (prefix == 'FORGOTPASSWORD') {
				if (verify == null) {
					return JSON.stringify({
						status_code: '-99',
						status_msg: 'Code verification not valid'
					});
				} else {
					return JSON.stringify({
						status_code: '00',
						status_msg: 'Please input your new password',
						id: await _utilInstance.encrypt(id, config.cryptoKey.hashKey)
					});
				}
			} else {
				return JSON.stringify({
					status_code: '-99',
					status_msg: 'Invalid formula of code verification'
				});
			}
		} else {
			return JSON.stringify({
				status_code: '-99',
				status_msg: 'Invalid formula of code verification',
				err_msg: response.status_msg
			});
		}
	}

	async doChangePassword(param) {
		//Verification Code first
		var result = await this.doVerifyForgotPasswordCode_JWT(param);
		if (JSON.parse(result).status_code == '00') {
			//Decrypt id from verify code
			var rsDecrypted = await _utilInstance.decrypt(JSON.parse(result).id, config.cryptoKey.hashKey);

			//Encrypt the new password
			var encryptedNewPassword = await utilSecureInstance.generateEncryptedPassword(param.new_password);

			//Update to database
			var resultUpdate = await userRepoInstance.changePassword(
				encryptedNewPassword,
				param.email,
				rsDecrypted.decrypted
			);
			console.log('>>> Result : ' + resultUpdate.status_code);
			if (resultUpdate.status_code == '00') {
				return JSON.stringify({
					status_code: '00',
					status_msg: "You've successfully change your password. Please relogin again"
				});
			} else {
				return JSON.stringify({
					status_code: '-99',
					status_msg: 'Change password failed. Please try again or contact to our customer service.',
					err_msg: resultUpdate.err_msg
				});
			}
		} else {
			return result;
		}
	}

	async doLoggedChangePassword(param) {
		var xJoResult = {};
		var xFlagProcess = true;
		var xDecId = {};

		// Validate old password
		var validateEmail = await userRepoInstance.isEmailExists(param.email);
		if (validateEmail != null) {
			var validatePassword = await bcrypt.compare(param.old_password, validateEmail.password);
			if (validatePassword) {
			} else {
				xFlagProcess = false;
				xJoResult = {
					status_code: '-99',
					status_msg: 'Incorrect old password. Please try again using correct old password'
				};
			}
		}

		if (xFlagProcess) {
			if (param.user_id != '') {
				xDecId = await _utilInstance.decrypt(param.user_id, config.cryptoKey.hashKey);
				if (xDecId.status_code == '00') {
					param.user_id = xDecId.decrypted;
				} else {
					xJoResult = xDecId;
					xFlagProcess = false;
				}
			}

			if (xFlagProcess) {
				//Encrypt the new password
				var encryptedNewPassword = await utilSecureInstance.generateEncryptedPassword(param.new_password);

				//Update to database
				var resultUpdate = await userRepoInstance.changePassword(
					encryptedNewPassword,
					param.email,
					param.user_id
				);
				if (resultUpdate.status_code == '00') {
					return JSON.stringify({
						status_code: '00',
						status_msg: "You've successfully change your password."
					});
				} else {
					return JSON.stringify({
						status_code: '-99',
						status_msg: 'Change password failed. Please try again or contact to our customer service.',
						err_msg: resultUpdate.err_msg
					});
				}
			}
		}

		return xJoResult;
	}

	async verifyToken(param) {
		var joResult = {};

		if (
			param.hasOwnProperty('method') &&
			param.hasOwnProperty('token') &&
			param.method != '' &&
			param.token != '' &&
			param.token != 'undefined' &&
			param.method != 'undefined'
		) {
			if (param.method == 'conventional' || param.method == 'oauth2') {
				console.log(`>>> Verify Token : ${param.token}`);
				joResult = await jwt_utilInstance.verifyJWT(param.token);

				// let xResultRefresh = await jwt_utilInstance.refreshJWT({
				// 	token: param.token
				// });
				console.log(`>>> joResult.result_verify: ${JSON.stringify(joResult.result_verify)}`);

				if (joResult.status_code == '00') {
					if (true) {
						// This validation when all esanqua app ready to send  device
						//if (joResult.result_verify.device == param.device_id) {

						// Check if scope is access_token or refresh_token
						if (joResult.result_verify.scope == 'access_token') {
							//Get User Detail by ID
							var xDecId = await _utilInstance.decrypt(
								joResult.result_verify.id,
								config.cryptoKey.hashKey
							);

							if (xDecId.status_code == '00') {
								var xUserId = xDecId.decrypted;
								var xObjUser = await userRepoInstance.getById(xUserId);
								if (xObjUser != null) {
									joResult.result_verify.name = xObjUser.name;
									joResult.result_verify.user_level_id = xObjUser.user_level_id;
									joResult.result_verify.user_level = xObjUser.user_level;
									joResult.result_verify.company = xObjUser.company;

									joResult.result_verify.notification_via_fcm = xObjUser.notification_via_fcm;
									joResult.result_verify.notification_via_email = xObjUser.notification_via_email;
									joResult.result_verify.notification_via_wa = xObjUser.notification_via_wa;
									joResult.result_verify.notification_via_telegram =
										xObjUser.notification_via_telegram;
								}
							}

							// Get Employee Info
							var xUrlAPI = config.api.employeeService.getEmployeeInfo;
							var xUrlQuery =
								'/' + (await _utilInstance.encrypt(xObjUser.employee_id, config.cryptoKey.hashKey));
							var xEmployeeInfo = await _utilInstance.axiosRequest(xUrlAPI + xUrlQuery, {});

							// console.log(`>>> token: ${param.token}`);
							// console.log(`>>> url: ${xUrlAPI + xUrlQuery}`);
							// console.log(`>>> tokxEmployeeInfoen: ${JSON.stringify(xEmployeeInfo)}`);

							if (xEmployeeInfo != null) {
								if (xEmployeeInfo.status_code == '00') {
									joResult.result_verify.employee_info = xEmployeeInfo.token_data.data;
								}
							} else {
								joResult.result_verify.employee_info = null;
							}
						} else {
							joResult = {
								status_code: '-99',
								status_msg: 'Token not valid'
							};
						}
					} else {
						joResult = {
							status_code: '-99',
							status_msg: 'Parameter device not valid'
						};
					}
				}
			} else if (param.method == 'google') {
				joResult = await _utilInstance.axiosRequest(
					config.login.oAuth2.google.urlVerifyToken + param.token,
					{}
				);
			}
		} else {
			joResult = {
				status_code: '-99',
				status_msg: 'You need to suply parameter method and token'
			};
		}

		return JSON.stringify(joResult);
	}

	async addVendorId(param) {
		var joResult = {};
		var flagProcess = true;

		//Decrypt id
		var xDecVendorId = await _utilInstance.decrypt(param.vendor_id);
		if (xDecVendorId.status_code == '00') {
			param.vendor_id = xDecVendorId.decrypted;
			var xDecUserId = await _utilInstance.decrypt(param.user_id);
			if (xDecUserId.status_code == '00') {
				param.user_id = xDecUserId.decrypted;
			} else {
				flagProcess = false;
				joResult = xDecUserId;
			}
		} else {
			flagProcess = false;
			joResult = xDecVendorId;
		}

		if (flagProcess) joResult = await userRepoInstance.updateVendorID(param.user_id, param.vendor_id);

		return JSON.stringify(joResult);
	}

	async deleteUser(param) {
		var joResult = {};
		var flagProcess = true;

		var xDecId = await _utilInstance.decrypt(param.id, config.cryptoKey.hashKey);
		if (xDecId.status_code == '00') {
			param.id = xDecId.decrypted;
		} else {
			flagProcess = false;
			joResult = xDecId;
		}

		if (flagProcess) {
			joResult = await userRepoInstance.delete(param);
			// This line for delete from user
			/*if (joResult.status_code == '00') {
				// Get Detail User
				let xUser = await userRepoInstance.getById(param.id);
				if (xUser) {
					if (xUser.employee_id != null) {
						// Non Active Employee
						var xUrlAPI = config.api.employeeService.baseUrl + '/employee/non_active';
						console.log(xUrlAPI);
						var xEmployeeInfo = await _utilInstance.axiosRequestPost(
							xUrlAPI,
							'POST',
							{
								id: await _utilInstance.encrypt(xUser.employee_id, config.cryptoKey.hashKey)
							},
							{
								headers: {
									'x-method': param.method,
									'x-token': param.token
								}
							}
						);
						joResult.non_active_result = xEmployeeInfo;
					}
				}
			}*/
		}

		return joResult;
	}

	async deleteUserByEmployeeId(param) {
		var joResult = {};
		var flagProcess = true;

		var xDecId = await _utilInstance.decrypt(param.employee_id, config.cryptoKey.hashKey);
		if (xDecId.status_code == '00') {
			param.employee_id = xDecId.decrypted;
		} else {
			flagProcess = false;
			joResult = xDecId;
		}

		if (flagProcess) {
			joResult = await userRepoInstance.deleteUserByEmployeeId(param);
			// This line for delete from user
			/*if (joResult.status_code == '00') {
				// Get Detail User
				let xUser = await userRepoInstance.getById(param.id);
				if (xUser) {
					if (xUser.employee_id != null) {
						// Non Active Employee
						var xUrlAPI = config.api.employeeService.baseUrl + '/employee/non_active';
						console.log(xUrlAPI);
						var xEmployeeInfo = await _utilInstance.axiosRequestPost(
							xUrlAPI,
							'POST',
							{
								id: await _utilInstance.encrypt(xUser.employee_id, config.cryptoKey.hashKey)
							},
							{
								headers: {
									'x-method': param.method,
									'x-token': param.token
								}
							}
						);
						joResult.non_active_result = xEmployeeInfo;
					}
				}
			}*/
		}

		return joResult;
	}

	async getUserByEmployeeId(pId) {
		var xJoResult = {};
		var xDecId = null;
		var xFlagProcess = true;
		var xData = {};

		console.log(`>>> pId : ${pId}`);

		if (pId.length == 65) {
			xDecId = await _utilInstance.decrypt(pId, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				pId = xDecId.decrypted;
			} else {
				xFlagProcess = false;
				xJoResult = xDecId;
			}
		}

		if (xFlagProcess) {
			var xResult = await userRepoInstance.getUserByEmployeeId(pId);

			if (xResult != null) {
				xData = {
					id: await _utilInstance.encrypt(xResult.id, config.cryptoKey.hashKey),
					clear_id: xResult.id,
					employee_id: await _utilInstance.encrypt(xResult.employee_id, config.cryptoKey.hashKey),
					name: xResult.name,
					email: xResult.email,
					status: xResult.status,
					verified_at: xResult.verified_at,
					sanqua_company_id: xResult.sanqua_company_id,
					company: xResult.company,
					fcm_token: xResult.fcm_token,
					fcm_token_web: xResult.fcm_token_web,
					fcm_token_expedition: xResult.fcm_token_expedition
				};

				if (xResult.user_level != null) {
					// Reformat user_level key
					var xJsonUserLevel = await _localUtilInstance.reformatJSONUserLevel(xResult.user_level);
					// xResult.user_level = xJsonUserLevel;
					// console.log(JSON.stringify(xResult));
					xData.application = xJsonUserLevel;
				}

				xJoResult = {
					status_code: '00',
					status_msg: 'OK',
					data: xData
				};
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Data not found'
				};
			}
		}

		return xJoResult;
	}

	async doUpdateFCMToken(pParam) {
		var xJoResult = {};
		var xFlagProcess = false;
		var xDecId = null;

		console.log(`>>> pParam <doUpdateFCMToken>: ${JSON.stringify(pParam)} `);

		try {
			if (pParam.hasOwnProperty('user_id')) {
				if (pParam.user_id != '') {
					xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
					if (xDecId.status_code == '00') {
						pParam.user_id = xDecId.decrypted;
						xFlagProcess = true;
					} else {
						xJoResult = xDecId;
					}
				}
			}

			if (xFlagProcess) {
				xJoResult = await userRepoInstance.saveGeneral(
					{
						id: pParam.user_id,
						fcm_token: pParam.fcm_token,
						fcm_token_web: pParam.fcm_token_web,
						fcm_token_expedition: pParam.fcm_token_expedition
					},
					'update'
				);
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `[UserService.doUpdateFCMToken] Exception: ${e.message}`
			};
		}

		return xJoResult;
	}

	async refreshToken(pParam) {
		var xJoResult = {};
		let xPrivateKey = fs.readFileSync(__dirname + '/../../private.pem');

		try {
			if (pParam.hasOwnProperty('token') && pParam.hasOwnProperty('refresh_token')) {
				if (pParam.token != '' && pParam.refresh_token != '') {
					let xResultVerifyOriginToken = await jwt_utilInstance.verifyJWT(pParam.token, 'refresh_token');
					let xResultVerifyRefreshToken = await jwt_utilInstance.verifyJWT(
						pParam.refresh_token,
						'refresh_token'
					);
					if (xResultVerifyOriginToken.status_code == '00') {
						if (xResultVerifyRefreshToken.status_code == '00') {
							// Check the value of token
							if (
								xResultVerifyOriginToken.result_verify.email ==
									xResultVerifyRefreshToken.result_verify.email &&
								xResultVerifyOriginToken.result_verify.device ==
									xResultVerifyRefreshToken.result_verify.device &&
								xResultVerifyOriginToken.result_verify.uuid ==
									xResultVerifyRefreshToken.result_verify.uuid
							) {
								if (xResultVerifyRefreshToken.result_verify.scope == 'refresh_token') {
									// Generate new access token
									let xToken = '';
									let xTokenRefresh = '';
									let xUUID = await _utilInstance.generateUUID4();

									if (
										xResultVerifyOriginToken.result_verify.device == 'mobile' ||
										xResultVerifyOriginToken.result_verify.device == 'web'
									) {
										var xDecId = await _utilInstance.decrypt(
											xResultVerifyOriginToken.result_verify.id,
											config.cryptoKey.hashKey
										);
										if (xDecId.status_code == '00') {
											let xId = xDecId.decrypted;
											xToken = jwt.sign(
												{
													email: xResultVerifyOriginToken.result_verify.email,
													id: xId,
													device:
														xResultVerifyOriginToken.result_verify.device == ''
															? 'web'
															: xResultVerifyOriginToken.result_verify.device,
													uuid: xUUID,
													scope: 'access_token'
												},
												// config.secret,
												xPrivateKey,
												{
													expiresIn:
														xResultVerifyOriginToken.result_verify.device == 'mobile'
															? config.login.expireToken.mobile
															: config.login.expireToken.web,
													algorithm: 'RS256'
												}
											);

											// Generate Refresh token
											xTokenRefresh = jwt.sign(
												{
													email: xResultVerifyOriginToken.result_verify.email,
													id: xId,
													device:
														xResultVerifyOriginToken.result_verify.device == ''
															? 'web'
															: xResultVerifyOriginToken.result_verify.device,
													uuid: xUUID,
													scope: 'refresh_token'
												},
												// config.secret,
												xPrivateKey,
												{
													expiresIn: config.login.expireRefreshToken,
													algorithm: 'RS256'
												}
											);

											xJoResult = {
												status_code: '00',
												status_msg: 'OK',
												new_access_token: xToken,
												refresh_token: xTokenRefresh
											};
										} else {
											xJoResult = {
												status_code: '-99',
												status_msg: 'Invalid token element'
											};
										}
									}
								}
							} else {
								xJoResult = {
									status_code: '-99',
									status_msg: 'Invalid refresh token'
								};
							}
						} else {
							xJoResult = {
								status_code: '-99',
								status_msg: 'Invalid refresh token'
							};
						}
					} else {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Origin token not valid'
						};
					}
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Parameter token or refresh_token can not be empty'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Please supply valid parameter'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `[UserService.refreshToken] Exception: ${e.message}`
			};
		}

		return xJoResult;
	}

	async generateEncryptedPassword(pParam) {
		let xPassword = await utilSecureInstance.generateEncryptedPassword(pParam.password);
		return {
			status_code: '00',
			status_msg: 'OK',
			password: xPassword
		};
	}

	async doUpdateNotificationSetting(pParam) {
		var xJoResult = {};
		var xFlagProcess = false;
		var xDecId = null;
		var xParamUpdate = {};

		try {
			if (pParam.hasOwnProperty('user_id')) {
				if (pParam.user_id != '') {
					xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
					if (xDecId.status_code == '00') {
						pParam.user_id = xDecId.decrypted;
						xFlagProcess = true;
					} else {
						xJoResult = xDecId;
					}
				}
			}

			if (xFlagProcess) {
				xParamUpdate.id = pParam.user_id;
				if (pParam.type_notification == 'fcm') {
					xParamUpdate.notification_via_fcm = pParam.flag;
				} else if (pParam.type_notification == 'email') {
					xParamUpdate.notification_via_email = pParam.flag;
				} else if (pParam.type_notification == 'wa') {
					xParamUpdate.notification_via_wa = pParam.flag;
				} else if (pParam.type_notification == 'telegram') {
					xParamUpdate.notification_via_telegram = pParam.flag;
				}
				xJoResult = await userRepoInstance.saveGeneral(xParamUpdate, 'update');
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `[UserService.doUpdateNotification] Exception: ${e.message}`
			};
		}

		return xJoResult;
	}
}

module.exports = UserService;
