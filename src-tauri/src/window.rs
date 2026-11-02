use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Manager, WindowEvent};

use crate::commands::{read_ui_scale, BASE_H, BASE_W};

static AUTO_HIDE_ENABLED: AtomicBool = AtomicBool::new(true);

/// 按档位设置窗口尺寸（读取当前显示器，宽、高分别做超屏 clamp），并重新居中
pub fn apply_scale(window: &tauri::WebviewWindow, scale: f64) {
    let s = scale.clamp(0.5, 2.0);
    let mut w = BASE_W * s;
    let mut h = BASE_H * s;
    if let Ok(Some(monitor)) = window.current_monitor() {
        let factor = monitor.scale_factor();
        let logical_w = monitor.size().width as f64 / factor;
        let logical_h = monitor.size().height as f64 / factor;
        w = w.min(logical_w - 40.0);
        h = h.min(logical_h - 80.0);
    }
    let _ = window.set_size(tauri::LogicalSize::new(w, h));
    let _ = window.center();
}

/// 切换浮层窗口显示/隐藏的内部实现
/// 供 IPC command、托盘点击、快捷键共用
pub fn toggle_overlay_impl(window: tauri::WebviewWindow) {
    let visible = window.is_visible().unwrap_or(false);
    if visible {
        let _ = window.hide();
    } else {
        // 唤出前按当前档位校准窗口尺寸（覆盖换屏后超屏的场景）
        let scale = {
            let app = window.app_handle();
            read_ui_scale(app)
        };
        apply_scale(&window, scale);
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
