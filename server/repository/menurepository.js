var env = process.env.NODE_ENV || 'localhost';
var configEnv = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const { hash } = require('bcryptjs');
const Op = Sequelize.Op;

// Model
const _modelDb = require('../models').ms_menus;
const _modelApplication = require('../models').ms_applications;

// Utils
const Util = require('peters-globallib-v2');
const _utilInstance = new Util();

class MenuRepository {
	constructor() {}

	async getById(pParam) {
		var xData = _modelDb.findOne({
			where: {
				id: pParam.id
			}
		});

		return xData;
	}

	async list(pParam) {
		var xOrder = [];
		var xInclude = [];
		var xWhere = [];
		var xWhereAnd = [];
		var xWhereOr = [];

		xInclude = [
			{
				model: _modelApplication,
				as: 'application',
				attributes: [ 'id', 'name' ]
			}
		];

		if (pParam.order_by != '' && pParam.hasOwnProperty('order_by')) {
			xOrder = [ pParam.order_by, pParam.order_type == 'desc' ? 'DESC' : 'ASC' ];
		} else {
			xOrder = [ 'id', 'ASC' ];
		}

		if (pParam.hasOwnProperty('application_id')) {
			if (pParam.application_id != '') {
				xWhereAnd.push({
					application_id: pParam.application_id
				});
			}
		}

		if (pParam.hasOwnProperty('filter')) {
			if (pParam.filter != null && pParam.filter != undefined && pParam.filter != '') {
				var xFilter = JSON.parse(pParam.filter);
				if (xFilter.length > 0) {
					// xWhereAnd.push( pParam.filter );
					for (var index in xFilter) {
						xWhereAnd.push(xFilter[index]);
					}
				}
			}
		}

		if (pParam.hasOwnProperty('keyword')) {
			if (pParam.keyword != '' && pParam.keyword != null) {
				xWhereOr.push(
					{
						name: {
							[Op.iLike]: '%' + pParam.keyword + '%'
						}
					},
					{
						app: {
							[Op.iLike]: '%' + pParam.keyword + '%'
						}
					},
				);
			}
		}

		if (xWhereAnd.length > 0) {
			xWhere.push({
				[Op.and]: xWhereAnd
			});
		}

		if (xWhereOr.length > 0) {
			xWhere.push({
				[Op.or]: xWhereOr
			});
		}
		// var xParam = {
		// 	where: {
		// 		[Op.and]: [
		// 			{
		// 				is_delete: 0
		// 			},
		// 			xWhereApp
		// 		],
		// 		[Op.or]: [
		// 			{
		// 				name: {
		// 					[Op.iLike]: '%' + pParam.keyword + '%'
		// 				}
		// 			},
		// 			{
		// 				app: {
		// 					[Op.iLike]: '%' + pParam.keyword + '%'
		// 				}
		// 			}
		// 		]
		// 	},
		// 	include: xInclude,
		// 	order: [ xOrder ]
		// };
		
		var xParamQuery = {
			where: xWhere,
			include: xInclude,
			order: [ xOrder ]
		};

		if (pParam.hasOwnProperty('offset') && pParam.hasOwnProperty('limit')) {
			if (pParam.offset != '' && pParam.limit != '') {
				xParamQuery.offset = pParam.offset;
				xParamQuery.limit = pParam.limit;
			}
		}

		var xData = await _modelDb.findAndCountAll(xParamQuery);

		return xData;
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
						status_msg: 'Data has been successfully saved'
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

	async delete(pParam) {
		let xTransaction;
		var xJoResult = {};
		var xId = pParam.id;
		delete pParam.id;

		try {
			var xSaved = null;
			xTransaction = await sequelize.transaction();

			xSaved = await _modelDb.destroy(
				{
					where: {
						id: xId
					}
				},
				{ xTransaction }
			);

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
}

module.exports = MenuRepository;
