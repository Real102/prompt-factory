// ============================================================
// Prompt Factory - 拼装引擎
// 将多个片段按拼装台顺序组合成最终 prompt 文本
// ============================================================

import type { Snippet } from '@/types';

/**
 * 将指定顺序的片段 ID 组合为完整 prompt 文本。
 *
 * @param snippetIds - 拼装台中的片段 ID 顺序列表
 * @param snippets   - 当前所有片段的字典（来自 snippetStore）
 * @returns 组合后的纯文本，片段之间以两个换行分隔
 */
export function compose(
  snippetIds: string[],
  snippets: Record<string, Snippet>
): string {
  return snippetIds
    .map((id) => snippets[id])
    .filter((s): s is Snippet => s != null)
    .map((s) => s.content)
    .join('\n\n');
}
