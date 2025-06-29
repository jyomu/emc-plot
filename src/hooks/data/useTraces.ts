import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parseTouchstone } from '../../utils/parseTouchstone'
import type { PartialPlotData } from '../../types/plot'

export interface TracesState {
  allTraces: PartialPlotData[]
  sParams: string[]
  mutate: (file: File) => void
  status: 'idle' | 'pending' | 'error' | 'success'
  isLoading: boolean
  error: unknown | null
}

export function useTraces(): TracesState {
  const queryClient = useQueryClient()
  
  const mutation = useMutation<PartialPlotData[], unknown, File>({
    mutationFn: async (file: File) => {
      return await parseTouchstone(file)
    },
    onSuccess: (data: PartialPlotData[]) => {
      queryClient.setQueryData(['allTraces'], data)
    }
  })
  
  const { data: allTraces = [] } = useQuery({
    queryKey: ['allTraces'],
    queryFn: () => queryClient.getQueryData<PartialPlotData[]>(['allTraces']) || [],
    staleTime: Infinity, // ファイルデータは変更されない限りキャッシュを維持
  })
  
  const sParams = allTraces
    .map(t => typeof t.name === 'string' ? t.name : '')
    .filter((name): name is string => Boolean(name))
  
  return { 
    allTraces, 
    sParams, 
    mutate: mutation.mutate, 
    status: mutation.status,
    isLoading: mutation.isPending,
    error: mutation.error
  }
}
