# AIBud

A modern React application that provides a friendly AI assistant. Built with React, Vite, Tailwind CSS, and integrated with Ollama for local AI inference.

## About the Creator

AIBud was created by **Andrew Brown**, a solo founder from America. It's a passion project with the goal of helping the world have more access to AI.

## 🚀 Features

- **AI-Powered Chat Interface**: Get help with web development questions, code snippets, and project ideas
- **Local AI Processing**: Uses Ollama for privacy and offline capability
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Quick Actions**: Pre-built prompts for common development questions
- **Conversation History**: View and manage your chat history
- **Copy to Clipboard**: Easy copying of responses and prompts
- **Settings Panel**: Configure Ollama URL and model selection
- **Code Formatting**: Automatic formatting of code blocks in responses

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Ollama (local inference)
- **State Management**: React Hooks

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Ollama** installed and running locally
- **Modern web browser**

## 🔧 Installation

### 1. Install Ollama

First, install Ollama on your system:

**macOS:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Linux:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [https://ollama.ai/download](https://ollama.ai/download)

### 2. Pull a Model

After installing Ollama, pull a model (recommended: llama3):

```bash
ollama pull llama3
```

Other good options:

```bash
ollama pull mistral
ollama pull gemma:7b
ollama pull codellama
```

### 3. Start Ollama

Start the Ollama service:

```bash
ollama serve
```

### 4. Clone and Setup the React App

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:3000`

## 🎯 Usage

### Basic Usage

1. **Start Ollama**: Make sure Ollama is running (`ollama serve`)
2. **Open the App**: Navigate to `http://localhost:3000`
3. **Ask Questions**: Type your web development questions in the chat
4. **Get Responses**: Receive AI-powered assistance with code examples and explanations

### Quick Actions

Use the sidebar quick actions for common questions:

- React App Ideas
- CSS Best Practices
- API Design Tips
- Performance Optimization
- State Management

### Settings

Click the settings icon to configure:

- **Ollama URL**: Default is `http://localhost:11434`
- **Model Selection**: Choose from available models
- **Refresh Models**: Update the list of available models

## 🔧 Configuration

### Ollama Models

The app works with any Ollama model. Popular options for development:

- **llama3**: Good general-purpose model
- **codellama**: Specialized for code generation
- **mistral**: Fast and efficient
- **gemma:7b**: Lightweight and fast

### Custom Prompts

The app includes a specialized prompt for web development assistance. You can modify the prompt in `src/App.jsx` to customize the AI's behavior.

## 📁 Project Structure

```
webdev-assistant/
├── src/
│   ├── components/
│   │   ├── Chat.jsx          # Main chat interface
│   │   └── History.jsx       # History and quick actions
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # App entry point
│   └── index.css             # Global styles
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use the `gh-pages` package
- **Static Hosting**: Any static file hosting service

## 🔒 Privacy & Security

- **Local Processing**: All AI processing happens locally via Ollama
- **No Data Collection**: No user data is sent to external services
- **Offline Capable**: Works without internet connection (after model download)

## 🐛 Troubleshooting

### Common Issues

**"Failed to get response from Ollama"**

- Make sure Ollama is running: `ollama serve`
- Check if the model is downloaded: `ollama list`
- Verify the Ollama URL in settings

**"Model not found"**

- Pull the model: `ollama pull llama3`
- Check available models: `ollama list`

**"Connection refused"**

- Ensure Ollama is running on the correct port (default: 11434)
- Check firewall settings

### Performance Tips

- Use smaller models for faster responses (e.g., `gemma:7b`)
- Close other applications to free up memory
- Consider using a GPU if available

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for local AI inference
- [React](https://reactjs.org/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build tool

---

**Happy coding! 🚀**
