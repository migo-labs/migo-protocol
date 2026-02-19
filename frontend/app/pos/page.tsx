'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Users, DollarSign, QrCode as QrIcon, ArrowLeft } from 'lucide-react';

export default function POSPage() {
  const [step, setStep] = useState<'input' | 'qr'>('input');
  const [amount, setAmount] = useState('');
  const [people, setPeople] = useState('2');
  const [splitId, setSplitId] = useState('');

  const handleGenerate = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    const newSplitId = `split-${Date.now()}`;
    setSplitId(newSplitId);
    setStep('qr');
  };

  const handleReset = () => {
    setStep('input');
    setAmount('');
    setPeople('2');
    setSplitId('');
  };

  const shareAmount = amount && people ? (parseFloat(amount) / parseInt(people)).toFixed(2) : '0.00';
  const qrData = `https://migo.app/pay/${splitId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botón Volver */}
        <div className="mb-6">
            <Link href="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Volver</span>
            </button>
            </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
            <Image
            src="/migo-logo.png"
            alt="Migo POS"
            width={250}
            height={100}
            priority
            className="w-auto h-auto max-w-xs mx-auto mb-3"
            />
            <p className="text-sm text-[#FFB800] font-medium">Punto de Venta · Pagos Compartidos</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'input' ? (
            /* STEP 1: Input de Monto y Personas */
            <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-card p-8 space-y-8"
            >
            {/* Monto */}
            <div className="space-y-4">
                <label className="text-base text-white text-center font-medium block">
                Monto Total
                </label>
                <div className="relative">
                <div className="text-center pt-4 pb-2">
                    <span className="text-slate-500 text-6xl font-black mr-2">$</span>
                    <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setAmount(value);
                    }}
                    placeholder="0"
                    className="bg-transparent border-none outline-none text-9xl font-black text-white text-center inline-block min-w-[200px] tabular-nums"
                    style={{ width: `${Math.max(3, (amount || '0').length)}ch` }}
                    autoFocus
                    />
                </div>
                <div className="h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                </div>
            </div>

            {/* Personas */}
            <div className="space-y-4">
                <label className="text-base text-slate-300 flex items-center gap-2 font-medium">
                <Users className="w-5 h-5" />
                Cantidad de Personas
                </label>
                
                <div className="glass-card p-6 bg-slate-800/30">
                <div className="flex items-center justify-between gap-6">
                    {/* Botón MENOS */}
                    <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPeople((prev) => Math.max(2, parseInt(prev || '2') - 1).toString())}
                    className="group relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg hover:shadow-xl border border-slate-600"
                    >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative text-4xl font-bold text-slate-200 group-hover:text-white transition-colors">
                        −
                    </span>
                    </motion.button>

                    {/* NÚMERO CENTRAL */}
                    <div className="flex-1 text-center">
                    <div className="text-8xl font-black text-gradient mb-1 tabular-nums">
                        {people || '2'}
                    </div>
                    <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">
                        {parseInt(people || '2') === 1 ? 'persona' : 'personas'}
                    </p>
                    </div>

                    {/* Botón MÁS */}
                    <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPeople((prev) => Math.min(10, parseInt(prev || '2') + 1).toString())}
                    className="group relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#00B8DD] hover:from-[#00C4EC] hover:to-[#00A5CA] transition-all shadow-lg hover:shadow-xl shadow-[#00D9FF]/20"
                    >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative text-4xl font-bold text-white">
                        +
                    </span>
                    </motion.button>
      </div>
    </div>
  </div>

  {/* Monto por persona */}
  {amount && parseFloat(amount) > 0 && people && parseInt(people) > 0 && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 bg-[#00D9FF]/5 border-[#00D9FF]/20 text-center"
    >
      <p className="text-base text-slate-300 mb-3 font-medium">Cada persona paga:</p>
      <p className="text-5xl font-black text-[#00D9FF] tabular-nums">
        ${shareAmount}
      </p>
    </motion.div>
  )}

  {/* Botón Generar */}
  <Button
    onClick={handleGenerate}
    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-[#006B7D] to-[#00D9FF] hover:opacity-90 shadow-lg"
  >
    <QrIcon className="w-6 h-6 mr-2" />
    Generar QR
  </Button>
</motion.div>
          ) : (
            /* STEP 2: Mostrar QR */
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 space-y-6 relative"
            >
              {/* Botón cerrar */}
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Monto grande */}
              <div className="text-center py-6 border-b border-slate-700/50">
                <p className="text-6xl font-bold text-gradient mb-2">
                  ${amount}
                </p>
                <p className="text-sm text-slate-400">Monto Total</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center py-8">
                <div className="bg-white p-6 rounded-3xl shadow-2xl">
                  <QRCodeCanvas
                    value={qrData}
                    size={280}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Info del split */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
                  <span className="text-slate-400">Dividido entre:</span>
                  <span className="text-xl font-bold">{people} personas</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
                  <span className="text-slate-400">Cada uno paga:</span>
                  <span className="text-2xl font-bold text-[#00D9FF]">
                    ${shareAmount}
                  </span>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="glass-card p-4 bg-blue-500/5 border-blue-500/20 text-center">
                <p className="text-sm text-slate-300">
                  📱 Los clientes escanean este QR para pagar su parte
                </p>
              </div>

              {/* Botón nuevo cobro */}
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-14 border-2 border-slate-600 hover:bg-slate-700/50"
              >
                Nuevo Cobro
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">
            Migo POS · Powered by Stellar
          </p>
        </div>
      </div>
    </div>
  );
}