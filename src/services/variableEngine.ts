// ============================================================
// Prompt Factory - 变量引擎
// 从模板 content 中提取 {{变量}} 占位符并填充变量值
// 正则支持中文变量名（{{项目名}}、{{语言}} 等）
// ============================================================

const VAR_PATTERN = /\{\{([^{}]+)\}\}/g;

/**
 * 从文本中提取变量名列表（去重，保持首次出现顺序）。
 * 匹配 {{变量名}} 占位符，变量名可为中文、字母、数字、下划线。
 */
export function extractVars(text: string): string[] {
  const seen = new Set<string>();
  const vars: string[] = [];
  for (const match of text.matchAll(VAR_PATTERN)) {
    const name = match[1].trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      vars.push(name);
    }
  }
  return vars;
}

/**
 * 用变量值填充模板文本中的 {{变量}} 占位符。
 * 未提供值的变量保留原始占位符 {{变量名}}。
 */
export function fillVars(text: string, vars: Record<string, string>): string {
  return text.replace(VAR_PATTERN, (_, raw: string) => {
    const name = raw.trim();
    return vars[name] ?? `{{${raw}}}`;
  });
}

/** splitByVariables 返回的分段类型 */
export interface TextSegment {
  type: 'text' | 'var';
  content: string;
}

/**
 * 将文本按 {{变量名}} 占位符切分为有序分段。
 * 用于预览区分段渲染：var 段可着色高亮，text 段为普通文本。
 * 占位符在 composedText 中永远存在（变量值不回写），故 DOM 结构稳定。
 */
export function splitByVariables(text: string): TextSegment[] {
  const result: TextSegment[] = [];
  const pattern = /\{\{([^{}]+)\}\}/g;
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
