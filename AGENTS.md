# AGENTS.md

本文件是 `vscode-webstorm-theme` 仓库的维护约定。

## 项目概览

这是一个只包含 VS Code 颜色主题的扩展，没有运行时 TypeScript/JavaScript 代码。主题文件使用 VS Code 支持的 JSONC 格式，因此可以包含注释和尾随逗号。

当前扩展版本以 [package.json](./package.json) 为准，目前是 `1.0.6`。主题入口也以 `package.json` 的 `contributes.themes` 为准，不要仅根据文件名推断哪些主题会被发布。

## 常用命令

```bash
# 校验 package.json 中声明的主题、路径和主题基本结构
npm run validate

# 校验后生成 VSIX；需要系统中可用 `vsce` 命令（由 @vscode/vsce 提供）
npm run package
```

如果本机没有 `vsce`，可先执行 `npm install --global @vscode/vsce`，或直接运行 `npx --yes @vscode/vsce package`。

开发预览：按 `F5` 启动 Extension Development Host，然后通过 `Preferences: Color Theme` 选择主题。主题文件变更后，开发窗口通常会自动刷新；若没有刷新，可重新选择主题或重载窗口。

## 仓库结构

```text
├── package.json                  # 扩展清单和 6 个主题入口
├── themes/                       # VS Code JSONC 颜色主题
│   ├── ws-darker-color-theme.json
│   ├── webstorm-darcula-color-theme.json
│   ├── webstorm-dark-color-theme.json
│   ├── new_dark.json
│   ├── new_darcula.json
│   └── ws-light-color-theme.json
├── scripts/validate-themes.mjs   # 发布前的主题和 manifest 校验
├── assets/images/                # 扩展图标和预览图
├── README.md                     # 用户文档
├── CHANGELOG.md                  # 版本变更记录
└── .vscodeignore                 # VSIX 内容排除规则
```

## 修改主题的约定

- 修改颜色、语法高亮或语义高亮时，直接编辑对应 `themes/*.json` 文件；不要编辑 VSIX 生成物。
- 新增主题时，同时创建主题文件，并在 `package.json` 的 `contributes.themes` 中增加唯一的 `label` 和正确的相对路径。
- 主题路径必须位于 `themes/` 目录内，主题至少应包含 `type` 和 `colors`。
- UI 颜色键优先参考 [VS Code Theme Color Reference](https://code.visualstudio.com/api/references/theme-color)；未知或过时的颜色键可能被 VS Code 忽略。
- 修改 `WebStorm Darker` 后，确认 README 预览、CHANGELOG 和实际主题入口是否仍然准确。
- 主题视觉调整不应顺手改变其他主题；如需同步，明确检查每个主题的差异。

## 发布检查清单

1. 运行 `npm run validate`。
2. 检查 `package.json` 版本与 `CHANGELOG.md` 是否一致。
3. 确认 `package.json` 引用的所有主题文件都已纳入提交。
4. 用 `F5` 至少检查一个深色主题和一个浅色主题。
5. 运行 `npm run package`，确认生成的 VSIX 不包含 `AGENTS.md`、`CLAUDE.md`、开发脚本、`.vscode` 等仓库维护文件。

除非任务明确要求，不要手动编辑或提交生成的 `.vsix` 文件；不要覆盖用户已有的未提交修改。
