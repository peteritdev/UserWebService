var env = process.env.NODE_ENV || 'localhost';
var configEnv = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const { hash } = require('bcryptjs');
const Op = Sequelize.Op;

// Model
const _modelDb = require('../models').ms_clientapplications;

const Utility = require('peters-globallib-v2');
const clientapplication = require('../models/clientapplication');
const _utilInstance = new Utility();

class ClientApplicationRepository {
	constructor() {}

	async getById(pParam) {
		var xInclude = [];
		var xWhereOr = [];
		var xWhereAnd = [];
		var xWhere = [];
		var xAttributes = [];
		var xJoResult = {};

		try {
			xInclude = [];

			xWhereAnd.push({
				id: pParam.id
			});

			if (xWhereAnd.length > 0) {
				xWhere.push({
					[Op.and]: xWhereAnd
				});
			}

			var xData = await _modelDb.findOne({
				where: xWhere,
				include: xInclude,
				subQuery: false
			});

			if (xData) {
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
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Failed get data. Error : ${e.message}`
			};
		}

		return xJoResult;
	}

	async list(pParam) {
		var xOrder = [ 'id', 'ASC' ];
		var xWhere = [];
		var xWhereOr = [];
		var xWhereAnd = [];
		var xInclude = [];
		var xJoResult = {};

		try {
			xInclude = [];

			if (pParam.hasOwnProperty('keyword')) {
				if (pParam.keyword != '') {
					xWhereOr.push({
						name: {
							[Op.iLike]: '%' + pParam.keyword + '%'
						},
						host: {
							[Op.iLike]: '%' + pParam.keyword + '%'
						},
						client_id: {
							[Op.iLike]: '%' + pParam.keyword + '%'
						}
					});
				}
			}

			if (xWhereAnd.length > 0) {
				xWhere.push({
					[Op.and]: xWhereAnd
				});
			}

			if (pParam.hasOwnProperty('order_by')) {
				xOrder = [ pParam.order_by, pParam.order_type == 'desc' ? 'DESC' : 'ASC' ];
			}

			if (xWhereOr.length > 0) {
				xWhere.push({
					[Op.or]: xWhereOr
				});
			}

			var xParamQuery = {
				where: xWhere,
				order: [ xOrder ],
				include: xInclude,
				subQuery: false
			};

			var xCountDataWithoutLimit = await _modelDb.count(xParamQuery);

			if (pParam.hasOwnProperty('offset') && pParam.hasOwnProperty('limit')) {
				if (pParam.offset != '' && pParam.limit != '' && pParam.limit != 'all') {
					xParamQuery.offset = pParam.offset;
					xParamQuery.limit = pParam.limit;
				}
			}

			var xData = await _modelDb.findAndCountAll(xParamQuery);

			xJoResult = {
				status_code: '00',
				status_msg: 'OK',
				data: xData,
				total_record: xCountDataWithoutLimit
			};
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Failed get data. Error : ${e.message}`
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
		var xJoResult = {};
		let xTransaction;
		var xSaved = null;

		try {
			var xSaved = null;
			xTransaction = await sequelize.transaction();

			if (pAct == 'add') {
				xSaved = await _modelDb.create(pParam, { transaction: xTransaction });
				if (xSaved.id != null) {
					await xTransaction.commit();
					xJoResult = {
						status_code: '00',
						status_msg: 'Data has been successfully saved',
						created_id: await _utilInstance.encrypt(xSaved.id.toString(), config.cryptoKey.hashKey),
						clear_id: xSaved.id
					};
				}
			} else if (pAct == 'update') {
				var xId = pParam.id;
				delete pParam.id;
				var xWhere = {
					where: {
						id: xId
					},
					transaction: xTransaction
				};
				xSaved = await _modelDb.update(pParam, xWhere);

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
				status_msg: `Failed save or update data. Error : ` + e.message
			};
		}

		return xJoResult;
	}

	async delete(pParam) {
		let xTransaction;
		var xJoResult = {};

		try {
			var xSaved = null;
			xTransaction = await sequelize.transaction();

			xSaved = await _modelDb.destroy({
				where: {
					id: pParam.id
				},
				transaction: xTransaction
			});

			await xTransaction.commit();

			xJoResult = {
				status_code: '00',
				status_msg: 'Data has been successfully deleted'
			};

			return xJoResult;
		} catch (e) {
			if (xTransaction) await xTransaction.rollback();
			xJoResult = {
				status_code: '-99',
				status_msg: 'Failed save or update data',
				err_msg: e
			};

			return xJoResult;
		}
	}

	async getByClientIdAndRedirectUri(pParam) {
		var xJoResult = {};

		try {
			var xInclude = [];
			var xWhereOr = [];
			var xWhereAnd = [];
			var xWhere = [];
			var xAttributes = [];
			var xJoResult = {};

			xInclude = [];

			if (pParam.hasOwnProperty('client_id')) {
				if (pParam.client_id != '') {
					xWhereAnd.push({
						client_id: pParam.client_id
					});
				}
			}

			if (pParam.hasOwnProperty('redirect_uri')) {
				if (pParam.redirect_uri != '') {
					xWhereAnd.push({
						redirect_uri: pParam.redirect_uri
					});
				}
			}

			if (xWhereAnd.length > 0) {
				xWhere.push({
					[Op.and]: xWhereAnd
				});
			}

			var xData = await _modelDb.findOne({
				where: xWhere,
				include: xInclude,
				subQuery: false
			});

			if (xData) {
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
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `Exception error <ClientApplicationRepository.validateOAuth>: ${e.message}`
			};
		}

		return xJoResult;
	}
}

module.exports = ClientApplicationRepository;
