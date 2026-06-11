import { QueryClient, MutationCache } from '@tanstack/react-query'
import { showToastGlobal } from '../components/shared/Toast.jsx'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: () => showToastGlobal('Could not save — please try again', 'error'),
  }),
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
})
