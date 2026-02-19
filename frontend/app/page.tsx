'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Store, User, Moon, Sun } from "lucide-react";

export default function Home() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
    } flex flex-col items-center justify-center px-6 py-12`}>
      
      {/* Toggle de tema - Arriba a la derecha */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all ${
          isDark 
            ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' 
            : 'bg-white hover:bg-gray-100 text-gray-800 shadow-lg'
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <Image
          src="/migo-logo.png"
          alt="Migo"
          width={300}
          height={120}
          priority
          className="w-auto h-auto max-w-sm drop-shadow-lg"
        />
      </motion.div>

      {/* Cards - Sin títulos, solo iconos */}
      <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
        
        {/* Cliente */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/pay/demo-123">
            <Card className={`h-full border-2 transition-all cursor-pointer overflow-hidden group ${
              isDark
                ? 'bg-slate-800/50 border-slate-700 hover:border-[#00D9FF] hover:shadow-xl hover:shadow-[#00D9FF]/20'
                : 'bg-white border-gray-200 hover:border-[#00D9FF] hover:shadow-xl'
            }`}>
              <CardContent className="p-12 flex flex-col items-center justify-center h-full">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-24 h-24 bg-gradient-to-br from-[#00D9FF] to-[#00B8DD] rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-[#00D9FF]/30"
                >
                  <User className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Cliente
                </h3>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Negocio */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href="/pos">
            <Card className={`h-full border-2 transition-all cursor-pointer overflow-hidden group ${
              isDark
                ? 'bg-slate-800/50 border-slate-700 hover:border-[#006B7D] hover:shadow-xl hover:shadow-[#006B7D]/20'
                : 'bg-white border-gray-200 hover:border-[#006B7D] hover:shadow-xl'
            }`}>
              <CardContent className="p-12 flex flex-col items-center justify-center h-full">
                <motion.div
                  whileHover={{ rotate: -360 }}
                  transition={{ duration: 0.5 }}
                  className="w-24 h-24 bg-gradient-to-br from-[#006B7D] to-[#005563] rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-[#006B7D]/30"
                >
                  <Store className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Negocio
                </h3>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16"
      >
        <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Powered by Stellar · Soroban Smart Contracts
        </p>
      </motion.div>
    </div>
  );
}