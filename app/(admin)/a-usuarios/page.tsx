import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Gestión de Usuarios | CarGA',
  description: 'Administrá los usuarios registrados en CarGA.',
};

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Gestión de Usuarios</h1>
      <Card>
        <p className="text-gray-600">
          Acá vas a poder ver, editar y gestionar todos los usuarios
          registrados — transportistas y cargadores.
        </p>
        <p className="mt-4 text-sm font-medium text-gold">
          Próximamente
        </p>
      </Card>
    </div>
  );
}
