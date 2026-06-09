use std::sync::mpsc;
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
async fn save_workspace(
    app: tauri::AppHandle,
    content: String,
    filename: String,
) -> Result<String, String> {
    let (tx, rx) = mpsc::channel();

    app.dialog()
        .file()
        .add_filter("Workspace", &["json", "xml"])
        .set_file_name(&filename)
        .save_file(move |path| {
            let _ = tx.send(path);
        });

    match rx.recv().map_err(|_| "dialog failed".to_string())? {
        Some(fp) => {
            let pb = fp
                .as_path()
                .ok_or("invalid path".to_string())?
                .to_path_buf();
            std::fs::write(&pb, &content).map_err(|e| e.to_string())?;
            Ok(pb.to_string_lossy().to_string())
        }
        None => Err("User cancelled".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![save_workspace])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
