import { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import range from 'lodash/range';
import classNames from 'classnames';
import ArrowRightIcon from '../icons/arrow-right-icon';
import ArrowLeftIcon from '../icons/arrow-left-icon';
import { useQueryParams } from '../../utils';
import { useLocation } from 'react-router';
import styles from './pagination.module.scss';

interface Props {
  totalResults: number;
  currentPage: number;
  pageSize?: number;
  className?: string;
}

export default function Pagination(props: Props) {
  const { totalResults, currentPage, pageSize } = props;
  const pagination = useMemo(
    () => paginate(totalResults, { currentPage, pageSize }),
    [totalResults, currentPage, pageSize]
  );
  const lastPage = pagination[pagination.length - 1] as number;

  const location = useLocation();
  const params = useQueryParams();
  const getHref = (page: number) => {
    const newParams = new URLSearchParams(params);
    newParams.set('page', page.toString());
    return location.pathname + '?' + newParams.toString();
  };

  return (
    <nav className={classNames(styles.nav, props.className)} aria-label="Page navigation">
      {currentPage > 1 ? (
        <Link replace to={getHref(currentPage - 1)} className={styles.previous}>
          <ArrowLeftIcon aria-hidden /> Previous
        </Link>
      ) : (
        <span className={styles.previous}>
          <ArrowLeftIcon aria-hidden /> Previous
        </span>
      )}
      <ul>
        {pagination.map((page, index) => {
          if (page === '...') {
            return <li key={'dots-' + index}>...</li>;
          }

          return (
            <li key={page}>
              <NavLink replace to={getHref(page)} aria-label={'Page ' + page} isActive={() => page === currentPage}>
                {page}
              </NavLink>
            </li>
          );
        })}
      </ul>
      {currentPage < lastPage ? (
        <Link replace to={getHref(currentPage + 1)} className={styles.next}>
          Next <ArrowRightIcon aria-hidden />
        </Link>
      ) : (
        <span className={styles.next}>
          Next <ArrowRightIcon aria-hidden />
        </span>
      )}
    </nav>
  );
}

const MIN_PAGE_COUNT = 9;
const DEFAULT_PAGE_SIZE = 10;

interface PaginationOptions {
  currentPage: number;
  pageSize?: number;
}

export function paginate(
  totalResults: number,
  { currentPage, pageSize = DEFAULT_PAGE_SIZE }: PaginationOptions
): Array<number | '...'> {
  const totalPageCount = Math.ceil(totalResults / pageSize);

  if (totalPageCount < MIN_PAGE_COUNT) {
    // Total page count is small enough to return all pages
    return range(1, totalPageCount + 1);
  }

  const lastPage = totalPageCount;
  const previousPage = Math.max(currentPage - 1, 1);
  const nextPage = Math.min(currentPage + 1, lastPage);

  const insertDotsOnLeft = previousPage > 3;
  const insertDotsOnRight = nextPage < lastPage - 2;

  // 1 2 3 4 5 ... 9 10
  if (!insertDotsOnLeft && insertDotsOnRight) {
    return [...range(1, 6), '...', lastPage - 1, lastPage];
  }

  // 1 2 ... 6 7 8 9 10
  if (insertDotsOnLeft && !insertDotsOnRight) {
    return [1, 2, '...', ...range(lastPage - 4, lastPage + 1)];
  }

  // 1 ... 4 5 6 ... 10
  return [1, '...', ...range(previousPage, nextPage + 1), '...', lastPage];
}

export function usePagedData<T>(data: T[], { currentPage, pageSize = DEFAULT_PAGE_SIZE }: PaginationOptions) {
  const totalPageCount = Math.ceil(data.length / pageSize);
  currentPage = Math.max(Math.min(currentPage, totalPageCount), 1);

  return useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);
}
