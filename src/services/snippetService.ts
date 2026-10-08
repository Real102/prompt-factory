// ============================================================
// Prompt Factory - 片段服务
// 提供片段的增删改查纯函数操作（无状态，操作传入的字典）
// ============================================================

import type { Snippet, Category } from '@/types';

/** 自增计数器，配合时间戳生成唯一 ID */
let idCounter = 0;

/** 生成唯一片段 ID */
function generateId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/**
 * 片段服务类。
 *
 * 设计说明：此类为无状态工具类，所有方法接收 snippets 字典
 * 作为参数进行操作并返回新对象，符合 Zustand 不可变更新模式。
 */
export class SnippetService {
  /** 获取所有片段列表 */
  getAll(snippets: Record<string, Snippet>): Snippet[] {
    return Object.values(snippets);
  }

  /** 按分类获取片段列表 */
  getByCategory(snippets: Record<string, Snippet>, cat: Category): Snippet[] {
    return Object.values(snippets).filter((s) => s.category === cat);
  }

  /** 创建新片段（不写入字典，返回新建的片段对象） */
  create(
    snippets: Record<string, Snippet>,
    data: Omit<Snippet, 'id' | 'version' | 'updated_at'>
  ): Snippet {
    const now = Date.now();
    const snippet: Snippet = {
      ...data,
      id: generateId(),
      version: 1,
      updated_at: now,
    };
    return snippet;
  }

  /** 更新片段（返回更新后的片段对象，版本号自增） */
  update(
    snippets: Record<string, Snippet>,
    id: string,
    data: Partial<Snippet>
  ): Snippet {
    const existing = snippets[id];
    if (!existing) {
      throw new Error(`Snippet not found: ${id}`);
    }
    const updated: Snippet = {
      ...existing,
      ...data,
      id: existing.id, // id 不可变
      version: existing.version + 1,
      updated_at: Date.now(),
    };
    return updated;
  }

  /** 删除片段（返回新字典，不修改原对象） */
  delete(
    snippets: Record<string, Snippet>,
    id: string
  ): Record<string, Snippet> {
    const next = { ...snippets };
    delete next[id];
    return next;
  }
}

/** 单例实例 */
export const snippetService = new SnippetService();
