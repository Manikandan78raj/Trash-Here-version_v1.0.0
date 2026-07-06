import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

describe('Card Component & Subcomponents', () => {
  it('should render children inside card container', () => {
    render(
      <Card>
        <div data-testid="card-child">Card Content</div>
      </Card>,
    );
    expect(screen.getByTestId('card-child')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should apply custom classNames', () => {
    const { container } = render(<Card className="custom-card-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-card-class');
  });

  it('should render with rounded-3xl and bg-card classes by default', () => {
    const { container } = render(<Card>Card Content</Card>);
    expect(container.firstChild).toHaveClass('rounded-3xl', 'bg-card');
  });

  it('should render all subcomponents correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title Test</CardTitle>
          <CardDescription>Description Test</CardDescription>
        </CardHeader>
        <CardContent>Content Body</CardContent>
        <CardFooter>Footer Content</CardFooter>
      </Card>,
    );

    expect(screen.getByText('Title Test')).toBeInTheDocument();
    expect(screen.getByText('Description Test')).toBeInTheDocument();
    expect(screen.getByText('Content Body')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });
});
