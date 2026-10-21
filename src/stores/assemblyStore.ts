// ============================================================
// Prompt Factory - 拼装台 Store
// 管理拼装台片段顺序、组合文本、注入与复制操作
// ============================================================

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { compose, applyVariables } from '@/services/composeEngine';
import { useSnippetStore } from './snippetStore';
import { useUIStore } from './uiStore';

/** 拼装台 Store 接口 */
interface AssemblyStore {
  /** 拼装台中的片段 ID 列表（有序） */
  assemblyItems: string[];
  /** 组合后的完整文本（自动合成，派生，含 {{}} 占位符） */
  composedText: string;
  /** 变量值字典（运行时状态，不持久化） */
  variables: Record<string, string>;
  /** 是否可执行操作（注入/复制） */
  canAction: boolean;
  /** 当前模式 */
  mode: 'assembly' | 'editing';
  /** 是否因编辑而锁定拼装台 */
  isLocked: boolean;
  /** 用户编辑后的文本快照（null=未编辑过） */
  editedText: string | null;
  /** 添加片段到拼装台（已存在则忽略） */
  addToAssembly: (id: string) => void;
  /** 从拼装台移除片段 */
  removeFromAssembly: (id: string) => void;
  /** 重排拼装台（供 dnd-kit onDragEnd 调用） */
  reorderAssembly: (from: number, to: number) => void;
  /** 清空拼装台 */
  clearAssembly: () => void;
  /** 设置变量值 */
  setVariable: (name: string, value: string) => void;
  /** 进入编辑模式 */
  enterEditing: () => void;
  /** 退出编辑模式（锁定拼装台） */
  exitEditing: () => void;
  /** 重置编辑态（解锁拼装台，保留片段和顺序） */
  resetEditing: () => void;
  /** 设置编辑文本（预览框编辑时调用） */
  setEditedText: (text: string) => void;
  /** 注入到光标位置 */
  injectToCursor: () => Promise<void>;
  /** 复制到剪贴板 */
  copyToClipboard: () => Promise<void>;
}

/**
 * 根据当前拼装台和片段库计算 composedText。
 * 从两个 store 的实时状态派生，确保数据一致。
 */
function computeComposedText(
  assemblyItems: string[]
): string {
  const snippets = useSnippetStore.getState().snippets;
  return compose(assemblyItems, snippets);
}

export const useAssemblyStore = create<AssemblyStore>((set, get) => ({
  assemblyItems: [],
  composedText: '',
  variables: {},
  canAction: false,
  mode: 'assembly',
  isLocked: false,
  editedText: null,

  addToAssembly: (id) => {
    if (get().isLocked) return;
    const { assemblyItems } = get();
    if (assemblyItems.includes(id)) return;
    const next = [...assemblyItems, id];
    set({
      assemblyItems: next,
      composedText: computeComposedText(next),
      variables: {},
      canAction: next.length > 0,
    });
  },

  removeFromAssembly: (id) => {
    if (get().isLocked) return;
    const { assemblyItems } = get();
    const next = assemblyItems.filter((item) => item !== id);
    set({
      assemblyItems: next,
      composedText: computeComposedText(next),
      canAction: next.length > 0,
    });
  },

  reorderAssembly: (from, to) => {
    if (get().isLocked) return;
    const { assemblyItems } = get();
    if (
      from < 0 ||
      from >= assemblyItems.length ||
      to < 0 ||
      to >= assemblyItems.length ||
      from === to
    ) {
      return;
    }
    const next = [...assemblyItems];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set({
      assemblyItems: next,
      composedText: computeComposedText(next),
      canAction: next.length > 0,
    });
  },

  clearAssembly: () => {
    set({
      assemblyItems: [],
      composedText: '',
      variables: {},
      canAction: false,
      mode: 'assembly',
      isLocked: false,
      editedText: null,
    });
  },

  setVariable: (name, value) => {
    const { variables } = get();
    set({ variables: { ...variables, [name]: value } });
  },

  enterEditing: () => {
    const { composedText, editedText, variables } = get();
    // 占位符前后各加一个空格，再替换变量值
    // 编辑框中通过空格辨认变量填入部分（textarea 无法富文本高亮）
    const padded = composedText.replace(
      /\{\{([\w\u4e00-\u9fff]+)\}\}/g,
      ' $& '
    );
    const resolved = applyVariables(padded, variables);
    if (!resolved && !editedText) return;
    set({
      mode: 'editing',
      editedText: editedText ?? resolved,
    });
  },

  exitEditing: () => {
    set({
      mode: 'assembly',
      isLocked: true,
    });
  },

  resetEditing: () => {
    set({
      editedText: null,
      isLocked: false,
      mode: 'assembly',
    });
  },

  setEditedText: (text) => {
    set({ editedText: text });
  },

  injectToCursor: async () => {
    const { editedText, composedText, variables } = get();
    const text = editedText ?? applyVariables(composedText, variables);
    if (!text) return;
    try {
      const ok = await invoke<boolean>('inject_text', { text });
      if (ok) {
        useUIStore.getState().hideOverlay();
      } else {
        useUIStore.getState().showToast('注入失败', 'info');
      }
    } catch {
      useUIStore.getState().showToast('注入不可用', 'info');
    }
  },

  copyToClipboard: async () => {
    const { editedText, composedText, variables } = get();
    const text = editedText ?? applyVariables(composedText, variables);
    if (!text) return;
    try {
      const ok = await invoke<boolean>('copy_to_clipboard', { text });
      if (ok) {
        useUIStore.getState().showToast('已复制到剪贴板', 'success');
      } else {
        useUIStore.getState().showToast('复制失败', 'info');
      }
    } catch {
      useUIStore.getState().showToast('复制不可用', 'info');
    }
  },
}));

// ---- 跨 Store 同步 ----
// 当 snippetStore 中的 snippets 发生变化时（如编辑片段内容），
// 重新计算 composedText 以保持实时一致。
useSnippetStore.subscribe((state) => {
  const assemblyState = useAssemblyStore.getState();
  if (assemblyState.assemblyItems.length === 0) return;
  const newComposed = compose(assemblyState.assemblyItems, state.snippets);
  if (newComposed !== assemblyState.composedText) {
    useAssemblyStore.setState({ composedText: newComposed });
  }
});
