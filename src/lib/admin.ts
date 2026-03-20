import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

const PROJECT_ID = 'image-to-excel-628ee';

function getServiceAccountCredential() {
  const clientEmail = import.meta.env.FIREBASE_SA_CLIENT_EMAIL;
  const privateKey = import.meta.env.FIREBASE_SA_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return cert({
      projectId: PROJECT_ID,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });
  }
  return undefined;
}

let _adminApp: App | undefined;

function getAdminApp(): App {
  if (!_adminApp) {
    if (getApps().length > 0) {
      _adminApp = getApps()[0];
    } else {
      const credential = getServiceAccountCredential();
      _adminApp = credential
        ? initializeApp({ credential })
        : initializeApp({ projectId: PROJECT_ID });
    }
  }
  return _adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export async function verifyToken(authHeader: string | null): Promise<string> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }
  const token = authHeader.slice(7);
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded.uid;
}

// Data Connect REST API
const DC_BASE = 'https://firebasedataconnect.googleapis.com/v1beta';
const LOCATION = 'asia-northeast1';
const SERVICE = 'image-to-excel';
const CONNECTOR = 'default';

async function getAccessToken(): Promise<string> {
  const { GoogleAuth } = await import('google-auth-library');
  const clientEmail = import.meta.env.FIREBASE_SA_CLIENT_EMAIL;
  const privateKey = import.meta.env.FIREBASE_SA_PRIVATE_KEY;

  const auth = (clientEmail && privateKey)
    ? new GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })
    : new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token!;
}

export async function dcQuery<T>(operationName: string, variables: Record<string, unknown>): Promise<T> {
  const accessToken = await getAccessToken();
  const url = `${DC_BASE}/projects/${PROJECT_ID}/locations/${LOCATION}/services/${SERVICE}/connectors/${CONNECTOR}:executeQuery`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ operationName, variables }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Data Connect query error: ${err}`);
  }

  const data = await res.json() as { data: T };
  return data.data;
}

export async function dcMutation<T>(operationName: string, variables: Record<string, unknown>): Promise<T> {
  const accessToken = await getAccessToken();
  const url = `${DC_BASE}/projects/${PROJECT_ID}/locations/${LOCATION}/services/${SERVICE}/connectors/${CONNECTOR}:executeMutation`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ operationName, variables }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Data Connect mutation error: ${err}`);
  }

  const data = await res.json() as { data: T };
  return data.data;
}
