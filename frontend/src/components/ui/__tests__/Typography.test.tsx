import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading, Text, Caption, Code } from '../Typography';

describe('Typography Components', () => {
  describe('Heading', () => {
    it('should render h1 when level is 1', () => {
      render(<Heading level={1}>Title H1</Heading>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Title H1');
    });

    it('should render h2 by default', () => {
      render(<Heading>Default H2</Heading>);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });

  describe('Text', () => {
    it('should render paragraph text with default variant', () => {
      render(<Text>Paragraph content</Text>);
      const p = screen.getByText('Paragraph content');
      expect(p.tagName.toLowerCase()).toBe('p');
      expect(p).toHaveClass('text-base');
    });

    it('should render lead variant correctly', () => {
      render(<Text variant="lead">Lead text</Text>);
      expect(screen.getByText('Lead text')).toHaveClass('text-lg');
    });
  });

  describe('Caption and Code', () => {
    it('should render Caption component', () => {
      render(<Caption>Upper Caption</Caption>);
      expect(screen.getByText('Upper Caption')).toHaveClass('uppercase');
    });

    it('should render Code component', () => {
      render(<Code>const x = 10;</Code>);
      const code = screen.getByText('const x = 10;');
      expect(code.tagName.toLowerCase()).toBe('code');
      expect(code).toHaveClass('font-mono');
    });
  });
});
