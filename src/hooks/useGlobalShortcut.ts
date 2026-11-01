// ============================================================
// Prompt Factory - 全局快捷键 Hook
// 监听 Escape（收起浮层）和 Enter（注入到光标）
// 注意：全局唤起快捷键由 Rust 侧 tauri-plugin-global-shortcut 处理，
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

      // Escape → 编辑模式下让位（取消语义由 PreviewPanel 的 handler 独占处理），
      // 否则收起浮层
      if (e.key === 'Escape') {
        // 编辑模式的 Esc（=取消，resetEditing）由 PreviewPanel 独占处理；
        // 此处不动作，消除双 handler 语义竞争（B2）
        if (assemblyState.mode === 'editing') {
          return;
        }
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
