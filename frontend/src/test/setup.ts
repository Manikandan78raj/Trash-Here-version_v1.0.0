import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Global ResizeObserver and layout property mocks for jsdom virtualization (@tanstack/react-virtual)
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: { width: 1000, height: 600, top: 0, left: 0, bottom: 600, right: 1000, x: 0, y: 0, toJSON: () => {} },
          borderBoxSize: [{ inlineSize: 1000, blockSize: 600 }],
          contentBoxSize: [{ inlineSize: 1000, blockSize: 600 }],
        } as any,
      ],
      this as any,
    );
  }
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = MockResizeObserver as any;

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 600,
});
Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
  configurable: true,
  value: 60000,
});
Element.prototype.getBoundingClientRect = () => ({
  width: 1000,
  height: 600,
  top: 0,
  left: 0,
  bottom: 600,
  right: 1000,
  x: 0,
  y: 0,
  toJSON: () => {},
});

afterEach(() => {
  cleanup();
});
