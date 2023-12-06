const env = process.env.NODE_ENV || 'localhost';
const config = require(__dirname + '/../config/config.json')[env];

// Utility
const Util = require('peters-globallib-v2');
const _utilInstance = new Util();

const Security = require('../utils/security.js');
const _utilSecurity = new Security();

class TestService {
	constructor() {}

	async generateBCASignature(pParam) {
		return await _utilSecurity.generateBCASignature(pParam);
	}

	async verifyBCASignature(pParam) {
		return await _utilSecurity.verifyBCASignature(pParam);
	}
}

module.exports = TestService;
