import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { LogType } from '../types/plot'

/**
 * DFT/IDFT処理前のデータ変換設定
 */
export interface PreProcessState {
  maEnabled: boolean;
  maWindow: number;
  logType: LogType;
  showHalf: boolean;
}

/**
 * プロット表示時の後処理設定（全プロット共通）
 */
export interface PostProcessState {
  showMA: boolean;
  maWindow: number;
}

/**
 * Pre-process controls hook return type
 */
export interface PreProcessControls {
  state: PreProcessState;
  setMaEnabled: (enabled: boolean) => void;
  setMaWindow: (window: number) => void;
  setLogType: (logType: LogType) => void;
  setShowHalf: (showHalf: boolean) => void;
}

/**
 * Post-process controls hook return type
 */
export interface PostProcessControls {
  state: PostProcessState;
  setShowMA: (showMA: boolean) => void;
  setMaWindow: (maWindow: number) => void;
}

const DEFAULT_PRE_PROCESS_STATE: PreProcessState = {
  maEnabled: false,
  maWindow: 50,
  logType: 'none',
  showHalf: true
} as const

const DEFAULT_POST_PROCESS_STATE: PostProcessState = {
  showMA: false,
  maWindow: 50
} as const

/**
 * DFT/IDFT個別の前処理設定を管理
 * @param processType - 'dft' または 'idft'
 * @returns PreProcessControls
 */
export function usePreProcessControls(processType: 'dft' | 'idft'): PreProcessControls {
  const queryClient = useQueryClient()
  
  const { data: state } = useQuery({
    queryKey: ['preProcessState', processType],
    queryFn: () => DEFAULT_PRE_PROCESS_STATE,
    staleTime: Infinity,
  })

  const setMaEnabled = (enabled: boolean) => {
    queryClient.setQueryData(['preProcessState', processType], (old: PreProcessState | undefined) => ({
      ...(old || DEFAULT_PRE_PROCESS_STATE),
      maEnabled: enabled
    }))
  }

  const setMaWindow = (window: number) => {
    if (window < 2 || window > 1000) return // バリデーション
    queryClient.setQueryData(['preProcessState', processType], (old: PreProcessState | undefined) => ({
      ...(old || DEFAULT_PRE_PROCESS_STATE),
      maWindow: window
    }))
  }

  const setLogType = (logType: LogType) => {
    queryClient.setQueryData(['preProcessState', processType], (old: PreProcessState | undefined) => ({
      ...(old || DEFAULT_PRE_PROCESS_STATE),
      logType
    }))
  }

  const setShowHalf = (showHalf: boolean) => {
    queryClient.setQueryData(['preProcessState', processType], (old: PreProcessState | undefined) => ({
      ...(old || DEFAULT_PRE_PROCESS_STATE),
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

/**
 * 全プロット共通の後処理設定を管理
 * @returns PostProcessControls
 */
export function usePostProcessControls(): PostProcessControls {
  const queryClient = useQueryClient()
  
  const { data: state } = useQuery({
    queryKey: ['postProcessState'],
    queryFn: () => DEFAULT_POST_PROCESS_STATE,
    staleTime: Infinity,
  })

  const setShowMA = (showMA: boolean) => {
    queryClient.setQueryData(['postProcessState'], (old: PostProcessState | undefined) => ({
      ...(old || DEFAULT_POST_PROCESS_STATE),
      showMA
    }))
  }

  const setMaWindow = (maWindow: number) => {
    if (maWindow < 2 || maWindow > 1000) return // バリデーション
    queryClient.setQueryData(['postProcessState'], (old: PostProcessState | undefined) => ({
      ...(old || DEFAULT_POST_PROCESS_STATE),
      maWindow
    }))
  }

  return {
    state: state || DEFAULT_POST_PROCESS_STATE,
    setShowMA,
    setMaWindow
  }
}
