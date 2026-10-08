use tauri_plugin_clipboard_manager::ClipboardExt;

/// IPC command: 光标注入文本
/// 方案：将文本写入剪贴板 → 隐藏浮层 → 模拟 Ctrl+V 粘贴
#[tauri::command]
pub fn inject_text(text: String, window: tauri::WebviewWindow, app: tauri::AppHandle) -> bool {
    // 1. 将文本写入剪贴板
    if app.clipboard().write_text(&text).is_err() {
        return false;
    }

    // 2. 隐藏浮层窗口
    let _ = window.hide();

    // 3. 短暂等待让窗口隐藏生效（让焦点回到目标应用）
    std::thread::sleep(std::time::Duration::from_millis(150));

    // 4. 模拟 Ctrl+V 粘贴
    #[cfg(windows)]
    {
        return simulate_paste_windows();
    }

    #[cfg(not(windows))]
    {
        let _ = app;
        false
    }
}

/// Windows: 使用 SendInput API 模拟 Ctrl+V 按键
#[cfg(windows)]
fn simulate_paste_windows() -> bool {
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        SendInput, INPUT, INPUT_TYPE, KEYEVENTF_KEYUP, VK_CONTROL, VIRTUAL_KEY,
    };

    // V 键的虚拟键码 = 0x56 (86)
    let vk_v = VIRTUAL_KEY(0x56);
    // INPUT_KEYBOARD = 1
    let keyboard_input = INPUT_TYPE(1);

    unsafe {
        let mut inputs: [INPUT; 4] = std::mem::zeroed();

        // Ctrl down
        inputs[0].r#type = keyboard_input;
        inputs[0].Anonymous.ki.wVk = VK_CONTROL;

        // V down
        inputs[1].r#type = keyboard_input;
        inputs[1].Anonymous.ki.wVk = vk_v;

        // V up
        inputs[2].r#type = keyboard_input;
        inputs[2].Anonymous.ki.wVk = vk_v;
        inputs[2].Anonymous.ki.dwFlags = KEYEVENTF_KEYUP;

        // Ctrl up
        inputs[3].r#type = keyboard_input;
        inputs[3].Anonymous.ki.wVk = VK_CONTROL;
        inputs[3].Anonymous.ki.dwFlags = KEYEVENTF_KEYUP;

        SendInput(&inputs, std::mem::size_of::<INPUT>() as i32) == inputs.len() as u32
    }
}
