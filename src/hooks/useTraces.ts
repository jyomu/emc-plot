import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parseTouchstone } from '../utils/parseTouchstone'
import type { PartialPlotData } from '../types/plot'

export function useTraces() {
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
  })
  const sParams = allTraces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  return { allTraces, sParams, mutate: mutation.mutate, status: mutation.status }
}
