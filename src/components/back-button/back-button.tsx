import { ReactNode } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import styles from './back-button.module.scss';

interface Props {
  children: ReactNode;
  fallback?: { href: string; text?: ReactNode };
}

export default function BackButton(props: Props) {
  const history = useHistory();
  const { fallback, children } = props;

  // We can go back if we are not on the first page the user visited
  const canGoBack = !window.history.state?._app_entry_page;

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
  When the app mounts we want to identify the current page as the one the user first visited (i.e. the entry page),
  so that if the custom back button is present on the entry page, that it knows that it can't go back.
 */
export function identifyAppEntryPage() {
  // We use session storage so that if the user refreshes the browser tab, that we don't identify another entry page
  if (window.sessionStorage.getItem('has_identified_app_entry_page') !== 'true') {
    window.history.replaceState({ _app_entry_page: true }, '');
    window.sessionStorage.setItem('has_identified_app_entry_page', 'true');
  }
}
