/**
 * Puerta oculta del CRM. Sin la cookie `crm_gate`, /auth, /portal y las APIs de login responden 404 como si no
 * existieran. La cookie solo la da el enlace secreto /acceso/<CRM_ENTRY_KEY> (o un correo de acceso de un solo uso).
 *
 * Usa Web Crypto para poder correr en el middleware (Edge). Si CRM_ENTRY_KEY no está definida la puerta no se
 * aplica (así no te quedas fuera al desplegar antes de configurarla).
 */

export const GATE_COOKIE = 'crm_gate';
export const GATE_TTL_S = 60 * 60 * 24 * 30;
export const MIN_KEY_LENGTH = 24;

const enc = new TextEncoder();

export const gateKey = () => (process.env.CRM_ENTRY_KEY || '').trim();

/** ¿Hay una clave de entrada válida configurada? (una demasiado corta se ignora para no dar falsa seguridad) */
export const gateEnabled = () => gateKey().length >= MIN_KEY_LENGTH;

async function hmac(key: string, msg: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Valor de la cookie: caducidad en segundos + firma. No contiene la clave. */
export async function signGate(now = Date.now()): Promise<string> {
  const exp = Math.floor(now / 1000) + GATE_TTL_S;
  return `${exp}.${await hmac(gateKey(), `gate:${exp}`)}`;
}

export async function verifyGate(value: string | undefined | null, now = Date.now()): Promise<boolean> {
  if (!gateEnabled() || !value) return false;
  const [exp, sig] = value.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) * 1000 < now) return false;
  return safeEqual(sig, await hmac(gateKey(), `gate:${exp}`));
}

/** Rutas escondidas tras la puerta. Los enlaces de los correos (callback, confirm, invite) quedan fuera: llevan su propio token. */
const OPEN = ['/auth/callback', '/auth/confirm', '/auth/set-password', '/auth/auth-code-error'];

export function isGated(pathname: string): boolean {
  if (OPEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return false;
  return (
    pathname === '/auth' ||
    pathname.startsWith('/auth/') ||
    pathname === '/portal' ||
    pathname.startsWith('/portal/') ||
    pathname === '/api/auth-config' ||
    pathname === '/api/auth/login' ||
    pathname.startsWith('/api/auth/passkey')
  );
}

export const gateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: GATE_TTL_S,
};
