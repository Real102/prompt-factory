import { useMemo } from 'react';
import { useAssemblyStore } from '@/stores/assemblyStore';
import { useSnippetStore } from '@/stores/snippetStore';
import {
  applyVariables,
  splitByVariables,
  extractVariableOwners,
} from '@/services/composeEngine';
import styles from './PreviewPanel.module.css';

/**
 * 合成预览区 —— 648×208, 填充 var(--bg-preview), 描边 var(--stroke), 圆角 6。
 * 拼装模式：只读 <pre>，按占位符分段渲染，变量值/占位符按来源片段分类色高亮。
 * 锁定未编辑模式：同上分段渲染。
 * 编辑模式：可编辑 <textarea>（纯文本，无高亮）。
 * 锁定已编辑模式：纯文本快照（editedText，无高亮）。
 */
function PreviewPanel() {
  const mode = useAssemblyStore((s) => s.mode);
  const composedText = useAssemblyStore((s) => s.composedText);
  const variables = useAssemblyStore((s) => s.variables);
  const editedText = useAssemblyStore((s) => s.editedText);
  const setEditedText = useAssemblyStore((s) => s.setEditedText);
  const assemblyItems = useAssemblyStore((s) => s.assemblyItems);
  const snippets = useSnippetStore((s) => s.snippets);
  const categories = useSnippetStore((s) => s.categories);

  const isEditing = mode === 'editing';

  // editedText 存在（用户编辑过）→ 纯文本快照，无高亮
  // editedText 为 null → 分段渲染，变量多色高亮
  const segments = useMemo(
    () => (editedText ? null : splitByVariables(composedText)),
    [editedText, composedText]
  );

  // 变量名 → 来源片段分类颜色（与 VariableSlots 共用同一映射）
  const varOwners = useMemo(
    () => extractVariableOwners(assemblyItems, snippets, categories),
    [assemblyItems, snippets, categories]
  );

  // 编辑模式 / 锁定已编辑 → 纯文本输出
  // 拼装模式 / 锁定未编辑 → 分段渲染
  const textOutput = editedText ?? applyVariables(composedText, variables);

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.panel} ${isEditing ? styles.editing : ''}`}>
        <span className={styles.label}>
          {isEditing ? '// EDITING…' : '// COMPOSED OUTPUT'}
        </span>
        {isEditing ? (
          <textarea
            className={styles.textarea}
            value={textOutput}
            onChange={(e) => setEditedText(e.target.value)}
            autoFocus
          />
        ) : segments && segments.length > 0 ? (
          <pre className={styles.content}>
            {segments.map((seg, i) => {
              if (seg.type === 'var') {
                const name = seg.content.slice(2, -2);
                const value = variables[name];
                return (
                  <span
                    key={i}
                    className={styles.varHighlight}
                    style={{ color: varOwners.get(name) || '#c9f73d' }}
                  >
                    {value || seg.content}
                  </span>
                );
              }
              return <span key={i}>{seg.content}</span>;
            })}
          </pre>
        ) : textOutput ? (
          <pre className={styles.content}>{textOutput}</pre>
        ) : (
          <div className={styles.empty}>拼装结果将在此实时预览</div>
        )}
      </div>
    </div>
  );
}

export default PreviewPanel;
