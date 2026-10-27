<div align="center">

# Prompt Factory

**本地优先的 Prompt 模板复用工具**

选模板 · 填变量 · 一键注入 —— 模板优先，拼装进阶

<br>

<!-- 截图占位：替换为实际截图 -->
<!-- <img src="docs/screenshot-main.png" width="680" alt="Prompt Factory 主界面" /> -->

<br>

<img src="https://img.shields.io/badge/Tauri-v2-orange?logo=tauri&logoColor=white" alt="Tauri v2" />
<img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" alt="React 18" />
<img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/Zustand-5-c9f73d" alt="Zustand" />
<img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-c9f73d" alt="Platform" />
<img src="https://img.shields.io/badge/license-MIT-c9f73d" alt="MIT License" />
<img src="https://img.shields.io/badge/version-0.1.0-c9f73d" alt="version" />

</div>

---

## 这是什么

Prompt Factory 是一个常驻系统托盘的轻量桌面工具。选模板、填变量、一键注入光标——3 步搞定。需要更灵活的组合时，切换到片段拼装模式，拖拽积木般组装完整 Prompt。

按 `Ctrl+Space`（macOS `Option+Space`）随时唤起，一键复制或直接注入到光标位置。

**所有数据存储在本地，无需联网，不依赖任何云服务。**

---

## 功能亮点

<table>
<tr>
<td width="50%" valign="top">

### 模板管理

> 选模板 → 填变量 → 一键注入，3 步搞定

- 整段型模板，支持 `{{变量}}` 占位符
- 模板 CRUD，浮层内直接编辑
- 标签管理，inline 创建/删除，颜色自动映射
- 频率排序，高频模板自动靠前
- 模糊搜索，模板名/描述/内容全匹配

</td>
<td width="50%" valign="top">

### 拼装引擎（进阶）

> 拖拽组合，实时预览

- Tab 切换到片段库，勾选片段加入拼装台
- 拖拽排序，实时合成预览
- 自动提取变量，按来源分类着色
- 编辑模式：三态切换，临场微调不回写片段

**内置分类：**

| 分类 | 颜色 | 用途 |
|:---:|:---:|---|
| 角色 | `#c9f73d` | 定义 AI 扮演的身份 |
| 权限 | `#6ad7ff` | 约束可做/不可做的事 |
| 避免 | `#ff7a3d` | 明确禁止的行为 |
| 格式 | `#7af0c4` | 输出格式要求 |
| 上下文 | `#ffd24d` | 项目/环境背景信息 |

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 一键输出

> 复制 or 注入，两种方式

- **复制到剪贴板**：粘贴到任意输入框
- **注入到光标**：直接写入当前焦点输入框
- Windows: SendInput 模拟 Ctrl+V
- macOS: AppleScript 模拟 Cmd+V
- 按 `Enter` 快速注入，无需切换窗口

</td>
<td width="50%" valign="top">

### 系统集成

> 常驻后台，随唤随到

- 全局快捷键唤起浮层
- 系统托盘常驻，左键唤起 / 右键菜单
- 界面缩放（6 档 80%–150%），实时生效
- 支持开机自启
- 单实例保护，防止重复启动
- Toast 操作反馈，2 秒自动消失
- 无边框透明窗口，始终置顶

</td>
</tr>
</table>

---

## 快速开始

### 下载使用

> 前往 [Releases](../../releases) 页面下载对应平台的安装包，Windows 为 NSIS 安装程序（`.exe`），macOS 为 DMG 镜像（`.dmg`）。

首次启动会自动生成内置种子数据（包含常用角色、权限、格式等片段），开箱即用。

### 从源码构建

**环境要求：**

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri v2 前置依赖](https://v2.tauri.app/start/prerequisites/)

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm tauri dev

# 构建发布版本
pnpm tauri build
```

<details>
<summary>Windows 开发脚本（可选）</summary>

项目根目录提供了一组 PowerShell 辅助脚本：

| 脚本 | 说明 |
|---|---|
| `dev.ps1` | 启动开发模式（Vite + Tauri） |
| `build-portable.ps1` | 构建并打包便携版 zip |
| `cargo-check.ps1` | Rust 编译检查 |
| `tsc-check.ps1` | TypeScript 类型检查 |
| `gen-icons.ps1` | 生成应用图标 |

</details>

<details>
<summary>CI 自动构建（GitHub Actions）</summary>

项目内置 `.github/workflows/build.yml`，支持矩阵构建 Windows + macOS 安装包：

- **手动触发**：GitHub 仓库 → Actions → Build → Run workflow
- **自动发布**：推送 `v` 开头的 tag（如 `v0.1.0`）自动构建并创建 Release

```bash
git tag v0.1.0
git push origin v0.1.0
```

</details>

---

## 使用指南

### 基本流程

```
Ctrl+Space / Option+Space 唤起浮层
              │
              ▼
     搜索或选择模板 ──▶ 自动加载 + 提取变量 ──▶ 填充变量 ──▶ 预览确认
              │                                              │
              │ (进阶路径)                   ┌───────────────┴───────────────┐
              ▼                             ▼                               ▼
       拖入拼装台 ──▶ 排序预览        复制到剪贴板                    注入到光标位置
```

### 快捷键

| 快捷键 | 作用 |
|:---:|---|
| <kbd>Ctrl</kbd>+<kbd>Space</kbd>（Win）/ <kbd>Option</kbd>+<kbd>Space</kbd>（Mac） | 全局唤起 / 收起浮层 |
| <kbd>Esc</kbd> | 收起浮层 / 退出编辑模式 |
| <kbd>Enter</kbd> | 注入结果到光标位置 |

### 数据与隐私

- 业务数据位于**程序同目录** `data/prompt-factory-data.json`，纯 JSON 文本
- UI 偏好（界面缩放等）独立存于 `data/prompt-factory-settings.json`，互不干扰
- 支持数据导入 / 导出（JSON 文件级），方便备份与迁移
- **完全离线运行**，数据不离开本机，不上传任何服务器

---

## 技术栈

| 层级 | 技术 | 说明 |
|---|:---:|---|
| 桌面框架 | [Tauri v2](https://tauri.app/) | Rust 后端 + WebView 前端，体积小、性能好 |
| 前端 | [React 18](https://react.dev/) | 组件化 UI |
| 语言 | [TypeScript 5](https://www.typescriptlang.org/) | 类型安全 |
| 构建 | [Vite 5](https://vitejs.dev/) | 极速 HMR |
| 状态管理 | [Zustand 5](https://github.com/pmndrs/zustand) | 轻量、无样板 |
| 拖拽 | [@dnd-kit](https://dndkit.com/) | 无障碍、可定制的拖拽交互 |
| 包管理 | [pnpm](https://pnpm.io/) | 高效磁盘利用 |

---

## 项目结构

```
prompt-factory/
├── src/                       # 前端源码
│   ├── components/            # UI 组件（14 个模块）
│   │   ├── Overlay/           #   浮层容器
│   │   ├── SearchBar/         #   搜索栏
│   │   ├── SearchResults/     #   搜索结果（两段式）
│   │   ├── AssemblyTrack/     #   拼装台（拖拽区）
│   │   ├── VariableArea/      #   变量填充区（模板模式）
│   │   ├── VariableSlots/     #   变量槽位（拼装模式）
│   │   ├── PreviewPanel/      #   预览面板（分段高亮）
│   │   ├── BottomBar/         #   底部操作栏
│   │   ├── TabBar/            #   Tab 切换（模板/片段库）
│   │   ├── SnippetLibrary/    #   片段库
│   │   ├── SnippetEditor/     #   片段编辑器
│   │   ├── TemplateList/      #   模板列表（标签 + 频率排序）
│   │   ├── TemplateEditor/    #   模板编辑器
│   │   └── Toast/             #   提示通知
│   ├── stores/                # Zustand 状态（4 个 store）
│   ├── services/              # 拼装引擎、存储服务、变量引擎、平台判断
│   ├── hooks/                 # 全局快捷键、窗口拖拽、UI 缩放
│   ├── data/                  # 种子数据
│   ├── styles/                # 全局样式与 CSS 变量
│   └── types.ts               # 类型定义
├── src-tauri/                 # Tauri / Rust 后端
│   ├── src/                   # Rust 源码（注入、托盘、快捷键、命令）
│   ├── icons/                 # 应用图标
│   ├── Cargo.toml             # Rust 依赖
│   └── tauri.conf.json        # Tauri 配置
├── .github/workflows/         # CI 自动构建（Win + macOS）
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 开发计划

### 已完成

- [x] 片段分类管理与搜索
- [x] 拖拽拼装与实时预览
- [x] 变量自动提取与填充
- [x] 编辑模式（三态切换）
- [x] 模板管理（整段型 + 变量 + CRUD）
- [x] Tab 切换（模板 / 片段库）
- [x] 标签管理（inline 创建/删除/颜色映射）
- [x] 模糊搜索（两段式，模板优先）
- [x] 频率排序（usage_count）
- [x] 全局快捷键唤起（Win + macOS）
- [x] 光标注入（Win: SendInput / macOS: AppleScript）
- [x] 界面缩放 / 开机自启 / 单实例锁
- [x] 变量分段高亮与来源着色
- [x] 跨平台 CI 自动构建（Win + macOS）

### 待完成

- [ ] 数据导入导出 UI 入口
- [ ] 片段库频率排序
- [ ] 主题切换
- [ ] 内置模板库
- [ ] 首次体验引导
- [ ] 片段/模板分享

---

<div align="center">

**使用过程中的任何问题或功能建议，欢迎提交 [Issue](../../issues)**

Made with Tauri + React

</div>
