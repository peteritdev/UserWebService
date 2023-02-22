var env = process.env.NODE_ENV || 'localhost';
var config = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const { hash } = require('bcryptjs');
const Op = Sequelize.Op;

//Model
const _modelDb = require('../models').tr_approvalmatrixdocuments;
const _modelApprovalMatrixDocumentUser = require('../models').tr_approvalmatrixdocumentusers;
const _modelUser = require('../models').ms_users;
const _modelApplication = require('../models').ms_applications;

const Utility = require('peters-globallib-v2');
const { param } = require('express-validator');
const _utilInstance = new Utility();

class ApprovalMatrixDocumentRepository {
	constructor() {}

	async list(pParam) {
		var xWhere = [];
		var xWhereAnd = [];

		var xOrder = [ 'id', 'ASC' ];
		var xInclude = [
			{
				attributes: [ 'id', 'status', 'user_id' ],
				model: _modelApprovalMatrixDocumentUser,
				as: 'approval_matrix_document_user',
				include: [
					{
						attributes: [
							'id',
							'name',
							'email',
							'employee_id',
							'notification_via_fcm',
							'notification_via_email',
							'notification_via_wa',
							'notification_via_telegram'
						],
						model: _modelUser,
						as: 'user'
					}
				]
			}
		];

		if (pParam.hasOwnProperty('application_id')) {
			if (pParam.application_id != '') {
				xWhereAnd.push({
					application_id: pParam.application_id
				});
			}
		}

		if (pParam.hasOwnProperty('table_name')) {
			if (pParam.table_name != '') {
				xWhereAnd.push({
					table_name: pParam.table_name
				});
			}
		}

		if (pParam.hasOwnProperty('document_id')) {
			if (pParam.document_id != '') {
				xWhereAnd.push({
					document_id: pParam.document_id
				});
			}
		}

		if (pParam.hasOwnProperty('user_id')) {
			if (pParam.user_id != '') {
				xWhereAnd.push({
					'$approval_matrix_document_user.user_id$': pParam.user_id
				});
			}
		}

		if (pParam.hasOwnProperty('mode')) {
			if (pParam.mode == 'not_approve_yet') {
				xWhereAnd.push({
					total_approved: {
						[Op.lt]: sequelize.col('min_approver')
					}
				});
			}
		}

		xWhereAnd.push({
			is_delete: 0
		});

		if (xWhereAnd.length > 0) {
			xWhere.push({
				[Op.and]: xWhereAnd
			});
		}

		if (pParam.order_by != '' && pParam.hasOwnProperty('order_by')) {
			xOrder = [ pParam.order_by, pParam.order_type == 'desc' ? 'DESC' : 'ASC' ];
		}

		var xParamQuery = {
			where: xWhere,
			include: xInclude,
			order: [ xOrder ],
			subQuery: false
		};

		if (pParam.hasOwnProperty('offset') && pParam.hasOwnProperty('limit')) {
			console.log(`>>> pParam: ${JSON.stringify(pParam)}`);
			if (pParam.limit != 'all') {
				if (pParam.offset != '' && pParam.limit != '') {
					xParamQuery.offset = pParam.offset;
					xParamQuery.limit = pParam.limit;
				}
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
			} else if (pAct == 'add_with_detail') {
				pParam.status = 1;
				pParam.is_delete = 0;

				xSaved = await _modelDb.create(
					pParam,
					{
						include: [
							{
								model: _modelApprovalMatrixDocumentUser,
								as: 'approval_matrix_document_user'
							}
						]
					},
					{ xTransaction }
				);

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

	async delete(pParam) {
		let xTransaction;
		var xJoResult = {};

		try {
			var xSaved = null;
			xTransaction = await sequelize.transaction();

			xSaved = await _modelDb.update(
				{
					is_delete: 1,
					deleted_by: pParam.deleted_by,
					deleted_by_name: pParam.deleted_by_name,
					deleted_at: await _utilInstance.getCurrDateTime()
				},
				{
					where: {
						id: pParam.id
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

	async deletePermanent(pParam) {
		let xTransaction;
		var xJoResult = {};

		try {
			var xSaved = null;
			xTransaction = await sequelize.transaction();

			xSaved = await _modelDb.destroy(
				{
					where: {
						document_id: pParam.document_id,
						application_id: pParam.application_id,
						table_name: pParam.table_name
					},
					include: [
						{
							model: _modelApprovalMatrixDocumentUser,
							as: 'approval_matrix_document_user'
						}
					]
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
				status_msg: 'Failed delete data',
				err_msg: e
			};

			return xJoResult;
		}
	}

	async isUserAllowApprove(pParam) {
		var xJoResult = {};
		var xSql = '';
		var xObjJsonWhere = {};

		if (pParam.hasOwnProperty('document_id')) {
			if (pParam.document_id != '') {
				xObjJsonWhere.documentId = pParam.document_id;
			}
		}

		if (pParam.hasOwnProperty('application_id')) {
			if (pParam.application_id != '') {
				xObjJsonWhere.applicationId = pParam.application_id;
			}
		}

		if (pParam.hasOwnProperty('user_id')) {
			if (pParam.user_id != '') {
				xObjJsonWhere.userId = pParam.user_id;
			}
		}

		// console.log(">>> HERE : "+  JSON.stringify(xObjJsonWhere));

		// xSql =
		// 	' SELECT amd.min_approver, amd.total_approved, ' +
		// 	'    ( ' +
		// 	'        CASE WHEN sequence = 1 THEN ( ' +
		// 	'               CASE WHEN total_approved < min_approver  then 1 else 0 end ' +
		// 	'        ) ' +
		// 	'        WHEN sequence > 1 THEN ( ' +
		// 	'            select case when total_approved < min_approver then 0 else 1 end ' +
		// 	'            from tr_approvalmatrixdocuments amd_sub inner join tr_approvalmatrixdocumentusers amdu_sub ' +
		// 	'                on amd_sub.id = amdu_sub.approval_matrix_document_id ' +
		// 	'            where amd_sub.document_id = :documentId ' +
		// 	'            and amd_sub.application_id = :applicationId ' +
		// 	// '            -- and sequence = ( amd.sequence - 1 ) LIMIT 1 ' +
		// 	'			 order by "sequence" asc LIMIT 1 ' +
		// 	/* Peter: Above line im remark to support approval matrix based on sequence ordering not by number sequence.
		// 			For example if i set sequence 1,2,3 so it run normally because it check the next sequence is valid or not
		// 			If i set 1,3 it can not allow the sequence number 3 to approve, because after 1, it must be 2 not 3 but in matrix i set 1 and 3
		// 			Why i set 1,3 for this example? Because it support positioning qrcode on FPB
		// 	*/
		// 	'        ) ELSE 0 END ' +
		// 	'    ) AS "is_your_turn" ' +
		// 	' FROM tr_approvalmatrixdocuments amd inner join tr_approvalmatrixdocumentusers amdu ' +
		// 	'  ON amd.id = amdu.approval_matrix_document_id ' +
		// 	' WHERE amd.document_id = :documentId and amd.application_id = :applicationId and amd.total_approved < min_approver ' +
		// 	'    AND amdu.user_id = :userId';

		xSql = `SELECT amd.min_approver, amd.total_approved, amdu.user_id, amdu.user_name,
						CASE WHEN sequence = 1 THEN (
						CASE WHEN total_approved < min_approver  then 1 else 0 end
						)	
						WHEN sequence > 1 THEN (
						CASE WHEN amdu.user_id IN (
							SELECT user_id
							FROM tr_approvalmatrixdocumentusers b INNER JOIN (
								select id, document_id
								from tr_approvalmatrixdocuments 
								where document_id = :documentId AND application_id = :applicationId AND total_approved < min_approver 
								order by sequence LIMIT 1
							) a ON a.id = b.approval_matrix_document_id
						) THEN 1 ELSE 0 END
						)ELSE 0 END AS "is_your_turn"
				FROM tr_approvalmatrixdocuments amd inner join tr_approvalmatrixdocumentusers amdu  
				ON amd.id = amdu.approval_matrix_document_id 
				WHERE amd.document_id = :documentId 
				and amd.application_id = :applicationId
				and amd.total_approved < min_approver  
				AND amdu.user_id = :userId`;

		var xDtQuery = await sequelize.query(xSql, {
			replacements: xObjJsonWhere,
			type: sequelize.QueryTypes.SELECT
		});

		if (xDtQuery.length > 0) {
			xJoResult = {
				status_code: '00',
				status_msg: 'OK',
				is_allow_approve: xDtQuery[0].is_your_turn,
				min_approver: xDtQuery[0].min_approver,
				total_approved: xDtQuery[0].total_approved
			};
		} else {
			xJoResult = {
				status_code: '-99',
				status_msg: 'You not allow to approve this document.'
			};
		}

		return xJoResult;
	}

	// Purpose: this function use for verify approval using QRCode
	// Component of qrcode :
	// - VALIDATE_SIGNATURE|ASMS|movement_id which is document_id|user_id
	async verifyApprovalByQRCode(pParam) {
		var xJoResult = {};
		var xInclude = [],
			xWhere = [],
			xWhereAnd = [],
			xWhereOr = [];

		try {
			xInclude = [
				{
					model: _modelApplication,
					as: 'application',
					where: {
						app_code: pParam.app_code
					}
				},
				{
					model: _modelApprovalMatrixDocumentUser,
					as: 'approval_matrix_document_user',
					where: {
						user_id: pParam.user_id,
						status: 1
					}
				}
			];

			if (
				pParam.hasOwnProperty('document_id') &&
				pParam.hasOwnProperty('app_code') &&
				pParam.hasOwnProperty('user_id')
			) {
				xWhereAnd.push({
					document_id: pParam.document_id
					// '$application.app_code$': pParam.app_code,
					// '$approval_matrix_document_user.user_id$': pParam.user_id,
					// '$approval_matrix_document_user.status$': 1,
				});
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

			var xData = await _modelDb.findOne({
				where: xWhere,
				include: xInclude,
				subQuery: false
			});

			xJoResult = {
				status_code: '00',
				status_msg: 'OK',
				data: xData
			};
		} catch (e) {
			xJoResult = {
				status_code: `-99`,
				status_msg: `[ApprovalMatrixDocumentRepository.verifyApprovalByQRCode] Error: ${e}`
			};
		}

		return xJoResult;
	}
}

module.exports = ApprovalMatrixDocumentRepository;
