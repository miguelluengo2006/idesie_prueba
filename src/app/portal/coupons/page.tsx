'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Shuffle, Tag, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { crm } from '@/components/portal/crmApi';
import Modal from '@/components/portal/Modal';
import { EmptyState, Page, Panel, Skeleton } from '@/components/portal/ui';
import { DISCOUNT_TYPES, describeCoupon, type DiscountType, type ShopCoupon, type ShopProduct } from '@/lib/shop';
import { cn } from '@/lib/utils';

type Coupon = ShopCoupon & { uses: number };

const inputCls = 'w-full min-h-11 rounded-xl bg-white/[0.05] border border-[var(--portal-line-strong)] px-3.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-[var(--signal)]';
const lblCls = 'block text-xs font-medium text-white/60 mb-1.5';
const toLocalInput = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

const randomCode = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
};

function CouponForm({ initial, products, token, onDone, onClose }: { initial: Coupon | null; products: ShopProduct[]; token?: string; onDone: () => void; onClose: () => void }) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [type, setType] = useState<DiscountType>(initial?.discountType ?? 'percent');
  const [value, setValue] = useState(initial ? String(initial.discountValue) : '');
  const [appliesTo, setAppliesTo] = useState<string[]>(initial?.appliesTo ?? []);
  const [validFrom, setValidFrom] = useState(toLocalInput(initial?.validFrom ?? null));
  const [validUntil, setValidUntil] = useState(toLocalInput(initial?.validUntil ?? null));
  const [maxUses, setMaxUses] = useState(initial?.maxUses != null ? String(initial.maxUses) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = { code, description, discountType: type, discountValue: Number(value.replace(',', '.')), appliesTo, validFrom: validFrom || null, validUntil: validUntil || null, maxUses: maxUses === '' ? null : Number(maxUses) };
      if (initial) await crm(token, `/api/shop/coupons/${initial.id}`, { method: 'PATCH', body });
      else await crm(token, '/api/shop/coupons', { method: 'POST', body });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
      setSaving(false);
    }
  };

  const unit = type === 'percent' ? '%' : '€';
  return (
    <Modal title={initial ? 'Editar cupón' : 'Nuevo cupón'} onClose={onClose} wide>
      <form onSubmit={save} className="grid gap-4">
        <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end">
          <div>
            <label className={lblCls} htmlFor="cp-code">Código</label>
            <input id="cp-code" className={cn(inputCls, 'uppercase tracking-wider font-mono')} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BIENVENIDA10" required />
          </div>
          <button type="button" onClick={() => setCode(randomCode())} className="min-h-11 px-4 rounded-xl border border-[var(--portal-line-strong)] text-sm text-white/70 hover:text-white inline-flex items-center gap-2 cursor-pointer">
            <Shuffle className="w-4 h-4" aria-hidden="true" /> Generar
          </button>
        </div>
        <div>
          <label className={lblCls} htmlFor="cp-desc">Nota interna (opcional)</label>
          <input id="cp-desc" className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Campaña de otoño, alumnos de la promoción…" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lblCls} htmlFor="cp-type">Tipo de descuento</label>
            <select id="cp-type" className={inputCls} value={type} onChange={(e) => setType(e.target.value as DiscountType)}>
              {(Object.keys(DISCOUNT_TYPES) as DiscountType[]).map((t) => <option key={t} value={t}>{DISCOUNT_TYPES[t]}</option>)}
            </select>
          </div>
          <div>
            <label className={lblCls} htmlFor="cp-val">{type === 'fixed_price' ? 'Precio final (€)' : `Valor (${unit})`}</label>
            <input id="cp-val" className={inputCls} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'percent' ? '10' : '100'} required />
          </div>
        </div>
        <fieldset>
          <legend className={lblCls}>Productos donde vale <span className="text-white/40">(ninguno marcado = todos)</span></legend>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {products.map((p) => (
              <label key={p.slug} className="flex items-center gap-2.5 min-h-10 rounded-xl border border-[var(--portal-line)] px-3 text-sm text-white/80 cursor-pointer">
                <input type="checkbox" checked={appliesTo.includes(p.slug)} onChange={(e) => setAppliesTo((a) => (e.target.checked ? [...a, p.slug] : a.filter((s) => s !== p.slug)))} />
                {p.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={lblCls} htmlFor="cp-from">Válido desde</label>
            <input id="cp-from" type="datetime-local" className={inputCls} value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
          </div>
          <div>
            <label className={lblCls} htmlFor="cp-until">Válido hasta</label>
            <input id="cp-until" type="datetime-local" className={inputCls} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <div>
            <label className={lblCls} htmlFor="cp-max">Máximo de usos</label>
            <input id="cp-max" inputMode="numeric" className={inputCls} value={maxUses} onChange={(e) => setMaxUses(e.target.value.replace(/\D/g, ''))} placeholder="Sin límite" />
          </div>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-500/15 text-red-300 px-4 py-3 text-sm">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-11 px-5 rounded-xl text-sm text-white/70 hover:text-white cursor-pointer">Cancelar</button>
          <button type="submit" disabled={saving} className="portal-cta min-h-11 px-6 rounded-xl text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer">
            {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />} {initial ? 'Guardar' : 'Crear cupón'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CouponsPage() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([crm<{ coupons: Coupon[] }>(token, '/api/shop/coupons'), crm<{ products: ShopProduct[] }>(token, '/api/shop/products')]);
      setCoupons(c.coupons);
      setProducts(p.products);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar');
    }
  }, [token]);
  useEffect(() => { if (token) load(); }, [token, load]);

  const toggle = async (c: Coupon) => {
    try { await crm(token, `/api/shop/coupons/${c.id}`, { method: 'PATCH', body: { active: !c.active } }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cambiar'); }
  };
  const remove = async (c: Coupon) => {
    if (!window.confirm(`¿Borrar el cupón ${c.code}?`)) return;
    try { await crm(token, `/api/shop/coupons/${c.id}`, { method: 'DELETE' }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo borrar'); }
  };

  const state = (c: Coupon) => {
    const now = Date.now();
    if (!c.active) return { label: 'Desactivado', cls: 'text-white/45 bg-white/[0.06]' };
    if (c.validUntil && new Date(c.validUntil).getTime() < now) return { label: 'Caducado', cls: 'text-amber-300 bg-amber-400/10' };
    if (c.validFrom && new Date(c.validFrom).getTime() > now) return { label: 'Programado', cls: 'text-sky-300 bg-sky-400/10' };
    if (c.maxUses != null && c.uses >= c.maxUses) return { label: 'Agotado', cls: 'text-amber-300 bg-amber-400/10' };
    return { label: 'Activo', cls: 'text-emerald-300 bg-emerald-400/10' };
  };
  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

  return (
    <Page
      title="Cupones"
      subtitle="Códigos de descuento para la tienda"
      actions={<button onClick={() => setEditing('new')} className="portal-cta min-h-10 px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"><Plus className="w-4 h-4" aria-hidden="true" /> Nuevo cupón</button>}
    >
      {error && <p role="alert" className="rounded-xl bg-red-500/15 text-red-300 px-4 py-3 text-sm">{error}</p>}
      <Panel>
        {!coupons ? (
          <div className="grid gap-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
        ) : coupons.length === 0 ? (
          <EmptyState icon={<Tag className="w-6 h-6" />} title="Aún no hay cupones" text="Crea el primero y compártelo: se aplica en el pago de la tienda." action={<button onClick={() => setEditing('new')} className="portal-cta min-h-10 px-5 rounded-xl text-sm font-semibold cursor-pointer">Crear cupón</button>} />
        ) : (
          <ul className="divide-y divide-[var(--portal-line)]">
            {coupons.map((c) => {
              const s = state(c);
              return (
                <li key={c.id} className="py-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button onClick={() => setEditing(c)} className="text-left min-w-0 flex-1 basis-56 cursor-pointer">
                    <span className="font-mono font-semibold tracking-wider">{c.code}</span>
                    <span className="block text-xs text-white/50 mt-0.5 truncate">{describeCoupon(c)}{c.description ? ` · ${c.description}` : ''}</span>
                  </button>
                  <div className="text-xs text-white/55 tabular-nums">
                    <span className="text-white/85 font-medium">{c.uses}{c.maxUses != null ? ` / ${c.maxUses}` : ''}</span> usos
                    <span className="block">{fmt(c.validFrom)} → {fmt(c.validUntil)}</span>
                  </div>
                  <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', s.cls)}>{s.label}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggle(c)} className="min-h-9 px-3 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/[0.06] cursor-pointer">{c.active ? 'Desactivar' : 'Activar'}</button>
                    <button onClick={() => remove(c)} aria-label={`Borrar ${c.code}`} className="w-9 h-9 rounded-lg flex items-center justify-center text-white/45 hover:text-red-300 hover:bg-white/[0.06] cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      {editing && <CouponForm initial={editing === 'new' ? null : editing} products={products} token={token} onClose={() => setEditing(null)} onDone={() => { setEditing(null); load(); }} />}
    </Page>
  );
}
