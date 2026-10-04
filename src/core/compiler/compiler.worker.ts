/**
 * Web Worker entry for the compiler kernel. Receives {@link KernelRequestMessage}s
 * and answers each with exactly one {@link KernelResponseMessage}.
 *
 * Bundled by Vite as a separate module worker together with the TypeScript
 * compiler; the `lib.*.d.ts` files are further split into lazily loaded
 * chunks by `browser-libs.ts`.
 *
 * @module core/compiler/compiler.worker
 */

import { isKernelRequestMessage, type KernelResponseMessage } from './kernel-protocol';
import { createKernelService } from './kernel-service';

const service = createKernelService();

const reply = (message: KernelResponseMessage): void => {
  self.postMessage(message);
};

self.addEventListener('message', (event: MessageEvent<unknown>) => {
  const message = event.data;
  if (!isKernelRequestMessage(message)) return;
  service.handle(message.id, message.request).then(
    (payload) => reply(payload ? { id: message.id, status: 'ok', payload } : { id: message.id, status: 'cancelled' }),
    (error: unknown) => reply({ id: message.id, status: 'error', message: error instanceof Error ? error.message : String(error) }),
  );
});
