const jwt = require('jsonwebtoken');
const jwtRefresh = require('jsonwebtoken-refresh');
const env = process.env.NODE_ENV || 'localhost';
const config = require(__dirname + '/../config/config.json')[env];
const { json } = require('sequelize');
const fs = require('fs');

//Utility
const Util = require('../utils/globalutility.js');
const utilInstance = new Util();

class JwtUtil {
	constructor() {}

	async verifyJWT(pToken, pScope = null) {
		var jsonResult;
		let xPublicKey = fs.readFileSync(__dirname + '/../../public.pem');

		if (pToken.startsWith('Bearer ')) {
			pToken = pToken.slice(7, pToken.length);
		}

		if (pToken) {
			try {
				// console.log(`>>> Before..`);
				var resultVerify = await jwt.verify(pToken, xPublicKey, { algorithms: [ 'RS256' ] });
				// console.log(`>>> resultVerify: ${JSON.stringify(resultVerify)}`);
				var xEncId = await utilInstance.encrypt(resultVerify.id);
				resultVerify.id = xEncId;
				jsonResult = {
					status_code: '00',
					status_msg: 'OK',
					result_verify: resultVerify
				};
			} catch (err) {
				// console.log(`>>> err: ${err.name}`);
				if (err.name == 'TokenExpiredError') {
					let xDecoded = await jwt.decode(pToken, { complete: true });
					if (xDecoded.hasOwnProperty('payload')) {
						if (xDecoded.payload.hasOwnProperty('id')) {
							if (xDecoded.payload.id != '') {
								var xEncId = await utilInstance.encrypt(xDecoded.payload.id);
								xDecoded.payload.id = xEncId;
							}
						}
					}

					let xStatusCode = '';
					if (pScope == null) {
						xStatusCode = '-99';
					} else {
						if (pScope == 'refresh_token') {
							xStatusCode = '00';
						}
					}
					jsonResult = {
						status_code: xStatusCode,
						status_msg: `${err.name}`,
						result_verify: xDecoded.payload
					};
				} else {
					jsonResult = {
						status_code: '-99',
						status_msg: `Exception error: ${err.message}`,
						err_msg: err
					};
				}
			}
		} else {
			jsonResult = {
				status_code: '-99',
				status_msg: 'Failed',
				err_msg: 'Token not valid'
			};
		}

		//console.log(jsonResult);

		return jsonResult;
	}

	async refreshJWT(pParam) {
		var xJoResult = {};

		try {
			let xOriginalDecoded = await jwtRefresh.decode(pParam.token, { complete: true });
			if (xOriginalDecoded != null) {
				let xExpireIn =
					xOriginalDecoded.payload.device == 'mobile'
						? config.login.expireToken.mobile
						: config.login.expireToken.web;
				let xRefreshed = await jwtRefresh.refresh(xOriginalDecoded, xExpireIn, config.secret);
				// new 'exp' value is later in the future.
				// console.log(`>>> ${JSON.stringify(xOriginalDecoded)}`);
				// console.log(`>>> Refresh : ${JSON.stringify(jwtRefresh.decode(xRefreshed, { complete: true }))}`);
				xJoResult = {
					status_code: '00',
					status_msg: 'OK',
					new_token: xRefreshed
				};
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: `Token not valid`
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <JWTUtil.refreshJWT>: ${e.message}`
			};
		}

		return xJoResult;
	}
}

module.exports = JwtUtil;
