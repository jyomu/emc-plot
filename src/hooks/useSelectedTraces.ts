import { useQueryClient } from '@tanstack/react-query'

export function useSelectedTraces() {
  const queryClient = useQueryClient()
  const selected = queryClient.getQueryData<string[]>(['selected']) || []
  const setSelected = (next: string[]) => queryClient.setQueryData(['selected'], next)
  const toggleSelected = (value: string) => {
    setSelected(selected.includes(value)
      ? selected.filter(x => x !== value)
      : [...selected, value]
    )
  }
  return { selected, toggleSelected, setSelected }
}
