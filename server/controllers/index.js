const user = require('./user');
const userLevel = require('./userlevel');
const menu = require('./menu');
const userLevelAccess = require('./userlevelaccess');
const application = require('./application');
const userUserLevel = require('./useruserlevel');
const applicationTable = require('./applicationtable');
const approvalMatrix = require('./approvalmatrix');
const approvalMatrixApprover = require('./approvalmatrixapprover');
const approvalMatrixApproverUser = require('./approvalmatrixapproveruser');
const approvalMatrixDocument = require('./approvalmatrixdocument');
const notificationTemplate = require('./notificationtemplate');

const thirdPartyUser = require('./thirdpartyuser');

module.exports = {
	user,
	userLevel,
	menu,
	userLevelAccess,
	application,
	userUserLevel,
	applicationTable,
	approvalMatrix,
	approvalMatrixApprover,
	approvalMatrixApproverUser,
	approvalMatrixDocument,
	notificationTemplate,

	thirdPartyUser
};
