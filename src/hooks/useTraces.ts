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
      queryClient.setQueryData(['traces'], data)
    }
  })
  const traces = queryClient.getQueryData<PartialPlotData[]>(['traces']) || []
  return { traces, mutate: mutation.mutate, status: mutation.status }
}
