import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseTouchstone } from '../utils/parseTouchstone'
import type { PartialPlotData } from '../types/plot'

export function useTraces() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      return await parseTouchstone(file)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['allTraces'], data)
    }
  })
  const allTraces = queryClient.getQueryData<PartialPlotData[]>(['allTraces']) || []
  const sParams = allTraces.map(t => typeof t.name === 'string' ? t.name : '').filter(Boolean)
  return { allTraces, sParams, mutate: mutation.mutate, status: mutation.status }
}
