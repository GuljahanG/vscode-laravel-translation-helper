# Laravel Translator Helper

![Cute Cat](https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif)

## Overview

**Laravel Translator Helper** is a Visual Studio Code extension that automatically wraps static text in Laravel Blade files for localization. This tool simplifies the process of internationalizing your Laravel applications by allowing you to easily generate localization keys and update your language files.

## Features

- **Unique Keys with Transliteration**: Automatically generate unique localization keys by converting Cyrillic text to Latin characters.
- **Support for Directories and Subdirectories**: Easily specify directories and subdirectories for organizing your localization files.
- **Auto-Wrap Selected Text**: Automatically wrap your selected text with Laravel's `__('key')` syntax for quick localization.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Sidebar or by pressing `Ctrl+Shift+X`.
3. Search for `Laravel Translator Helper` and click **Install**.
4. After installation, reload Visual Studio Code.

## Configuration

To customize the root directory for localization files, add the following configuration to your `settings.json`:

1. Open VS Code.
2. Go to `File` > `Preferences` > `Settings` (or press `Ctrl+,`).
3. Search for `Laravel Translator Helper` in the search box.
4. Set the `Root Directory` to your preferred value, e.g., `resources/lang`.

Alternatively, you can directly edit your `settings.json` file and add:

```json
{
  "laravelTranslatorHelper.rootDirectory": "resources/lang"
}

## Usage

### Wrapping Selected Text

1. Select the text you want to localize in a Blade file.
2. Right-click and select **Process and Update Localization Files** from the context menu.
3. Alternatively, you can press `Ctrl+Alt+T` to quickly wrap the selected text.

### Wrapping All Static Text

1. Right-click in the editor and select **Handle All Static Text** to automatically wrap all unwrapped static text in the current file.

## Keybindings

- `Ctrl+Alt+T`: Wrap selected text with localization syntax.


## Requirements

- Visual Studio Code v1.92.0 or higher.
- Laravel framework for backend support.

## Contributing

Contributions are welcome! Please submit a pull request or create an issue for any bugs or feature requests.

## License

This extension is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
