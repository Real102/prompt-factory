use tauri::{Manager, WindowEvent};

/// 切换浮层窗口显示/隐藏的内部实现
/// 供 IPC command、托盘点击、快捷键共用
pub fn toggle_overlay_impl(window: tauri::WebviewWindow) {
    let visible = window.is_visible().unwrap_or(false);
    if visible {
        let _ = window.hide();
    } else {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.center();
    }
}

/// IPC command: 切换浮层窗口
#[tauri::command]
pub fn toggle_overlay(window: tauri::WebviewWindow) {
    toggle_overlay_impl(window);
}

/// 注册窗口失焦自动收起
/// 窗口失去焦点时自动隐藏浮层
pub fn setup_auto_hide(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let win = window.clone();
        window.on_window_event(move |event| {
            if let WindowEvent::Focused(false) = event {
                let _ = win.hide();
            }
        });
    }
}
