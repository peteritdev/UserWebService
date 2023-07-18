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
const oAuth2 = require('./oauth2');
const test = require('./test');

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
	oAuth2,
	test
};
