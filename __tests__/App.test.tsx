/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/storage', () => {
  const empty = { unlocked: 0, records: {} };
  return {
    EMPTY_PROGRESS: empty,
    loadProgress: jest.fn(() => Promise.resolve(empty)),
    normalizeProgress: jest.fn((p: unknown) => p),
    saveProgress: jest.fn(() => Promise.resolve()),
    recordResult: jest.fn(() => empty),
  };
});

test('renders the title menu', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });
  // Let startup work (saved progress, audio settings) settle inside act().
  await ReactTestRenderer.act(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
  });
  expect(JSON.stringify(tree!.toJSON())).toContain('SHADOWMAN');
  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
