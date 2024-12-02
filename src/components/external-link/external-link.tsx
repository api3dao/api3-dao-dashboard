import { KeyboardEvent, MouseEvent, ReactNode, useEffect } from 'react';

interface Props {
  className?: string;
  href: string;
  children: ReactNode;
}

const ExternalLink = (props: Props) => {
  const { className, children } = props;

  let href = props.href.trim();
  const urlRegex = /^https?:\/\//i; // Starts with https:// or http:// (case insensitive)
  if (!urlRegex.test(href)) {
    href = 'about:blank';
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && href === 'about:blank') {
      // eslint-disable-next-line no-console
      console.warn(`An invalid URL has been provided: "${props.href}". Only https:// or http:// URLs are allowed.`);
    }
  }, [href, props.href]);

  const handleEvent = (event: KeyboardEvent<HTMLAnchorElement> | MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onKeyDown={handleEvent}
      onClick={handleEvent}
    >
      {children}
    </a>
  );
};

export default ExternalLink;
