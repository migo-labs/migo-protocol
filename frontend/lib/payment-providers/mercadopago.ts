// lib/payment-providers/mercadopago.ts

import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

export async function createMPPayment(params: {
  amount: number;
  description: string;
  splitId: string;
  participantId: string;
}) {
  const payment = new Payment(client);
  
  const result = await payment.create({
    body: {
      transaction_amount: params.amount,
      description: `Migo Split - ${params.description}`,
      payment_method_id: 'pix', // O 'credit_card', 'debit_card'
      payer: {
        email: 'user@example.com'
      },
      metadata: {
        split_id: params.splitId,
        participant_id: params.participantId
      },
      notification_url: `https://api.migo.app/webhooks/mp/${params.splitId}`
    }
  });
  
  return result;
}
