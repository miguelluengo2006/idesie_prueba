import { redirect } from 'next/navigation';

/** Los másteres viven ahora en /masters; se conserva la dirección antigua. */
export default function Page() {
  redirect('/masters');
}
