// ============================================================
// Prompt Factory - 片段库 Store
// 管理所有片段和分类，通过 StorageService 持久化
// ============================================================

import { create } from 'zustand';
import type { Snippet, CategoryMeta } from '@/types';
import { storageService, getSeedData } from '@/services/storage';
import { snippetService } from '@/services/snippetService';

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
        set({
          snippets: data.snippets,
          categories: data.categories,
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
}));
