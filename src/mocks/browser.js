import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create worker but don't start it here
export const worker = setupWorker(...handlers);
