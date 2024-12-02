import { ComponentPropsWithoutRef, useEffect } from 'react';

interface Props extends Omit<ComponentPropsWithoutRef<'a'>, 'target' | 'rel'> {
  href: string;
}

const ExternalLink = (props: Props) => {
  const { children, href: incomingHref, ...rest } = props;

  const href = cleanHref(incomingHref);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && href === 'about:blank') {
      // eslint-disable-next-line no-console
      console.warn(`An invalid URL has been provided: "${incomingHref}". Only https:// or http:// URLs are allowed.`);
    }
  }, [href, incomingHref]);

  return (
    <a target="_blank" rel="noopener noreferrer" href={href} {...rest}>
      {children}
    </a>
  );
};

const cleanHref = (href: string) => {
  const urlRegex = /^https?:\/\//i; // Starts with https:// or http:// (case insensitive)
  const trimmedHref = href.trim();

  if (!urlRegex.test(trimmedHref)) {
    return 'about:blank';
  }

  return trimmedHref;
};

export default ExternalLink;
