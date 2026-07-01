import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      error: 'Membership is disabled during the public test period.',
    }),
    {
      status: 410,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
