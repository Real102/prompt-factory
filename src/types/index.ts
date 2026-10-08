// ============================================================
// Prompt Factory - 核心类型定义
// 由子 Agent 2 定义，子 Agent 4 使用
// ============================================================

/** 片段分类 */
export type Category = 'role' | 'perm' | 'avoid' | 'fmt' | 'ctx';

/** 单个提示词片段 */
export interface Snippet {
  /** 唯一标识 */
  id: string;
  /** 所属分类 */
  category: Category;
  /** 片段名称 */
  name: string;
  /** 片段内容 */
  content: string;
  /** 版本号，每次更新自增 */
  version: number;
  /** 最后更新时间戳（ms） */
  updated_at: number;
}

/** 分类元信息 */
export interface CategoryMeta {
  id: Category;
  name: string;
  color: string;
}

/** 应用持久化数据结构 */
export interface AppData {
  snippets: Record<string, Snippet>;
  categories: CategoryMeta[];
}

/** 分类元信息常量（颜色与 variables.css 中 --cat-* 一致） */
export const CATEGORIES: CategoryMeta[] = [
  { id: 'role', name: '角色设定', color: '#c9f73d' },
  { id: 'perm', name: '权限边界', color: '#6ad7ff' },
  { id: 'avoid', name: '避坑指南', color: '#ff7a3d' },
  { id: 'fmt', name: '输出格式', color: '#7af0c4' },
  { id: 'ctx', name: '上下文', color: '#ffd24d' },
];

/**
 * 分类 → CSS 变量映射，UI 组件配色专用。
 * 确保引用 variables.css 中的 --cat-* 变量，与设计稿一致。
 */
export const CATEGORY_CSS_VARS: Record<Category, string> = {
  role: 'var(--cat-role)',
  perm: 'var(--cat-perm)',
  avoid: 'var(--cat-avoid)',
  fmt: 'var(--cat-fmt)',
  ctx: 'var(--cat-ctx)',
};
