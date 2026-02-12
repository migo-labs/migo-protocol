// app/wallet/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Download, CreditCard, AlertCircle } from "lucide-react";

const wallets = [
  { 
    name: "Freighter", 
    icon: "🔷",
    description: "Browser extension wallet",
    installUrl: "https://www.freighter.app/",
    detectFunction: () => typeof window !== 'undefined' && window.freighter !== undefined
  },
  { 
    name: "LOBSTR", 
    icon: "🦞",
    description: "Mobile wallet for iOS & Android",
    installUrl: "https://lobstr.co/",
    detectFunction: () => typeof window !== 'undefined' && /Lobstr/i.test(navigator.userAgent)
  },
  { 
    name: "Albedo", 
    icon: "🌟",
    description: "Web-based wallet",
    installUrl: "https://albedo.link/",
    detectFunction: () => true // Albedo siempre disponible (web-based)
  },
  { 
    name: "xBull", 
    icon: "🐂",
    description: "Multi-platform wallet",
    installUrl: "https://xbull.app/",
    detectFunction: () => typeof window !== 'undefined' && window.xBullSDK !== undefined
  },
];

export default function WalletPage() {
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [hasAnyWallet, setHasAnyWallet] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Detectar wallets instaladas
    const detected = wallets.map(wallet => ({
      ...wallet,
      isInstalled: wallet.detectFunction()
    }));
    
    setAvailableWallets(detected);
    setHasAnyWallet(detected.some(w => w.isInstalled));
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Detectando wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8">
      {/* Header con back button */}
      <div className="w-full max-w-md mb-6">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
          ← Volver
        </Link>
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Connect to your favorite wallet
      </h1>
      
      <p className="text-sm text-gray-500 mb-8 text-center">
        Albedo, xBull, Freighter, LOBSTR
      </p>

      <div className="w-full max-w-md space-y-6">
        {/* Lista de wallets */}
        <div className="space-y-3">
          {availableWallets.map((wallet) => (
            wallet.isInstalled ? (
              // Wallet INSTALADA - Click para conectar
              <Link 
                key={wallet.name}
                href="/profile"
              >
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 px-6 justify-between border-2 border-green-200 hover:border-[#00D9FF] hover:bg-[#00D9FF]/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{wallet.icon}</span>
                    <div className="text-left">
                      <p className="font-semibold text-lg">{wallet.name}</p>
                      <p className="text-xs text-gray-500">{wallet.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                      ✓ Instalada
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Button>
              </Link>
            ) : (
              // Wallet NO INSTALADA - Click para instalar
              <Button
                key={wallet.name}
                variant="outline"
                className="w-full h-auto py-4 px-6 justify-between border-2 border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-80 transition-all"
                onClick={() => window.open(wallet.installUrl, '_blank')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl grayscale">{wallet.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-lg text-gray-600">{wallet.name}</p>
                    <p className="text-xs text-gray-400">{wallet.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Instalar</span>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </Button>
            )
          ))}
        </div>

        {/* Si NO tiene ninguna wallet instalada */}
        {!hasAnyWallet && (
          <>
            {/* Alert de ayuda */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">No tienes una wallet instalada</p>
                    <p className="text-blue-700 text-xs">
                      Click en cualquier wallet arriba para instalar (recomendado: fees bajos), 
                      o continúa con métodos tradicionales de pago.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Divisor */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">O CONTINUAR SIN WALLET</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Opción Web2 - Destacada */}
            <Link href="/create?source=no-wallet">
              <Button
                className="w-full h-auto py-6 px-6 bg-gradient-to-r from-[#FFB800] to-[#FF8C00] hover:opacity-90 text-white shadow-lg"
              >
                <div className="flex items-center gap-3 w-full">
                  <CreditCard className="w-6 h-6" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-lg">Continuar sin wallet</p>
                    <p className="text-xs opacity-90">Pagar con tarjeta o Mercado Pago</p>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </Link>

            {/* Comparación de fees */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-3">
                <p className="text-xs text-yellow-900">
                  <strong>💡 Tip:</strong> Con wallet crypto pagas ~$0.02 de fee. 
                  Con tarjeta/MP pagas 3-5% (~$50-80). ¡Tu eliges!
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Si SÍ tiene wallet pero quiere usar Web2 */}
        {hasAnyWallet && (
          <>
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">O</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <Link href="/create?source=has-wallet">
              <Button
                variant="outline"
                className="w-full py-4 border-2 hover:border-[#FFB800] hover:bg-[#FFB800]/5"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pagar con tarjeta/Mercado Pago
              </Button>
            </Link>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Powered by Stellar Network
      </p>
    </div>
  );
}