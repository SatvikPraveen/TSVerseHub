/**
 * An in-process stand-in for the compiler Web Worker.
 *
 * jsdom has no Worker, so the kernel hooks would report "unavailable". This
 * fake runs the real request handler (`createKernelService`, the code the
 * worker wraps) and answers with the same message envelope as
 * `compiler.worker.ts`, asynchronously, so the hooks exercise their genuine
 * request/response, cancellation and state logic.
 */

import { isKernelRequestMessage, type KernelResponseMessage } from '@/core/compiler/kernel-protocol';
import { createKernelService } from '@/core/compiler/kernel-service';

type Listener = (event: MessageEvent<unknown>) => void;

export class FakeKernelWorker {
  static instances = 0;
  private readonly service = createKernelService();
  private readonly listeners = new Set<Listener>();

  constructor(_url: URL | string, _options?: WorkerOptions) {
    FakeKernelWorker.instances += 1;
  }

  addEventListener(type: string, listener: Listener): void {
    if (type === 'message') this.listeners.add(listener);
  }

  removeEventListener(type: string, listener: Listener): void {
    if (type === 'message') this.listeners.delete(listener);
  }

  postMessage(message: unknown): void {
    if (!isKernelRequestMessage(message)) return;
    const reply = (response: KernelResponseMessage): void => {
      const event = new MessageEvent<unknown>('message', { data: response });
      for (const listener of this.listeners) listener(event);
    };
    this.service.handle(message.id, message.request).then(
      (payload) => reply(payload ? { id: message.id, status: 'ok', payload } : { id: message.id, status: 'cancelled' }),
      (error: unknown) => reply({ id: message.id, status: 'error', message: error instanceof Error ? error.message : String(error) }),
    );
  }

  terminate(): void {
    this.listeners.clear();
  }
}
