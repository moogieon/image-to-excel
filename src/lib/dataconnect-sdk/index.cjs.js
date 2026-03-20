const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const PlanType = {
  FREE: "FREE",
  PRO: "PRO",
  PAYGO: "PAYGO",
  SUPER_ADMIN: "SUPER_ADMIN",
}
exports.PlanType = PlanType;

const connectorConfig = {
  connector: 'default',
  service: 'image-to-excel',
  location: 'asia-northeast1'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const createFreeUserPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFreeUserPlan', inputVars);
}
createFreeUserPlanRef.operationName = 'CreateFreeUserPlan';
exports.createFreeUserPlanRef = createFreeUserPlanRef;

exports.createFreeUserPlan = function createFreeUserPlan(dcOrVars, vars) {
  return executeMutation(createFreeUserPlanRef(dcOrVars, vars));
};

const upgradeUserPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpgradeUserPlan', inputVars);
}
upgradeUserPlanRef.operationName = 'UpgradeUserPlan';
exports.upgradeUserPlanRef = upgradeUserPlanRef;

exports.upgradeUserPlan = function upgradeUserPlan(dcOrVars, vars) {
  return executeMutation(upgradeUserPlanRef(dcOrVars, vars));
};

const deductTokenRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeductToken', inputVars);
}
deductTokenRef.operationName = 'DeductToken';
exports.deductTokenRef = deductTokenRef;

exports.deductToken = function deductToken(dcOrVars, vars) {
  return executeMutation(deductTokenRef(dcOrVars, vars));
};

const cancelUserPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CancelUserPlan', inputVars);
}
cancelUserPlanRef.operationName = 'CancelUserPlan';
exports.cancelUserPlanRef = cancelUserPlanRef;

exports.cancelUserPlan = function cancelUserPlan(dcOrVars, vars) {
  return executeMutation(cancelUserPlanRef(dcOrVars, vars));
};

const logUsageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LogUsage', inputVars);
}
logUsageRef.operationName = 'LogUsage';
exports.logUsageRef = logUsageRef;

exports.logUsage = function logUsage(dcOrVars, vars) {
  return executeMutation(logUsageRef(dcOrVars, vars));
};

const updateUserPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserPlan', inputVars);
}
updateUserPlanRef.operationName = 'UpdateUserPlan';
exports.updateUserPlanRef = updateUserPlanRef;

exports.updateUserPlan = function updateUserPlan(dcOrVars, vars) {
  return executeMutation(updateUserPlanRef(dcOrVars, vars));
};

const getUserWithPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserWithPlan', inputVars);
}
getUserWithPlanRef.operationName = 'GetUserWithPlan';
exports.getUserWithPlanRef = getUserWithPlanRef;

exports.getUserWithPlan = function getUserWithPlan(dcOrVars, vars) {
  return executeQuery(getUserWithPlanRef(dcOrVars, vars));
};

const getTodayUsageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTodayUsage', inputVars);
}
getTodayUsageRef.operationName = 'GetTodayUsage';
exports.getTodayUsageRef = getTodayUsageRef;

exports.getTodayUsage = function getTodayUsage(dcOrVars, vars) {
  return executeQuery(getTodayUsageRef(dcOrVars, vars));
};

const getUsageHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUsageHistory', inputVars);
}
getUsageHistoryRef.operationName = 'GetUsageHistory';
exports.getUsageHistoryRef = getUsageHistoryRef;

exports.getUsageHistory = function getUsageHistory(dcOrVars, vars) {
  return executeQuery(getUsageHistoryRef(dcOrVars, vars));
};
