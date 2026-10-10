use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Manager, WindowEvent};

static AUTO_HIDE_ENABLED: AtomicBool = AtomicBool::new(true);

/// 切换浮层窗口显示/隐藏的内部实现
/// 供 IPC command、托盘点击、快捷键共用
pub fn toggle_overlay_impl(window: tauri::WebviewWindow) {
    let visible = window.is_visible().unwrap_or(false);
    if visible {
        let _ = window.hide();
    } else {
        let _ = window.center();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

/// IPC command: 切换浮层窗口
#[tauri::command]
pub fn toggle_overlay(window: tauri::WebviewWindow) {
    toggle_overlay_impl(window);
}

/// IPC command: 启动窗口拖拽
/// 临时禁用失焦自动隐藏，调用原生 start_dragging，兜底 3 秒后恢复
#[tauri::command]
pub fn start_drag(window: tauri::WebviewWindow) {
    AUTO_HIDE_ENABLED.store(false, Ordering::SeqCst);
    let _ = window.start_dragging();
    std::thread::spawn(|| {
        std::thread::sleep(std::time::Duration::from_secs(3));
        AUTO_HIDE_ENABLED.store(true, Ordering::SeqCst);
    });
}

/// 注册窗口失焦自动收起
/// 窗口失去焦点时自动隐藏浮层（拖拽期间通过 AUTO_HIDE_ENABLED 禁用）
pub fn setup_auto_hide(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let win = window.clone();
        window.on_window_event(move |event| {
            match event {
                WindowEvent::Focused(false) => {
                    if AUTO_HIDE_ENABLED.load(Ordering::SeqCst) {
                        let _ = win.hide();
                    }
                }
                WindowEvent::Focused(true) => {
                    AUTO_HIDE_ENABLED.store(true, Ordering::SeqCst);
                }
                _ => {}
            }
        });
    }
}
