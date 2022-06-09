const jwt = require('jsonwebtoken');
const jwtRefresh = require('jsonwebtoken-refresh');
const env = process.env.NODE_ENV || 'localhost';
const config = require(__dirname + '/../config/config.json')[env];
const { json } = require('sequelize');

//Utility
const Util = require('../utils/globalutility.js');
const utilInstance = new Util();

class JwtUtil {
	constructor() {}

	async verifyJWT(pToken) {
		var jsonResult;

		if (pToken.startsWith('Bearer ')) {
			pToken = pToken.slice(7, pToken.length);
		}

		if (pToken) {
			try {
				var resultVerify = await jwt.verify(pToken, config.secret);
				var xEncId = await utilInstance.encrypt(resultVerify.id);
				resultVerify.id = xEncId;
				jsonResult = {
					status_code: '00',
					status_msg: 'OK',
					result_verify: resultVerify
				};
			} catch (err) {
				jsonResult = {
					status_code: '-99',
					status_msg: 'Error',
					err_msg: err
				};
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
