import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LivePreview } from './LivePreview';

describe('LivePreview - Responsive Viewport', () => {
  const mockCode = 'function Component() { return <div>Test</div>; }\nrender(<Component />)';

  it('should render viewport selection buttons', () => {
    render(<LivePreview code={mockCode} />);

    expect(screen.getByRole('button', { name: /모바일/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /태블릿/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /데스크톱/i })).toBeInTheDocument();
  });

  it('should have desktop viewport active by default', () => {
    render(<LivePreview code={mockCode} />);

    const desktopButton = screen.getByRole('button', { name: /데스크톱/i });
    expect(desktopButton).toHaveClass('viewport-btn--active');
  });

  it('should set preview render width to 375px when mobile viewport is selected', async () => {
    const user = userEvent.setup();
    render(<LivePreview code={mockCode} />);

    const mobileButton = screen.getByRole('button', { name: /모바일/i });
    await user.click(mobileButton);

    const previewRender = screen.getByRole('button', { name: /모바일/i }).closest('.panel-header')?.nextElementSibling?.querySelector('.preview-render') as HTMLElement;
    expect(previewRender).toHaveStyle('width: 375px');
  });

  it('should set preview render width to 768px when tablet viewport is selected', async () => {
    const user = userEvent.setup();
    render(<LivePreview code={mockCode} />);

    const tabletButton = screen.getByRole('button', { name: /태블릿/i });
    await user.click(tabletButton);

    const previewRender = tabletButton.closest('.panel-header')?.nextElementSibling?.querySelector('.preview-render') as HTMLElement;
    expect(previewRender).toHaveStyle('width: 768px');
  });

  it('should set preview render width to 100% when desktop viewport is selected', async () => {
    const user = userEvent.setup();
    render(<LivePreview code={mockCode} />);

    // First switch to mobile
    const mobileButton = screen.getByRole('button', { name: /모바일/i });
    await user.click(mobileButton);

    // Then switch back to desktop
    const desktopButton = screen.getByRole('button', { name: /데스크톱/i });
    await user.click(desktopButton);

    const previewRender = desktopButton.closest('.panel-header')?.nextElementSibling?.querySelector('.preview-render') as HTMLElement;
    expect(previewRender).toHaveStyle('width: 100%');
  });

  it('should update active button when viewport changes', async () => {
    const user = userEvent.setup();
    render(<LivePreview code={mockCode} />);

    const mobileButton = screen.getByRole('button', { name: /모바일/i });
    const tabletButton = screen.getByRole('button', { name: /태블릿/i });
    const desktopButton = screen.getByRole('button', { name: /데스크톱/i });

    // Check desktop is active by default
    expect(desktopButton).toHaveClass('viewport-btn--active');
    expect(mobileButton).not.toHaveClass('viewport-btn--active');

    // Click mobile
    await user.click(mobileButton);
    expect(mobileButton).toHaveClass('viewport-btn--active');
    expect(desktopButton).not.toHaveClass('viewport-btn--active');

    // Click tablet
    await user.click(tabletButton);
    expect(tabletButton).toHaveClass('viewport-btn--active');
    expect(mobileButton).not.toHaveClass('viewport-btn--active');
  });
});
