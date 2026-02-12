'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function CreateSplitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  
  const [amount, setAmount] = useState("");
  const [participants, setParticipants] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/split/demo/pay?source=${source || 'unknown'}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8">
      {/* Header con back button - MISMA ESTRUCTURA QUE /wallet */}
      <div className="w-full max-w-md mb-6">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
          ← Volver
        </Link>
      </div>

      {/* Logo pequeño arriba */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-[#00D9FF] rounded-full flex items-center justify-center">
          <span className="text-3xl">😊</span>
        </div>
      </div>

      {/* Alert si viene sin wallet */}
      {source === 'no-wallet' && (
        <Card className="w-full max-w-md mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Pagarás con métodos tradicionales</p>
                <p className="text-xs text-blue-700">
                  Al generar el QR, solo verás opciones de tarjeta/Mercado Pago.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* Monto a cobrar */}
        <div className="space-y-2">
          <Label className="text-[#FFB800] text-lg font-medium">
            Monto a cobrar:
          </Label>
          <Input
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-lg border-2 rounded-xl"
            required
          />
        </div>

        {/* Dividido entre */}
        <div className="space-y-2">
          <Label className="text-[#FFB800] text-lg font-medium">
            Dividido entre:
          </Label>
          <Input
            type="number"
            placeholder="3"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="h-14 text-lg border-2 rounded-xl"
            required
          />
        </div>

        {/* Botón Generar QR */}
        <Button 
          type="submit"
          className="w-full bg-[#006B7D] hover:bg-[#005563] text-white py-6 rounded-full text-lg font-medium mt-8"
        >
          Generar Qr
        </Button>
      </form>

      {/* Emails abajo */}
      <div className="mt-12 text-sm text-gray-600 space-y-1 text-center">
        <p>arasantamaria30@gmail.com</p>
        <p className="underline">beverly.jlgc@gmail.com</p>
        <p>tamaraov246@gmail.com</p>
      </div>
    </div>
  );
}