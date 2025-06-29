import { useQuery, useQueryClient } from '@tanstack/react-query'

export interface SelectedSParamsState {
  selectedSParams: string[]
  toggleSelectedSParam: (value: string) => void
  setSelectedSParams: (params: string[]) => void
  clearSelection: () => void
  selectAll: (availableParams: string[]) => void
}

export function useSelectedSParams(): SelectedSParamsState {
  const queryClient = useQueryClient()
  
  const { data: selectedSParams = [] } = useQuery({
    queryKey: ['selected'],
    queryFn: () => queryClient.getQueryData<string[]>(['selected']) || [],
    staleTime: Infinity, // 選択状態は明示的に変更されるまでキャッシュを維持
  })
  
  const setSelectedSParams = (next: string[]) => {
    queryClient.setQueryData(['selected'], next)
  }
  
  const toggleSelectedSParam = (value: string) => {
    setSelectedSParams(
      selectedSParams.includes(value)
        ? selectedSParams.filter(x => x !== value)
        : [...selectedSParams, value]
    )
  }
  
  const clearSelection = () => {
    setSelectedSParams([])
  }
  
  const selectAll = (availableParams: string[]) => {
    setSelectedSParams(availableParams)
  }
  
  return { 
    selectedSParams, 
    toggleSelectedSParam, 
    setSelectedSParams,
    clearSelection,
    selectAll
  }
}
