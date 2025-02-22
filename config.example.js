const config = {
    USE_MOCK: false, // Set to true to use mock data, false to use real API
    API: {
        BASE_URL: 'http://localhost:3000',
        ENDPOINTS: {
            COMPLETIONS: '/api/chat/completions'
        },
        API_KEY: 'your-api-key-here', // Replace with your API key
        MODEL: 'skrive-leif'
    }
};

export default config;
