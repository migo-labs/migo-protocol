'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// ... resto de imports

export default function PaymentOptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source'); // 'no-wallet', 'has-wallet', o null
  
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const splitAmount = 1667;
  const splitId = 'demo-123';
  
  // Determinar si mostrar opciones Web3
  const showWeb3Options = source !== 'no-wallet';
  
  // ... resto del código
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ... header ... */}
      
      <div className="px-6 py-6 max-w-2xl mx-auto">
        {/* ... monto a pagar ... */}
        
        {/* Opciones Web3 - SOLO si tiene wallet */}
        {showWeb3Options && (
          <div className="mb-8">
            {/* ... código de wallets Web3 que ya tienes ... */}
          </div>
        )}
        
        {/* Divisor - SOLO si muestra Web3 */}
        {showWeb3Options && (
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">O PAGAR CON</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
        )}
        
        {/* Opciones Web2 - SIEMPRE mostrar */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            💳 {showWeb3Options ? 'Métodos Tradicionales' : 'Métodos de Pago'}
          </h2>
          
          {/* ... resto del código Web2 ... */}
        </div>
      </div>
    </div>
  );
}