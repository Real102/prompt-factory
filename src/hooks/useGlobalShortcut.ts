// ============================================================
// Prompt Factory - 全局快捷键 Hook
// 监听 Escape（收起浮层）和 Enter（注入到光标）
// 注意：Ctrl+Space 全局唤起由 Rust 侧 tauri-plugin-global-shortcut 处理
// ============================================================

import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAssemblyStore } from '@/stores/assemblyStore';

/**
 * 全局键盘快捷键监听。
 *
 * - Escape: 浮层可见时收起
 * - Enter:  拼装台非空且焦点不在输入控件时，执行注入
 *
 * 在根组件挂载时调用一次即可。
 */
export function useGlobalShortcut(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const uiState = useUIStore.getState();
      const assemblyState = useAssemblyStore.getState();

      // Escape → 收起浮层
      if (e.key === 'Escape') {
        if (uiState.overlayVisible) {
          e.preventDefault();
          void uiState.toggleOverlay();
        }
        return;
      }

      // Enter → 注入到光标（仅在非输入控件聚焦时）
      if (e.key === 'Enter' && assemblyState.canAction) {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        void assemblyState.injectToCursor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
