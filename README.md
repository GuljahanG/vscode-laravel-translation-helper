# 🌍 Laravel Translator Helper

## ✨ Overview

**Laravel Translator Helper** is a VS Code extension that auto-wraps static text in Laravel Blade files for localization. Simplify your Laravel app's internationalization with easy key generation and language file updates!


## 🚀 Features

- 🔑 **Unique Keys**: Auto-generate keys by transliterating Cyrillic to Latin or using camelCase for translations.
- ⚙️ **Manual & Automatic Configuration**: 
  - **Automatic**: Automatically detect the file direction.
  - **Manual**: Add the desired file by entering its name in the input field.
- 📂 **Directory Support**: Easily manage localization files in your specified root directory.
- ⚡ **Quick Wrap**: Instantly wrap static text with `__('key')` for localization.
- 🌐 **Google Translator**: Use the Google Translator for free, but note that it has usage limits. If you encounter a 429 error, consider using a proxy.
- ⏳ **Version 5 Updates**: We are eagerly awaiting updates in version 5! 


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

json
{
  "laravelTranslatorHelper.rootDirectory": "resources/lang"
}

## 🛠️ Usage

1. Select text in a Blade file.
2. Right-click and choose **Process and Update Localization Files**.
3. Or press `Ctrl+Alt+T` to wrap text instantly.

## 📹 How to Use

Watch our [How to Use video](https://youtu.be/4sR6uybrXG0) for a step-by-step guide on using this extension.

## 🎹 Keybindings

- `Ctrl+Alt+T`: Quick wrap selected text.

## 🔜 Upcoming Features

### v5
- Open-source translator for keys and text.

### v6
- Highlighted static text that needs translation.

### v7
- Add a quick fix button for translations.

![Pathetic Cat](https://media.tenor.com/kPLrQQWWgYsAAAAM/kittens-please.gif)

😺 **Support Needed**: For the next version, we need a VPS server to enhance functionality. This will help all Laravel users. Thank you for your support! You can buy me a coffee [here](https://buymeacoffee.com/ilmedova).

## 🤝 Contributing

Contributions welcome! Submit a pull request or open an issue.

