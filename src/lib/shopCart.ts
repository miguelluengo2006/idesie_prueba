'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { MAX_CART_ITEMS } from '@/lib/shop';

const KEY = 'idesie_shop_cart';
const EVENT = 'idesie-shop-cart';
const EMPTY: string[] = [];
let cache: { raw: string | null; slugs: string[] } = { raw: null, slugs: EMPTY };

/** Solo guardamos identificadores: el precio siempre lo decide el servidor al calcular el pedido. */
function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cache.slugs;
  }
  if (raw === cache.raw) return cache.slugs;
  let slugs = EMPTY;
  try {
    const parsed = JSON.parse(raw || '[]');
    if (Array.isArray(parsed)) slugs = [...new Set(parsed.filter((s): s is string => typeof s === 'string' && /^[a-z0-9-]{1,80}$/.test(s)))].slice(0, MAX_CART_ITEMS);
  } catch {
    /* contenido corrupto: se trata como carrito vacío */
  }
  cache = { raw, slugs };
  return slugs;
}

function write(slugs: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    cache = { raw: JSON.stringify(slugs), slugs };
  }
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
};

export function clearShopCart() {
  write([]);
}

export function useShopCart() {
  const slugs = useSyncExternalStore(subscribe, read, () => EMPTY);
  const add = useCallback((slug: string) => {
    const cur = read();
    if (!cur.includes(slug)) write([...cur, slug].slice(0, MAX_CART_ITEMS));
  }, []);
  const remove = useCallback((slug: string) => write(read().filter((s) => s !== slug)), []);
  return { slugs, count: slugs.length, add, remove, has: (slug: string) => slugs.includes(slug) };
}
