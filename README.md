# Text Analysis Application

A web application that analyzes text and provides suggestions for improvements.

## Setup

1. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and replace `your-api-key-here` with your actual API key.

3. Open `index.html` in your browser to use the application.

## Configuration

The application can be configured through `config.js`:

- `USE_MOCK`: Set to `true` to use mock data instead of making API calls
- `API.BASE_URL`: The base URL for the API
- `API.API_KEY`: Your API key
- `API.MODEL`: The model to use for text analysis

## Development

The `config.js` file is ignored by Git to prevent accidentally committing API keys. Always use `config.example.js` as a template and create your own `config.js` file with your actual API key.
