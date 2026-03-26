import type { Metadata } from 'next';
import { PerfilTransportistaClient } from './perfil-transportista-client';

export const metadata: Metadata = {
  title: 'Mi Perfil | CarGA',
  description: 'Gestioná tu perfil de transportista en CarGA.',
};

export default function TransportistaPerfilPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Mi Perfil</h1>
      <PerfilTransportistaClient />
    </div>
  );
}
