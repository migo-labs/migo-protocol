# Investigación: MPP y x402 — Protocolos de pago para agentes

> Nota de investigación — marzo 2026. No incluir en el roadmap actual. Revisar cuando se implemente el escrow Soroban.

---

## Contexto

Existen dos protocolos emergentes para pagos programáticos (máquina a máquina) que son relevantes para la evolución futura de Migo:

---

## x402 (Coinbase + Cloudflare + Google + Visa)

**Estado:** Producción. Millones de pagos procesados. Ya integrado en Stellar.

**Concepto:** Reactiva el código HTTP 402 "Payment Required" como mecanismo real de pago.

```
Cliente solicita recurso
        ↓
Servidor responde 402 + precio
        ↓
Cliente paga en stablecoin
        ↓
Servidor entrega el recurso
```

**En Stellar:**
SDF integró x402 con OpenZeppelin smart accounts en Stellar. Setup mínimo para proteger un endpoint Express:

```typescript
import { paymentMiddleware } from '@x402/express';

app.use(paymentMiddleware({
  "GET /weather": {
    accepts: [{
      scheme: "exact",
      price: "$0.001",
      network: "stellar:pubnet",
      payTo: "G...YOUR_STELLAR_ADDRESS",
    }],
  },
}));
```

**Links:**
- https://stellar.org/blog/foundation-news/x402-on-stellar
- https://github.com/coinbase/x402

---

## MPP (Machine Payments Protocol — Stripe + Tempo)

**Estado:** Lanzado el 18 de marzo 2026. Muy nuevo, corre principalmente sobre blockchain Tempo.

**Concepto:** Estándar abierto para que agentes de IA paguen servicios programáticamente. Co-diseñado con Visa para soportar tarjetas además de stablecoins.

**stellar-mpp-sdk:** Implementación del concepto MPP sobre Stellar + Soroban. Dos modos:

- **Charge** — cada pago es una transferencia SAC on-chain individual
- **Channel** — canal unidireccional off-chain con liquidación final on-chain

```typescript
// Servidor
const mppx = Mppx.create({
  secretKey: process.env.MPP_SECRET_KEY,
  methods: [
    stellar.charge({
      recipient: process.env.STELLAR_RECIPIENT,
      currency: USDC_SAC_TESTNET,
      network: 'testnet',
    }),
  ],
})
```

**Links:**
- https://mpp.dev/overview
- https://github.com/stellar-experimental/stellar-mpp-sdk

---

## Relevancia para Migo

### Corto plazo — ninguna
El stack actual (Express + Stellar SDK + Horizon) es suficiente para el MVP.

### Mediano plazo — x402
Cuando se implemente el escrow Soroban, x402 podría reemplazar la lógica manual de `registerPaymentService()` con el protocolo estándar. El pagador Web3 simplemente hace un fetch normal y x402 maneja el flujo de pago automáticamente.

### Largo plazo — Channel mode
El modo Channel del stellar-mpp-sdk es interesante para casos de uso de alta frecuencia — por ejemplo, un tab abierto en un restaurante donde los clientes pagan micro-pagos off-chain hasta que el comercio cierra el canal.

### Caso futuro — agentes de IA
Si Migo evoluciona hacia pagos automatizados (ej: un agente que divide y paga facturas automáticamente), MPP es el protocolo estándar para ese caso.

---

## Decisión

No integrar ahora. Revisar cuando:
- [ ] Escrow Soroban esté implementado
- [ ] Se evalúe reemplazar la lógica de `registerPaymentService()` con x402
- [ ] Se explore el caso de uso de agentes de IA

---

*Investigación iniciada por Romina — marzo 2026*
