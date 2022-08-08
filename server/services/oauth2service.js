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

//Repository
const UserRepository = require('../repository/userrepository.js');
const userRepoInstance = new UserRepository();

// Service
const ClientApplicationService = require('../services/clientapplicationservice.js');
const _clientApplicationServiceInstance = new ClientApplicationService();

const Util = require('peters-globallib-v2');
const _utilInstance = new Util();

class OAuth2Service {
	constructor() {}

	async doLogin(pParam) {
		var xJoResult = {};

		try {
			var xValidateEmail = await userRepoInstance.isEmailExists(pParam.email);
			var xFlagProcess = true;

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

								let xExpireTime = moment().add(config.login.oAuth2.simpeg.expireToken, 'hours').unix();

								let xResultSave = await _clientApplicationServiceInstance.saveClientApplicationAuthorization(
									{
										client_application_id: xClientDetail.data.id,
										client_id: pParam.client_id,
										state: pParam.state,
										code: xAuthCode,
										scope: pParam.scope,
										code_expire_in: xExpireTime,
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
				status_msg: `Exception error <UserService.doLogin>: ${e.message}`
			};
		}

		return xJoResult;
	}

	async generateAccessToken(pParam) {
		var xJoResult = {};

		try {
			// Validate Client ID and Client Secret
			let xClientDetail = await _clientApplicationServiceInstance.getByClientId({
				client_id: pParam.client_id
			});
			if (xClientDetail.status_code == '-99') {
				xJoResult = xClientDetail;
				xJoResult.status_msg = 'Invalid client_id value. Please make sure use valid client_id';
			} else {
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
					// Validate authorization_code with client_id
					let xLogAuthorization = await _clientApplicationServiceInstance.getLogByClientIdAndCode({
						client_id: pParam.client_id,
						code: pParam.code
					});
					if (xLogAuthorization.status_code == '00') {
						let xToken = jwt.sign(
							{
								client_id: pParam.client_id,
								code: pParam.code,
								scope: pParam.scope
							},
							config.login.oAuth2.simpeg.secret,
							{
								expiresIn: config.login.oAuth2.simpeg.expireAccessToken
							}
						);

						// Update token into database
					} else {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Invalid authorization_code value. Please make sure use valid value'
						};
					}
				}
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <UserService.generateAccessToken>: ${e.message}`
			};
		}

		return xJoResult;
	}
}

module.exports = OAuth2Service;
