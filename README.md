# Local Text Generator

## Overview
Local Text Generator is an open-source framework designed for hosting a local large language model (LLM) to assist with creative storytelling and text editing. This project enables users to generate and edit stories seamlessly using AI while maintaining complete privacy and control over their data. The web-based interface allows for customizable generation settings, undo/redo functionality, and light/dark mode support.

<img width="1532" alt="image" src="https://github.com/user-attachments/assets/627edfaa-80bc-4482-a40c-c5f2b83d939b" />


## Unique Feature: Inline Text Editing & Smart Generation
Unlike traditional AI-powered text generation tools, **Local Text Generator** allows users to edit any part of their text and generate inline completions dynamically. This feature enables:
- **Creative Writing**: Continue stories naturally while preserving flow and style.
- **Text Editing & Refinement**: Modify any part of the document and regenerate content within context.
- **Professional & Academic Writing**: Rewrite, extend, or enhance text without starting from scratch.
- **Code & Documentation Enhancement**: Improve clarity and consistency in structured content.

Users can simply **place the cursor anywhere in the document** and press **Ctrl+Enter** to generate a seamless inline extension or improvement.

---

## Features
- **Local LLM Hosting**: Runs entirely on your machine without external API calls.
- **Inline Text Editing**: Generate content at any cursor position for interactive text refinement.
- **Text Continuation**: Generates text that seamlessly extends user-provided input.
- **Customizable Settings**: Adjust parameters like temperature, length, and context size.
- **Undo/Redo History**: Maintain a history of edits and easily revert changes.
- **Dark/Light Mode**: Toggle between themes for comfortable reading.
- **Keyboard Shortcuts**: Use quick key commands for generating and managing content.
- **Persistent Storage**: Saves text history locally in browser storage.

---

## Installation
### Prerequisites
- **Node.js** (Optional, for future expansions)
- **Python (For running LLM backend)**
- **Ollama or Local LLM Server** (Example: `deepseek-r1:14b` model)

### Steps to Run Locally
1. **Clone the Repository**
   ```sh
   git clone https://github.com/your-repo/local-text-generator.git
   cd local-text-generator
   ```

2. **Start the Local LLM Server**  
   Ensure you have a local model running (e.g., using Ollama):
   ```sh
   ollama serve
   ```
   Or if using a different backend, ensure it is accessible at:
   ```sh
   http://localhost:11434/api/generate
   ```

3. **Run the Web Interface**
   Simply open `index.html` in a browser:
   ```sh
   open index.html  # Mac/Linux
   start index.html # Windows
   ```

---

## Usage
### Generating a Text or Editing Inline
1. Place the cursor where you want to edit or continue the text.
2. Press **Ctrl+Enter** (or click the generate button) to generate inline text.
3. The AI will extend, rewrite, or refine the selected portion naturally.

### Customizing AI Behavior
- **Temperature**: Adjust creativity level (low values = deterministic, high values = more randomness).
- **Max Length**: Controls how much text is generated in one go.
- **Context Size**: Determines how much of the past text the AI remembers.
- **Custom Context**: Provide additional instructions to guide the AI’s output.

### Managing History
- **Undo (Ctrl+Z)**: Revert the last change.
- **Redo (Ctrl+Shift+Z or Ctrl+Y)**: Restore the undone change.
- **New Text**: Clears the editor and resets history.
- **Save Text**: Stores the current text in local storage.

### Theming & Accessibility
- Click the **theme toggle** to switch between dark and light mode.
- Text selection is enhanced for better readability.

---

## Keyboard Shortcuts
| Shortcut        | Action                      |
|----------------|----------------------------|
| **Ctrl+Enter** | Generate text inline       |
| **Ctrl+Z**     | Undo                        |
| **Ctrl+Shift+Z** or **Ctrl+Y** | Redo       |
| **Escape**     | Cancel ongoing generation   |

---

## Contributing
We welcome contributions to improve the framework! Here’s how you can help:
1. **Fork the repository**.
2. **Make changes and commit**.
3. **Submit a pull request** with detailed changes.

Feel free to open issues for bug reports, feature requests, or general discussion.

---

## License
This project is licensed under the **MIT License**. Feel free to use and modify it as needed.

---

## Credits
- **Developed by:** Kenneth Law
- **Inspiration:** AI storytelling tools like NovelAI

For any questions or feedback, feel free to open an issue or reach out!

