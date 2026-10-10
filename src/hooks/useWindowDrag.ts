import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useWindowDrag() {
  const onMouseDown = useCallback(async (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    try {
      await invoke('start_drag');
    } catch {
      // 浏览器环境忽略
    }
  }, []);

  return { onMouseDown };
}
