export type Category = string;

export interface Snippet {
  id: string;
  name: string;
  content: string;
  category: Category;
  /** 版本号，每次更新自增 */
  version: number;
  /** 最后更新时间戳（ms） */
  updated_at: number;
}

export type ToastVariant = 'copy' | 'inject';

export interface ToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
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

/** 分类 → CSS 变量颜色映射（种子分类默认颜色） */
export const CATEGORY_COLORS: Record<string, string> = {
  role: 'var(--cat-role)',
  perm: 'var(--cat-perm)',
  avoid: 'var(--cat-avoid)',
  fmt: 'var(--cat-fmt)',
  ctx: 'var(--cat-ctx)',
};

/** UI 组件配色专用别名（与 CATEGORY_COLORS 等价） */
export { CATEGORY_COLORS as CATEGORY_CSS_VARS };

/** 分类 → 中文标签 */
export const CATEGORY_LABELS: Record<string, string> = {
  role: '角色',
  perm: '权限',
  avoid: '避免',
  fmt: '格式',
  ctx: '上下文',
};

/** 分类展示顺序 */
export const CATEGORY_ORDER: string[] = ['role', 'perm', 'avoid', 'fmt', 'ctx'];

/** 新分类自动分配颜色池 */
export const CATEGORY_COLOR_POOL: string[] = [
  '#c9f73d', '#6ad7ff', '#ff7a3d', '#7af0c4', '#ffd24d',
  '#ff6b9d', '#a78bfa', '#fbbf24', '#34d399', '#60a5fa',
];

/** 分类元信息列表（供种子数据与 UI 使用） */
export const CATEGORIES: CategoryMeta[] = [
  { id: 'role', name: '角色', color: 'var(--cat-role)' },
  { id: 'perm', name: '权限', color: 'var(--cat-perm)' },
  { id: 'avoid', name: '避免', color: 'var(--cat-avoid)' },
  { id: 'fmt', name: '格式', color: 'var(--cat-fmt)' },
  { id: 'ctx', name: '上下文', color: 'var(--cat-ctx)' },
];
