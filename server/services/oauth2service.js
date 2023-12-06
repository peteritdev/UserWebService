const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
const bcrypt = require('bcrypt');

var env = process.env.NODE_ENV || 'localhost';
var config = require(__dirname + '/../config/config.json')[env];

// Service
const UserService = require('../services/userservice.js');
const userServiceInstance = new UserService();

//Repository
const UserRepository = require('../repository/userrepository.js');
const userRepoInstance = new UserRepository();

// Service
const ClientApplicationService = require('../services/clientapplicationservice.js');
const _clientApplicationServiceInstance = new ClientApplicationService();

const Util = require('peters-globallib-v2');
const _utilInstance = new Util();

const Security = require('../utils/security.js');
const _utilSecurity = new Security();

class OAuth2Service {
	constructor() {}

	async doLogin(pParam) {
		console.log(`>>> pParam: ${JSON.stringify(pParam)}`);
		var xJoResult = {};

		try {
			var xValidateEmail = await userRepoInstance.isEmailExists(pParam.email);
			var xFlagProcess = false;

			if (xValidateEmail != null) {
				let xValidatePassword = await bcrypt.compare(pParam.password, xValidateEmail.password);
				if (xValidatePassword) {
					// Validate the client_id and redirect_uri
					let xClientDetail = await _clientApplicationServiceInstance.getByClientId({
						client_id: pParam.client_id
					});
					console.log(`>>> xClientDetail :${JSON.stringify(xClientDetail)}`);

					if (xClientDetail.status_code == '-99') {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Invalid Client ID'
						};
					} else {
						if (xClientDetail.data.redirect_uri != pParam.redirect_uri) {
							xJoResult = {
								status_code: '-99',
								status_msg: 'Invalid Redirect URI'
							};
						} else {
							if (pParam.response_type == 'code') {
								// Generate authorization code
								let xAuthCode = crypto.randomBytes(16).toString('hex');

								let xExpireTime = moment().add(config.login.oAuth2.sanqua.expireToken, 'hours').unix();

								// console.log(`>>> Scope : ${pParam.scope}`);

								let xDecId = await _utilInstance.decrypt(
									xClientDetail.data.id,
									config.cryptoKey.hashKey
								);
								let xClientId = null;
								if (xDecId.status_code == '00') {
									xClientId = xDecId.decrypted;
									xFlagProcess = true;
								} else {
									xJoResult = xDecId;
								}

								if (xFlagProcess) {
									let xResultSave = await _clientApplicationServiceInstance.saveClientApplicationAuthorization(
										{
											client_application_id: xClientId,
											client_id: pParam.client_id,
											state: pParam.state,
											code: xAuthCode,
											scope: pParam.scope,
											code_expire_in: xExpireTime,
											email: xValidateEmail.email,
											act: 'add'
										}
									);

									if (xResultSave.status_code == '00') {
										xJoResult = {
											status_code: '00',
											status_msg:
												'Login successfully. Please use this authotirization code to get access token',
											authorization_code: xAuthCode,
											state: pParam.state,
											scope: pParam.scope
										};
									} else {
										xJoResult = xResultSave;
									}
								}
							}
						}
					}
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Email or password not valid'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Email or password not valid'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <OAuth2Service.doLogin>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async token(pParam) {
		var xJoResult = {};
		console.log(`>>> pParam oauth2service.token: ${JSON.stringify(pParam)}`);

		try {
			// console.log(`>>> Client Id : ${pParam.client_id}`);
			// Validate Client ID and Client Secret
			let xClientDetail = await _clientApplicationServiceInstance.getByClientId({
				client_id: pParam.client_id
			});
			if (xClientDetail.status_code == '-99') {
				xJoResult = xClientDetail;
				xJoResult.status_msg = 'Invalid client_id value. Please make sure use valid client_id';
			} else {
				if (pParam.grant_type == 'authorization_code') {
					if (pParam.client_secret != xClientDetail.data.client_secret) {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Invalid client_secret value. Please make sure use valid client_secret'
						};
					} else if (pParam.redirect_uri != xClientDetail.data.redirect_uri) {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Invalid redirect_uri value. Please make sure use valid redirect_uri'
						};
					} else {
						xJoResult = await this.generateAccessTokenByAuthCode(pParam);
					}
				} else if (pParam.grant_type == 'client_credentials') {
					pParam.client_detail = xClientDetail.data;
					xJoResult = await this.generateAccessTokenByClientCredential(pParam);
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <OAuth2Service.token>: ${e.message}`
			};
		}

		// console.log(`>>> xJoResult oauth2service.token: ${JSON.stringify(xJoResult)}`);

		return xJoResult;
	}

	async generateAccessTokenByClientCredential(pParam) {
		var xJoResult = {};

		try {
			if (pParam.client_detail != null) {
				let xExpireTokenIn = moment().add(config.login.oAuth2.bca.expireAccessToken, 'hours').unix();
				let xToken = jwt.sign(
					{
						issued_to: pParam.client_detail.client_id,
						audience: pParam.client_detail.client_id,
						user_id: pParam.client_detail.id,
						email: pParam.client_detail.host,
						iat: moment().unix()
					},
					config.login.oAuth2.bca.secret,
					{
						expiresIn: config.login.oAuth2.bca.expireAccessToken
					}
				);
				xJoResult = {
					status_code: '00',
					status_msg: 'Accepted',
					token_type: 'Bearer',
					expires_in: xExpireTokenIn,
					access_token: xToken,
					client_id: pParam.client_detail.client_id
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <OAuth2Service.generateAccessTokenByClientCredential>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async generateAccessTokenByAuthCode(pParam) {
		var xJoResult = {};

		try {
			// Validate authorization_code with client_id
			let xLogAuthorization = await _clientApplicationServiceInstance.getLogByClientIdAndCode({
				client_id: pParam.client_id,
				code: pParam.code
			});
			if (xLogAuthorization.status_code == '00') {
				//if (pParam.scope == xLogAuthorization.data.scope) {
				let xExpireTokenIn = moment().add(config.login.oAuth2.sanqua.expireAccessToken, 'hours').unix();
				let xToken = jwt.sign(
					{
						issued_to: pParam.client_id,
						audience: pParam.client_id,
						code: pParam.code,
						// scope: pParam.scope,
						user_id: xLogAuthorization.data.email,
						email: xLogAuthorization.data.email,
						iat: moment().unix()
					},
					config.login.oAuth2.sanqua.secret,
					{
						expiresIn: config.login.oAuth2.sanqua.expireAccessToken
					}
				);

				// Update token into database
				let xParamUpdate = {
					code: pParam.code,
					client_id: pParam.client_id,
					token: xToken,
					act: 'update_by_client_id_and_code'
				};
				let xResultUpdate = await _clientApplicationServiceInstance.saveClientApplicationAuthorization(
					xParamUpdate
				);
				if (xResultUpdate.status_code == '00') {
					xJoResult = {
						status_code: '00',
						status_msg: 'Accepted',
						token_type: 'Bearer',
						expires_in: xExpireTokenIn,
						access_token: xToken,
						// scope: pParam.scope,
						email: xLogAuthorization.data.email
					};
				} else {
					xJoResult = xResultUpdate;
				}
				// } else {
				// 	xJoResult = {
				// 		status_code: '-99',
				// 		status_msg: 'Authorization code not valid for this scope'
				// 	};
				// }
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Invalid authorization_code value. Please make sure use valid value'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <OAuth2Service.generateAccessTokenByAuthCode>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async verifyTokenOAuth2(pHeaders) {
		if (pHeaders.hasOwnProperty('authorization')) {
			if (pHeaders['authorization'] != '') {
				var xToken = pHeaders['authorization'].split(' ');
				if (xToken[0] == 'Bearer') {
					let xResultVerifyToken = await this.tokenInfo({
						access_token: xToken[1]
					});
					console.log(`>>> xResultVerifyToken: ${JSON.stringify(xResultVerifyToken)}`);
					if (xResultVerifyToken.status_code == '00') {
						let xUserDetail = await userServiceInstance.isEmailExists(xResultVerifyToken.verify.email);
						if (xUserDetail != null) {
							return {
								status_code: '00',
								status_msg: 'OK',
								email: xUserDetail.email,
								name: xUserDetail.name
							};
						}
					}
				} else {
					return {
						status_code: '-99',
						status_msg: 'Authorization type not valid'
					};
				}
			} else {
				return {
					status_code: '-99',
					status_msg: 'Authorization can not empty'
				};
			}
		} else {
			return {
				status_code: '-99',
				status_msg: 'Parameter not valid'
			};
		}
	}

	async tokenInfo(pParam) {
		var xJoResult = {};

		try {
			if (pParam.hasOwnProperty('access_token')) {
				if (pParam.access_token != '') {
					let xResultVerify = await jwt.verify(pParam.access_token, config.login.oAuth2.sanqua.secret);
					xJoResult = {
						status_code: '00',
						status_msg: 'OK',
						verify: xResultVerify
					};
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Parameter access_token is required'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Parameter not valid'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Token not valid. ${e.message}`
			};
		}

		return xJoResult;
	}

	async tokenProfile(pParam) {
		var xJoResult = {};

		try {
			if (pParam.hasOwnProperty('access_token')) {
				if (pParam.access_token != '') {
					let xResultVerify = await jwt.verify(pParam.access_token, config.login.oAuth2.sanqua.secret);
					if (xResultVerify) {
						let xUserDetail = await userServiceInstance.isEmailExists({
							email: xResultVerify.email
						});

						console.log(`>>> xUserDetail : ${JSON.stringify(xUserDetail)}`);
						if (xUserDetail) {
							var xSplittedName = xUserDetail.name.split(' ');
							xJoResult = {
								status_code: '00',
								status_msg: 'OK',
								data: {
									id: xUserDetail.id,
									email: xUserDetail.email,
									verified_email: true,
									name: xUserDetail.name,
									given_name: xSplittedName[0],
									family_name: xSplittedName[1]
								}
							};
						} else {
							return {};
						}
					} else {
						xJoResult = xResultVerify;
					}
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Parameter access_token is required'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Parameter not valid'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Token not valid. ${e.message}`
			};
		}

		return xJoResult;
	}

	// BCA Open API Service for Notification
	async verifyBCASignature(pParam) {
		return await _utilSecurity.verifyBCASignature(pParam);
	}
}

module.exports = OAuth2Service;
