import { create } from 'zustand';
import type { Category, Snippet, ToastState, ToastVariant } from '../types';

/**
 * Mock 片段数据 —— 子 Agent 4 实现 store 后替换为真实数据源。
 * 覆盖全部 5 个分类，便于验证配色与交互。
 */
const MOCK_SNIPPETS: Snippet[] = [
  { id: 's1', name: '资深前端工程师', content: '你是一位资深前端工程师，精通 React 与 TypeScript。', category: 'role', version: 1, updated_at: 0 },
  { id: 's2', name: '后端架构师', content: '你是一位后端架构师，擅长分布式系统设计。', category: 'role', version: 1, updated_at: 0 },
  { id: 's3', name: '允许联网搜索', content: '允许使用联网搜索获取最新信息。', category: 'perm', version: 1, updated_at: 0 },
  { id: 's4', name: '可执行代码', content: '允许执行代码以验证结果。', category: 'perm', version: 1, updated_at: 0 },
  { id: 's5', name: '不要臆测', content: '不要臆测未知信息，不确定时主动提问。', category: 'avoid', version: 1, updated_at: 0 },
  { id: 's6', name: '避免模糊', content: '避免模糊表述，给出明确结论。', category: 'avoid', version: 1, updated_at: 0 },
  { id: 's7', name: 'Markdown 输出', content: '使用 Markdown 格式输出。', category: 'fmt', version: 1, updated_at: 0 },
  { id: 's8', name: '代码块标注语言', content: '代码块需标注语言类型。', category: 'fmt', version: 1, updated_at: 0 },
  { id: 's9', name: '项目上下文', content: '当前项目：Prompt Factory MVP。', category: 'ctx', version: 1, updated_at: 0 },
  { id: 's10', name: '技术栈', content: '技术栈：React + Tauri + Zustand。', category: 'ctx', version: 1, updated_at: 0 },
];

interface SnippetStore {
  /* ---- state ---- */
  snippets: Snippet[];
  assemblyIds: string[];
  previewText: string;
  searchQuery: string;
  editorVisible: boolean;
  toast: ToastState;
  collapsedCategories: Record<string, boolean>;

  /* ---- actions ---- */
  loadSnippets: () => void;
  toggleAssembly: (id: string) => void;
  removeFromAssembly: (id: string) => void;
  reorderAssembly: (activeId: string, overId: string) => void;
  setSearchQuery: (q: string) => void;
  showEditor: () => void;
  hideEditor: () => void;
  saveSnippet: (data: { name: string; content: string; category: Category }) => void;
  showToast: (message: string, variant: ToastVariant) => void;
  hideToast: () => void;
  toggleCategoryCollapse: (category: string) => void;
  composePreview: () => void;
  copyToClipboard: () => void;
  injectAtCursor: () => void;
}

function compose(snippets: Snippet[], assemblyIds: string[]): string {
  return assemblyIds
    .map((id) => snippets.find((s) => s.id === id))
    .filter((s): s is Snippet => s != null)
    .map((s) => s.content)
    .join('\n\n');
}

export const useSnippetStore = create<SnippetStore>((set, get) => ({
  snippets: [],
  assemblyIds: [],
  previewText: '',
  searchQuery: '',
  editorVisible: false,
  toast: { visible: false, message: '', variant: 'copy' },
  collapsedCategories: { role: false, perm: true, avoid: true, fmt: true, ctx: true },

  loadSnippets: () => {
    set({ snippets: MOCK_SNIPPETS });
  },

  toggleAssembly: (id) => {
    const { assemblyIds } = get();
    if (assemblyIds.includes(id)) {
      set({ assemblyIds: assemblyIds.filter((x) => x !== id) });
    } else {
      set({ assemblyIds: [...assemblyIds, id] });
    }
    get().composePreview();
  },

  removeFromAssembly: (id) => {
    const { assemblyIds } = get();
    set({ assemblyIds: assemblyIds.filter((x) => x !== id) });
    get().composePreview();
  },

  reorderAssembly: (activeId, overId) => {
    const { assemblyIds } = get();
    const oldIndex = assemblyIds.indexOf(activeId);
    const newIndex = assemblyIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...assemblyIds];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    set({ assemblyIds: next });
    get().composePreview();
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  showEditor: () => set({ editorVisible: true }),
  hideEditor: () => set({ editorVisible: false }),

  saveSnippet: (data) => {
    const { snippets } = get();
    const newSnippet: Snippet = { id: `s${Date.now()}`, version: 1, updated_at: Date.now(), ...data };
    set({ snippets: [...snippets, newSnippet], editorVisible: false });
  },

  showToast: (message, variant) => {
    set({ toast: { visible: true, message, variant } });
    setTimeout(() => {
      set({ toast: { visible: false, message: '', variant: 'copy' } });
    }, 2000);
  },

  hideToast: () => set({ toast: { visible: false, message: '', variant: 'copy' } }),

  toggleCategoryCollapse: (category) => {
    const { collapsedCategories } = get();
    set({ collapsedCategories: { ...collapsedCategories, [category]: !collapsedCategories[category] } });
  },

  composePreview: () => {
    const { snippets, assemblyIds } = get();
    set({ previewText: compose(snippets, assemblyIds) });
  },

  copyToClipboard: () => {
    const { previewText } = get();
    if (previewText) {
      // Tauri clipboard 插件占位 —— 子 Agent 2 接入后替换
      navigator.clipboard?.writeText(previewText);
      get().showToast('✓ 已复制到剪贴板', 'copy');
    }
  },

  injectAtCursor: () => {
    const { previewText } = get();
    if (previewText) {
      // Tauri 注入占位 —— 子 Agent 2 接入后替换
      get().showToast('✓ 已注入光标', 'inject');
    }
  },
}));
