import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTemplateStore } from '@/stores/templateStore';
import { useSnippetStore } from '@/stores/snippetStore';
import { useUIStore } from '@/stores/uiStore';
import styles from './TemplateEditor.module.css';

/**
 * 模板编辑器 —— 新建默认固化型（PRD §4.5.1）；编辑引用型模板时
 * content 初始值为按 steps 实时拼接的合成文本快照，编辑 content 保存后
 * 单向转换为固化型（二次确认，不可逆，PRD §4.5.8）；仅改名/描述不触发转换。
 */
function TemplateEditor() {
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const updateTemplate = useTemplateStore((s) => s.updateTemplate);
  const convertToSolidified = useTemplateStore((s) => s.convertToSolidified);
  const templates = useTemplateStore((s) => s.templates);
  const snippets = useSnippetStore((s) => s.snippets);
  const editingTemplateId = useUIStore((s) => s.editingTemplateId);
  const toggleTemplateEditor = useUIStore((s) => s.toggleTemplateEditor);
  const showToast = useUIStore((s) => s.showToast);

  const editingTemplate = editingTemplateId ? templates[editingTemplateId] : null;
  const isEditingReference = editingTemplate?.type === 'reference';

  const [name, setName] = useState(editingTemplate?.name || '');
  const [description, setDescription] = useState(editingTemplate?.description || '');
  // 引用型：content 初始值为按 steps 实时拼接的合成文本快照
  const [content, setContent] = useState(() => {
    if (!editingTemplate) return '';
    if (editingTemplate.type === 'reference') {
      return (editingTemplate.steps ?? [])
        .map((id) => snippets[id])
        .filter((s): s is NonNullable<typeof s> => s != null)
        .map((s) => s.content)
        .join('\n');
    }
    return editingTemplate.content || '';
  });
  const [confirmConvert, setConfirmConvert] = useState(false);
  const initialContentRef = useRef(content);

  const contentChanged =
    content.trim() !== initialContentRef.current.trim();

  function handleSave() {
    if (!name.trim() || !content.trim()) return;
    if (editingTemplateId) {
      // 引用型模板 content 被修改 → 二次确认后单向转换为固化型（PRD §4.5.8）
      if (isEditingReference && contentChanged) {
        setConfirmConvert(true);
        return;
      }
      if (isEditingReference) {
        // 仅改名/描述：不触发转换，模板保持引用型
        void updateTemplate(editingTemplateId, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        void updateTemplate(editingTemplateId, {
          name: name.trim(),
          description: description.trim() || undefined,
          content: content.trim(),
        });
      }
    } else {
      void addTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        type: 'solidified',
        content: content.trim(),
      });
    }
    toggleTemplateEditor();
  }

  function handleConfirmConvert() {
    if (!editingTemplateId) return;
    void convertToSolidified(editingTemplateId, content.trim()).then(() => {
      return updateTemplate(editingTemplateId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
    });
    showToast('模板已转换为固化型', 'info');
    setConfirmConvert(false);
    toggleTemplateEditor();
  }

  function handleCancel() {
    toggleTemplateEditor();
  }

  return (
    <div className={styles.editor}>
      <input
        className={styles.nameInput}
        type="text"
        placeholder="模板名称…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <input
        className={styles.nameInput}
        type="text"
        placeholder="模板描述（可选）…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <textarea
        className={styles.contentInput}
        placeholder="输入模板内容，可用 {{变量名}} 插入变量…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />
      {isEditingReference && (
        <span className={styles.refHint}>
          引用型模板：修改内容并保存后将转换为固化型，片段引用关系不可恢复（仅改名/描述不受影响）
        </span>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          {editingTemplateId ? '更新' : '保存'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </button>
      </div>
      {confirmConvert &&
        createPortal(
          <div
            className={styles.confirmMask}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setConfirmConvert(false);
            }}
          >
            <div
              className={styles.confirmDialog}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmConvert(false);
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmConvert();
                }
              }}
            >
              <span className={styles.confirmMsg}>
                保存后该模板将转换为固化型，片段引用关系不可恢复，是否继续？
              </span>
              <div className={styles.confirmBtns}>
                <button
                  type="button"
                  className={styles.confirmCancel}
                  onClick={() => setConfirmConvert(false)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className={styles.confirmOk}
                  onClick={handleConfirmConvert}
                >
                  继续保存
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default TemplateEditor;
