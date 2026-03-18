# 🚀 MIGO Backend - Capa de Orquestación de Pagos

> Motor de pagos divididos multi-activo con liquidación automática on-chain en Stellar

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

---

## 📖 Descripción General

MIGO es un **backend híbrido Web2 + Web3 de orquestación de pagos** que permite:

- 💰 **Pagos divididos** entre múltiples participantes
- 🌍 **Soporte multi-activo** (XLM, USDC, simulación fiat)
- ⚡ **Liquidación automática** en blockchain Stellar
- 🔐 **Dos modos de división**: FIXED (basado en porcentajes) y OPEN_POOL (flexible)
- 🎯 **Generación de intents de pago** para integración con wallets
- 📱 **Sesiones de pago basadas en QR** para UX fluida

**Casos de uso:**
- Gastos grupales (restaurantes, viajes, servicios compartidos)
- División de facturas B2B
- Escrow para freelancers (con liberación manual)
- Agregación de pagos multi-activo
- Remesas transfronterizas con conversión automática

---

## 🏗 Arquitectura

```
┌─────────────┐
│   Cliente   │ (Wallet / Frontend)
└──────┬──────┘
       │ HTTP REST
       ▼
┌─────────────────────────────────────┐
│      MIGO Backend (Node.js)         │
│  ┌────────────────────────────────┐ │
│  │  Motor de Splits               │ │
│  │  - FIXED / OPEN_POOL          │ │
│  │  - Derivación de estados      │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Motor de Pagos                │ │
│  │  - Conversión multi-activo    │ │
│  │  - Protección contra excesos  │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  Motor de Liquidación          │ │
│  │  - Liberación automática      │ │
│  │  - Integración con Stellar    │ │
│  └────────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌───────────────┐
       │    Stellar    │
       │    Testnet    │
       └───────────────┘
```

---

## 🎯 Conceptos Fundamentales

### Flujo de Sesión de Pago (Experiencia QR-First)

MIGO utiliza un **enfoque QR-first** donde toda la experiencia de pago comienza con un único código QR:

```
1. Comerciante crea el split
        ↓
2. Sistema genera código QR único (GET /splits/:id/qr)
        ↓
3. Usuario escanea el QR con cualquier wallet compatible
        ↓
4. Wallet obtiene el payment intent (GET /splits/:id/intent)
        ↓
5. Usuario autoriza el pago en su activo preferido
        ↓
6. Backend registra el pago (POST /splits/:id/pay)
        ↓
7. Backend acumula y convierte al activo de liquidación
        ↓
8. Al completarse → liquidación automática al comerciante
```

**Ventaja clave:** Un solo QR soporta múltiples wallets, múltiples activos y múltiples participantes.

---

### Modos de División

#### Modo FIXED
- Participantes predefinidos con shares asignados (%)
- Cada participante solo puede pagar hasta su share
- La validación refuerza la lista de participantes

**Ejemplo:**
```json
{
  "mode": "FIXED",
  "totalAmount": 100,
  "participants": [
    { "id": "alice", "share": 60 },
    { "id": "bob", "share": 40 }
  ]
}
```

**Caso de uso:** División de factura B2B donde la contribución de cada parte está predeterminada.

---

#### Modo OPEN_POOL
- Cualquiera puede contribuir
- Sin shares predefinidos
- Primero en llegar, primero en servirse hasta completar el total

**Ejemplo:**
```json
{
  "mode": "OPEN_POOL",
  "totalAmount": 100
}
```

**Caso de uso:** Cuenta de restaurante donde cualquiera puede aportar cualquier monto.

---

### Flujo de Estados del Split

```
PENDING
   ↓ (pago registrado)
PARTIAL
   ↓ (total alcanzado)
READY_FOR_SETTLEMENT
   ↓ (liquidación automática)
SETTLED ✓
```

**Estados especiales:**
- `CANCELLED` - Cancelado manualmente o expirado
- Los estados bloqueados previenen pagos adicionales

---

### Soporte Multi-Activo

MIGO soporta pagos heterogéneos que se convierten a un único activo de liquidación:

```typescript
// Pago en XLM
{
  "originalAsset": "XLM",
  "originalAmount": 50
}

// Pago en USDC
{
  "originalAsset": "USDC", 
  "originalAmount": 100
}

// Ambos se acumulan en el mismo settlementAsset
```

**Activos soportados:**
- Stellar nativo (XLM)
- Activos de crédito Stellar (USDC, tokens personalizados)
- Simulación fiat (ARS_BANK, BRL_BANK) - conversión mock

**Flujo de conversión:**
1. Usuario paga en su activo preferido
2. Backend convierte al `settlementAsset` del comerciante
3. La acumulación ocurre en la moneda de liquidación
4. Pago final en un único activo

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js >= 18.0.0
- npm o yarn
- Cuenta Stellar testnet (para liquidación)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/migo-labs/migo-protocol.git

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
```
### Configuración de Stellar Testnet

**Obtener claves de testnet:**

1. Ir a https://laboratory.stellar.org/#account-creator
2. Click en "Generate keypair"
3. Copiar:
   - **Public Key** (comienza con `G...`)
   - **Secret Key** (comienza con `S...`)
4. Click en "Fund account with Friendbot" para recibir XLM testnet

### Variables de Entorno

```bash
# .env
DATABASE_URL=postgresql://user:password@host:5432/dbname
MIGO_SECRET=SA...              # Clave secreta Stellar (testnet)
MERCHANT_PUBLIC=GA...          # Dirección Stellar del comerciante
ISSUER_PUBLIC=GA...            # Emisor USDC (testnet)
PORT=3000
NODE_ENV=development
STELLAR_NETWORK=testnet                                       # testnet | mainnet
STELLAR_HORIZON_URL_TESTNET=https://horizon-testnet.stellar.org
STELLAR_HORIZON_URL_MAINNET=https://horizon.stellar.org
ISSUER_PUBLIC_ASSET=            # Issuer de USDC
                                # Circle testnet: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
                                # Circle mainnet: GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
```

> ⚠️ **Seguridad:** Nunca commitear claves secretas reales. Usar solo claves de testnet para desarrollo.

### Ejecutar Servidor de Desarrollo

```bash
npm run dev
```

El servidor corre en `http://localhost:3000`

---

## 🔍 Verificación de Transacciones en Blockchain

### Cómo Verificar Liquidaciones Reales

Cuando un split se completa y pasa a estado `SETTLED`, el backend ejecuta una **transacción real en Stellar testnet** y devuelve el hash:

```json
{
  "status": "SETTLED",
  "stellarTxHash": "73b64097802be69113f40929e9c15bb9250f1a49b5617d290dcdb3118f1dbc35",
  "releasedAt": "2026-02-17T13:55:55.345Z"
}
```

### Ver Transacciones en Stellar Expert

**Opción 1: Ver cuenta del comerciante (ejemplo real)**
```
https://stellar.expert/explorer/testnet/account/GAU6LGBVRRFZDKJJ3HX2QD6EVXQWZTWJ4SBEYWWU4KHUTTBXBUH5BZOE
```

Aquí verás:
- ✅ Todas las transacciones recibidas
- ✅ Balance actual en XLM y USDC
- ✅ Historial completo de operaciones
- ✅ Timestamps de cada liquidación

**Opción 2: Ver transacción específica**
```
https://stellar.expert/explorer/testnet/tx/{stellarTxHash}
```

Ejemplo con hash real:
```
https://stellar.expert/explorer/testnet/tx/73b64097802be69113f40929e9c15bb9250f1a49b5617d290dcdb3118f1dbc35
```

### Qué Ver en el Explorer

Cuando abras el link verás:
- ✅ **Monto transferido** (en XLM o USDC)
- ✅ **Dirección origen** (cuenta MIGO)
- ✅ **Dirección destino** (comerciante)
- ✅ **Timestamp** exacto de la transacción
- ✅ **Fee pagado** a la red Stellar
- ✅ **Memo** (si aplica)

**Esto prueba que:**
- La liquidación fue **real en blockchain**
- No es simulada
- Es **verificable públicamente**
- Tiene **finalidad blockchain**

> 💡 **Nota sobre Testnet vs Mainnet:**  
> **Actualmente:** MIGO ejecuta transacciones reales en **Stellar testnet** (red de pruebas con tokens sin valor real).  
> **Futuro (v1.0):** El despliegue en **Stellar mainnet** permitirá procesar transacciones con dinero real en producción.

---

## 📡 Endpoints de la API

### 🔑 Sesión de Pago (QR-First)

#### Generar Sesión de Pago QR
```http
GET /splits/:id/qr
```

**Este es el punto de entrada para toda la experiencia del usuario.**

Cuando un comerciante crea un split, genera un código QR usando este endpoint. Este único QR:
- ✅ Funciona con cualquier wallet compatible (Freighter, LOBSTR, etc.)
- ✅ Soporta múltiples participantes escaneando el mismo código
- ✅ Maneja diferentes activos de pago (XLM, USDC, fiat)
- ✅ Proporciona estado de pago en tiempo real

**Respuesta:**
```json
{
  "type": "MIGO_PAYMENT_SESSION",
  "splitId": "550e8400-...",
  "totalAmount": 100,
  "settlementAsset": {
    "network": "stellar",
    "type": "native",
    "code": "XLM"
  },
  "intentUrl": "http://localhost:3000/splits/550e8400-.../intent"
}
```

**Cómo las wallets usan esto:**
1. Usuario escanea QR
2. Wallet decodifica información de sesión
3. Wallet obtiene intent completo desde `intentUrl`
4. Wallet presenta UI de pago con monto/activo
5. Usuario autoriza → Wallet llama `POST /splits/:id/pay`

**Casos de uso:**
- 🍽️ QR en mesa de restaurante para dividir cuenta
- 🎫 Pago de entrada a evento (múltiples compradores)
- 📦 Coordinación de compra grupal
- 💼 Factura B2B con múltiples pagadores

---

#### Obtener Payment Intent
```http
GET /splits/:id/intent
```

**Llamado automáticamente por wallets después de escanear el QR.**

Proporciona información de pago estructurada para UIs de wallets.

**Respuesta:**
```json
{
  "splitId": "550e8400-...",
  "amount": 100,
  "remainingAmount": 50,
  "settlementAsset": {
    "network": "stellar",
    "type": "native",
    "code": "XLM"
  },
  "status": "PARTIAL",
  "expiresAt": "2026-12-31T23:59:59Z",
  "memo": "MIGO_SPLIT_550e8400"
}
```

**Ejemplo de integración de wallet:**
```javascript
// Usuario escanea QR
const qrData = decodeQR(scannedData);

// Obtener detalles de pago
const intent = await fetch(qrData.intentUrl);

// Mostrar en UI de wallet
displayPaymentRequest({
  amount: intent.remainingAmount,
  asset: intent.settlementAsset,
  destination: merchantAddress,
  memo: intent.memo
});
```

---

### Operaciones Core de Split

#### Crear Split
```http
POST /splits
Content-Type: application/json

{
  "totalAmount": 100,
  "settlementAsset": {
    "network": "stellar",
    "type": "native",
    "code": "XLM"
  },
  "mode": "OPEN_POOL",
  "expiresAt": "2026-12-31T23:59:59Z" // opcional
}
```

**Respuesta:**
```json
{
  "id": "550e8400-...",
  "status": "PENDING",
  "totalAmount": 100,
  "settlementAsset": {...},
  "createdAt": "2026-02-17T...",
  "mode": "OPEN_POOL"
}
```

**Siguiente paso:** Generar QR con `GET /splits/:id/qr`

---

#### Registrar Pago
```http
POST /splits/:id/pay
Content-Type: application/json

{
  "payerId": "alice",
  "method": "CRYPTO",
  "originalAsset": "XLM",
  "originalAmount": 50
}
```

**Típicamente llamado por wallets, no directamente por usuarios.**

**Respuesta:**
```json
{
  "payment": {
    "id": "...",
    "convertedAmount": 50,
    "conversionRate": 1,
    "externalStatus": "CONFIRMED"
  },
  "updatedSplit": {
    "status": "PARTIAL",
    "totalAmount": 100,
    "remainingAmount": 50
  }
}
```

**Acciones automáticas:**
- ✅ Convierte pago a `settlementAsset`
- ✅ Actualiza estado del split
- ✅ Dispara liquidación si se alcanza el total
- ✅ Envía webhook (si está configurado)

---

#### Obtener Resumen del Split
```http
GET /splits/:id/summary
```

**Snapshot financiero en tiempo real.**

**Respuesta:**
```json
{
  "totalAmount": 100,
  "paidAmount": 50,
  "remainingAmount": 50,
  "percentageCompleted": 50,
  "status": "PARTIAL"
}
```

**Casos de uso:**
- Dashboard frontend
- Display de estado en app móvil
- Sistema de notificaciones para comerciantes

---

### Endpoints Adicionales

| Método | Endpoint | Descripción | Caso de Uso |
|--------|----------|-------------|-------------|
| `GET` | `/splits/:id` | Obtener detalles del split | Estado completo del split |
| `GET` | `/splits/:id/payments` | Listar todos los pagos | Historial de pagos |
| `GET` | `/splits/:id/participants-status` | Estado individual (modo FIXED) | Seguimiento por usuario |
| `POST` | `/splits/:id/cancel` | Cancelar split | Abortar sesión de pago |
| `POST` | `/splits/:id/release` | Disparar liquidación manual | Liberación de escrow |
| `GET` | `/health` | Health check | Monitoreo |

---

## 🧪 Ejemplos de Uso

### Ejemplo 1: División en Restaurante (Flujo QR-First)

**Escenario:** 4 amigos dividen una cuenta de $100

```bash
# 1. Mozo crea el split
curl -X POST http://localhost:3000/splits \
  -H "Content-Type: application/json" \
  -d '{
    "totalAmount": 100,
    "settlementAsset": {
      "network": "stellar",
      "type": "credit",
      "code": "USDC",
      "issuer": "GAAG4OCCXTHAWGTSYWHU2KXY4QY475IUTUPYVET4CSGXGE5664CHQEZW"
    },
    "mode": "OPEN_POOL"
  }'

# Respuesta: { "id": "abc123", ... }


# 2. Generar QR para la mesa
curl http://localhost:3000/splits/abc123/qr


# 3. Amigos escanean QR, wallets obtienen intent
curl http://localhost:3000/splits/abc123/intent


# 4. Ana paga $40 (vía wallet)
curl -X POST http://localhost:3000/splits/abc123/pay \
  -H "Content-Type: application/json" \
  -d '{
    "payerId": "ana",
    "method": "CRYPTO",
    "originalAsset": "USDC",
    "originalAmount": 40
  }'


# 5. Lucas paga $30 en XLM (auto-convertido)
curl -X POST http://localhost:3000/splits/abc123/pay \
  -d '{
    "payerId": "lucas",
    "method": "CRYPTO",
    "originalAsset": "XLM",
    "originalAmount": 60
  }'


# 6. Carola completa con $30
curl -X POST http://localhost:3000/splits/abc123/pay \
  -d '{
    "payerId": "carola",
    "method": "CRYPTO",
    "originalAsset": "USDC",
    "originalAmount": 30
  }'


# 7. Verificar estado final (debe ser SETTLED)
curl http://localhost:3000/splits/abc123
# Respuesta: { "status": "SETTLED", "stellarTxHash": "3a4b..." }
```

**Resultado:** 
- ✅ Comerciante recibe exactamente 100 USDC
- ✅ Todos los pagos convertidos automáticamente
- ✅ Liquidación ejecutada en Stellar
- ✅ Hash de transacción disponible para verificación

---

### Ejemplo 2: Factura B2B FIXED

**Escenario:** Dos empresas dividen una factura de servicio de $1000 (70/30)

```bash
# Crear split con shares predefinidos
curl -X POST http://localhost:3000/splits \
  -H "Content-Type: application/json" \
  -d '{
    "totalAmount": 1000,
    "settlementAsset": {
      "network": "stellar",
      "type": "native",
      "code": "XLM"
    },
    "mode": "FIXED",
    "participants": [
      { "id": "empresa_a", "share": 70 },
      { "id": "empresa_b", "share": 30 }
    ]
  }'

# Empresa A paga su 70% ($700)
curl -X POST http://localhost:3000/splits/{id}/pay \
  -d '{
    "payerId": "empresa_a",
    "method": "CRYPTO",
    "originalAsset": "XLM",
    "originalAmount": 700
  }'

# Verificar estado individual
curl http://localhost:3000/splits/{id}/participants-status
# Respuesta: Muestra empresa_a completada, empresa_b pendiente
```

---

### Ejemplo 3: Pago Grupal Multi-Activo

**Escenario:** 3 personas pagando en diferentes monedas

```bash
# Crear split OPEN_POOL
curl -X POST http://localhost:3000/splits \
  -d '{
    "totalAmount": 150,
    "settlementAsset": {
      "network": "stellar",
      "type": "credit",
      "code": "USDC",
      "issuer": "GA..."
    },
    "mode": "OPEN_POOL"
  }'

# Pago 1: XLM (auto-convertido a USDC)
curl -X POST http://localhost:3000/splits/{id}/pay \
  -d '{
    "payerId": "usuario1",
    "originalAsset": "XLM",
    "originalAmount": 100
  }'

# Pago 2: USDC directo
curl -X POST http://localhost:3000/splits/{id}/pay \
  -d '{
    "payerId": "usuario2",
    "originalAsset": "USDC",
    "originalAmount": 75
  }'

# Pago 3: ARS simulado (conversión mock)
curl -X POST http://localhost:3000/splits/{id}/pay \
  -d '{
    "payerId": "usuario3",
    "originalAsset": "ARS_BANK",
    "originalAmount": 37500
  }'

# Resultado: Todo convertido y acumulado como USDC
```

---

## 🔒 Seguridad y Validación

### Protecciones Integradas

✅ **Prevención de sobrepago** - No se puede pagar más que el monto restante  
✅ **Cumplimiento de shares (FIXED)** - Participantes no pueden exceder su share asignado  
✅ **Validación de estado** - No se puede pagar splits cancelados o liquidados  
✅ **Expiración** - Cancelación automática después de expiresAt  
✅ **Validación de participantes (FIXED)** - Solo participantes registrados pueden pagar  
✅ **Idempotencia lista** - Detección de pagos duplicados (planificado v0.2)

### Manejo de Errores

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| `400` | Formato de request inválido | Campos requeridos faltantes |
| `404` | Split no encontrado | ID de split inválido |
| `409` | Conflicto | Ya liquidado, ya cancelado |
| `422` | Error de lógica de negocio | Sobrepago, participante incorrecto, expirado |

---

## 🧬 Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Blockchain:** Stellar SDK (@stellar/stellar-sdk)
- **Almacenamiento:** En memoria (Map/Array) - Solo MVP
- **Generación QR:** qrcode
- **Generación de IDs:** uuid

---

## 📊 Estado Actual

**MIGO está en etapa MVP** - Motor de orquestación de pagos completamente funcional con:

✅ **Integración funcional con Stellar testnet**  
✅ **Conversión multi-activo (mock)**  
✅ **Ejecución de liquidación automática**  
✅ **Máquina de estados completa**  
✅ **Sesiones de pago basadas en QR**  
✅ **Arquitectura preparada para evolucionar a producción**  

### Limitaciones Conocidas (MVP)

⚠️ **Almacenamiento en memoria** - Los datos se reinician al reiniciar el servidor  
⚠️ **Conversiones mock** - Conversión FX real vía Stellar DEX (Horizon) — ARS_BANK y BRL_BANK aún usan tasas mock hasta integración on-chain  
⚠️ **Sin autenticación** - API pública para demo  
⚠️ **Solo testnet** - No conectado a mainnet  
⚠️ **Pagos Web2 mock** - Transferencias bancarias simuladas  

Estas son intencionales para la fase MVP y serán abordadas en próximas iteraciones.

---

## 🗺 Hoja de Ruta de Desarrollo

### Fase 2 - Persistencia e Infraestructura (v0.2)
- [ ] Integración PostgreSQL / Supabase
- [ ] Schema de base de datos con indexación apropiada
- [ ] Atomicidad de transacciones
- [ ] Optimización de queries
- [ ] Scripts de migración
- [ ] Capa de idempotencia

### Fase 3 - Integración Real (v0.3)
- [ ] Integración API MercadoPago
- [ ] Webhooks de verificación de pago
- [ ] Capa de cumplimiento BCRA (Argentina - Transferencia 3.0)
- [ ] Conversión FX real vía oracle
- [ ] Framework KYC/AML
- [ ] Soporte multi-PSP

### Fase 4 - Lanzamiento Mainnet (v1.0)
- [ ] Despliegue en Stellar mainnet
- [ ] Autenticación y autorización
- [ ] Rate limiting y protección
- [ ] Logging estructurado
- [ ] Monitoreo y alertas
- [ ] Suite de tests comprensiva
- [ ] Pipeline CI/CD
- [ ] Auditoría de seguridad
- [ ] Documentación de producción


---

## 🧪 Testing y Validación

### Checklist de Testing Manual

**Flujo OPEN_POOL:**
- [ ] Crear split
- [ ] Generar QR
- [ ] Hacer pago parcial
- [ ] Verificar estado `PARTIAL`
- [ ] Completar pago
- [ ] Verificar estado `SETTLED`
- [ ] Confirmar `stellarTxHash` presente
- [ ] Intentar pagar de nuevo → debe fallar

**Flujo FIXED:**
- [ ] Crear split con participantes
- [ ] Generar QR
- [ ] Pagar como participante válido → debe funcionar
- [ ] Pagar como participante inválido → debe fallar
- [ ] Verificar endpoint `participants-status`

**Flujo de Sesión QR:**
- [ ] Generar QR para split
- [ ] Obtener intent desde datos QR
- [ ] Verificar que intent muestra monto restante correcto
- [ ] Múltiples usuarios escanean mismo QR
- [ ] Verificar que cada pago actualiza el intent

**Casos Edge:**
- [ ] Sobrepago → debe fallar
- [ ] Cancelar split → debe bloquear pagos
- [ ] Split expirado → debe auto-cancelarse
- [ ] Pagar split liquidado → debe fallar
- [ ] Pagos multi-activo se acumulan correctamente

### Tests Automatizados

Suite de tests comprensiva planificada para v0.2 con:
- Jest para tests unitarios
- Supertest para tests de integración
- Mock de interacciones con Stellar testnet
- Cobertura completa de endpoints
- Validación de generación de QR

---

## 🔗 Recursos

- **Stellar Testnet Explorer:** https://stellar.expert/explorer/testnet
- **Documentación Stellar SDK:** https://stellar.github.io/js-stellar-sdk/
- **Stellar Laboratory:** https://laboratory.stellar.org/
- **Documentación del Proyecto:** (próximamente)

---
