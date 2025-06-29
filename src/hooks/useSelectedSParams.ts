import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useSelectedSParams() {
  const queryClient = useQueryClient()
  const { data: selectedSParams = [] } = useQuery({
    queryKey: ['selected'],
    queryFn: () => queryClient.getQueryData<string[]>(['selected']) || [],
    // キャッシュの値が変わったら自動で再取得
  })
  const setSelectedSParams = (next: string[]) => queryClient.setQueryData(['selected'], next)
  const toggleSelectedSParam = (value: string) => {
    setSelectedSParams(selectedSParams.includes(value)
      ? selectedSParams.filter(x => x !== value)
      : [...selectedSParams, value]
    )
  }
  return { selectedSParams, toggleSelectedSParam, setSelectedSParams }
}
