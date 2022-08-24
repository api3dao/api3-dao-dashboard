import { render, screen } from '@testing-library/react';
import ExternalLink from './external-link';

describe('<ExternalLink />', () => {
  it('accepts an URL that starts with "https://"', () => {
    render(<ExternalLink href="https://api3.org">API3</ExternalLink>);
    expect(screen.getByRole('link', { name: 'API3' })).toHaveAttribute('href', 'https://api3.org');
  });

  it('accepts an URL that starts with "http://"', () => {
    render(<ExternalLink href="http://api3.org">API3</ExternalLink>);
    expect(screen.getByRole('link', { name: 'API3' })).toHaveAttribute('href', 'http://api3.org');
  });

  it('accepts a mixed-case URL', () => {
    render(<ExternalLink href="Https://api3.org">API3</ExternalLink>);
    expect(screen.getByRole('link', { name: 'API3' })).toHaveAttribute('href', 'Https://api3.org');
  });

  it('accepts an URL that is padded with whitespace', () => {
    render(<ExternalLink href=" https://api3.org ">API3</ExternalLink>);
    expect(screen.getByRole('link', { name: 'API3' })).toHaveAttribute('href', 'https://api3.org');
  });

  it('rejects a javascript URL', () => {
    // eslint-disable-next-line no-script-url
    render(<ExternalLink href="javascript:alert('xss')">API3</ExternalLink>);
    expect(screen.getByRole('link', { name: 'API3' })).toHaveAttribute('href', 'about:blank');
  });

  it('rejects a data URL', () => {
    render(<ExternalLink href="data:text/html,<script>alert('xss')</script>">API3</ExternalLink>);
    expect(screen.getByRole('link', { name: 'API3' })).toHaveAttribute('href', 'about:blank');
  });

  it('rejects an URL without protocol', () => {
    render(<ExternalLink href="api3.org">API3</ExternalLink>);
    expect(screen.getByRole('link', { name: 'API3' })).toHaveAttribute('href', 'about:blank');
  });
});
