'use client';

import { useEffect, useState } from 'react';
import { fetchSplit } from '@/lib/api';

export default function TestSplitPage() {
  // Estado para guardar el split que viene del backend
  const [split, setSplit] = useState<any>(null);
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // Reemplazá con un ID real de tu backend
  const splitId = "9dc6b8df-9394-4d9c-80f4-606500ca03a2";

  // useEffect se ejecuta cuando el componente se monta
  useEffect(() => {
    fetchSplit(splitId)
      .then(setSplit)           // Si todo sale bien, guardamos el split
      .catch(err => setError(err.message)); // Si falla, guardamos el error
  }, [splitId]);

  // Mostrar mensaje de error si lo hubo
  if (error) return <p>Error: {error}</p>;
  // Mostrar loading mientras llega la data
  if (!split) return <p>Cargando...</p>;

  // Renderizar la info del split
  return (
    <div className="p-4">
        <h1>Split {split.id}</h1>
        <p>Total: {split.totalAmount}</p>
        <p>Estado: {split.status}</p>
    </div>
  );
}
