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
const ApplicationMatrixDocumentRepository = require('../repository/approvalmatrixdocumentrepository.js');
const _repoInstance = new ApplicationMatrixDocumentRepository();

const ApplicationMatrixApproverRepository = require('../repository/approvalmatrixapproverrepository.js');
const _approvalMatrixApproverRepoInstance = new ApplicationMatrixApproverRepository();

const ApplicationService = require('../services/applicationservice.js');
const _applicationServiceInstance = new ApplicationService();

const UserService = require('../services/userservice.js');
const _userServiceInstance = new UserService();

//Util
const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();

class ApprovalMatrixDocumentService {
	constructor() {}

	async list(pParam) {
		var xJoResult = {};
		var xJoArrData = [];
		var xFlagProcess = true;

		if (pParam.hasOwnProperty('document_id')) {
			if (pParam.document_id != '') {
				var xDecId = await _utilInstance.decrypt(pParam.document_id, config.cryptoKey.hashKey);
				if (xDecId.status_code == '00') {
					pParam.document_id = xDecId.decrypted;
				} else {
					xJoResult = xDecId;
					xFlagProcess = false;
				}
			}
		}

		if (xFlagProcess) {
			xFlagProcess = true;
			if (pParam.hasOwnProperty('user_id')) {
				if (pParam.user_id != '') {
					if (pParam.user_id.length == 65) {
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
						document_id: await _utilInstance.encrypt(
							xRows[index].document_id.toString(),
							config.cryptoKey.hashKey
						),
						document_no: xRows[index].document_no,
						sequence: xRows[index].sequence,
						application_name: xRows[index].application_name,
						table_name: xRows[index].table_name,
						approver_user: xRows[index].approval_matrix_document_user,
						min_approver: xRows[index].min_approver,

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

	async isUserAllowApprove(pParam) {
		var xJoResult;
		var xFlagProcess = true;
		var xDecId = null;

		if (pParam.hasOwnProperty('document_id')) {
			if (pParam.document_id != '') {
				xDecId = await _utilInstance.decrypt(pParam.document_id, config.cryptoKey.hashKey);
				if (xDecId.status_code == '00') {
					pParam.document_id = xDecId.decrypted;
				} else {
					xFlagProcess = false;
					xJoResult = xDecId;
				}
			}
		}

		if (xFlagProcess) {
			if (pParam.hasOwnProperty('user_id')) {
				if (pParam.user_id != '') {
					xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
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
			var xJoResult = await _repoInstance.isUserAllowApprove(pParam);
		}

		return xJoResult;
	}

	async save(pParam) {
		var xJoResult;
		var xAct = pParam.act;
		var xFlagProcess = true;

		delete pParam.act;

		if (xAct == 'add') {
			// Add Header
			var xDecId = await _utilInstance.decrypt(pParam.document_id, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				pParam.document_id = xDecId.decrypted;
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
				var xParamSave = null;
				var xResultApprover4Notification = [];

				// Get approval matrix
				var xParamFilter = {
					application_id: pParam.application_id,
					table_name: pParam.table_name
				};

				// Filter for FPB Purpose
				if (pParam.hasOwnProperty('logged_company_id')) {
					if (pParam.logged_company_id == 6) {
						xParamFilter.department_id = false;
					} else {
						if (pParam.hasOwnProperty('department_id')) {
							if (pParam.department_id != '') {
								xParamFilter.department_id = pParam.department_id;
							}
						}
					}
				} else {
					if (pParam.hasOwnProperty('department_id')) {
						if (pParam.department_id != '') {
							xParamFilter.department_id = pParam.department_id;
						}
					}
				}

				if (pParam.hasOwnProperty('company_id')) {
					if (pParam.company_id != '') {
						xParamFilter.company_id = pParam.company_id;
					}
				}

				if (pParam.hasOwnProperty('ecatalogue_fpb_category_item')) {
					if (pParam.ecatalogue_fpb_category_item == 7) {
						xParamFilter.ecatalogue_fpb_category_item = pParam.ecatalogue_fpb_category_item;
					} else {
						xParamFilter.ecatalogue_fpb_category_item = null;
					}
				}
				var xApprovalMatrix = await _approvalMatrixApproverRepoInstance.getById(xParamFilter);
				// console.log(`>>> xApprovalMatrix : ${JSON.stringify(xApprovalMatrix)}`);
				console.log(`>>> xParamFilter: ${JSON.stringify(xParamFilter)}`);

				if (xApprovalMatrix.count > 0) {
					var xRowsApprovalMatrix = xApprovalMatrix.rows;

					for (var index in xRowsApprovalMatrix) {
						var xApproverUser = [];
						if (xRowsApprovalMatrix[index].approval_matrix_approver_user.length > 0) {
							for (var j = 0; j < xRowsApprovalMatrix[index].approval_matrix_approver_user.length; j++) {
								xApproverUser.push({
									user_id: xRowsApprovalMatrix[index].approval_matrix_approver_user[j].user.id,
									user_name: xRowsApprovalMatrix[index].approval_matrix_approver_user[j].user.name,
									email: xRowsApprovalMatrix[index].approval_matrix_approver_user[j].user.email,
									status: 0
								});
							}
						}

						xParamSave = {
							document_id: pParam.document_id,
							document_no: pParam.document_no,
							sequence: xRowsApprovalMatrix[index].sequence,
							application_id: pParam.application_id,
							application_name:
								xRowsApprovalMatrix[index].approval_matrix.application_table.application.name,
							table_name: xRowsApprovalMatrix[index].approval_matrix.application_table.table_name,
							min_approver: xRowsApprovalMatrix[index].min_approver,
							approval_matrix_document_user: xApproverUser
						};

						var xAddResult = await _repoInstance.save(xParamSave, 'add_with_detail');

						xResultApprover4Notification.push({
							sequence: xRowsApprovalMatrix[index].sequence,
							approver_user: xApproverUser
						});
					}

					xJoResult = {
						status_code: '00',
						status_msg: 'Data has been successfully saved',
						approvers: xResultApprover4Notification
					};
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'Approval matrix not found.'
					};
				}
			}
		} else if (xAct == 'fetch_matrix') {
			// Delete approval matrix first
			var xFlagProcess = true;
			var xTempEncDocumentId = '';

			var xDecId = await _utilInstance.decrypt(pParam.document_id, config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				xTempEncDocumentId = pParam.document_id;
				pParam.document_id = xDecId.decrypted;
			} else {
				xFlagProcess = false;
				xJoResult = xDecId;
			}

			var xDeleteResult = await _repoInstance.deletePermanent(pParam);

			if (xDeleteResult.status_code == '00') {
				pParam.act = 'add';
				pParam.document_id = xTempEncDocumentId;
				var xResultAdd = this.save(pParam);
				xJoResult = xResultAdd;
			}
		} else if (xAct == 'add_manual') {
			if (pParam.hasOwnProperty('approval_matrix')) {
				if (pParam.approval_matrix.length > 0) {
					let xArrResult = [];
					for (var i in pParam.approval_matrix) {
						// Get application name
						let xApplicationName = '';
						let xJaApproverUser = [];
						let xApplicationDetail = await _applicationServiceInstance.getById({
							id: pParam.approval_matrix[i].application_id
						});
						if (xApplicationDetail) {
							xApplicationName = xApplicationDetail.data.name;
						}

						// Translate approval_users from employee_id to user_id
						for (var j in pParam.approval_matrix[i].approval_employees) {
							console.log(`>>> Employee ID: ${pParam.approval_matrix[i].approval_employees[j]}`);
							let xUserDetail = await _userServiceInstance.getUserByEmployeeId(
								pParam.approval_matrix[i].approval_employees[j]
							);
							console.log(`>>> xUserDetail: ${JSON.stringify(xUserDetail)}`);
							if (xUserDetail.status_code == '00') {
								xJaApproverUser.push({
									user_id: xUserDetail.data.clear_id,
									user_name: xUserDetail.data.name
								});
							}
						}

						// Lets Insert into database
						let xParamSave = {
							document_id: pParam.approval_matrix[i].document_id,
							document_no: pParam.approval_matrix[i].document_no,
							sequence: pParam.approval_matrix[i].sequence,
							application_id: pParam.approval_matrix[i].application_id,
							application_name: xApplicationName,
							table_name: pParam.approval_matrix[i].table_name,
							min_approver: pParam.approval_matrix[i].min_approver,
							approval_matrix_document_user: xJaApproverUser
						};
						console.log(`>>> Param Save: ${xParamSave}`);
						var xAddResult = await _repoInstance.save(xParamSave, 'add_with_detail');

						xArrResult.push(xAddResult);
					}

					xJoResult = {
						status_code: '00',
						status_msg: 'You have successfully add manually approval matrix',
						approval_matrix_result: xArrResult
					};
				} else {
					xJoResult = {
						status_code: '-99',
						status_msg: 'No data found to add'
					};
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'You need to supply the parameter correctly'
				};
			}
		}

		return xJoResult;
	}

	async delete(pParam) {
		var xJoResult;
		var xFlagProcess = true;

		var xDecId = await _utilInstance.decrypt(pParam.document_id, config.cryptoKey.hashKey);
		if (xDecId.status_code == '00') {
			pParam.document_id = xDecId.decrypted;
		} else {
			xFlagProcess = false;
			xJoResult = xDecId;
		}

		var xDeleteResult = await _repoInstance.deletePermanent(pParam);
		xJoResult = xDeleteResult;

		return xJoResult;
	}

	// Purpose: this function use for verify approval using QRCode
	// Component of qrcode :
	// - VALIDATE_SIGNATURE|ASMS|movement_id which is document_id|user_id
	async verifyApprovalByQRCode(pParam) {
		var xJoResult = {};
		var xFlagProcess = false;
		var xDecId = null;

		try {
			let xSplitedSignature = pParam.signature.split('|');
			var xDecId = await _utilInstance.decrypt(xSplitedSignature[2], config.cryptoKey.hashKey);
			if (xDecId.status_code == '00') {
				let xSplitedId = xDecId.decrypted.split('|');
				let xVerifyParam = {
					document_id: xSplitedId[0],
					app_code: xSplitedSignature[1],
					user_id: xSplitedId[1]
				};
				let xResultVerifyApproval = await _repoInstance.verifyApprovalByQRCode(xVerifyParam);
				if (xResultVerifyApproval.status_code == '00') {
					if (xResultVerifyApproval.data != null) {
						xJoResult = {
							status_code: '00',
							status_msg: 'OK',
							data: {
								application_name: xResultVerifyApproval.data.application.name,
								document_date:
									xResultVerifyApproval.data.createdAt != ''
										? moment(xResultVerifyApproval.data.createdAt).format('DD MMM YYYY')
										: null,
								document_no: xResultVerifyApproval.data.document_no,
								approver_name: xResultVerifyApproval.data.approval_matrix_document_user[0].user_name,
								status: xResultVerifyApproval.data.approval_matrix_document_user[0].status
							}
						};
					} else {
						xJoResult = {
							status_code: '-99',
							status_msg: 'Data not found'
						};
					}
				}
			} else {
				xJoResult = {
					status_code: '-99',
					status_msg: 'QRCode not valid. The approval information is wrong!'
				};
			}
		} catch (e) {
			xJoResult = {
				status_code: '-99',
				status_msg: `[approvalmatroxdocumentservice.verifyApprovalByQRCode] Err: ${e}`
			};
		}

		return xJoResult;
	}
}

module.exports = ApprovalMatrixDocumentService;
