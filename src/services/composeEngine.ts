// ============================================================
// Prompt Factory - 拼装引擎
// 将多个片段按拼装台顺序组合成最终 prompt 文本
// ============================================================

import type { CategoryMeta, Snippet } from '@/types';

/**
 * 变量高亮色规则：变量颜色跟随来源片段所属分类的颜色。
 * 由 extractVariableOwners 建立「变量名 → 分类颜色」映射，
 * 变量区 chip 标签与预览区变量值共用此映射，保证两端颜色一致。
 */

/**
 * 将指定顺序的片段 ID 组合为完整 prompt 文本。
 *
 * @param snippetIds - 拼装台中的片段 ID 顺序列表
 * @param snippets   - 当前所有片段的字典（来自 snippetStore）
 * @returns 组合后的纯文本，片段之间以单个换行分隔
 */
export function compose(
  snippetIds: string[],
  snippets: Record<string, Snippet>
): string {
  return snippetIds
    .map((id) => snippets[id])
    .filter((s): s is Snippet => s != null)
    .map((s) => s.content)
    .join('\n');
}

/**
 * 从合成文本中提取所有 {{变量名}} 占位符，去重后返回有序列表。
 * 支持中文、英文、数字、下划线作为变量名。
 */
export function extractVariables(text: string): string[] {
  const names = new Set<string>();
  for (const m of text.matchAll(/\{\{([\w\u4e00-\u9fff]+)\}\}/g)) {
    names.add(m[1]);
  }
  return [...names];
}

/**
 * 将合成文本中的 {{变量名}} 占位符替换为变量值。
 * 未设置的变量保留原始占位符文本。
 */
export function applyVariables(
  text: string,
  vars: Record<string, string>
): string {
  return text.replace(/\{\{([\w\u4e00-\u9fff]+)\}\}/g, (full, name: string) =>
    vars[name] ? vars[name] : full
  );
}

/** splitByVariables 返回的分段类型 */
export interface TextSegment {
  type: 'text' | 'var';
  content: string;
}

/**
 * 将合成文本按 {{变量名}} 占位符切分为有序分段。
 * 用于预览区分段渲染：var 段可着色高亮，text 段为普通文本。
 * 占位符在 composedText 中永远存在（变量值不回写），故 DOM 结构稳定。
 */
export function splitByVariables(text: string): TextSegment[] {
  const result: TextSegment[] = [];
  const pattern = /\{\{([\w\u4e00-\u9fff]+)\}\}/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      result.push({ type: 'text', content: text.slice(lastIndex, m.index) });
    }
    result.push({ type: 'var', content: m[0] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    result.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return result;
}

/**
 * 按拼装台顺序扫描每个片段，建立「变量名 → 分类颜色」映射。
 * 变量首次出现所在片段的分类颜色即为该变量的颜色；
 * 同名变量出现在多个片段时取首次出现的分类颜色，稳定可预期。
 */
export function extractVariableOwners(
  snippetIds: string[],
  snippets: Record<string, Snippet>,
  categories: CategoryMeta[]
): Map<string, string> {
  const catColor = new Map(categories.map((c) => [c.id, c.color]));
  const owners = new Map<string, string>();
  for (const id of snippetIds) {
    const s = snippets[id];
    if (!s) continue;
    const color = catColor.get(s.category) || '#c9f73d';
    for (const m of s.content.matchAll(/\{\{([\w\u4e00-\u9fff]+)\}\}/g)) {
      if (!owners.has(m[1])) {
        owners.set(m[1], color);
      }
    }
  }
  return owners;
}
