# Migo Frontend

Interfaz de usuario de Migo Protocol. Construida con Next.js 15 + React 19 + Tailwind CSS

---

## Estructura
```
frontend/
├── app/
│   ├── page.tsx          # Landing / home
│   ├── pos/              # Pantalla del negocio — genera QR y crea splits
│   ├── pay/[id]/         # Pantalla del pagador — elige wallet y moneda
│   └── test-split/       # Página de desarrollo para probar conexión con backend
├── components/           # Componentes reutilizables
└── lib/
    ├── api.ts            # Cliente HTTP para el backend
    └── wallets.ts        # Integración Freighter, xBull, Albedo, LOBSTR
```

---

## Correr el frontend

**Requisitos:** Node.js 18+, backend corriendo en `http://localhost:3001`
```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

---

## Páginas

### `/pos`
Pantalla del negocio. Permite crear un split y generar el QR interoperable

### `/pay/[id]`
Pantalla del pagador. Se accede escaneando el QR. Permite elegir wallet y moneda para pagar

### `/test-split`
Página de desarrollo. Conecta con el backend y muestra datos de un split real

Para usarla: reemplazá el `splitId` hardcodeado en `app/test-split/page.tsx` con un ID real

---

## Conexión con el backend

El frontend se comunica con el backend via `lib/api.ts`
Por defecto apunta a `http://localhost:3001`