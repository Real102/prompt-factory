/**
 * Prompt Factory — 种子数据
 */

import { CATEGORIES } from '@/types';
import type { AppData, Category, Snippet } from '@/types';

const SEED_SNIPPETS: Array<Omit<Snippet, 'updated_at'>> = [
  {
    id: 'sn_role',
    category: 'role' as Category,
    name: '角色设定',
    content: '你是资深 Rust 工程师，专注代码质量、安全与性能。',
    version: 1,
  },
  {
    id: 'sn_perm',
    category: 'perm' as Category,
    name: '操作权限',
    content: '你可阅读项目代码、提出重构建议，但不要直接改写代码。',
    version: 1,
  },
  {
    id: 'sn_avoid',
    category: 'avoid' as Category,
    name: '避免事项',
    content: '不要泛泛建议；不要跳过 unsafe 块审查。',
    version: 1,
  },
  {
    id: 'sn_fmt',
    category: 'fmt' as Category,
    name: '输出格式',
    content: '按【问题等级｜位置｜建议｜理由】四列输出，末尾附总结。',
    version: 1,
  },
  {
    id: 'sn_ctx',
    category: 'ctx' as Category,
    name: '上下文背景',
    content: '项目：prompt-factory；语言：Rust。请基于实际代码作答。',
    version: 1,
  },
];

/**
 * 返回初始种子数据（包含 5 个预设片段与 5 个分类元信息）。
 * updated_at 在调用时动态设置为当前时间戳。
 */
export function getSeedData(): AppData {
  const now = Date.now();
  const snippets: Record<string, Snippet> = {};
  for (const s of SEED_SNIPPETS) {
    snippets[s.id] = { ...s, updated_at: now };
  }
  return {
    snippets,
    categories: CATEGORIES.map(c => ({ ...c })),
  };
}
