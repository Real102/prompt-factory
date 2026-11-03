import { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useSnippetStore } from '@/stores/snippetStore';
import { storageService } from '@/services/storage';
import styles from './TabBar.module.css';

function TabBar() {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const toggleTemplateEditor = useUIStore((s) => s.toggleTemplateEditor);
  const toggleSnippetEditor = useUIStore((s) => s.toggleSnippetEditor);
  const setShowCategoryEditor = useUIStore((s) => s.setShowCategoryEditor);
  const [seedMode, setSeedMode] = useState(() => storageService.isSeedMode());

  function toggleSeedMode() {
    const next = !storageService.isSeedMode();
    storageService.setSeedMode(next);
    setSeedMode(next);
    // 切换后两个 store 重新加载数据（种子模式 ↔ 实际数据）
    void useTemplateStore.getState().loadTemplates();
    void useSnippetStore.getState().loadSnippets();
  }

  const isTemplate = activeTab === 'template';

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={`${styles.tab} ${isTemplate ? styles.tabActive : ''}`}
        onClick={() => setActiveTab('template')}
      >
        模板
      </button>
      <button
        type="button"
        className={`${styles.tab} ${!isTemplate ? styles.tabActive : ''}`}
        onClick={() => setActiveTab('snippet')}
      >
        片段库
      </button>
      {import.meta.env.DEV && (
        <button
          type="button"
          className={`${styles.addBtn} ${styles.seedBtn} ${seedMode ? styles.seedBtnActive : ''}`}
          title="切换种子数据 / 实际数据（仅开发环境）"
          onClick={toggleSeedMode}
        >
          种子数据
        </button>
      )}
      <div className={styles.addBtns}>
        {isTemplate ? (
          <button type="button" className={styles.addBtn} onClick={toggleTemplateEditor}>
            +模板
          </button>
        ) : (
          <>
            <button type="button" className={styles.addBtn} onClick={() => setShowCategoryEditor(true)}>
              +分类
            </button>
            <button type="button" className={styles.addBtn} onClick={toggleSnippetEditor}>
              +片段
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TabBar;
