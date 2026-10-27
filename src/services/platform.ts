// ============================================================
// Prompt Factory - 运行时平台判断
// 前端无法使用 Rust 的 cfg!，通过 userAgent 运行时判断
// ============================================================

/** 是否 macOS 平台（运行时求值一次） */
export const isMac = /mac|iphone|ipad/i.test(navigator.userAgent);

/** 全局唤起快捷键的展示文案（与 Rust 侧 shortcut.rs 打包时固定的绑定一致） */
export const SHORTCUT_HINT = isMac ? 'Option Space' : 'Ctrl Space';
