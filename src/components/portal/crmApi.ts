/** Llamada a la API del panel con la sesión actual. Lanza un Error con el mensaje del servidor si algo falla. */
export async function crm<T = any>(
  token: string | undefined,
  path: string,
  init: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown } = {}
): Promise<T> {
  if (!token) throw new Error('La sesión ha caducado. Vuelve a entrar.');
  const res = await fetch(path, {
    method: init.method || 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Algo ha fallado. Inténtalo de nuevo.');
  return data as T;
}
