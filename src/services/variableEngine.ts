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
