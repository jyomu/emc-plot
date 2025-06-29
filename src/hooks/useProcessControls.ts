import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { LogType } from '../types/plot'

export interface PreProcessState {
  maEnabled: boolean;
  maWindow: number;
  logType: LogType;
  showHalf: boolean;
}

export interface PostProcessState {
  showMA: boolean;
  maWindow: number;
}

const DEFAULT_PRE_PROCESS_STATE: PreProcessState = {
  maEnabled: false,
  maWindow: 50,
  logType: 'none',
  showHalf: true
}

const DEFAULT_POST_PROCESS_STATE: PostProcessState = {
  showMA: false,
  maWindow: 50
}

// Pre-process controls hook (DFTとIDFTで個別管理)
export function usePreProcessControls(processType: 'dft' | 'idft') {
  const queryClient = useQueryClient()
  
  const { data: state } = useQuery({
    queryKey: ['preProcessState', processType],
    queryFn: () => DEFAULT_PRE_PROCESS_STATE,
    staleTime: Infinity,
  })

  const setMaEnabled = (enabled: boolean) => {
    queryClient.setQueryData(['preProcessState', processType], (old: PreProcessState) => ({
      ...old,
      maEnabled: enabled
    }))
  }

  const setMaWindow = (window: number) => {
    queryClient.setQueryData(['preProcessState', processType], (old: PreProcessState) => ({
      ...old,
      maWindow: window
    }))
  }

  const setLogType = (logType: LogType) => {
    queryClient.setQueryData(['preProcessState', processType], (old: PreProcessState) => ({
      ...old,
      logType
    }))
  }

  const setShowHalf = (showHalf: boolean) => {
    queryClient.setQueryData(['preProcessState', processType], (old: PreProcessState) => ({
      ...old,
      showHalf
    }))
  }

  return {
    state: state || DEFAULT_PRE_PROCESS_STATE,
    setMaEnabled,
    setMaWindow,
    setLogType,
    setShowHalf
  }
}

// Post-process controls hook
export function usePostProcessControls() {
  const queryClient = useQueryClient()
  
  const { data: state } = useQuery({
    queryKey: ['postProcessState'],
    queryFn: () => DEFAULT_POST_PROCESS_STATE,
    staleTime: Infinity,
  })

  const setShowMA = (showMA: boolean) => {
    queryClient.setQueryData(['postProcessState'], (old: PostProcessState) => ({
      ...old,
      showMA
    }))
  }

  const setMaWindow = (maWindow: number) => {
    queryClient.setQueryData(['postProcessState'], (old: PostProcessState) => ({
      ...old,
      maWindow
    }))
  }

  return {
    state: state || DEFAULT_POST_PROCESS_STATE,
    setShowMA,
    setMaWindow
  }
}
