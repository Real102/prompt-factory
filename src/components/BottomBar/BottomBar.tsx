import { useState } from 'react';
import { useAssemblyStore } from '@/stores/assemblyStore';
import { applyVariables } from '@/services/composeEngine';
import SaveAsTemplateDialog from '@/components/SaveAsTemplateDialog/SaveAsTemplateDialog';
import styles from './BottomBar.module.css';

/** 另存为模板弹窗快照（点击按钮时固化引用/文本，避免弹窗期间状态变化影响结果） */
interface SaveAsSnapshot {
  type: 'solidified' | 'reference';
  steps?: string[];
  content?: string;
}

/**
 * 底部按钮区 —— 高 56, 填充 var(--bg-panel)。
 * 拼装模式：[✎ 编辑] + [复制] + [注入] + [另存为模板]（有片段时）
 * 编辑模式：[✓ 完成] + [取消] + [复制] + [注入] + [另存为模板]
 * 锁定模式：[✎ 编辑] + [↺ 重置] + [复制] + [注入] + [另存为模板]
 * canAction 为 false 时复制/注入按钮禁用。
 * 另存为模板（PRD §4.5.8 + 场景区分）：有 editedText 时另存固化型（优先）；
 * 普通拼装（无选中模板）有片段时另存引用型；点击模板展示（引用型选中）
 * 不显示按钮，仅编辑状态才显示。
 */
function BottomBar() {
  const canAction = useAssemblyStore((s) => s.canAction);
  const mode = useAssemblyStore((s) => s.mode);
  const isLocked = useAssemblyStore((s) => s.isLocked);
  const composedText = useAssemblyStore((s) => s.composedText);
  const variables = useAssemblyStore((s) => s.variables);
  const editedText = useAssemblyStore((s) => s.editedText);
  const assemblyItems = useAssemblyStore((s) => s.assemblyItems);
  const selectedTemplateId = useAssemblyStore((s) => s.selectedTemplateId);
  const enterEditing = useAssemblyStore((s) => s.enterEditing);
  const exitEditing = useAssemblyStore((s) => s.exitEditing);
  const resetEditing = useAssemblyStore((s) => s.resetEditing);
  const copyToClipboard = useAssemblyStore((s) => s.copyToClipboard);
  const injectToCursor = useAssemblyStore((s) => s.injectToCursor);

  const [saveAs, setSaveAs] = useState<SaveAsSnapshot | null>(null);

  const isEditing = mode === 'editing';
  const hasContent = (editedText ?? applyVariables(composedText, variables)).length > 0;
  const hasEdited = editedText != null && editedText.trim() !== '';
  // 另存为模板显示条件：
  // - 编辑/锁定模式有 editedText → 显示（另存固化型，优先）
  // - 普通拼装（无选中模板）有片段 → 显示（另存引用型）
  // - 点击模板展示（引用型选中加载）不显示，仅编辑状态才显示
  const showSaveAs =
    hasEdited || (selectedTemplateId == null && assemblyItems.length > 0);

  function handleSaveAs() {
    if (hasEdited) {
      setSaveAs({ type: 'solidified', content: editedText });
    } else if (assemblyItems.length > 0) {
      setSaveAs({ type: 'reference', steps: [...assemblyItems] });
    }
  }

  return (
    <div className={styles.bar}>
      {isEditing ? (
        <>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDone}`}
            onClick={exitEditing}
          >
            ✓ 完成
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnCancel}`}
            onClick={resetEditing}
          >
            取消
          </button>
        </>
      ) : (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnEdit}`}
          onClick={enterEditing}
          disabled={!hasContent}
        >
          ✎ 编辑
        </button>
      )}
      {isLocked && !isEditing && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnReset}`}
          onClick={resetEditing}
        >
          ↺ 重置
        </button>
      )}
      {showSaveAs && (
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSaveAs}`}
          onClick={handleSaveAs}
        >
          另存为模板
        </button>
      )}
      <button
        type="button"
        className={`${styles.btn} ${styles.primary} ${!canAction ? styles.disabled : ''}`}
        onClick={() => void copyToClipboard()}
        disabled={!canAction}
      >
        ⏎ 复制到剪贴板
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.secondary} ${!canAction ? styles.disabled : ''}`}
        onClick={() => void injectToCursor()}
        disabled={!canAction}
      >
        ⇧ 注入当前光标
      </button>
      {saveAs && (
        <SaveAsTemplateDialog
          type={saveAs.type}
          steps={saveAs.steps}
          content={saveAs.content}
          onClose={() => setSaveAs(null)}
        />
      )}
    </div>
  );
}

export default BottomBar;
