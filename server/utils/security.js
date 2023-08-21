const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var config = require('../config/config.json');
const SecurityUtil = require('peters-cryptolib');
const _securityUtilInstance = new SecurityUtil();

var env = process.env.NODE_ENV || 'localhost';
var config = require(__dirname + '/../config/config.json')[env];

const fs = require('fs');
const _xClassName = 'Security';

class Security {
	constructor() {}

	async generateEncryptedPassword(pPassword) {
		var salt = await bcrypt.genSalt(10);
		var password = await bcrypt.hash(pPassword, salt);
		return password;
	}

	async verifyToken(pToken) {
		try {
			var decoded = jwt.verify(pToken, config.secret);
			return {
				status_code: '00',
				status_msg: 'OK',
				decoded: decoded
			};
		} catch (err) {
			return {
				status_code: '-99',
				status_msg: 'Error verify token : ' + err
			};
		}
	}

	async generateBCASignature(pParam) {
		try {
			/* StringToSign = HTTPMethod + ':' + RelativeURL + ':' + AccessToken + ':' + 
                                LowerCase(HexEncode(SHA-256(MinifyJson(RequestBody)))*/

			let xPrivateKey = fs.readFileSync(config.login.oAuth2.bca.rsaKey.private);
			// let xPublicKey = fs.readFileSync(config.login.oAuth2.bca.rsaKey.public);
			// console.log(`>>> xPrivateKey : ${xPublicKey}`);
			// Symetric:
			// let xStringToSign =
			// 	`${pParam.http_method}:${pParam.relative_url}:${pParam.access_token}:` +
			// 	(await _securityUtilInstance.createSHA(256, pParam.request_body, 'hex')).toLowerCase() +
			// 	`:${pParam.time_stamp}`;
			// let xSignaturePrivate = await _securityUtilInstance.hmacSHA(512, xPrivateKey, xStringToSign, 'base64');
			// let xSignaturePublic = await _securityUtilInstance.hmacSHA(512, xPublicKey, xStringToSign, 'base64');

			// Asymetric :
			let xStringToSign = `${pParam.client_id}|${pParam.time_stamp}`;
			console.log(`>>> xStringToSign: ${xStringToSign}`);
			let xSignature = await _securityUtilInstance.createSignature(
				'RSA-SHA256',
				xPrivateKey,
				xStringToSign,
				'base64'
			);

			return {
				status_code: '00',
				status_msg: 'OK',
				signature: xSignature
			};
		} catch (e) {
			return {
				status_code: '-99',
				status_msg: `<${_xClassName}.generateBCASignature> Exception error:  ${e.message}`
			};
		}
	}

	async verifyBCASignature(pParam) {
		try {
			let xPublicKey = fs.readFileSync(config.login.oAuth2.bca.rsaKey.public);
			// console.log(`>>> xPrivateKey : ${xPublicKey}`);
			// console.log(`>>> signature : ${pParam.signature}`);

			let xStringToSign = `${pParam.client_id}|${pParam.time_stamp}`;
			console.log(`>>> xStringToSign: ${xStringToSign}`);
			let xIsVerify = await _securityUtilInstance.verifySignature(
				'RSA-SHA256',
				xPublicKey,
				xStringToSign,
				pParam.signature,
				'base64'
			);
			return {
				status_code: '00',
				status_msg: 'OK',
				is_verified: xIsVerify
			};
		} catch (e) {
			return {
				status_code: '-99',
				status_msg: `<${_xClassName}.verifyBCASignature> Exception error:  ${e.message}`
			};
		}
	}
}

module.exports = Security;
