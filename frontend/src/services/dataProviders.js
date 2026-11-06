
import { nasaTrekProvider } from "./providers/nasaTrek";

const DATA_PROVIDERS = {
  nasaTrek: nasaTrekProvider
};

export function getDataProvider(providerId) {
  const provider = DATA_PROVIDERS[providerId];

  if (!provider) {
    throw new Error(`Data provider not found: ${providerId}`);
  }

  return provider;
}

export function getAvailableProviders() {
  return Object.keys(DATA_PROVIDERS);
}
