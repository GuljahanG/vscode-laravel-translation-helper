# 🌍 Laravel Translator Helper

## ✨ Overview

**Laravel Translator Helper** is a VS Code extension that auto-wraps static text in Laravel Blade files for localization. Simplify your Laravel app's internationalization with easy key generation and language file updates!

## 🚀 Features

- 🔑 **Unique Keys**: Auto-generate keys by transliterating Cyrillic to Latin.
- 📂 **Directory Support**: Organize localization files easily.
- ⚡ **Quick Wrap**: Instantly wrap selected text with `__('key')` for localization.

## 📦 Installation

1. Open VS Code.
2. Go to Extensions (`Ctrl+Shift+X`).
3. Search `Laravel Translator Helper` and hit **Install**.
4. Reload VS Code. 🎉

## ⚙️ Configuration

1. Open VS Code settings (`Ctrl+,`).
2. Search for `Laravel Translator Helper`.
3. Set your `Root Directory`, e.g., `resources/lang`.

Or, add this to `settings.json`:

```json
{
  "laravelTranslatorHelper.rootDirectory": "resources/lang"
}

## 🛠️ Usage

1. Select text in a Blade file.
2. Right-click and choose **Process and Update Localization Files**.
3. Or press `Ctrl+Alt+T` to wrap text instantly.

## 🎹 Keybindings

- `Ctrl+Alt+T`: Quick wrap selected text.

## ⚙️ Requirements

- VS Code v1.92.0+
- Laravel framework

## 🤝 Contributing

Contributions welcome! Submit a pull request or open an issue.

