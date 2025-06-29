import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useSelectedTraces() {
  const queryClient = useQueryClient()
  const { data: selected = [] } = useQuery({
    queryKey: ['selected'],
    queryFn: () => queryClient.getQueryData<string[]>(['selected']) || [],
    // キャッシュの値が変わったら自動で再取得
  })
  const setSelected = (next: string[]) => queryClient.setQueryData(['selected'], next)
  const toggleSelected = (value: string) => {
    setSelected(selected.includes(value)
      ? selected.filter(x => x !== value)
      : [...selected, value]
    )
  }
  return { selected, toggleSelected, setSelected }
}
