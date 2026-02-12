'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Download, Share2 } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-6">
      {/* Animación de éxito */}
      <div className="mb-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
      </div>

      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        ¡Pago Exitoso!
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Tu pago fue procesado correctamente
      </p>

      {/* Detalles del pago */}
      <Card className="w-full max-w-md mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Monto:</span>
            <span className="font-semibold">$1,667 ARS</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Método:</span>
            <span className="font-semibold">Freighter (USDC)</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Fee:</span>
            <span className="font-semibold text-green-600">$0.02</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Tiempo:</span>
            <span className="font-semibold">3.2 segundos</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">TX Hash:</span>
            <span className="font-mono text-xs text-blue-600">a7f3...9d2b</span>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="w-full max-w-md space-y-3 mb-8">
        <Button variant="outline" className="w-full" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" />
          Descargar Comprobante
        </Button>
        
        <Button variant="outline" className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          Compartir
        </Button>
      </div>

      {/* Botón volver */}
      <Link href="/" className="w-full max-w-md">
        <Button className="w-full bg-[#006B7D] hover:bg-[#005563]">
          Volver al Inicio
        </Button>
      </Link>

      {/* Footer info */}
      <p className="text-xs text-gray-500 text-center mt-8">
        Powered by Stellar · Migo Protocol
      </p>
    </div>
  );
}