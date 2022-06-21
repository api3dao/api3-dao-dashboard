import React from 'react';
import { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import classNames from 'classnames';
import ArrowRightIcon from '../../components/icons/ArrowRightIcon';
import ArrowLeftIcon from '../../components/icons/ArrowLeftIcon';
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
  const pagination = usePagination({ totalResults, currentPage, pageSize });
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
        <Link to={getHref(currentPage - 1)} className={styles.previous}>
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
              <NavLink
                replace
                to={getHref(page)}
                aria-label={'Page ' + page}
                isActive={() => page === props.currentPage}
              >
                {page}
              </NavLink>
            </li>
          );
        })}
      </ul>
      {currentPage < lastPage ? (
        <Link to={getHref(currentPage + 1)} className={styles.next}>
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

export function usePagination({
  totalResults,
  currentPage,
  pageSize = 10,
}: {
  totalResults: number;
  currentPage: number;
  pageSize?: number;
}): Array<number | '...'> {
  return useMemo(() => {
    const totalPageCount = Math.ceil(totalResults / pageSize);

    if (totalPageCount < MIN_PAGE_COUNT) {
      return getNumberRange(1, totalPageCount);
    }

    const lastPage = totalPageCount;

    const previousPage = Math.max(currentPage - 1, 1);
    const showDotsOnLeft = previousPage >= 4;

    const nextPage = Math.min(currentPage + 1, lastPage);
    const showDotsOnRight = nextPage <= lastPage - 3;

    // 1 2 3 4 5 ... 9 10
    if (!showDotsOnLeft && showDotsOnRight) {
      return [...getNumberRange(1, 5), '...', lastPage - 1, lastPage];
    }

    // 1 2 ... 6 7 8 9 10
    if (showDotsOnLeft && !showDotsOnRight) {
      return [1, 2, '...', ...getNumberRange(lastPage - 4, lastPage)];
    }

    // 1 ... 5 6 7 ... 10
    return [1, '...', ...getNumberRange(previousPage, nextPage), '...', lastPage];
  }, [totalResults, pageSize, currentPage]);
}

function getNumberRange(start: number, end: number) {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => index + start);
}

export function usePagedData<T>({
  data,
  currentPage,
  pageSize = 10,
}: {
  data: T[];
  currentPage: number;
  pageSize?: number;
}) {
  const totalPageCount = Math.ceil(data.length / pageSize);
  currentPage = Math.max(Math.min(currentPage, totalPageCount), 1);

  return useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);
}
