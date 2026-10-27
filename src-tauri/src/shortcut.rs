use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

/// 注册全局快捷键唤起浮层
/// Windows/Linux: Ctrl+Space
/// macOS: Option+Space（避免与 Spotlight 的 Cmd+Space 冲突）
pub fn register_shortcut(app: &tauri::AppHandle) -> tauri::Result<()> {
    let shortcut = if cfg!(target_os = "macos") {
        "alt+space"
    } else {
        "ctrl+space"
    };
    app.global_shortcut()
        .on_shortcut(shortcut, move |app, _shortcut, event| {
            if event.state != ShortcutState::Pressed {
                return;
            }
            if let Some(window) = app.get_webview_window("main") {
                crate::window::toggle_overlay_impl(window);
            }
        })
        .map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to register global shortcut: {}", e),
            )
        })?;
    Ok(())
}
