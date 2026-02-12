// lib/wallets.ts

export const STELLAR_WALLETS = [
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '🔷',
    type: 'extension',
    detectFunction: () => window.freighter !== undefined,
    connectFunction: async () => {
      const { isConnected, getPublicKey } = await import('@stellar/freighter-api');
      if (await isConnected()) {
        return await getPublicKey();
      }
      return null;
    }
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    icon: '🦞',
    type: 'mobile',
    deepLink: 'lobstr://',
    detectFunction: () => /Lobstr/i.test(navigator.userAgent),
  },
  {
    id: 'albedo',
    name: 'Albedo',
    icon: '🌟',
    type: 'web',
    url: 'https://albedo.link',
    connectFunction: async () => {
      const albedo = await import('@albedo-link/intent');
      const result = await albedo.publicKey();
      return result.pubkey;
    }
  },
  {
    id: 'xbull',
    name: 'xBull',
    icon: '🐂',
    type: 'extension',
    detectFunction: () => window.xBullSDK !== undefined,
    connectFunction: async () => {
      const xbull = window.xBullSDK;
      await xbull.connect();
      return xbull.getPublicKey();
    }
  }
];
