import { useEffect, useMemo, useRef } from 'react';
import { useAssemblyStore } from '@/stores/assemblyStore';
import { useSnippetStore } from '@/stores/snippetStore';
import {
  extractVariables,
  extractVariableOwners,
} from '@/services/composeEngine';
import styles from './VariableSlots.module.css';

/**
 * 变量插槽区 —— 自动扫描合成文本中的 {{变量名}} 占位符，
 * 为每个变量生成可编辑输入框。
 * 无占位符时不渲染（height=0），不占浮层空间。
 * 编辑/锁定模式下输入框禁用。
 * 标签颜色跟随来源片段分类色，与 PreviewPanel 共用 varOwners 映射。
 * 引用型模板选中后自动聚焦第一个变量框（PRD §4.5.3，同固化型行为）。
 */
function VariableSlots() {
  const composedText = useAssemblyStore((s) => s.composedText);
  const assemblyItems = useAssemblyStore((s) => s.assemblyItems);
  const variables = useAssemblyStore((s) => s.variables);
  const setVariable = useAssemblyStore((s) => s.setVariable);
  const isLocked = useAssemblyStore((s) => s.isLocked);
  const canAction = useAssemblyStore((s) => s.canAction);
  const selectedTemplateId = useAssemblyStore((s) => s.selectedTemplateId);
  const snippets = useSnippetStore((s) => s.snippets);
  const categories = useSnippetStore((s) => s.categories);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const varNames = useMemo(
    () => extractVariables(composedText),
    [composedText]
  );

  const varOwners = useMemo(
    () => extractVariableOwners(assemblyItems, snippets, categories),
    [assemblyItems, snippets, categories]
  );

  useEffect(() => {
    if (selectedTemplateId && varNames.length > 0) {
      firstInputRef.current?.focus();
    }
  }, [selectedTemplateId, varNames.length]);

  if (varNames.length === 0 || !canAction) return null;

  return (
    <div className={styles.section}>
      <span className={styles.label}>◆ VARIABLES · 变量插槽</span>
      <div className={styles.chips}>
        {varNames.map((name) => (
          <div key={name} className={styles.chip}>
            <span
              className={styles.tag}
              style={{ background: varOwners.get(name) || '#c9f73d' }}
            >
              {`{{${name}}}`}
            </span>
            <span className={styles.eq}>=</span>
            <input
              ref={name === varNames[0] ? firstInputRef : undefined}
              className={styles.input}
              type="text"
              value={variables[name] ?? ''}
              onChange={(e) => setVariable(name, e.target.value)}
              disabled={isLocked}
              placeholder="未设置"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default VariableSlots;
