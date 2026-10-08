import { useState } from 'react';
import styles from './SearchBar.module.css';

/**
 * 顶栏搜索 —— 高 44, 填充 var(--bg-panel2)。
 * 左侧搜索图标 + 输入框, 右端快捷键提示。
 * MVP 搜索为占位实现（仅本地 state）。
 */
function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <svg className={styles.icon} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M9.5 9.5L12 12"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <input
          className={styles.input}
          type="text"
          placeholder="搜索片段…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <span className={styles.hint}>Ctrl Space</span>
    </div>
  );
}

export default SearchBar;
