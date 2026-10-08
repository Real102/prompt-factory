use tauri::Manager;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

/// 注册全局快捷键唤起浮层
/// Windows: Ctrl+Space
pub fn register_shortcut(app: &tauri::AppHandle) -> tauri::Result<()> {
    app.global_shortcut()
        .on_shortcut("ctrl+space", move |app, _shortcut, _event| {
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
