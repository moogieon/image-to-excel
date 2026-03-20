import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum PlanType {
  FREE = "FREE",
  PRO = "PRO",
  PAYGO = "PAYGO",
  SUPER_ADMIN = "SUPER_ADMIN",
};



export interface CancelUserPlanData {
  userPlan_update?: UserPlan_Key | null;
}

export interface CancelUserPlanVariables {
  userPlanId: UserPlan_Key;
  cancelReason?: string | null;
}

export interface CreateFreeUserPlanData {
  userPlan_insert: UserPlan_Key;
}

export interface CreateFreeUserPlanVariables {
  userId: User_Key;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  uid: string;
  email: string;
  displayName?: string | null;
}

export interface DeductTokenData {
  userPlan_update?: UserPlan_Key | null;
}

export interface DeductTokenVariables {
  userPlanId: UserPlan_Key;
  remaining: number;
}

export interface GetTodayUsageData {
  usageLogs: ({
    pagesUsed: number;
    fileName?: string | null;
    usedAt: TimestampString;
  })[];
}

export interface GetTodayUsageVariables {
  uid: string;
  today: TimestampString;
}

export interface GetUsageHistoryData {
  usageLogs: ({
    pagesUsed: number;
    fileName?: string | null;
    usedAt: TimestampString;
  })[];
}

export interface GetUsageHistoryVariables {
  uid: string;
  limit?: number | null;
}

export interface GetUserWithPlanData {
  users: ({
    id: UUIDString;
    uid: string;
    email: string;
    displayName?: string | null;
    plan: PlanType;
    userPlans_on_user: ({
      id: UUIDString;
      plan: PlanType;
      name: string;
      status: UserPlanStatus;
      tokensRemaining: number;
      tokensTotal: number;
      billingCycle?: string | null;
      startedAt: TimestampString;
      expiresAt?: TimestampString | null;
      canceledAt?: TimestampString | null;
      cancelReason?: string | null;
    } & UserPlan_Key)[];
  } & User_Key)[];
}

export interface GetUserWithPlanVariables {
  uid: string;
}

export interface LogUsageData {
  usageLog_insert: UsageLog_Key;
}

export interface LogUsageVariables {
  userId: User_Key;
  pagesUsed: number;
  fileName?: string | null;
}

export interface UpdateUserPlanData {
  user_update?: User_Key | null;
}

export interface UpdateUserPlanVariables {
  userId: User_Key;
  plan: PlanType;
}

export interface UpgradeUserPlanData {
  userPlan_insert: UserPlan_Key;
}

export interface UpgradeUserPlanVariables {
  userId: User_Key;
  plan: PlanType;
  name: string;
  tokens: number;
  billingCycle?: string | null;
  expiresAt?: TimestampString | null;
}

export interface UsageLog_Key {
  id: UUIDString;
  __typename?: 'UsageLog_Key';
}

export interface UserPlan_Key {
  id: UUIDString;
  __typename?: 'UserPlan_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateFreeUserPlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFreeUserPlanVariables): MutationRef<CreateFreeUserPlanData, CreateFreeUserPlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFreeUserPlanVariables): MutationRef<CreateFreeUserPlanData, CreateFreeUserPlanVariables>;
  operationName: string;
}
export const createFreeUserPlanRef: CreateFreeUserPlanRef;

export function createFreeUserPlan(vars: CreateFreeUserPlanVariables): MutationPromise<CreateFreeUserPlanData, CreateFreeUserPlanVariables>;
export function createFreeUserPlan(dc: DataConnect, vars: CreateFreeUserPlanVariables): MutationPromise<CreateFreeUserPlanData, CreateFreeUserPlanVariables>;

interface UpgradeUserPlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpgradeUserPlanVariables): MutationRef<UpgradeUserPlanData, UpgradeUserPlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpgradeUserPlanVariables): MutationRef<UpgradeUserPlanData, UpgradeUserPlanVariables>;
  operationName: string;
}
export const upgradeUserPlanRef: UpgradeUserPlanRef;

export function upgradeUserPlan(vars: UpgradeUserPlanVariables): MutationPromise<UpgradeUserPlanData, UpgradeUserPlanVariables>;
export function upgradeUserPlan(dc: DataConnect, vars: UpgradeUserPlanVariables): MutationPromise<UpgradeUserPlanData, UpgradeUserPlanVariables>;

interface DeductTokenRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeductTokenVariables): MutationRef<DeductTokenData, DeductTokenVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeductTokenVariables): MutationRef<DeductTokenData, DeductTokenVariables>;
  operationName: string;
}
export const deductTokenRef: DeductTokenRef;

export function deductToken(vars: DeductTokenVariables): MutationPromise<DeductTokenData, DeductTokenVariables>;
export function deductToken(dc: DataConnect, vars: DeductTokenVariables): MutationPromise<DeductTokenData, DeductTokenVariables>;

interface CancelUserPlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CancelUserPlanVariables): MutationRef<CancelUserPlanData, CancelUserPlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CancelUserPlanVariables): MutationRef<CancelUserPlanData, CancelUserPlanVariables>;
  operationName: string;
}
export const cancelUserPlanRef: CancelUserPlanRef;

export function cancelUserPlan(vars: CancelUserPlanVariables): MutationPromise<CancelUserPlanData, CancelUserPlanVariables>;
export function cancelUserPlan(dc: DataConnect, vars: CancelUserPlanVariables): MutationPromise<CancelUserPlanData, CancelUserPlanVariables>;

interface LogUsageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LogUsageVariables): MutationRef<LogUsageData, LogUsageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LogUsageVariables): MutationRef<LogUsageData, LogUsageVariables>;
  operationName: string;
}
export const logUsageRef: LogUsageRef;

export function logUsage(vars: LogUsageVariables): MutationPromise<LogUsageData, LogUsageVariables>;
export function logUsage(dc: DataConnect, vars: LogUsageVariables): MutationPromise<LogUsageData, LogUsageVariables>;

interface UpdateUserPlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserPlanVariables): MutationRef<UpdateUserPlanData, UpdateUserPlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserPlanVariables): MutationRef<UpdateUserPlanData, UpdateUserPlanVariables>;
  operationName: string;
}
export const updateUserPlanRef: UpdateUserPlanRef;

export function updateUserPlan(vars: UpdateUserPlanVariables): MutationPromise<UpdateUserPlanData, UpdateUserPlanVariables>;
export function updateUserPlan(dc: DataConnect, vars: UpdateUserPlanVariables): MutationPromise<UpdateUserPlanData, UpdateUserPlanVariables>;

interface GetUserWithPlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserWithPlanVariables): QueryRef<GetUserWithPlanData, GetUserWithPlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserWithPlanVariables): QueryRef<GetUserWithPlanData, GetUserWithPlanVariables>;
  operationName: string;
}
export const getUserWithPlanRef: GetUserWithPlanRef;

export function getUserWithPlan(vars: GetUserWithPlanVariables): QueryPromise<GetUserWithPlanData, GetUserWithPlanVariables>;
export function getUserWithPlan(dc: DataConnect, vars: GetUserWithPlanVariables): QueryPromise<GetUserWithPlanData, GetUserWithPlanVariables>;

interface GetTodayUsageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTodayUsageVariables): QueryRef<GetTodayUsageData, GetTodayUsageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTodayUsageVariables): QueryRef<GetTodayUsageData, GetTodayUsageVariables>;
  operationName: string;
}
export const getTodayUsageRef: GetTodayUsageRef;

export function getTodayUsage(vars: GetTodayUsageVariables): QueryPromise<GetTodayUsageData, GetTodayUsageVariables>;
export function getTodayUsage(dc: DataConnect, vars: GetTodayUsageVariables): QueryPromise<GetTodayUsageData, GetTodayUsageVariables>;

interface GetUsageHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUsageHistoryVariables): QueryRef<GetUsageHistoryData, GetUsageHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUsageHistoryVariables): QueryRef<GetUsageHistoryData, GetUsageHistoryVariables>;
  operationName: string;
}
export const getUsageHistoryRef: GetUsageHistoryRef;

export function getUsageHistory(vars: GetUsageHistoryVariables): QueryPromise<GetUsageHistoryData, GetUsageHistoryVariables>;
export function getUsageHistory(dc: DataConnect, vars: GetUsageHistoryVariables): QueryPromise<GetUsageHistoryData, GetUsageHistoryVariables>;

