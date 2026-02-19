'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="mb-8"
      >
        <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-20 h-20 text-emerald-400" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">¡Pago Exitoso!</h1>
        <p className="text-lg text-slate-300 mb-2">
          Tu parte del split fue pagada correctamente
        </p>
        <p className="text-sm text-slate-500">
          La transacción se confirmó en la red Stellar
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/">
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 h-14 text-lg">
            Cerrar
          </Button>
        </Link>
      </motion.div>

      <p className="text-xs text-slate-500 mt-12">
        Powered by Stellar · Migo Protocol
      </p>
    </div>
  );
}