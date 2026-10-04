import { expect, test, type Page } from '@playwright/test';

/**
 * End-to-end check of the compiler kernel in a real browser: the Web Worker
 * boots, lazily loads the lib.*.d.ts chunks, analyses the initial code, and
 * its diagnostics reach both the status bar and Monaco's markers on every
 * edit (see ADR 0008).
 */

interface MonacoModel {
  setValue(value: string): void;
}
interface MonacoEditor {
  getModel(): MonacoModel | null;
  getRawOptions(): { readOnly?: boolean };
}
interface MonacoGlobal {
  editor: { getEditors(): MonacoEditor[] };
}

/** Replace the input editor's content through Monaco's API (keyboard selection is unreliable). */
const setPlaygroundCode = async (page: Page, code: string): Promise<void> => {
  await page.evaluate((text) => {
    const { monaco } = window as unknown as { monaco?: MonacoGlobal };
    const input = monaco?.editor.getEditors().find((e) => !e.getRawOptions().readOnly);
    const model = input?.getModel();
    if (!model) throw new Error('playground input editor not found');
    model.setValue(text);
  }, code);
};

test('the playground analyses its initial code and reports diagnostics on every edit', async ({ page }) => {
  await page.goto('/playground');

  const status = page.locator('[aria-live="polite"]').filter({ hasText: /Compiler|Checking/ }).first();
  await expect(status).toContainText('Compiler ready', { timeout: 45_000 });

  // The bundled sample is analysed without any user input.
  await expect(status).toContainText(/check [\d.]+ ms/, { timeout: 20_000 });
  await expect(status).toContainText(/\d+ errors?/);

  await setPlaygroundCode(page, 'export const answer: number = "forty-two";\n');
  await expect(status).toContainText('1 error', { timeout: 20_000 });
  await expect(status).not.toContainText('errors');
  await expect(page.locator('.monaco-editor .squiggly-error').first()).toBeVisible();

  await setPlaygroundCode(page, 'export const answer: number = 42;\n');
  await expect(status).toContainText('0 errors', { timeout: 20_000 });
  await expect(page.locator('.monaco-editor .squiggly-error')).toHaveCount(0);
});
