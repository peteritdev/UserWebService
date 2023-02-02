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
const ApplicationMatrixApproverRepository = require('../repository/approvalmatrixapproverrepository.js');
const _repoInstance = new ApplicationMatrixApproverRepository();

const ApprovalMatrixApproverUserRepository = require('../repository/approvalmatrixapproveruserrepository.js');
const _approverUserRepoInstance = new ApprovalMatrixApproverUserRepository();

//Util
const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();

class ApprovalMatrixApproverService {
	constructor() {}

	async list(pParam) {
		var xJoResult = {};
		var xJoArrData = [];
		var xFlagProcess = true;

		if (pParam.hasOwnProperty('approval_matrix_id')) {
			if (pParam.approval_matrix_id != '') {
				var xDecId = await _utilInstance.decrypt(pParam.approval_matrix_id, config.cryptoKey.hashKey);
				if (xDecId.status_code == '00') {
					pParam.approval_matrix_id = xDecId.decrypted;
				} else {
					xFlagProcess = false;
					xJoResult = xDecId;
				}
			}
		}

		if (xFlagProcess) {
			xFlagProcess = true;
			if (pParam.hasOwnProperty('user_id')) {
				if (pParam.user_id != '') {
					var xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
					if (xDecId.status_code == '00') {
						pParam.user_id = xDecId.decrypted;
					} else {
						xFlagProcess = false;
						xJoResult = xDecId;
					}
				}
			}
		}

		if (xFlagProcess) {
			var xResultList = await _repoInstance.list(pParam);

			if (xResultList.count > 0) {
				xJoResult.status_code = '00';
				xJoResult.status_msg = 'OK';
				xJoResult.total_record = xResultList.count;

				var xRows = xResultList.rows;

				for (var index in xRows) {
					xJoArrData.push({
						id: await _utilInstance.encrypt(xRows[index].id.toString(), config.cryptoKey.hashKey),
						approval_matrix: {
							id: await _utilInstance.encrypt(
								xRows[index].approval_matrix.id.toString(),
								config.cryptoKey.hashKey
							),
							application_table: {
								id: await _utilInstance.encrypt(
									xRows[index].approval_matrix.application_table.id.toString(),
									config.cryptoKey.hashKey
								),
								table_name: xRows[index].approval_matrix.application_table.table_name,
								application: {
									id: await _utilInstance.encrypt(
										xRows[index].approval_matrix.application_table.application.id.toString(),
										config.cryptoKey.hashKey
									),
									name: xRows[index].approval_matrix.application_table.application.name
								}
							}
						},
						sequence: xRows[index].sequence,
						min_approver: xRows[index].min_approver,
						approval_matrix_approver_user: xRows[index].approval_matrix_approver_user,
						created_at: moment(xRows[index].createdAt).format('DD-MM-YYYY HH:mm:ss'),
						updated_at: moment(xRows[index].updatedAt).format('DD-MM-YYYY HH:mm:ss')
					});
				}

				xJoResult.data = xJoArrData;
			} else {
				xJoResult.status_code = '-99';
				xJoResult.status_msg = 'Data not found';
			}
		}

		return xJoResult;
	}

	async getById(pParam) {
		var xJoResult = {};
		var xJoArrData = [];
		var xFlag = true;

		if (pParam.hasOwnProperty('id')) {
			if (pParam.id != '') {
				var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
				if (xDecId.status_code == '00') {
					pParam.id = xDecId.decrypted;
				} else {
					xFlag = false;
					xJoResult = xDecId;
				}
			}
		}

		if (xFlag) {
			var xResultList = await _repoInstance.getById(pParam);

			console.log(JSON.stringify(xResultList));

			if (xResultList.count > 0) {
				xJoResult.status_code = '00';
				xJoResult.status_msg = 'OK';
				xJoResult.total_record = xResultList.count;

				var xRows = xResultList.rows;

				for (var index in xRows) {
					xJoArrData.push({
						id: await _utilInstance.encrypt(xRows[index].id.toString(), config.cryptoKey.hashKey),
						approval_matrix: {
							id: await _utilInstance.encrypt(
								xRows[index].approval_matrix.id.toString(),
								config.cryptoKey.hashKey
							),
							application_table: {
								id: await _utilInstance.encrypt(
									xRows[index].approval_matrix.application_table.id.toString(),
									config.cryptoKey.hashKey
								),
								table_name: xRows[index].approval_matrix.application_table.table_name,
								application: {
									id: await _utilInstance.encrypt(
										xRows[index].approval_matrix.application_table.application.id.toString(),
										config.cryptoKey.hashKey
									),
									name: xRows[index].approval_matrix.application_table.application.name
								}
							}
						},
						sequence: xRows[index].sequence,
						min_approver: xRows[index].min_approver,
						approval_matrix_approver_user: xRows[index].approval_matrix_approver_user,
						created_at: moment(xRows[index].createdAt).format('DD-MM-YYYY HH:mm:ss'),
						updated_at: moment(xRows[index].updatedAt).format('DD-MM-YYYY HH:mm:ss')
					});
				}

				xJoResult.data = xJoArrData;
			} else {
				xJoResult.status_code = '-99';
				xJoResult.status_msg = 'Data not found';
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
			// Approval matrix approver
			var xDecId = await _utilInstance.decrypt(pParam.approval_matrix_id, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				pParam.approval_matrix_id = xDecId.decrypted;
				xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
				if (xDecId.status_code == '00') {
					pParam.created_by = xDecId.decrypted;
					pParam.created_by_name = pParam.user_name;
				} else {
					xFlagProcess = false;
					xJoResult = xDecId;
				}
			} else {
				xFlagProcess = false;
				xJoResult = xDecId;
			}

			if (xFlagProcess) {
				var xAddResult = await _repoInstance.save(pParam, 'add_with_detail');
				xJoResult = xAddResult;
			}
		} else if (xAct == 'update') {
			var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				pParam.id = xDecId.decrypted;
				xDecId = await _utilInstance.decrypt(pParam.approval_matrix_id, config.cryptoKey.hashKey);
				if (xDecId.status_code == '00') {
					pParam.approval_matrix_id = xDecId.decrypted;
					xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
					if (xDecId.status_code == '00') {
						pParam.created_by = xDecId.decrypted;
						pParam.created_by_name = pParam.user_name;
					} else {
						xFlagProcess = false;
						xJoResult = xDecId;
					}
				} else {
					xFlagProcess = false;
					xJoResult = xDecId;
				}
			} else {
				xFlagProcess = false;
				xJoResult = xDecId;
			}

			if (xFlagProcess) {
				// Delete approval matrix approver user
				var xResultDelete = await _repoInstance.deletePermanent({ id: pParam.id });
				if (xResultDelete.status_code == '00') {
					var xAddResult = await _repoInstance.save(pParam, 'add_with_detail');
					xJoResult = xAddResult;
				} else {
					xJoResult = xResultDelete;
				}
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

module.exports = ApprovalMatrixApproverService;
