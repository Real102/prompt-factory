// ============================================================
// Prompt Factory - 本地存储服务
// 通过 Tauri IPC 读写 exe 同目录下 data/prompt-factory-data.json
// 浏览器环境回退 localStorage
// ============================================================

import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import type { AppData } from '@/types';
import { getSeedData as getSeedDataFromData } from '@/data/seedSnippets';

/** 重新导出 getSeedData，供 snippetStore 使用 */
export { getSeedDataFromData as getSeedData };

/** localStorage 键名（浏览器开发环境回退用） */
const STORAGE_KEY = 'prompt-factory-data';

/** 校验 AppData 结构完整性（宽松：旧数据可能缺 templates/usage_count） */
function isValidData(data: unknown): data is Partial<AppData> & Record<string, unknown> {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.snippets !== null &&
    typeof obj.snippets === 'object' &&
    Array.isArray(obj.categories)
  );
}

/** 数据迁移：补齐旧数据缺失的 templates / usage_count / type 字段 */
function migrateData(data: Partial<AppData>): AppData {
  const snippets = data.snippets ?? {};
  const migratedSnippets = Object.fromEntries(
    Object.entries(snippets).map(([id, s]) => [
      id,
      { ...s, usage_count: s.usage_count ?? 0 },
    ])
  );
  const templates = Object.fromEntries(
    Object.entries(data.templates ?? {}).map(([id, t]) => [
      id,
      {
        ...t,
        type: t.type ?? 'solidified',
        steps: t.type === 'reference' ? (t.steps ?? []) : (t.steps ?? null),
      },
    ])
  );
  return {
    snippets: migratedSnippets,
    templates,
    categories: data.categories ?? [],
  };
}

/**
 * 本地存储服务。
 *
 * 通过 Tauri invoke 调用 Rust 侧的 read_data_file / write_data_file
 * 命令读写 JSON 文件。在浏览器开发环境（invoke 不可用）下
 * 自动回退到 localStorage。
 */
export class StorageService {
  /** 内存缓存：save 时合并各 store 的部分数据 */
  private cached: AppData | null = null;

  /** 加载数据；文件不存在或为空时返回种子数据 */
  async load(): Promise<AppData> {
    try {
      const raw = await invoke<string>('read_data_file');
      if (!raw || raw.trim() === '') {
        const seed = getSeedDataFromData();
        this.cached = seed;
        return seed;
      }
      const parsed = JSON.parse(raw);
      if (!isValidData(parsed)) {
        const seed = getSeedDataFromData();
        this.cached = seed;
        return seed;
      }
      const migrated = migrateData(parsed);
      this.cached = migrated;
      return migrated;
    } catch {
      return this.loadFromLocal();
    }
  }

  /** 保存数据到本地文件（接收 Partial，与缓存合并，避免多 store 循环依赖） */
  async save(data: Partial<AppData>): Promise<void> {
    const merged: AppData = {
      snippets: data.snippets ?? this.cached?.snippets ?? {},
      templates: data.templates ?? this.cached?.templates ?? {},
      categories: data.categories ?? this.cached?.categories ?? [],
    };
    this.cached = merged;
    const content = JSON.stringify(merged, null, 2);
    try {
      await invoke('write_data_file', { content });
    } catch {
      this.saveToLocal(merged);
    }
  }

  /** 从 localStorage 加载（浏览器回退） */
  private loadFromLocal(): AppData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seed = getSeedDataFromData();
        this.cached = seed;
        return seed;
      }
      const parsed = JSON.parse(raw);
      if (!isValidData(parsed)) {
        const seed = getSeedDataFromData();
        this.cached = seed;
        return seed;
      }
      const migrated = migrateData(parsed);
      this.cached = migrated;
      return migrated;
    } catch {
      const seed = getSeedDataFromData();
      this.cached = seed;
      return seed;
    }
  }

  /** 保存到 localStorage（浏览器回退） */
  private saveToLocal(data: AppData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 忽略存储配额错误
    }
  }

  /** 导出数据到用户选择的文件 */
  async exportData(): Promise<boolean> {
    try {
      const filePath = await save({
        title: '导出数据',
        defaultPath: 'prompt-factory-data.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });
      if (!filePath) return false;
      return await invoke<boolean>('export_data', { targetPath: filePath });
    } catch {
      return false;
    }
  }

  /** 从用户选择的文件导入数据 */
  async importData(): Promise<boolean> {
    try {
      const filePath = await open({
        title: '导入数据',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
      });
      if (!filePath || typeof filePath !== 'string') return false;
      return await invoke<boolean>('import_data', { sourcePath: filePath });
    } catch {
      return false;
    }
  }
}

/** 单例实例 */
export const storageService = new StorageService();
