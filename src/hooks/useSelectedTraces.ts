import { useState, useCallback } from 'react'

export function useSelectedTraces() {
  const [selected, setSelected] = useState<string[]>([])
  const toggleSelected = useCallback((value: string) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(x => x !== value)
        : [...prev, value]
    )
  }, [])
  return { selected, toggleSelected, setSelected }
}
