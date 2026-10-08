// ============================================================
// Prompt Factory - 剪贴板 Hook
// 封装 Tauri copy_to_clipboard IPC，提供带 Toast 反馈的复制方法
// ============================================================

import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useUIStore } from '@/stores/uiStore';

/** useClipboard 返回值 */
interface UseClipboardReturn {
  /** 复制文本到剪贴板，成功/失败均显示 Toast */
  copy: (text: string) => Promise<boolean>;
}

/**
 * 剪贴板操作 Hook。
 *
 * 通过 Tauri invoke 调用 Rust 侧 copy_to_clipboard 命令，
 * 浏览器环境下 invoke 抛异常时显示失败提示。
 */
export function useClipboard(): UseClipboardReturn {
  const showToast = useUIStore((s) => s.showToast);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        const ok = await invoke<boolean>('copy_to_clipboard', { text });
        if (ok) {
          showToast('已复制到剪贴板', 'success');
        } else {
          showToast('复制失败', 'info');
        }
        return ok;
      } catch {
        showToast('复制不可用', 'info');
        return false;
      }
    },
    [showToast]
  );

  return { copy };
}
