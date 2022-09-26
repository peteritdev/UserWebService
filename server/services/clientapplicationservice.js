const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const dateFormat = require('dateformat');
const bcrypt = require('bcrypt');
const fs = require('fs');
const generatePassword = require('secure-random-password');

// Config
const env = process.env.NODE_ENV || 'localhost';
const config = require(__dirname + '/../config/config.json')[env];

// Utility
const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();

// Repository
const Repository = require('../repository/clientapplicationrepository.js');
// const { Client } = require('pg');
// const { BULKDELETE } = require('sequelize/dist/lib/query-types.js');
const _repoInstance = new Repository();

class ClientApplicationService {
	constructor() {}

	async getById(pParam) {
		var xJoResult = {};
		var xFlagProccess = false;
		var xDecId = null;
		var xEncId = null;
		var xJoData = {};

		try {
			if (pParam.hasOwnProperty('id')) {
				if (pParam.id != '') {
					xEncId = pParam.id;
					xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
					if (xDecId.status_code == '00') {
						pParam.id = xDecId.decrypted;
						xFlagProccess = true;
					} else {
						xJoResult = xDecId;
					}
				}
			}

			if (xFlagProccess) {
				let xDetail = await _repoInstance.getById(pParam);

				if (xDetail) {
					if (xDetail.status_code == '00') {
						let xClientSecretClear = '';
						if (xDetail.data.client_secret != '') {
							xDecId = await _utilInstance.decrypt(
								Buffer.from(xDetail.data.client_secret, 'base64').toString('ascii'),
								config.cryptoKey.hashKey
							);
							if (xDecId.status_code == '00') {
								xClientSecretClear = xDecId.decrypted;
							} else {
								xFlagProccess = false;
								xJoResult = xDecId;
							}
						}

						if (xFlagProccess) {
							xJoData = {
								id: await _utilInstance.encrypt(xDetail.data.id.toString(), config.cryptoKey.hashKey),
								name: xDetail.data.name,
								host: xDetail.data.host,
								redirect_uri: xDetail.data.redirect_uri,
								client_id: xDetail.data.client_id,
								client_secret: xClientSecretClear,
								status: xDetail.data.status,
								created_by_name: xDetail.data.created_by_name,
								created_at:
									xDetail.data.createdAt != null
										? moment(xDetail.data.createdAt).format('DD-MM-YYYY HH:mm:ss')
										: null,
								updated_by_name: xDetail.data.updated_by_name,
								updated_at:
									xDetail.data.updatedAt != null
										? moment(xDetail.data.updatedAt).format('DD-MM-YYYY HH:mm:ss')
										: null
							};
							xJoResult = {
								status_code: '00',
								status_msg: 'OK',
								data: xJoData
							};
						}
					} else {
						xJoResult = xDetail;
					}
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <ClientApplicationService.getById>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async getByClientId(pParam) {
		var xJoResult = {};
		var xFlagProcess = false;
		var xDecId = null;
		var xEncId = null;
		var xJoData = {};

		try {
			let xDetail = await _repoInstance.getByClientID(pParam);
			console.log(`>>> xDetail :${JSON.stringify(xDetail)}`);

			if (xDetail) {
				if (xDetail.status_code == '00') {
					let xClientSecretClear = '';
					// console.log(`>>> Client Secret: ${xDetail.data.client_secret}`);
					if (xDetail.data.client_secret != '') {
						xDecId = await _utilInstance.decrypt(
							Buffer.from(xDetail.data.client_secret, 'base64').toString('ascii'),
							config.cryptoKey.hashKey
						);
						// console.log(`>>> xDecId: ${JSON.stringify(xDecId)}`);
						if (xDecId.status_code == '00') {
							xClientSecretClear = xDecId.decrypted;

							xFlagProcess = true;
						} else {
							xJoResult = xDecId;
						}
					}

					// console.log(`>>> xFlagProcess : ${xFlagProcess}`);

					if (xFlagProcess) {
						xJoData = {
							id: xDetail.data.id,
							name: xDetail.data.name,
							host: xDetail.data.host,
							redirect_uri: xDetail.data.redirect_uri,
							client_id: xDetail.data.client_id,
							client_secret: xClientSecretClear,
							status: xDetail.data.status,
							created_by_name: xDetail.data.created_by_name,
							created_at:
								xDetail.data.createdAt != null
									? moment(xDetail.data.createdAt).format('DD-MM-YYYY HH:mm:ss')
									: null,
							updated_by_name: xDetail.data.updated_by_name,
							updated_at:
								xDetail.data.updatedAt != null
									? moment(xDetail.data.updatedAt).format('DD-MM-YYYY HH:mm:ss')
									: null
						};
						xJoResult = {
							status_code: '00',
							status_msg: 'OK',
							data: xJoData
						};
					}
				} else {
					xJoResult = xDetail;
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <ClientApplicationService.getById>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async list(pParam) {
		var xJoResult = {};
		var xJoArrData = [];

		try {
			var xResultList = await _repoInstance.list(pParam);
			if (xResultList) {
				if (xResultList.status_code == '00') {
					var xRows = xResultList.data.rows;
					for (var index in xRows) {
						xJoArrData.push({
							id: await _utilInstance.encrypt(xRows[index].id.toString(), config.cryptoKey.hashKey),
							name: xRows[index].name,
							host: xRows[index].host,
							client_id: xRows[index].client_id,
							status: xRows[index].status,

							created_at: moment(xRows[index].createdAt).format('DD MMM YYYY HH:mm:ss'),
							created_by_name: xRows[index].created_by_name,
							updated_at: moment(xRows[index].updatedAt).format('DD MMM YYYY HH:mm:ss'),
							updated_by_name: xRows[index].updated_by_name
						});
					}

					xJoResult = {
						status_code: '00',
						status_msg: 'OK',
						total_record: xResultList.total_record,
						data: xJoArrData,
						now: moment().unix(),
						added: moment().add(5, 'hours').unix()
					};
				} else {
					xJoResult = xResultList;
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Data not found'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <ClientApplicationService.list>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async save(pParam) {
		var xJoResult;
		var xAct = pParam.act;
		delete pParam.act;
		var xFlagProcess = false;

		try {
			if (xAct == 'add') {
				if (pParam.hasOwnProperty('logged_user_id')) {
					if (pParam.logged_user_id != '') {
						var xDecId = await _utilInstance.decrypt(pParam.logged_user_id, config.cryptoKey.hashKey);
						if (xDecId.status_code == '00') {
							pParam.created_by = xDecId.decrypted;
							pParam.created_by_name = pParam.logged_user_name;
							xFlagProcess = true;
						} else {
							xJoResult = xDecId;
						}
					}
				}

				if (xFlagProcess) {
					let xGeneratedCredential = await this.generateClientIdAndClientSecret({});
					if (xGeneratedCredential.status_code == '00') {
						pParam.client_id = xGeneratedCredential.client_id;
						pParam.client_secret = xGeneratedCredential.client_secret_enc;
						var xAddResult = await _repoInstance.save(pParam, xAct);
						if (xAddResult.status_code == '00') {
							xJoResult = {
								status_code: '00',
								status_msg: 'OK',
								client_id: xGeneratedCredential.client_id,
								client_secret: xGeneratedCredential.client_secret
							};
						} else {
							xJoResult = xAddResult;
						}
					}
				}
			} else if (xAct == 'update') {
				// Decrypt Id
				if (pParam.hasOwnProperty('id') && pParam.hasOwnProperty('logged_user_id')) {
					if (pParam.logged_user_id != '' && pParam.id != '') {
						var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
						if (xDecId.status_code == '00') {
							pParam.id = xDecId.decrypted;
							var xDecId = await _utilInstance.decrypt(pParam.logged_user_id, config.cryptoKey.hashKey);
							if (xDecId.status_code == '00') {
								pParam.logged_user_id = xDecId.decrypted;
								xFlagProcess = true;
							} else {
								xJoResult = xDecId;
							}
						} else {
							xJoResult = xDecId;
						}
					}
				}

				if (xFlagProcess) {
					xJoResult = await _repoInstance.save(pParam, xAct);
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <ClientApplicationService.save>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async generateClientIdAndClientSecret(pParam) {
		var xJoResult = {};

		try {
			// Generate ClientID and ClientSecret
			let xClientId = Math.random().toString(16).slice(2) + crypto.randomBytes(3).toString('hex'); //crypto.randomBytes(32).toString('base64');

			let xData = await _repoInstance.getByClientID({
				client_id: xClientId
			});
			if (xData.status_code == '00') {
				xJoResult = await generateClientIdAndClientSecret(pParam);
			} else {
				let xClientSecretClear = `${generatePassword.randomPassword({
					length: 12,
					characters: [ generatePassword.lower, generatePassword.upper, generatePassword.digits ]
				})}-${generatePassword.randomPassword({
					length: 11,
					characters: [ generatePassword.lower, generatePassword.upper, generatePassword.digits ]
				})}`;

				// let xClientSecret = crypto.createHash('sha256').update(xClientSecretClear).digest('base64');
				let xClientSecret = await _utilInstance.encrypt(xClientSecretClear, config.cryptoKey.hashKey);
				xClientSecret = Buffer.from(xClientSecret).toString('base64');

				xJoResult = {
					status_code: '00',
					status_msg: 'OK',
					client_id: xClientId,
					client_secret: xClientSecretClear,
					client_secret_enc: xClientSecret
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <ClientApplicationService.generateClientIdAndClientSecret>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async delete(pParam) {
		var xJoResult;
		var xFlagProcess = false;

		let xLevel = pParam.logged_user_level.find(
			(el) => el.application.id === config.applicationId || el.application.id === 1
		);

		if (xLevel.is_admin != 1) {
			xJoResult = {
				status_code: '-99',
				status_msg: 'You not allowed to delete this data'
			};
		} else {
			var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				pParam.id = xDecId.decrypted;
				xFlagProcess = true;
			} else {
				xJoResult = xDecId;
			}

			if (xFlagProcess) {
				xJoResult = await _repoInstance.delete(pParam);
			}
		}

		return xJoResult;
	}

	async saveClientApplicationAuthorization(pParam) {
		var xJoResult;
		var xAct = pParam.act;
		delete pParam.act;
		var xFlagProcess = false;
		var xAddResult = {};

		try {
			if (xAct == 'add') {
				if (pParam.hasOwnProperty('client_application_id')) {
					if (pParam.client_application_id != '') {
						// Check by client_id and state
						let xCheckByClientIdAndState = await _repoInstance.getByClientIdAndState(pParam);
						let xParamSave = {
							client_application_id: pParam.client_application_id,
							client_id: pParam.client_id,
							state: pParam.state,
							code: pParam.code,
							scope: pParam.scope,
							code_expire_in: pParam.code_expire_in,
							email: pParam.email
						};
						if (xCheckByClientIdAndState.status_code == '00') {
							xParamSave.id = xCheckByClientIdAndState.data.id;
							xAddResult = await _repoInstance.saveClientApplicationAuthorization(xParamSave, 'update');
						} else {
							xAddResult = await _repoInstance.saveClientApplicationAuthorization(xParamSave, 'add');
						}

						xJoResult = xAddResult;
					} else {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Parameter client_application_id can not be empty'
						};
					}
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Parameter not valid'
					};
				}
			} else if (xAct == 'update_by_client_id_and_code') {
				if (pParam.hasOwnProperty('client_id') && pParam.hasOwnProperty('code')) {
					let xParamUpdate = {
						token: pParam.token,
						code: pParam.code,
						client_id: pParam.client_id,
						refresh_token: pParam.refresh_token
					};
					let xUpdateResult = await _repoInstance.saveClientApplicationAuthorization(xParamUpdate, xAct);
					xJoResult = xUpdateResult;
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <ClientApplicationService.saveClientApplicationState>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async getLogByClientIdAndCode(pParam) {
		var xJoResult = {};

		try {
			if (pParam.hasOwnProperty('client_id') && pParam.hasOwnProperty('code')) {
				if (pParam.client_id != '' && pParam.code != '') {
					let xLogResult = await _repoInstance.getLogByClientIdAndCode({
						client_id: pParam.client_id,
						code: pParam.code
					});
					xJoResult = xLogResult;
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <ClientApplicationService.getByClientIdAndState>: ${e.message}`
			};
		}

		return xJoResult;
	}

	// async validatePageOAuthLogin()
}

module.exports = ClientApplicationService;
