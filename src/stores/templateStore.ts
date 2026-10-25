// ============================================================
// Prompt Factory - 模板 Store
// 管理整段型模板的 CRUD、标签、usage_count，通过 StorageService 持久化
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

/** 模板 Store 接口 */
interface TemplateStore {
  /** 所有模板字典 */
  templates: Record<string, Template>;
  /** 是否正在加载 */
  loading: boolean;
  /** 从存储加载数据 */
  loadTemplates: () => Promise<void>;
  /** 新增模板并持久化 */
  addTemplate: (data: Omit<Template, 'id' | 'usage_count'>) => Promise<void>;
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
      ...data,
      id: genTemplateId(),
      usage_count: 0,
    };
    const next = { ...get().templates, [template.id]: template };
    set({ templates: next });
    await storageService.save({ templates: next });
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
}));
