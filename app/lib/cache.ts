import { BentoCache, bentostore } from 'bentocache';
import { memoryDriver } from 'bentocache/drivers/memory';

export const cache = new BentoCache({
  default: 'cache',

  stores: {
    cache: bentostore().useL1Layer(memoryDriver({ maxSize: 10_000 })),
  },
});
