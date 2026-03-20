# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUserWithPlan*](#getuserwithplan)
  - [*GetTodayUsage*](#gettodayusage)
  - [*GetUsageHistory*](#getusagehistory)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*CreateFreeUserPlan*](#createfreeuserplan)
  - [*UpgradeUserPlan*](#upgradeuserplan)
  - [*DeductToken*](#deducttoken)
  - [*CancelUserPlan*](#canceluserplan)
  - [*LogUsage*](#logusage)
  - [*UpdateUserPlan*](#updateuserplan)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@image-to-excel/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@image-to-excel/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@image-to-excel/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUserWithPlan
You can execute the `GetUserWithPlan` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getUserWithPlan(vars: GetUserWithPlanVariables): QueryPromise<GetUserWithPlanData, GetUserWithPlanVariables>;

interface GetUserWithPlanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserWithPlanVariables): QueryRef<GetUserWithPlanData, GetUserWithPlanVariables>;
}
export const getUserWithPlanRef: GetUserWithPlanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserWithPlan(dc: DataConnect, vars: GetUserWithPlanVariables): QueryPromise<GetUserWithPlanData, GetUserWithPlanVariables>;

interface GetUserWithPlanRef {
  ...
  (dc: DataConnect, vars: GetUserWithPlanVariables): QueryRef<GetUserWithPlanData, GetUserWithPlanVariables>;
}
export const getUserWithPlanRef: GetUserWithPlanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserWithPlanRef:
```typescript
const name = getUserWithPlanRef.operationName;
console.log(name);
```

### Variables
The `GetUserWithPlan` query requires an argument of type `GetUserWithPlanVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserWithPlanVariables {
  uid: string;
}
```
### Return Type
Recall that executing the `GetUserWithPlan` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserWithPlanData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserWithPlan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserWithPlan, GetUserWithPlanVariables } from '@image-to-excel/dataconnect';

// The `GetUserWithPlan` query requires an argument of type `GetUserWithPlanVariables`:
const getUserWithPlanVars: GetUserWithPlanVariables = {
  uid: ..., 
};

// Call the `getUserWithPlan()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserWithPlan(getUserWithPlanVars);
// Variables can be defined inline as well.
const { data } = await getUserWithPlan({ uid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserWithPlan(dataConnect, getUserWithPlanVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserWithPlan(getUserWithPlanVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserWithPlan`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserWithPlanRef, GetUserWithPlanVariables } from '@image-to-excel/dataconnect';

// The `GetUserWithPlan` query requires an argument of type `GetUserWithPlanVariables`:
const getUserWithPlanVars: GetUserWithPlanVariables = {
  uid: ..., 
};

// Call the `getUserWithPlanRef()` function to get a reference to the query.
const ref = getUserWithPlanRef(getUserWithPlanVars);
// Variables can be defined inline as well.
const ref = getUserWithPlanRef({ uid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserWithPlanRef(dataConnect, getUserWithPlanVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetTodayUsage
You can execute the `GetTodayUsage` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getTodayUsage(vars: GetTodayUsageVariables): QueryPromise<GetTodayUsageData, GetTodayUsageVariables>;

interface GetTodayUsageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTodayUsageVariables): QueryRef<GetTodayUsageData, GetTodayUsageVariables>;
}
export const getTodayUsageRef: GetTodayUsageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTodayUsage(dc: DataConnect, vars: GetTodayUsageVariables): QueryPromise<GetTodayUsageData, GetTodayUsageVariables>;

interface GetTodayUsageRef {
  ...
  (dc: DataConnect, vars: GetTodayUsageVariables): QueryRef<GetTodayUsageData, GetTodayUsageVariables>;
}
export const getTodayUsageRef: GetTodayUsageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTodayUsageRef:
```typescript
const name = getTodayUsageRef.operationName;
console.log(name);
```

### Variables
The `GetTodayUsage` query requires an argument of type `GetTodayUsageVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTodayUsageVariables {
  uid: string;
  today: TimestampString;
}
```
### Return Type
Recall that executing the `GetTodayUsage` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTodayUsageData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTodayUsageData {
  usageLogs: ({
    pagesUsed: number;
    fileName?: string | null;
    usedAt: TimestampString;
  })[];
}
```
### Using `GetTodayUsage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTodayUsage, GetTodayUsageVariables } from '@image-to-excel/dataconnect';

// The `GetTodayUsage` query requires an argument of type `GetTodayUsageVariables`:
const getTodayUsageVars: GetTodayUsageVariables = {
  uid: ..., 
  today: ..., 
};

// Call the `getTodayUsage()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTodayUsage(getTodayUsageVars);
// Variables can be defined inline as well.
const { data } = await getTodayUsage({ uid: ..., today: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTodayUsage(dataConnect, getTodayUsageVars);

console.log(data.usageLogs);

// Or, you can use the `Promise` API.
getTodayUsage(getTodayUsageVars).then((response) => {
  const data = response.data;
  console.log(data.usageLogs);
});
```

### Using `GetTodayUsage`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTodayUsageRef, GetTodayUsageVariables } from '@image-to-excel/dataconnect';

// The `GetTodayUsage` query requires an argument of type `GetTodayUsageVariables`:
const getTodayUsageVars: GetTodayUsageVariables = {
  uid: ..., 
  today: ..., 
};

// Call the `getTodayUsageRef()` function to get a reference to the query.
const ref = getTodayUsageRef(getTodayUsageVars);
// Variables can be defined inline as well.
const ref = getTodayUsageRef({ uid: ..., today: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTodayUsageRef(dataConnect, getTodayUsageVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.usageLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.usageLogs);
});
```

## GetUsageHistory
You can execute the `GetUsageHistory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getUsageHistory(vars: GetUsageHistoryVariables): QueryPromise<GetUsageHistoryData, GetUsageHistoryVariables>;

interface GetUsageHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUsageHistoryVariables): QueryRef<GetUsageHistoryData, GetUsageHistoryVariables>;
}
export const getUsageHistoryRef: GetUsageHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUsageHistory(dc: DataConnect, vars: GetUsageHistoryVariables): QueryPromise<GetUsageHistoryData, GetUsageHistoryVariables>;

interface GetUsageHistoryRef {
  ...
  (dc: DataConnect, vars: GetUsageHistoryVariables): QueryRef<GetUsageHistoryData, GetUsageHistoryVariables>;
}
export const getUsageHistoryRef: GetUsageHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUsageHistoryRef:
```typescript
const name = getUsageHistoryRef.operationName;
console.log(name);
```

### Variables
The `GetUsageHistory` query requires an argument of type `GetUsageHistoryVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUsageHistoryVariables {
  uid: string;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `GetUsageHistory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUsageHistoryData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUsageHistoryData {
  usageLogs: ({
    pagesUsed: number;
    fileName?: string | null;
    usedAt: TimestampString;
  })[];
}
```
### Using `GetUsageHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUsageHistory, GetUsageHistoryVariables } from '@image-to-excel/dataconnect';

// The `GetUsageHistory` query requires an argument of type `GetUsageHistoryVariables`:
const getUsageHistoryVars: GetUsageHistoryVariables = {
  uid: ..., 
  limit: ..., // optional
};

// Call the `getUsageHistory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUsageHistory(getUsageHistoryVars);
// Variables can be defined inline as well.
const { data } = await getUsageHistory({ uid: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUsageHistory(dataConnect, getUsageHistoryVars);

console.log(data.usageLogs);

// Or, you can use the `Promise` API.
getUsageHistory(getUsageHistoryVars).then((response) => {
  const data = response.data;
  console.log(data.usageLogs);
});
```

### Using `GetUsageHistory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUsageHistoryRef, GetUsageHistoryVariables } from '@image-to-excel/dataconnect';

// The `GetUsageHistory` query requires an argument of type `GetUsageHistoryVariables`:
const getUsageHistoryVars: GetUsageHistoryVariables = {
  uid: ..., 
  limit: ..., // optional
};

// Call the `getUsageHistoryRef()` function to get a reference to the query.
const ref = getUsageHistoryRef(getUsageHistoryVars);
// Variables can be defined inline as well.
const ref = getUsageHistoryRef({ uid: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUsageHistoryRef(dataConnect, getUsageHistoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.usageLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.usageLogs);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  uid: string;
  email: string;
  displayName?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@image-to-excel/dataconnect';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  uid: ..., 
  email: ..., 
  displayName: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ uid: ..., email: ..., displayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@image-to-excel/dataconnect';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  uid: ..., 
  email: ..., 
  displayName: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ uid: ..., email: ..., displayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateFreeUserPlan
You can execute the `CreateFreeUserPlan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
createFreeUserPlan(vars: CreateFreeUserPlanVariables): MutationPromise<CreateFreeUserPlanData, CreateFreeUserPlanVariables>;

interface CreateFreeUserPlanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFreeUserPlanVariables): MutationRef<CreateFreeUserPlanData, CreateFreeUserPlanVariables>;
}
export const createFreeUserPlanRef: CreateFreeUserPlanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFreeUserPlan(dc: DataConnect, vars: CreateFreeUserPlanVariables): MutationPromise<CreateFreeUserPlanData, CreateFreeUserPlanVariables>;

interface CreateFreeUserPlanRef {
  ...
  (dc: DataConnect, vars: CreateFreeUserPlanVariables): MutationRef<CreateFreeUserPlanData, CreateFreeUserPlanVariables>;
}
export const createFreeUserPlanRef: CreateFreeUserPlanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFreeUserPlanRef:
```typescript
const name = createFreeUserPlanRef.operationName;
console.log(name);
```

### Variables
The `CreateFreeUserPlan` mutation requires an argument of type `CreateFreeUserPlanVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateFreeUserPlanVariables {
  userId: User_Key;
}
```
### Return Type
Recall that executing the `CreateFreeUserPlan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFreeUserPlanData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFreeUserPlanData {
  userPlan_insert: UserPlan_Key;
}
```
### Using `CreateFreeUserPlan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFreeUserPlan, CreateFreeUserPlanVariables } from '@image-to-excel/dataconnect';

// The `CreateFreeUserPlan` mutation requires an argument of type `CreateFreeUserPlanVariables`:
const createFreeUserPlanVars: CreateFreeUserPlanVariables = {
  userId: ..., 
};

// Call the `createFreeUserPlan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFreeUserPlan(createFreeUserPlanVars);
// Variables can be defined inline as well.
const { data } = await createFreeUserPlan({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFreeUserPlan(dataConnect, createFreeUserPlanVars);

console.log(data.userPlan_insert);

// Or, you can use the `Promise` API.
createFreeUserPlan(createFreeUserPlanVars).then((response) => {
  const data = response.data;
  console.log(data.userPlan_insert);
});
```

### Using `CreateFreeUserPlan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFreeUserPlanRef, CreateFreeUserPlanVariables } from '@image-to-excel/dataconnect';

// The `CreateFreeUserPlan` mutation requires an argument of type `CreateFreeUserPlanVariables`:
const createFreeUserPlanVars: CreateFreeUserPlanVariables = {
  userId: ..., 
};

// Call the `createFreeUserPlanRef()` function to get a reference to the mutation.
const ref = createFreeUserPlanRef(createFreeUserPlanVars);
// Variables can be defined inline as well.
const ref = createFreeUserPlanRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFreeUserPlanRef(dataConnect, createFreeUserPlanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userPlan_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userPlan_insert);
});
```

## UpgradeUserPlan
You can execute the `UpgradeUserPlan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
upgradeUserPlan(vars: UpgradeUserPlanVariables): MutationPromise<UpgradeUserPlanData, UpgradeUserPlanVariables>;

interface UpgradeUserPlanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpgradeUserPlanVariables): MutationRef<UpgradeUserPlanData, UpgradeUserPlanVariables>;
}
export const upgradeUserPlanRef: UpgradeUserPlanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upgradeUserPlan(dc: DataConnect, vars: UpgradeUserPlanVariables): MutationPromise<UpgradeUserPlanData, UpgradeUserPlanVariables>;

interface UpgradeUserPlanRef {
  ...
  (dc: DataConnect, vars: UpgradeUserPlanVariables): MutationRef<UpgradeUserPlanData, UpgradeUserPlanVariables>;
}
export const upgradeUserPlanRef: UpgradeUserPlanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upgradeUserPlanRef:
```typescript
const name = upgradeUserPlanRef.operationName;
console.log(name);
```

### Variables
The `UpgradeUserPlan` mutation requires an argument of type `UpgradeUserPlanVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpgradeUserPlanVariables {
  userId: User_Key;
  plan: PlanType;
  name: string;
  tokens: number;
  billingCycle?: string | null;
  expiresAt?: TimestampString | null;
}
```
### Return Type
Recall that executing the `UpgradeUserPlan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpgradeUserPlanData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpgradeUserPlanData {
  userPlan_insert: UserPlan_Key;
}
```
### Using `UpgradeUserPlan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upgradeUserPlan, UpgradeUserPlanVariables } from '@image-to-excel/dataconnect';

// The `UpgradeUserPlan` mutation requires an argument of type `UpgradeUserPlanVariables`:
const upgradeUserPlanVars: UpgradeUserPlanVariables = {
  userId: ..., 
  plan: ..., 
  name: ..., 
  tokens: ..., 
  billingCycle: ..., // optional
  expiresAt: ..., // optional
};

// Call the `upgradeUserPlan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upgradeUserPlan(upgradeUserPlanVars);
// Variables can be defined inline as well.
const { data } = await upgradeUserPlan({ userId: ..., plan: ..., name: ..., tokens: ..., billingCycle: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upgradeUserPlan(dataConnect, upgradeUserPlanVars);

console.log(data.userPlan_insert);

// Or, you can use the `Promise` API.
upgradeUserPlan(upgradeUserPlanVars).then((response) => {
  const data = response.data;
  console.log(data.userPlan_insert);
});
```

### Using `UpgradeUserPlan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upgradeUserPlanRef, UpgradeUserPlanVariables } from '@image-to-excel/dataconnect';

// The `UpgradeUserPlan` mutation requires an argument of type `UpgradeUserPlanVariables`:
const upgradeUserPlanVars: UpgradeUserPlanVariables = {
  userId: ..., 
  plan: ..., 
  name: ..., 
  tokens: ..., 
  billingCycle: ..., // optional
  expiresAt: ..., // optional
};

// Call the `upgradeUserPlanRef()` function to get a reference to the mutation.
const ref = upgradeUserPlanRef(upgradeUserPlanVars);
// Variables can be defined inline as well.
const ref = upgradeUserPlanRef({ userId: ..., plan: ..., name: ..., tokens: ..., billingCycle: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upgradeUserPlanRef(dataConnect, upgradeUserPlanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userPlan_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userPlan_insert);
});
```

## DeductToken
You can execute the `DeductToken` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
deductToken(vars: DeductTokenVariables): MutationPromise<DeductTokenData, DeductTokenVariables>;

interface DeductTokenRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeductTokenVariables): MutationRef<DeductTokenData, DeductTokenVariables>;
}
export const deductTokenRef: DeductTokenRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deductToken(dc: DataConnect, vars: DeductTokenVariables): MutationPromise<DeductTokenData, DeductTokenVariables>;

interface DeductTokenRef {
  ...
  (dc: DataConnect, vars: DeductTokenVariables): MutationRef<DeductTokenData, DeductTokenVariables>;
}
export const deductTokenRef: DeductTokenRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deductTokenRef:
```typescript
const name = deductTokenRef.operationName;
console.log(name);
```

### Variables
The `DeductToken` mutation requires an argument of type `DeductTokenVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeductTokenVariables {
  userPlanId: UserPlan_Key;
  remaining: number;
}
```
### Return Type
Recall that executing the `DeductToken` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeductTokenData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeductTokenData {
  userPlan_update?: UserPlan_Key | null;
}
```
### Using `DeductToken`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deductToken, DeductTokenVariables } from '@image-to-excel/dataconnect';

// The `DeductToken` mutation requires an argument of type `DeductTokenVariables`:
const deductTokenVars: DeductTokenVariables = {
  userPlanId: ..., 
  remaining: ..., 
};

// Call the `deductToken()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deductToken(deductTokenVars);
// Variables can be defined inline as well.
const { data } = await deductToken({ userPlanId: ..., remaining: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deductToken(dataConnect, deductTokenVars);

console.log(data.userPlan_update);

// Or, you can use the `Promise` API.
deductToken(deductTokenVars).then((response) => {
  const data = response.data;
  console.log(data.userPlan_update);
});
```

### Using `DeductToken`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deductTokenRef, DeductTokenVariables } from '@image-to-excel/dataconnect';

// The `DeductToken` mutation requires an argument of type `DeductTokenVariables`:
const deductTokenVars: DeductTokenVariables = {
  userPlanId: ..., 
  remaining: ..., 
};

// Call the `deductTokenRef()` function to get a reference to the mutation.
const ref = deductTokenRef(deductTokenVars);
// Variables can be defined inline as well.
const ref = deductTokenRef({ userPlanId: ..., remaining: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deductTokenRef(dataConnect, deductTokenVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userPlan_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userPlan_update);
});
```

## CancelUserPlan
You can execute the `CancelUserPlan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
cancelUserPlan(vars: CancelUserPlanVariables): MutationPromise<CancelUserPlanData, CancelUserPlanVariables>;

interface CancelUserPlanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CancelUserPlanVariables): MutationRef<CancelUserPlanData, CancelUserPlanVariables>;
}
export const cancelUserPlanRef: CancelUserPlanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
cancelUserPlan(dc: DataConnect, vars: CancelUserPlanVariables): MutationPromise<CancelUserPlanData, CancelUserPlanVariables>;

interface CancelUserPlanRef {
  ...
  (dc: DataConnect, vars: CancelUserPlanVariables): MutationRef<CancelUserPlanData, CancelUserPlanVariables>;
}
export const cancelUserPlanRef: CancelUserPlanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the cancelUserPlanRef:
```typescript
const name = cancelUserPlanRef.operationName;
console.log(name);
```

### Variables
The `CancelUserPlan` mutation requires an argument of type `CancelUserPlanVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CancelUserPlanVariables {
  userPlanId: UserPlan_Key;
  cancelReason?: string | null;
}
```
### Return Type
Recall that executing the `CancelUserPlan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CancelUserPlanData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CancelUserPlanData {
  userPlan_update?: UserPlan_Key | null;
}
```
### Using `CancelUserPlan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, cancelUserPlan, CancelUserPlanVariables } from '@image-to-excel/dataconnect';

// The `CancelUserPlan` mutation requires an argument of type `CancelUserPlanVariables`:
const cancelUserPlanVars: CancelUserPlanVariables = {
  userPlanId: ..., 
  cancelReason: ..., // optional
};

// Call the `cancelUserPlan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await cancelUserPlan(cancelUserPlanVars);
// Variables can be defined inline as well.
const { data } = await cancelUserPlan({ userPlanId: ..., cancelReason: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await cancelUserPlan(dataConnect, cancelUserPlanVars);

console.log(data.userPlan_update);

// Or, you can use the `Promise` API.
cancelUserPlan(cancelUserPlanVars).then((response) => {
  const data = response.data;
  console.log(data.userPlan_update);
});
```

### Using `CancelUserPlan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, cancelUserPlanRef, CancelUserPlanVariables } from '@image-to-excel/dataconnect';

// The `CancelUserPlan` mutation requires an argument of type `CancelUserPlanVariables`:
const cancelUserPlanVars: CancelUserPlanVariables = {
  userPlanId: ..., 
  cancelReason: ..., // optional
};

// Call the `cancelUserPlanRef()` function to get a reference to the mutation.
const ref = cancelUserPlanRef(cancelUserPlanVars);
// Variables can be defined inline as well.
const ref = cancelUserPlanRef({ userPlanId: ..., cancelReason: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = cancelUserPlanRef(dataConnect, cancelUserPlanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userPlan_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userPlan_update);
});
```

## LogUsage
You can execute the `LogUsage` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
logUsage(vars: LogUsageVariables): MutationPromise<LogUsageData, LogUsageVariables>;

interface LogUsageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: LogUsageVariables): MutationRef<LogUsageData, LogUsageVariables>;
}
export const logUsageRef: LogUsageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
logUsage(dc: DataConnect, vars: LogUsageVariables): MutationPromise<LogUsageData, LogUsageVariables>;

interface LogUsageRef {
  ...
  (dc: DataConnect, vars: LogUsageVariables): MutationRef<LogUsageData, LogUsageVariables>;
}
export const logUsageRef: LogUsageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the logUsageRef:
```typescript
const name = logUsageRef.operationName;
console.log(name);
```

### Variables
The `LogUsage` mutation requires an argument of type `LogUsageVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface LogUsageVariables {
  userId: User_Key;
  pagesUsed: number;
  fileName?: string | null;
}
```
### Return Type
Recall that executing the `LogUsage` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `LogUsageData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface LogUsageData {
  usageLog_insert: UsageLog_Key;
}
```
### Using `LogUsage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, logUsage, LogUsageVariables } from '@image-to-excel/dataconnect';

// The `LogUsage` mutation requires an argument of type `LogUsageVariables`:
const logUsageVars: LogUsageVariables = {
  userId: ..., 
  pagesUsed: ..., 
  fileName: ..., // optional
};

// Call the `logUsage()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await logUsage(logUsageVars);
// Variables can be defined inline as well.
const { data } = await logUsage({ userId: ..., pagesUsed: ..., fileName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await logUsage(dataConnect, logUsageVars);

console.log(data.usageLog_insert);

// Or, you can use the `Promise` API.
logUsage(logUsageVars).then((response) => {
  const data = response.data;
  console.log(data.usageLog_insert);
});
```

### Using `LogUsage`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, logUsageRef, LogUsageVariables } from '@image-to-excel/dataconnect';

// The `LogUsage` mutation requires an argument of type `LogUsageVariables`:
const logUsageVars: LogUsageVariables = {
  userId: ..., 
  pagesUsed: ..., 
  fileName: ..., // optional
};

// Call the `logUsageRef()` function to get a reference to the mutation.
const ref = logUsageRef(logUsageVars);
// Variables can be defined inline as well.
const ref = logUsageRef({ userId: ..., pagesUsed: ..., fileName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = logUsageRef(dataConnect, logUsageVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.usageLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.usageLog_insert);
});
```

## UpdateUserPlan
You can execute the `UpdateUserPlan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateUserPlan(vars: UpdateUserPlanVariables): MutationPromise<UpdateUserPlanData, UpdateUserPlanVariables>;

interface UpdateUserPlanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserPlanVariables): MutationRef<UpdateUserPlanData, UpdateUserPlanVariables>;
}
export const updateUserPlanRef: UpdateUserPlanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserPlan(dc: DataConnect, vars: UpdateUserPlanVariables): MutationPromise<UpdateUserPlanData, UpdateUserPlanVariables>;

interface UpdateUserPlanRef {
  ...
  (dc: DataConnect, vars: UpdateUserPlanVariables): MutationRef<UpdateUserPlanData, UpdateUserPlanVariables>;
}
export const updateUserPlanRef: UpdateUserPlanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserPlanRef:
```typescript
const name = updateUserPlanRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserPlan` mutation requires an argument of type `UpdateUserPlanVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserPlanVariables {
  userId: User_Key;
  plan: PlanType;
}
```
### Return Type
Recall that executing the `UpdateUserPlan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserPlanData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserPlanData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUserPlan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserPlan, UpdateUserPlanVariables } from '@image-to-excel/dataconnect';

// The `UpdateUserPlan` mutation requires an argument of type `UpdateUserPlanVariables`:
const updateUserPlanVars: UpdateUserPlanVariables = {
  userId: ..., 
  plan: ..., 
};

// Call the `updateUserPlan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserPlan(updateUserPlanVars);
// Variables can be defined inline as well.
const { data } = await updateUserPlan({ userId: ..., plan: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserPlan(dataConnect, updateUserPlanVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUserPlan(updateUserPlanVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUserPlan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserPlanRef, UpdateUserPlanVariables } from '@image-to-excel/dataconnect';

// The `UpdateUserPlan` mutation requires an argument of type `UpdateUserPlanVariables`:
const updateUserPlanVars: UpdateUserPlanVariables = {
  userId: ..., 
  plan: ..., 
};

// Call the `updateUserPlanRef()` function to get a reference to the mutation.
const ref = updateUserPlanRef(updateUserPlanVars);
// Variables can be defined inline as well.
const ref = updateUserPlanRef({ userId: ..., plan: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserPlanRef(dataConnect, updateUserPlanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

