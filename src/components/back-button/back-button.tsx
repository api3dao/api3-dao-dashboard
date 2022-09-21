import { ReactNode } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import ArrowLeftIcon from '../icons/arrow-left-icon';
import styles from './back-button.module.scss';

interface Props {
  children: ReactNode;
  fallback?: { href: string; text?: ReactNode };
}

export default function BackButton(props: Props) {
  const history = useHistory();
  const { fallback, children } = props;

  // We can go back if we are not on the first page the user visited
  const canGoBack = !window.history.state?.appEntryPage;

  if (!canGoBack && fallback) {
    return (
      <Link to={fallback.href} className={styles.backLink}>
        <ArrowLeftIcon aria-hidden />
        {fallback.text || children}
      </Link>
    );
  }

  return (
    <button disabled={!canGoBack} className={styles.backButton} onClick={() => history.goBack()}>
      <ArrowLeftIcon aria-hidden />
      {children}
    </button>
  );
}

/*
  Identify the current page as the one the user first visited (i.e. the entry page).
 */
export function identifyAppEntryPage() {
  // We use session storage so that if the user refreshes the browser tab, that we don't
  // identify another entry page
  if (window.sessionStorage.getItem('hasIdentifiedAppEntryPage') !== 'true') {
    // The HashRouter (from react-router) doesn't support history/location state: https://v5.reactrouter.com/web/api/HashRouter
    window.history.replaceState({ appEntryPage: true }, '');
    window.sessionStorage.setItem('hasIdentifiedAppEntryPage', 'true');
  }
}
