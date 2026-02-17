import axios from "axios";

export async function sendWebhook(url: string, payload: any) {
  try {
    await axios.post(url, payload);
  } catch (error) {
    console.error("Webhook failed:", error);
  }
}
