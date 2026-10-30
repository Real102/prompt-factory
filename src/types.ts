export type Category = string;

export interface Snippet {
  id: string;
  category: Category;
  name: string;
  content: string;
  version: number;
  updated_at: number;
  /** 使用次数，复制到剪贴板/注入时 +1 */
  usage_count: number;
}

/** 模板类型：固化型=整段文本独立存在；引用型=片段 ID 有序组合 */
export type TemplateType = 'solidified' | 'reference';

/** 模板：固化型存整段 content；引用型存片段 ID 有序列表 steps */
export interface Template {
  id: string;
  name: string;
  /** 可选描述，不填默认用 content 作为描述 */
  description?: string;
  /** 模板类型（旧数据迁移时默认补 solidified） */
  type: TemplateType;
  /** 固化型：整段文本，可含 {{变量}}；引用型转换后填入 */
  content?: string;
  /** 引用型：片段 ID 有序列表；固化型为 null */
  steps?: string[] | null;
  /** 可选标签，最多5个 */
  tags?: string[];
  /** 使用次数，复制到剪贴板/注入时 +1 */
  usage_count: number;
}

export interface CategoryMeta {
  id: Category;
  name: string;
  color: string;
}

export interface AppData {
  snippets: Record<string, Snippet>;
  templates: Record<string, Template>;
  categories: CategoryMeta[];
}

export type ToastVariant = 'copy' | 'inject';

export interface ToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
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
  { id: 'role', name: '角色', color: '#c9f73d' },
  { id: 'perm', name: '权限', color: '#6ad7ff' },
  { id: 'avoid', name: '避免', color: '#ff7a3d' },
  { id: 'fmt', name: '格式', color: '#7af0c4' },
  { id: 'ctx', name: '上下文', color: '#ffd24d' },
];
