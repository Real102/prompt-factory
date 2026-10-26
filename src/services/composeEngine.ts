// ============================================================
// Prompt Factory - 拼装引擎
// 将多个片段按拼装台顺序组合成最终 prompt 文本
// 变量解析统一委托 variableEngine（宽正则 [^{}]+）
// ============================================================

import type { CategoryMeta, Snippet } from '@/types';
import { extractVars } from '@/services/variableEngine';

// 统一变量引擎：re-export 保持现有引用点稳定
export { extractVars as extractVariables, fillVars as applyVariables, splitByVariables } from '@/services/variableEngine';
export type { TextSegment } from '@/services/variableEngine';

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
    for (const name of extractVars(s.content)) {
      if (!owners.has(name)) {
        owners.set(name, color);
      }
    }
  }
  return owners;
}
