// ============================================================
// Prompt Factory - UI 状态 Store
// 管理浮层可见性、Toast 通知、编辑器面板开关
// ============================================================

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

/** Toast 通知类型 */
interface Toast {
  msg: string;
  type: 'success' | 'info';
}

/** UI Store 接口 */
interface UIStore {
  /** 浮层（主窗口）是否可见 */
  overlayVisible: boolean;
  /** 当前 Toast 通知，null 表示无 */
  toast: Toast | null;
  /** 片段新增/编辑表单是否展开 */
  showSnippetEditor: boolean;
  /** 切换浮层显隐（调用 Rust toggle_overlay + 同步前端状态） */
  toggleOverlay: () => Promise<void>;
  /** 仅同步前端状态为隐藏（Rust 端已隐藏窗口时使用） */
  hideOverlay: () => void;
  /** 显示 Toast，2 秒后自动清除 */
  showToast: (msg: string, type: 'success' | 'info') => void;
  /** 切换片段编辑器面板 */
  toggleSnippetEditor: () => void;
}

/** Toast 自动清除计时器 */
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIStore>((set) => ({
  overlayVisible: false,
  toast: null,
  showSnippetEditor: false,

  toggleOverlay: async () => {
    try {
      await invoke('toggle_overlay');
    } catch {
      // IPC 不可用（浏览器开发环境），仅切换前端状态
    }
    set((s) => ({ overlayVisible: !s.overlayVisible }));
  },

  hideOverlay: () => {
    set({ overlayVisible: false });
  },

  showToast: (msg, type) => {
    set({ toast: { msg, type } });
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      set({ toast: null });
      toastTimer = null;
    }, 2000);
  },

  toggleSnippetEditor: () => {
    set((s) => ({ showSnippetEditor: !s.showSnippetEditor }));
  },
}));
