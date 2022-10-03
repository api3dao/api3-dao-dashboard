import { useEffect, ComponentProps } from 'react';

const ExternalLink = (props: Omit<ComponentProps<'a'>, 'target' | 'rel'>) => {
  const { href, children, ...rest } = props;

  let sanitizedHref = href?.trim();
  const urlRegex = /^https?:\/\//i; // Starts with https:// or http:// (case insensitive)
  if (sanitizedHref && !urlRegex.test(sanitizedHref)) {
    sanitizedHref = 'about:blank';
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && sanitizedHref === 'about:blank') {
      // eslint-disable-next-line no-console
      console.warn(`An invalid URL has been provided: "${href}". Only https:// or http:// URLs are allowed.`);
    }
  }, [sanitizedHref, href]);

  return (
    <a href={sanitizedHref} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
};

export default ExternalLink;
