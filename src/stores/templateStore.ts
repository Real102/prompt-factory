// ============================================================
// Prompt Factory - 模板 Store
// 管理模板（固化型/引用型）的 CRUD、标签、usage_count，
// 通过 StorageService 持久化
// ============================================================

import { create } from 'zustand';
import type { Template } from '@/types';
import { CATEGORY_COLOR_POOL } from '@/types';
import { storageService } from '@/services/storage';

/** 标签名 → 颜色哈希映射（相同标签名全局同色，非随机） */
export function getTagColor(tagName: string): string {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = (hash << 5) - hash + tagName.charCodeAt(i);
    hash |= 0;
  }
  return CATEGORY_COLOR_POOL[Math.abs(hash) % CATEGORY_COLOR_POOL.length];
}

/** 生成模板 ID */
function genTemplateId(): string {
  return `tpl_${Date.now().toString(36)}`;
}

/** 统计片段被多少个引用型模板引用（删除片段前的引用保护提示用） */
export function countSnippetReferences(
  templates: Record<string, Template>,
  snippetId: string
): number {
  return Object.values(templates).filter(
    (t) => t.type === 'reference' && (t.steps ?? []).includes(snippetId)
  ).length;
}

/** 新增模板入参（引用型不存 content，固化型不存 steps） */
export type NewTemplateData = Pick<Template, 'name' | 'type'> &
  Partial<Pick<Template, 'description' | 'content' | 'steps' | 'tags'>>;

/** 模板 Store 接口 */
interface TemplateStore {
  /** 所有模板字典 */
  templates: Record<string, Template>;
  /** 是否正在加载 */
  loading: boolean;
  /** 从存储加载数据 */
  loadTemplates: () => Promise<void>;
  /** 新增模板并持久化（按类型规范化 content/steps） */
  addTemplate: (data: NewTemplateData) => Promise<Template>;
  /** 更新模板并持久化 */
  updateTemplate: (id: string, data: Partial<Omit<Template, 'id' | 'usage_count'>>) => Promise<void>;
  /** 删除模板并持久化 */
  deleteTemplate: (id: string) => Promise<void>;
  /** 使用次数 +1 并持久化（复制/注入时调用） */
  incrementUsage: (id: string) => Promise<void>;
  /** 追加标签（上限 5 个） */
  addTag: (id: string, tag: string) => Promise<void>;
  /** 移除标签 */
  removeTag: (id: string, tag: string) => Promise<void>;
  /** 从所有引用型模板 steps 中移除指定片段 ID（片段被删除时调用） */
  removeSnippetReferences: (snippetIds: string[]) => Promise<void>;
  /** 引用型编辑 content 后单向转换为固化型（steps 清空，不可逆） */
  convertToSolidified: (id: string, content: string) => Promise<void>;
}

/** 按模板类型规范化：引用型无 content，固化型无 steps */
function normalizeByType(data: NewTemplateData): Omit<Template, 'id' | 'usage_count'> {
  if (data.type === 'reference') {
    return {
      name: data.name,
      description: data.description,
      type: 'reference',
      content: undefined,
      steps: data.steps ?? [],
      tags: data.tags ?? [],
    };
  }
  return {
    name: data.name,
    description: data.description,
    type: 'solidified',
    content: data.content ?? '',
    steps: null,
    tags: data.tags ?? [],
  };
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: {},
  loading: false,

  loadTemplates: async () => {
    set({ loading: true });
    try {
      const data = await storageService.load();
      set({ templates: data.templates, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addTemplate: async (data) => {
    const template: Template = {
      ...normalizeByType(data),
      id: genTemplateId(),
      usage_count: 0,
    };
    const next = { ...get().templates, [template.id]: template };
    set({ templates: next });
    await storageService.save({ templates: next });
    return template;
  },

  updateTemplate: async (id, data) => {
    const existing = get().templates[id];
    if (!existing) return;
    const updated: Template = { ...existing, ...data, id: existing.id };
    const next = { ...get().templates, [id]: updated };
    set({ templates: next });
    await storageService.save({ templates: next });
  },

  deleteTemplate: async (id) => {
    const next = { ...get().templates };
    delete next[id];
    set({ templates: next });
    await storageService.save({ templates: next });
  },

  incrementUsage: async (id) => {
    const existing = get().templates[id];
    if (!existing) return;
    const updated: Template = {
      ...existing,
      usage_count: existing.usage_count + 1,
    };
    const next = { ...get().templates, [id]: updated };
    set({ templates: next });
    await storageService.save({ templates: next });
  },

  addTag: async (id, tag) => {
    const existing = get().templates[id];
    if (!existing) return;
    const tags = existing.tags ?? [];
    if (tags.includes(tag) || tags.length >= 5) return;
    const updated: Template = { ...existing, tags: [...tags, tag] };
    const next = { ...get().templates, [id]: updated };
    set({ templates: next });
    await storageService.save({ templates: next });
  },

  removeTag: async (id, tag) => {
    const existing = get().templates[id];
    if (!existing) return;
    const tags = (existing.tags ?? []).filter((t) => t !== tag);
    const updated: Template = { ...existing, tags };
    const next = { ...get().templates, [id]: updated };
    set({ templates: next });
    await storageService.save({ templates: next });
  },

  removeSnippetReferences: async (snippetIds) => {
    if (snippetIds.length === 0) return;
    const idSet = new Set(snippetIds);
    let changed = false;
    const next: Record<string, Template> = {};
    for (const [id, tpl] of Object.entries(get().templates)) {
      if (tpl.type === 'reference' && (tpl.steps ?? []).some((sid) => idSet.has(sid))) {
        next[id] = { ...tpl, steps: (tpl.steps ?? []).filter((sid) => !idSet.has(sid)) };
        changed = true;
      } else {
        next[id] = tpl;
      }
    }
    if (!changed) return;
    set({ templates: next });
    await storageService.save({ templates: next });
  },

  convertToSolidified: async (id, content) => {
    const existing = get().templates[id];
    if (!existing) return;
    const updated: Template = {
      ...existing,
      type: 'solidified',
      steps: null,
      content,
    };
    const next = { ...get().templates, [id]: updated };
    set({ templates: next });
    await storageService.save({ templates: next });
  },
}));
