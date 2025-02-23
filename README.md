# Skrive Leif - Interactive Text Improvement Tool 🎯

An elegant web application that helps improve your Norwegian text with real-time annotations and suggestions. Using advanced AI, it analyzes your text and provides specific recommendations for better clarity and readability.

![Skrive Leif Demo](demo.gif)

## ✨ Features

- **Real-time Text Analysis**: Get instant feedback on your writing
- **Interactive Annotations**: 
  - Visual marking of text sections using Rough Notation
  - Multiple annotation types (underline, strike-through, etc.)
  - Smooth transitions and animations
- **Smart Focus**: 
  - Current sentence stays prominent while others are dimmed
  - Easy to track changes and suggestions
- **Intuitive Interface**:
  - Clean, modern design using Pico CSS
  - Simple text editing and review process
  - Clear accept/decline actions for suggestions

## 🚀 Getting Started

### Prerequisites

- Modern web browser
- API key for the text analysis service

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skrive-leif.git
cd skrive-leif
```

2. Configure your API settings:
```bash
cp config.example.js config.js
```
Edit `config.js` with your API credentials:
```javascript
{
    API_BASE_URL: 'your-api-base-url',
    API_KEY: 'your-api-key',
    MODEL: 'skrive-leif-m-markering'
}
```

3. Open `index.html` in your web browser or serve it using a local server.

## 🎮 How to Use

1. **Enter Text**: Type or paste your Norwegian text into the input area
2. **Analyze**: Click "Analyser tekst" to start the analysis
3. **Review Changes**: 
   - Each suggestion is shown one at a time
   - Current sentence is highlighted while others are dimmed
   - Specific improvements are marked with annotations
4. **Accept or Decline**: Choose to accept or decline each suggested change
5. **Edit**: Click "Rediger tekst" to make manual changes at any time

## 🛠 Technical Details

### Technologies Used

- **Frontend**:
  - Vanilla JavaScript
  - [Rough Notation](https://roughnotation.com/) for annotations
  - [Pico CSS](https://picocss.com/) for styling

### API Integration

The application uses a specialized Norwegian language model for text analysis. The API returns:
- Suggested improvements for sentences
- Specific annotations for parts of text
- Writing rules and explanations
- Overall feedback and comments

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- [Rough Notation](https://roughnotation.com/) for the excellent annotation library
- [Pico CSS](https://picocss.com/) for the minimal, semantic CSS framework
