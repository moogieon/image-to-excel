# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, createFreeUserPlan, upgradeUserPlan, deductToken, cancelUserPlan, logUsage, updateUserPlan, getUserWithPlan, getTodayUsage, getUsageHistory } from '@image-to-excel/dataconnect';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation CreateFreeUserPlan:  For variables, look at type CreateFreeUserPlanVars in ../index.d.ts
const { data } = await CreateFreeUserPlan(dataConnect, createFreeUserPlanVars);

// Operation UpgradeUserPlan:  For variables, look at type UpgradeUserPlanVars in ../index.d.ts
const { data } = await UpgradeUserPlan(dataConnect, upgradeUserPlanVars);

// Operation DeductToken:  For variables, look at type DeductTokenVars in ../index.d.ts
const { data } = await DeductToken(dataConnect, deductTokenVars);

// Operation CancelUserPlan:  For variables, look at type CancelUserPlanVars in ../index.d.ts
const { data } = await CancelUserPlan(dataConnect, cancelUserPlanVars);

// Operation LogUsage:  For variables, look at type LogUsageVars in ../index.d.ts
const { data } = await LogUsage(dataConnect, logUsageVars);

// Operation UpdateUserPlan:  For variables, look at type UpdateUserPlanVars in ../index.d.ts
const { data } = await UpdateUserPlan(dataConnect, updateUserPlanVars);

// Operation GetUserWithPlan:  For variables, look at type GetUserWithPlanVars in ../index.d.ts
const { data } = await GetUserWithPlan(dataConnect, getUserWithPlanVars);

// Operation GetTodayUsage:  For variables, look at type GetTodayUsageVars in ../index.d.ts
const { data } = await GetTodayUsage(dataConnect, getTodayUsageVars);

// Operation GetUsageHistory:  For variables, look at type GetUsageHistoryVars in ../index.d.ts
const { data } = await GetUsageHistory(dataConnect, getUsageHistoryVars);


```