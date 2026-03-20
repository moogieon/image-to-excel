import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const PlanType = {
  FREE: "FREE",
  PRO: "PRO",
  PAYGO: "PAYGO",
  SUPER_ADMIN: "SUPER_ADMIN",
}

export const connectorConfig = {
  connector: 'default',
  service: 'image-to-excel',
  location: 'asia-northeast1'
};

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const createFreeUserPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFreeUserPlan', inputVars);
}
createFreeUserPlanRef.operationName = 'CreateFreeUserPlan';

export function createFreeUserPlan(dcOrVars, vars) {
  return executeMutation(createFreeUserPlanRef(dcOrVars, vars));
}

export const upgradeUserPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpgradeUserPlan', inputVars);
}
upgradeUserPlanRef.operationName = 'UpgradeUserPlan';

export function upgradeUserPlan(dcOrVars, vars) {
  return executeMutation(upgradeUserPlanRef(dcOrVars, vars));
}

export const deductTokenRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeductToken', inputVars);
}
deductTokenRef.operationName = 'DeductToken';

export function deductToken(dcOrVars, vars) {
  return executeMutation(deductTokenRef(dcOrVars, vars));
}

export const cancelUserPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CancelUserPlan', inputVars);
}
cancelUserPlanRef.operationName = 'CancelUserPlan';

export function cancelUserPlan(dcOrVars, vars) {
  return executeMutation(cancelUserPlanRef(dcOrVars, vars));
}

export const logUsageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LogUsage', inputVars);
}
logUsageRef.operationName = 'LogUsage';

export function logUsage(dcOrVars, vars) {
  return executeMutation(logUsageRef(dcOrVars, vars));
}

export const updateUserPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserPlan', inputVars);
}
updateUserPlanRef.operationName = 'UpdateUserPlan';

export function updateUserPlan(dcOrVars, vars) {
  return executeMutation(updateUserPlanRef(dcOrVars, vars));
}

export const getUserWithPlanRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserWithPlan', inputVars);
}
getUserWithPlanRef.operationName = 'GetUserWithPlan';

export function getUserWithPlan(dcOrVars, vars) {
  return executeQuery(getUserWithPlanRef(dcOrVars, vars));
}

export const getTodayUsageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetTodayUsage', inputVars);
}
getTodayUsageRef.operationName = 'GetTodayUsage';

export function getTodayUsage(dcOrVars, vars) {
  return executeQuery(getTodayUsageRef(dcOrVars, vars));
}

export const getUsageHistoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUsageHistory', inputVars);
}
getUsageHistoryRef.operationName = 'GetUsageHistory';

export function getUsageHistory(dcOrVars, vars) {
  return executeQuery(getUsageHistoryRef(dcOrVars, vars));
}

