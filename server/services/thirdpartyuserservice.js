const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
const bcrypt = require('bcrypt');
const fs = require('fs');

const env = process.env.NODE_ENV || 'localhost';
const config = require(__dirname + '/../config/config.json')[env];

//Repository
const Repository = require('../repository/thirdpartyuserrepository.js');
const _repoInstance = new Repository();

// Utility
const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();
const SecurityUtility = require('../utils/security.js');
const _securityUtil = new SecurityUtility();

class ThirdPartyUserService {
	constructor() {}

	async validateClientCredentials(pCredential) {
		var xJoResult = {};

		try {
			if (pCredential.startsWith('Basic ')) {
				let xAuthParamEnc = pCredential.slice(6, pCredential.length);
				let xAuthParamDec = Buffer.from(xAuthParamEnc, 'base64').toString('ascii');
				let xCredential = xAuthParamDec.split(':');

				// Check client_id registered
				let xClientDetail = await _repoInstance.getByClientID({ client_id: xCredential[0] });
				if (xClientDetail.status_code == '00') {
					// Compare the client_secret
					let xValidateClientSecret = await bcrypt.compare(xCredential[1], xClientDetail.data.client_secret);
					if (xValidateClientSecret) {
						xJoResult = {
							status_code: '00',
							status_msg: 'OK',
							data: xClientDetail.data
						};
					} else {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Credential not valid!'
						};
					}
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Credential not valid!'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Credential not valid!'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Error exception [thirdpartyuserservice.validateClientCredentials]: ${e.message}`
			};
		}

		return xJoResult;
	}

	async generateNewToken(pParam) {
		var xJoResult = {};

		try {
			// Generate Access Token
			let xToken = jwt.sign(
				{
					client_id: pParam.client_detail.client_id,
					port: pParam.client_detail.port,
					id: pParam.client_detail.id,
					scope: pParam.scope
				},
				config.thirdPartyConfig.secret,
				{
					expiresIn: config.thirdPartyConfig.expireToken
				}
			);

			// Generate Refresh Token
			let xRefreshToken = jwt.sign(
				{
					client_id: pParam.client_detail.client_id,
					port: pParam.client_detail.port,
					id: pParam.client_detail.id,
					scope: pParam.scope
				},
				config.thirdPartyConfig.refreshSecret,
				{
					expiresIn: config.thirdPartyConfig.expireRefreshToken
				}
			);

			if (xToken && xRefreshToken) {
				// Save active_token and refresh_token to database
				let xParamUpdate = {
					refresh_token: xRefreshToken,
					access_token: xToken,
					active_token: xToken,
					id: pParam.client_detail.id
				};
				let xResultUpdate = await _repoInstance.save(xParamUpdate, 'update');
				if (xResultUpdate.status_code == '00') {
					xJoResult = {
						status_code: '00',
						status_msg: 'Credential valid',
						access_token: xToken,
						refresh_token: xRefreshToken,
						expire_in: config.thirdPartyConfig.expireToken,
						scope: pParam.scope
					};
				} else {
					xJoResult = xResultUpdate;
				}
			}
		} catch (e) {}

		return xJoResult;
	}

	async generateClientIDAndClientSecret(pParam) {
		var xJoResult = {};

		try {
			// Generate client_id
			let xClientId = Math.random().toString(16).slice(2) + crypto.randomBytes(3).toString('hex'); //crypto.randomBytes(32).toString('base64');
			let xClientSecret = crypto.randomBytes(20).toString('hex');

			let xParamCheck = {
				client_id: xClientId
			};

			let xData = await _repoInstance.getByClientID(xParamCheck);
			if (xData.status_code == '00') {
				await generateClientIDAndClientSecret(pParam);
			} else {
				xJoResult = {
					status_code: '00',
					status_msg: 'OK',
					data: {
						client_id: xClientId,
						client_secret: xClientSecret
					}
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Error exception [thirdpartyuserservice.generateClientIDAndClientSecret]: ${e.message}`
			};
		}

		return xJoResult;
	}

	async save(pParam) {
		var xJoResult = {};
		var xFlagProcess = false;
		var xDecId = null;
		var xAct = pParam.act;
		delete pParam.act;

		try {
			if (pParam.hasOwnProperty('user_id')) {
				if (pParam.user_id != '') {
					xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
					if (xDecId.status_code == '00') {
						xFlagProcess = true;
						pParam.user_id = xDecId.decrypted;
					}
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Param User ID can not empty'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Param not valid'
				};
			}

			if (xFlagProcess) {
				if (xAct == 'add') {
					let xResultCredential = await this.generateClientIDAndClientSecret(pParam);
					if (xResultCredential.status_code == '00') {
						pParam.client_id = xResultCredential.data.client_id;
						pParam.client_secret = await _securityUtil.generateEncryptedPassword(
							xResultCredential.data.client_secret
						);

						let xSaveResult = await _repoInstance.save(pParam, xAct);
						xJoResult = xSaveResult;
						xJoResult.credentials = {
							client_id: xResultCredential.data.client_id,
							client_secret: xResultCredential.data.client_secret
						};
					} else {
						xJoResult = xResultCredential;
					}
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Error exception [thirdpartyuserservice.save]: ${e.message}`
			};
		}

		return xJoResult;
	}

	async getToken(pParam) {
		var xJoResult = {};
		var xDecId = null;
		var xValidateCredential = {};
		var xFlagCredential = false;

		try {
			if (pParam.grant_type == 'client_credentials') {
				xValidateCredential = await this.validateClientCredentials(pParam.authorization);
				if (xValidateCredential.status_code == '-99') {
					xJoResult = xValidateCredential;
				} else {
					xFlagCredential = true;
				}
			}

			if (xFlagCredential) {
				let xClientDetail = xValidateCredential.data;
				let xParam = {
					scope: pParam.scope,
					client_detail: xClientDetail
				};
				var xTokenInfo = await this.generateNewToken(xParam);
				xJoResult = xTokenInfo;
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Error exception [thirdpartyuserservice.gettoken]: ${e.message}`
			};
		}

		return xJoResult;
	}

	async refreshToken(pParam) {
		var xJoResult = {};
		var xFlagCredential = false;
		var xValidateCredential = {};

		try {
			if (pParam.hasOwnProperty('refresh_token')) {
				if (pParam.refresh_token != '') {
					if (pParam.grant_type == 'client_credentials') {
						xValidateCredential = await this.validateClientCredentials(pParam.authorization);
						if (xValidateCredential.status_code == '-99') {
							xJoResult = xValidateCredential;
						} else {
							xFlagCredential = true;
						}
					}

					if (xFlagCredential) {
						let xClientDetail = xValidateCredential.data;

						// Check if refresh_token owned by this user or not
						let xVerifyResult = await jwt.verify(
							pParam.refresh_token,
							config.thirdPartyConfig.refreshSecret
						);

						if (xVerifyResult) {
							if (xVerifyResult.client_id == xClientDetail.client_id) {
								let xParam = {
									scope: xVerifyResult.scope,
									client_detail: xClientDetail
								};
								var xTokenInfo = await this.generateNewToken(xParam);
								xJoResult = xTokenInfo;
							} else {
								xJoResult = {
									status_code: '-99',
									status_msg: 'Client ID not match with this refresh token'
								};
							}
						} else {
							xJoResult = {
								status_code: '-99',
								status_msg: 'Refresh token not valid'
							};
						}
					}
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Error exception [thirdpartyuserservice.refreshToken]: ${e.message}`
			};
		}

		return xJoResult;
	}

	async verifyAccessToken(pParam) {
		var xJoResult = {};

		try {
			if (pParam.hasOwnProperty('authorization')) {
				if (pParam.authorization.startsWith('Bearer ')) {
					let xToken = pParam.authorization.slice(7, pParam.authorization.length);
					let xVerifyResult = 
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Error exception [thirdpartyuserservice.verifyAccessToken]: ${e.message}`
			};
		}

		return xJoResult;
	}
}

module.exports = ThirdPartyUserService;
