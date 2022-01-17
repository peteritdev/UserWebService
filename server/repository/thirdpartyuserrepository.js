var env = process.env.NODE_ENV || 'localhost';
var config = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const { hash } = require('bcryptjs');
const Op = Sequelize.Op;

// Model
const _modelDb = require('../models').ms_thirdpartyusers;

const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();

class ThirdPartyUserRepository {
	constructor() {}

	async getByClientIDAndToken(pParam) {
		var xJoResult = {};
		var xWhere = {};

		try {
			if (pParam.hasOwnProperty('token') && pParam.hasOwnProperty('client_id')) {
				if (pParam.token != '' && pParam.client_id != '') {
					xWhere = {
						access_token: pParam.token,
						client_id: pParam.client_id,
						status: 1,
						is_delete: 0
					};

					var xData = await _modelDb.findOne({
						where: xWhere
					});

					if (xData != null) {
						xJoResult = {
							status_code: '00',
							status_msg: 'Token registered'
						};
					} else {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Token not found'
						};
					}
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Param not valid'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Param not valid'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: 'Exception [thirdpartyuserrepository.getbytoken]. Error : ' + e.message
			};
		}

		return xJoResult;
	}

	async getByClientID(pParam) {
		var xJoResult = {};
		var xWhere = {};

		try {
			if (pParam.hasOwnProperty('client_id')) {
				if (pParam.client_id != '') {
					if (pParam.hasOwnProperty('id')) {
						if (pParam.id != '') {
							xWhere = {
								client_id: pParam.client_id,
								status: 1,
								is_delete: 0,
								id: {
									[Op.ne]: pParam.id
								}
							};
						}
					} else {
						xWhere = {
							client_id: pParam.client_id,
							status: 1,
							is_delete: 0
						};
					}

					var xData = await _modelDb.findOne({
						where: xWhere
					});

					if (xData != null) {
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
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Param not valid'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'Param not valid'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: 'Exception Error. Error : ' + e,
				err_msg: e
			};
		}

		return xJoResult;
	}

	async save(pParam, pAct) {
		let xTransaction;
		var xJoResult = {};

		try {
			var xSaved = null;
			xTransaction = await sequelize.transaction();

			if (pAct == 'add') {
				pParam.status = 1;
				pParam.is_delete = 0;

				xSaved = await _modelDb.create(pParam, { xTransaction });

				if (xSaved.id != null) {
					await xTransaction.commit();

					xJoResult = {
						status_code: '00',
						status_msg: 'Data has been successfully saved',
						created_id: await _utilInstance.encrypt(xSaved.id.toString(), config.cryptoKey.hashKey)
					};
				} else {
					if (xTransaction) await xTransaction.rollback();

					xJoResult = {
						status_code: '-99',
						status_msg: 'Failed save to database'
					};
				}
			} else if (pAct == 'update') {
				pParam.updatedAt = await _utilInstance.getCurrDateTime();
				var xId = pParam.id;
				delete pParam.id;
				var xWhere = {
					where: {
						id: xId
					}
				};
				xSaved = await _modelDb.update(pParam, xWhere, { xTransaction });

				await xTransaction.commit();

				xJoResult = {
					status_code: '00',
					status_msg: 'Data has been successfully updated'
				};
			}
		} catch (e) {
			if (xTransaction) await xTransaction.rollback();
			xJoResult = {
				status_code: '-99',
				status_msg: 'Failed save or update data. Error : ' + e,
				err_msg: e
			};
		}

		return xJoResult;
	}
}

module.exports = ThirdPartyUserRepository;
