import type { APIRoute } from 'astro';
import { verifyToken, dcQuery, dcMutation, getAdminAuth } from '../../lib/admin';
import type { GetUserWithPlanData, GetTodayUsageData, CreateUserData } from '../../lib/dataconnect-sdk';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization');
    const rawToken = authHeader?.slice(7); // Bearer token

    let uid: string;
    try {
      uid = await verifyToken(authHeader);
    } catch {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 유저 조회 (없으면 자동 생성)
    let userData = await dcQuery<GetUserWithPlanData>('GetUserWithPlan', { uid }, rawToken);
    let user = userData.users[0];

    if (!user) {
      const authUser = await getAdminAuth().getUser(uid);
      const createResult = await dcMutation<CreateUserData>('CreateUser', {
        uid,
        email: authUser.email || '',
        displayName: authUser.displayName || null,
      }, rawToken);
      const userId = createResult.user_insert;
      if (userId) {
        await dcMutation('CreateFreeUserPlan', { userId });
      }
      userData = await dcQuery<GetUserWithPlanData>('GetUserWithPlan', { uid }, rawToken);
      user = userData.users[0];
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const activePlan = user.userPlans_on_user.find(p => p.status === 'ACTIVE');

    // Free 플랜이면 오늘 사용량도 조회
    let todayUsed = 0;
    if (user.plan === 'FREE' || !activePlan) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const usageData = await dcQuery<GetTodayUsageData>('GetTodayUsage', {
        uid,
        today: today.toISOString(),
      }, rawToken);
      todayUsed = usageData.usageLogs.reduce((sum, log) => sum + log.pagesUsed, 0);
    }

    return new Response(JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      plan: user.plan,
      planName: activePlan?.name || 'Free',
      tokensRemaining: activePlan?.tokensRemaining ?? 0,
      tokensTotal: activePlan?.tokensTotal ?? 3,
      todayUsed,
      billingCycle: activePlan?.billingCycle || null,
      startedAt: activePlan?.startedAt || null,
      expiresAt: activePlan?.expiresAt || null,
      canceledAt: activePlan?.canceledAt || null,
      memberSince: user.createdAt,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
