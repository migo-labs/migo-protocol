// app/page.tsx

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Logo Migo */}
      <div className="mb-8">
        <Image
          src="/migo-logo.png"
          alt="Migo - Friends share, Migo cares"
          width={300}
          height={120}
          priority
          className="w-auto h-auto max-w-sm"
        />
      </div>

      {/* Botones */}
      <div className="w-full max-w-xs space-y-3">
        {/* Botón principal - Connect Wallet */}
        <Link href="/wallet" className="block">
          <Button 
            className="w-full bg-[#006B7D] hover:bg-[#005563] text-white py-6 rounded-full text-lg font-medium shadow-lg"
          >
            Conectar Wallet
          </Button>
        </Link>
        
        {/* Botón secundario - Sin wallet */}
        <Link href="/create" className="block">
          <Button 
            variant="outline"
            className="w-full border-2 border-[#006B7D] text-[#006B7D] hover:bg-[#006B7D] hover:text-white py-6 rounded-full text-lg font-medium"
          >
            Continuar sin Wallet
          </Button>
        </Link>
      </div>

      {/* Info adicional */}
      <p className="text-xs text-gray-400 mt-8 text-center">
        Crypto o tradicional - tú eliges
      </p>
    </div>
  );
}