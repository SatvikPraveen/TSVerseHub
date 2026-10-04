import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { ProgressProvider } from '@/contexts/ProgressProvider';
import { curriculum, curriculumGraph, learningPath, moduleById } from '@/core/curriculum';
import Dashboard from '@/pages/Dashboard';

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProgressProvider>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </ProgressProvider>
    </MemoryRouter>,
  );

const pathIds = () =>
  within(screen.getByRole('list', { name: /learning path/i }))
    .getAllByRole('listitem')
    .map((item) => item.getAttribute('data-module-id'));

beforeEach(() => {
  window.localStorage.clear();
});

describe('Dashboard learning path', () => {
  it('defaults to the deepest module and lists the ordered path for decorators', () => {
    renderDashboard();

    const select = screen.getByLabelText(/target module/i);
    expect(select).toHaveValue('decorators');
    expect(pathIds()).toEqual(['basics', 'generics', 'advanced-types', 'patterns', 'decorators']);

    const list = screen.getByRole('list', { name: /learning path/i });
    for (const id of ['basics', 'generics', 'advanced-types', 'patterns', 'decorators'] as const) {
      expect(within(list).getByRole('link', { name: moduleById(id).title })).toHaveAttribute('href', `/concepts/${id}`);
    }
  });

  it('shows cumulative minutes along the path', () => {
    renderDashboard();

    const list = screen.getByRole('list', { name: /learning path/i });
    const items = within(list).getAllByRole('listitem');
    // basics 90 -> generics 210 -> advanced-types 450 -> patterns 600 -> decorators 720
    expect(items[0]).toHaveTextContent('1 h 30 min cumulative');
    expect(items[1]).toHaveTextContent('3 h 30 min cumulative');
    expect(items[4]).toHaveTextContent('12 h cumulative');
  });

  it('updates the path when the target changes', () => {
    renderDashboard();

    fireEvent.change(screen.getByLabelText(/target module/i), { target: { value: 'compiler-api' } });

    const expected = learningPath(curriculumGraph(curriculum.modules), 'compiler-api');
    expect(expected[expected.length - 1]).toBe('compiler-api');
    expect(pathIds()).toEqual(expected);
    expect(pathIds()).toContain('tsconfig');
    expect(pathIds()).not.toContain('patterns');
  });

  it('selects a target from the prerequisite graph', () => {
    renderDashboard();

    const graph = screen.getByRole('group', { name: /prerequisite graph/i });
    const tsconfigNode = within(graph)
      .getAllByRole('button')
      .find((button) => button.getAttribute('data-module-id') === 'tsconfig');
    expect(tsconfigNode).toBeDefined();
    fireEvent.click(tsconfigNode!);

    expect(screen.getByLabelText(/target module/i)).toHaveValue('tsconfig');
    expect(pathIds()).toEqual(['basics', 'namespaces-modules', 'tsconfig']);
    expect(tsconfigNode).toHaveAttribute('aria-pressed', 'true');
  });
});
