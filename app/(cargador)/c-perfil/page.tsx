import type { Metadata } from 'next';
import { PerfilCargadorClient } from './perfil-cargador-client';

export const metadata: Metadata = {
  title: 'Mi Perfil | CarGA',
  description: 'Gestioná tu perfil de cargador en CarGA.',
};

export default function CargadorPerfilPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Mi Perfil</h1>
      <PerfilCargadorClient />
    </div>
  );
}
