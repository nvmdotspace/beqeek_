import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useApiErrorHandler } from './use-api-error-handler';

export const useQueryWithAuth = <T>(options: UseQueryOptions<T, Error, T, any>) => {
  const { handleError } = useApiErrorHandler();

  const query = useQuery(options);

  // Handle 401 errors after render to avoid state updates during render
  useEffect(() => {
    if (query.error) {
      handleError(query.error);
    }
  }, [query.error, handleError]);

  return query;
};
