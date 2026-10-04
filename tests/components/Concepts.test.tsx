import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { ProgressProvider } from '@/contexts/ProgressProvider';
import { curriculum, curriculumGraph, moduleById, topologicalOrder } from '@/core/curriculum';
import Concepts from '@/pages/Concepts';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ProgressProvider>
        <Routes>
          <Route path="/concepts" element={<Concepts />} />
          <Route path="/concepts/:conceptId" element={<Concepts />} />
        </Routes>
      </ProgressProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  window.localStorage.clear();
});

describe('Concepts overview', () => {
  it('renders all 8 module titles in topological order', () => {
    renderAt('/concepts');

    const list = screen.getByRole('list', { name: /modules in prerequisite order/i });
    const items = within(list).getAllByRole('listitem');
    const expectedOrder = topologicalOrder(curriculumGraph(curriculum.modules));

    expect(curriculum.modules).toHaveLength(8);
    expect(items).toHaveLength(8);
    expect(items.map((item) => item.getAttribute('data-module-id'))).toEqual(expectedOrder);
    expectedOrder.forEach((id, index) => {
      expect(items[index]).toHaveTextContent(moduleById(id).title);
    });
  });

  it('links prerequisites to their module pages', () => {
    renderAt('/concepts');

    const list = screen.getByRole('list', { name: /modules in prerequisite order/i });
    const generics = within(list)
      .getAllByRole('listitem')
      .find((item) => item.getAttribute('data-module-id') === 'generics');
    expect(generics).toBeDefined();
    const prerequisiteLink = within(generics!).getByRole('link', { name: moduleById('basics').title });
    expect(prerequisiteLink).toHaveAttribute('href', '/concepts/basics');
  });

  it('falls back to the overview for an unknown module id', () => {
    renderAt('/concepts/not-a-module');

    expect(screen.getByRole('status')).toHaveTextContent('No module named "not-a-module"');
    expect(screen.getByRole('list', { name: /modules in prerequisite order/i })).toBeInTheDocument();
  });
});

describe('Concepts module detail', () => {
  it('renders sample titles and expectation badges with the specific TS codes', () => {
    renderAt('/concepts/generics');

    const generics = moduleById('generics');
    expect(screen.getByRole('heading', { level: 1, name: generics.title })).toBeInTheDocument();

    for (const sample of generics.samples) {
      expect(screen.getByRole('heading', { level: 4, name: sample.title })).toBeInTheDocument();
    }

    const badges = screen.getAllByTestId('expectation-badge').map((badge) => badge.textContent);
    expect(badges).toContain('errors: TS2345');
    expect(badges).toContain('errors: TS2344');
    expect(badges).toContain('compiles');
    expect(badges).toHaveLength(generics.samples.length);
  });

  it('renders type assertions as line:column is type', () => {
    renderAt('/concepts/basics');

    const assertions = screen.getAllByTestId('type-assertion').map((item) => item.textContent);
    expect(assertions).toContain('line 1:7 is "dark"');
    expect(assertions).toContain('line 2:5 is string');
    expect(assertions).toContain('line 3:7 is readonly [1, "two"]');
  });

  it('shows objectives with Bloom levels, prerequisites and references from the registry', () => {
    renderAt('/concepts/decorators');

    const objectives = within(screen.getByRole('list', { name: /learning objectives/i })).getAllByRole('listitem');
    expect(objectives).toHaveLength(moduleById('decorators').objectives.length);
    expect(objectives[0]).toHaveTextContent(/understand/i);

    const prerequisites = within(screen.getByRole('list', { name: /^prerequisites$/i })).getAllByRole('link');
    expect(prerequisites.map((link) => link.getAttribute('href'))).toEqual(['/concepts/patterns']);

    const references = within(screen.getByRole('list', { name: /references/i })).getAllByRole('link');
    expect(references.length).toBe(moduleById('decorators').references.length);
  });
});
