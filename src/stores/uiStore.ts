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
  /** 正在编辑的片段 ID，null=新增模式 */
  editingSnippetId: string | null;
  /** 片段库搜索关键词 */
  searchQuery: string;
  /** 搜索结果覆盖层是否展开 */
  searchPanelOpen: boolean;
  /** 底部区域当前 Tab：模板 / 片段库 */
  activeTab: 'template' | 'snippet';
  /** 模板编辑器是否展开 */
  showTemplateEditor: boolean;
  /** 正在编辑的模板 ID，null=新增模式 */
  editingTemplateId: string | null;
  /** 当前选中的模板 ID（高亮态），null=未选中 */
  selectedTemplateId: string | null;
  /** 设置片段库搜索关键词 */
  setSearchQuery: (q: string) => void;
  /** 设置搜索结果覆盖层展开状态 */
  setSearchPanelOpen: (open: boolean) => void;
  /** 切换浮层显隐（调用 Rust toggle_overlay + 同步前端状态） */
  toggleOverlay: () => Promise<void>;
  /** 仅同步前端状态为隐藏（Rust 端已隐藏窗口时使用） */
  hideOverlay: () => void;
  /** 显示 Toast，2 秒后自动清除 */
  showToast: (msg: string, type: 'success' | 'info') => void;
  /** 切换片段编辑器面板（新增模式） */
  toggleSnippetEditor: () => void;
  /** 开始编辑片段（打开编辑器并预填数据） */
  startEditSnippet: (id: string) => void;
  /** 设置底部 Tab */
  setActiveTab: (tab: 'template' | 'snippet') => void;
  /** 切换模板编辑器面板（新增模式） */
  toggleTemplateEditor: () => void;
  /** 开始编辑模板（打开编辑器并预填数据） */
  startEditTemplate: (id: string) => void;
  /** 设置选中模板 */
  setSelectedTemplate: (id: string | null) => void;
  /** 分类新增模式是否展开（片段库内，由 TabBar 的+分类触发） */
  showCategoryEditor: boolean;
  /** 设置分类新增模式 */
  setShowCategoryEditor: (open: boolean) => void;
}

/** Toast 自动清除计时器 */
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIStore>((set) => ({
  overlayVisible: false,
  toast: null,
  showSnippetEditor: false,
  editingSnippetId: null,
  searchQuery: '',
  searchPanelOpen: false,
  activeTab: 'template',
  showTemplateEditor: false,
  editingTemplateId: null,
  selectedTemplateId: null,
  showCategoryEditor: false,

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

  setSearchQuery: (q) => {
    set({ searchQuery: q });
  },

  setSearchPanelOpen: (open) => {
    set({ searchPanelOpen: open });
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
    set((s) => ({ showSnippetEditor: !s.showSnippetEditor, editingSnippetId: null }));
  },

  startEditSnippet: (id: string) => {
    set({ showSnippetEditor: true, editingSnippetId: id });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  toggleTemplateEditor: () => {
    set((s) => ({ showTemplateEditor: !s.showTemplateEditor, editingTemplateId: null }));
  },

  startEditTemplate: (id: string) => {
    set({ showTemplateEditor: true, editingTemplateId: id });
  },

  setSelectedTemplate: (id) => {
    set({ selectedTemplateId: id });
  },

  setShowCategoryEditor: (open) => {
    set({ showCategoryEditor: open });
  },
}));
