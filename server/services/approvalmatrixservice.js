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
const ApplicationMatrixRepository = require('../repository/approvalmatrixrepository.js');
const _repoInstance = new ApplicationMatrixRepository();

//Util
const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();

class ApprovalMatrixService {
	constructor() {}

	async list(pParam) {
		var xJoResult = {};
		var xJoArrData = [];

		var xResultList = await _repoInstance.list(pParam);

		if (xResultList.count > 0) {
			xJoResult.status_code = '00';
			xJoResult.status_msg = 'OK';
			xJoResult.total_record = xResultList.count;

			var xRows = xResultList.rows;

			for (var index in xRows) {
				xJoArrData.push({
					id: await _utilInstance.encrypt(xRows[index].id.toString(), config.cryptoKey.hashKey),
					name: xRows[index].name,
					application_table: {
						// id: await _utilInstance.encrypt((xRows[index].application_table.id).toString(), config.cryptoKey.hashKey),
						id: xRows[index].application_table.id,
						table_name: xRows[index].application_table.table_name,
						application: {
							id: await _utilInstance.encrypt(
								xRows[index].application_table.application.id.toString(),
								config.cryptoKey.hashKey
							),
							name: xRows[index].application_table.application.name
						}
					},
					company: {
						id: xRows[index].company_id,
						name: xRows[index].company_name
					},
					department: {
						id: xRows[index].department_id,
						name: xRows[index].department_name
					},
					ecatalogue_fpb_category_item:
						xRows[index].ecatalogue_fpb_category_item != null
							? {
									id: xRows[index].ecatalogue_fpb_category_item,
									name:
										config.lookupColumn.approvalMatrix.eCatalogueFpbCategoryItem[
											xRows[index].ecatalogue_fpb_category_item
										]
								}
							: null,
					created_at: moment(xRows[index].createdAt).format('DD-MM-YYYY HH:mm:ss'),
					updated_at: moment(xRows[index].updatedAt).format('DD-MM-YYYY HH:mm:ss')
				});
			}

			xJoResult.data = xJoArrData;
		} else {
			xJoResult.status_code = '-99';
			xJoResult.status_msg = 'Data not found';
		}

		return xJoResult;
	}

	async getById(pParam) {
		var xJoResult;
		var xFlag = true;

		var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
		if (xDecId.status_code == '00') {
			pParam.id = xDecId.decrypted;
		} else {
			xFlag = false;
			xJoResult = xDecId;
		}

		if (xFlag) {
			var xData = await _repoInstance.getById(pParam);
			if (xData != null) {
				xJoResult = {
					status_code: '00',
					status_msg: 'OK',
					data: {
						id: await _utilInstance.encrypt(xData.id.toString(), config.cryptoKey.hashKey),
						application_table: {
							id: await _utilInstance.encrypt(
								xData.application_table.id.toString(),
								config.cryptoKey.hashKey
							),
							name: xData.name,
							table_name: xData.application_table.table_name,
							application: {
								id: await _utilInstance.encrypt(
									xData.application_table.application.id.toString(),
									config.cryptoKey.hashKey
								),
								name: xData.application_table.application.name
							}
						},
						created_at: moment(xData.createdAt).format('DD-MM-YYYY HH:mm:ss'),
						updated_at: moment(xData.updatedAt).format('DD-MM-YYYY HH:mm:ss')
					}
				};
			}
		}

		return xJoResult;
	}

	async save(pParam) {
		var xJoResult;
		var xAct = pParam.act;
		var xFlagProcess = true;

		delete pParam.act;

		if (xAct == 'add') {
			// User Id
			var xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				pParam.created_by = xDecId.decrypted;
				pParam.created_by_name = pParam.user_name;
			} else {
				xFlagProcess = false;
				xJoResult = xDecId;
			}

			if (xFlagProcess) {
				var xAddResult = await _repoInstance.save(pParam, xAct);
				xJoResult = xAddResult;
			}
		} else if (xAct == 'update') {
			var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				pParam.id = xDecId.decrypted;
				xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
				if (xDecId.status_code == '00') {
					pParam.updated_by = xDecId.decrypted;
					pParam.updated_by_name = pParam.user_name;
				} else {
					xFlagProcess = false;
					xJoResult = xDecId;
				}
			} else {
				xFlagProcess = false;
				xJoResult = xDecId;
			}

			if (xFlagProcess) {
				var xAddResult = await _repoInstance.save(pParam, xAct);
				xJoResult = xAddResult;
			}
		}

		return xJoResult;
	}

	async delete(pParam) {
		var xJoResult;
		var xFlagProcess = true;

		var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
		if (xDecId.status_code == '00') {
			pParam.id = xDecId.decrypted;
			xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				pParam.deleted_by = xDecId.decrypted;
				pParam.deleted_by_name = pParam.user_name;
			} else {
				xFlagProcess = false;
				xJoResult = xDecId;
			}
		} else {
			xFlagProcess = false;
			xJoResult = xDecId;
		}

		var xDeleteResult = await _repoInstance.deletePermanent(pParam);
		xJoResult = xDeleteResult;

		return xJoResult;
	}
}

module.exports = ApprovalMatrixService;
