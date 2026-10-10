// ============================================================
// Prompt Factory - 片段库 Store
// 管理所有片段和分类，通过 StorageService 持久化
// ============================================================

import { create } from 'zustand';
import type { Snippet, CategoryMeta } from '@/types';
import { CATEGORY_COLOR_POOL } from '@/types';
import { storageService, getSeedData } from '@/services/storage';
import { snippetService } from '@/services/snippetService';

const CSS_VAR_COLOR_MAP: Record<string, string> = {
  'var(--cat-role)': '#c9f73d',
  'var(--cat-perm)': '#6ad7ff',
  'var(--cat-avoid)': '#ff7a3d',
  'var(--cat-fmt)': '#7af0c4',
  'var(--cat-ctx)': '#ffd24d',
};

function normalizeColor(color: string): string {
  return CSS_VAR_COLOR_MAP[color] || color;
}

/** 片段库 Store 接口 */
interface SnippetStore {
  /** 所有片段字典 */
  snippets: Record<string, Snippet>;
  /** 分类列表 */
  categories: CategoryMeta[];
  /** 是否正在加载 */
  loading: boolean;
  /** 从存储加载数据，首次空数据时注入种子 */
  loadSnippets: () => Promise<void>;
  /** 新增片段并持久化 */
  addSnippet: (data: Omit<Snippet, 'id' | 'version' | 'updated_at'>) => Promise<void>;
  /** 更新片段并持久化 */
  updateSnippet: (id: string, data: Partial<Snippet>) => Promise<void>;
  /** 删除片段并持久化 */
  deleteSnippet: (id: string) => Promise<void>;
  /** 新增分类并持久化 */
  addCategory: (name: string, color?: string) => Promise<void>;
  /** 更新分类并持久化 */
  updateCategory: (id: string, name: string, color: string) => Promise<void>;
  /** 删除分类并持久化（同时删除该分类下所有片段） */
  deleteCategory: (id: string) => Promise<void>;
}

export const useSnippetStore = create<SnippetStore>((set, get) => ({
  snippets: {},
  categories: [],
  loading: false,

  loadSnippets: async () => {
    set({ loading: true });
    try {
      const data = await storageService.load();
      // 首次 load 时若数据为空，注入种子数据并持久化
      if (Object.keys(data.snippets).length === 0) {
        const seed = getSeedData();
        await storageService.save(seed);
        set({
          snippets: seed.snippets,
          categories: seed.categories,
          loading: false,
        });
      } else {
        const normalizedCategories = data.categories.map((c) => ({
          ...c,
          color: normalizeColor(c.color),
        }));
        set({
          snippets: data.snippets,
          categories: normalizedCategories,
          loading: false,
        });
      }
    } catch {
      set({ loading: false });
    }
  },

  addSnippet: async (data) => {
    const { snippets, categories } = get();
    const snippet = snippetService.create(snippets, data);
    const nextSnippets = { ...snippets, [snippet.id]: snippet };
    set({ snippets: nextSnippets });
    await storageService.save({
      snippets: nextSnippets,
      categories,
    });
  },

  updateSnippet: async (id, data) => {
    const { snippets, categories } = get();
    const updated = snippetService.update(snippets, id, data);
    const nextSnippets = { ...snippets, [id]: updated };
    set({ snippets: nextSnippets });
    await storageService.save({
      snippets: nextSnippets,
      categories,
    });
  },

  deleteSnippet: async (id) => {
    const { snippets, categories } = get();
    const nextSnippets = snippetService.delete(snippets, id);
    set({ snippets: nextSnippets });
    await storageService.save({
      snippets: nextSnippets,
      categories,
    });
  },

  addCategory: async (name, color) => {
    const { snippets, categories } = get();
    const usedColors = new Set(categories.map((c) => c.color));
    const catColor = color || CATEGORY_COLOR_POOL.find((c) => !usedColors.has(c)) || CATEGORY_COLOR_POOL[categories.length % CATEGORY_COLOR_POOL.length];
    const newCat: CategoryMeta = {
      id: `cat_${Date.now().toString(36)}`,
      name,
      color: catColor,
    };
    const nextCategories = [...categories, newCat];
    set({ categories: nextCategories });
    await storageService.save({
      snippets,
      categories: nextCategories,
    });
  },

  updateCategory: async (id, name, color) => {
    const { snippets, categories } = get();
    const nextCategories = categories.map((c) =>
      c.id === id ? { ...c, name, color } : c
    );
    set({ categories: nextCategories });
    await storageService.save({
      snippets,
      categories: nextCategories,
    });
  },

  deleteCategory: async (id) => {
    const { snippets, categories } = get();
    const nextCategories = categories.filter((c) => c.id !== id);
    const nextSnippets = Object.fromEntries(
      Object.entries(snippets).filter(([, s]) => s.category !== id)
    );
    set({ snippets: nextSnippets, categories: nextCategories });
    await storageService.save({
      snippets: nextSnippets,
      categories: nextCategories,
    });
  },
}));
