import config from './config.js';
import { annotate } from 'https://unpkg.com/rough-notation?module';

// Test data
const mockApiResponse = {
    "endringer": [
        {
            "original_setning": "Det er mye som tyder på at de ansatte i virksomheten har foretatt en grundig analyse av egne problemer med sikte på å utvikle bedre rutiner for å håndtere mobbing på arbeidsplassen.",
            "forbedret_setning": "Mye tyder på at de ansatte har analysert egne problemer grundig. Formålet er å utvikle bedre rutiner mot mobbing på arbeidsplassen.",
            "regler": [
                "Det er ingen skam å sette punktum",
                "Bli ikke smittet av substantivsjuken"
            ],
            "kommentar": "Jeg har delt opp setningen for bedre lesbarhet og brukt et mer aktivt verb.",
            "annoteringer": [
                {
                    "type": "underline",
                    "tekst": "foretatt en grundig analyse"
                }
            ]
        },
        {
            "original_setning": "Vi mener at dette er viktig.",
            "forbedret_setning": "Dette er viktig.",
            "regler": [
                "Vær forsiktig med personlige pronomen som «jeg» og «vi»"
            ],
            "kommentar": "Fjernet personlig pronomen for en mer objektiv tone.",
            "annoteringer": [
                {
                    "type": "strike-through",
                    "tekst": "Vi mener at"
                }
            ]
        }
    ],
    "kommentarer": [
        {
            "original_setning": "Dette er en god setning.",
            "kommentar": "Veldig bra formulert og tydelig!"
        }
    ],
    "gjennomgående_kommentar": "Teksten kan forbedres ved å bruke mer aktivt språk og unngå lange setninger."
};

class TextEditor {
    constructor() {
        this.changes = [];
        this.currentChangeIndex = 0;
        this.currentAnnotations = [];
        this.originalText = '';
        this.currentText = '';
        this.acceptedChanges = new Set();

        // Bind methods to maintain 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.getElementById('editBtn').addEventListener('click', this.handleEditClick);
        document.getElementById('submitBtn').addEventListener('click', this.handleSubmit);
    }

    clearAnnotations() {
        this.currentAnnotations.forEach(annotation => annotation.remove());
        this.currentAnnotations = [];
    }

    displayTextWithAnnotation(text, change) {
        console.log('Displaying text:', text);
        console.log('Change:', change);

        const textDisplay = document.getElementById('textDisplay');

        // Split into sentences
        const sentences = text.split(/(?<=[.!?])\s+/);
        console.log('Split sentences:', sentences);

        // Find all sentences that contain parts of the improved or original text
        const improvedSentences = change.forbedret_setning.trim().split(/(?<=[.!?])\s+/);
        const sentenceIndices = [];

        sentences.forEach((sentence, index) => {
            const normalizedSentence = sentence.trim();
            const normalizedOriginal = change.original_setning.trim();

            // Check if sentence contains original text
            if (normalizedSentence.includes(normalizedOriginal)) {
                sentenceIndices.push(index);
            }

            // Check if sentence contains any part of the improved text
            improvedSentences.forEach(improvedSentence => {
                if (normalizedSentence.includes(improvedSentence.trim())) {
                    if (!sentenceIndices.includes(index)) {
                        sentenceIndices.push(index);
                    }
                }
            });
        });

        console.log('Found sentence indices:', sentenceIndices);

        if (sentenceIndices.length === 0) {
            console.log('No sentences found. Using exact match.');
            textDisplay.textContent = text;
            return;
        }

        // Sort indices to ensure correct order
        sentenceIndices.sort((a, b) => a - b);

        // Get the range of sentences to highlight
        const startIndex = sentenceIndices[0];
        const endIndex = sentenceIndices[sentenceIndices.length - 1];

        // Split text into before, target, and after
        const beforeText = sentences.slice(0, startIndex).join(' ');
        const targetSentences = sentences.slice(startIndex, endIndex + 1);
        const targetText = targetSentences.join(' ');
        const afterText = sentences.slice(endIndex + 1).join(' ');

        // Create spans for dimming
        textDisplay.innerHTML = '';

        if (beforeText) {
            const beforeSpan = document.createElement('span');
            beforeSpan.textContent = beforeText + ' ';
            beforeSpan.className = 'dimmed';
            textDisplay.appendChild(beforeSpan);
        }

        const targetSpan = document.createElement('span');
        targetSpan.textContent = targetText + ' ';
        textDisplay.appendChild(targetSpan);

        if (afterText) {
            const afterSpan = document.createElement('span');
            afterSpan.textContent = afterText;
            afterSpan.className = 'dimmed';
            textDisplay.appendChild(afterSpan);
        }

        // Apply annotations if they exist
        if (change.annoteringer && change.annoteringer.length > 0) {
            console.log('Applying annotations:', change.annoteringer);
            change.annoteringer.forEach(annotation => {
                const annotationText = annotation.tekst;

                // Find the text to annotate within the target span
                const targetContent = targetSpan.textContent;
                const annotationStart = targetContent.indexOf(annotationText);

                if (annotationStart !== -1) {
                    const before = targetContent.substring(0, annotationStart);
                    const annotated = targetContent.substring(annotationStart, annotationStart + annotationText.length);
                    const after = targetContent.substring(annotationStart + annotationText.length);

                    console.log('Applying annotation:', annotationText);
                    console.log('Before:', before);
                    console.log('Annotated:', annotated);
                    console.log('After:', after);

                    targetSpan.innerHTML = '';

                    if (before) {
                        const beforeAnnotation = document.createElement('span');
                        beforeAnnotation.textContent = before;
                        targetSpan.appendChild(beforeAnnotation);
                    }

                    const annotationSpan = document.createElement('span');
                    annotationSpan.textContent = annotated;
                    targetSpan.appendChild(annotationSpan);

                    if (after) {
                        const afterAnnotation = document.createElement('span');
                        afterAnnotation.textContent = after;
                        targetSpan.appendChild(afterAnnotation);
                    }

                    // Apply rough-notation based on type
                    const roughAnnotation = annotate(annotationSpan, {
                        type: annotation.type,
                        color: 'var(--primary)',
                        multiline: true,
                        iterations: 2,
                        animationDuration: 500
                    });
                    console.log('Showing rough annotation:', roughAnnotation);
                    roughAnnotation.show();
                    this.currentAnnotations.push(roughAnnotation);
                }
            });
        }
    }

    handleAccept() {
        const change = this.changes[this.currentChangeIndex];
        if (!change) return;

        console.log('Accepting change:', change);

        // Make the replacement
        this.currentText = this.currentText.replace(
            change.original_setning.trim(),
            change.forbedret_setning.trim()
        );

        console.log('Updated text:', this.currentText);

        this.acceptedChanges.add(this.currentChangeIndex);

        // Update display
        const textDisplay = document.getElementById('textDisplay');
        textDisplay.textContent = this.currentText;
        this.displayTextWithAnnotation(this.currentText, change);
        this.updateCommentSection(change);
    }

    handleRevert() {
        const change = this.changes[this.currentChangeIndex];
        if (!change) return;

        console.log('Reverting change:', change);

        // Handle multi-sentence improvements
        const improvedSentences = change.forbedret_setning.trim().split(/(?<=[.!?])\s+/);

        // Replace the entire improved text with the original
        if (improvedSentences.length > 1) {
            const improvedText = improvedSentences.join(' ');
            this.currentText = this.currentText.replace(improvedText, change.original_setning.trim());
        } else {
            this.currentText = this.currentText.replace(change.forbedret_setning.trim(), change.original_setning.trim());
        }

        console.log('Updated text:', this.currentText);

        this.acceptedChanges.delete(this.currentChangeIndex);

        // Update display
        const textDisplay = document.getElementById('textDisplay');
        textDisplay.textContent = this.currentText;
        this.displayTextWithAnnotation(this.currentText, change);
        this.updateCommentSection(change);
    }

    navigate(direction) {
        if (direction === 'right') {
            this.currentChangeIndex = (this.currentChangeIndex + 1) % this.changes.length;
        } else {
            this.currentChangeIndex = (this.currentChangeIndex - 1 + this.changes.length) % this.changes.length;
        }

        const change = this.changes[this.currentChangeIndex];
        if (!change) return;

        // Don't modify text, just update display with current state
        this.displayTextWithAnnotation(this.currentText, change);
        this.updateCommentSection(change);
    }

    updateUI() {
        const change = this.changes[this.currentChangeIndex];
        if (!change) return;

        const textDisplay = document.getElementById('textDisplay');

        // Reset text to original if we're showing the first change
        if (this.currentChangeIndex === 0) {
            textDisplay.textContent = this.originalText;
        }

        // Display current state of text with proper dimming
        this.displayTextWithAnnotation(textDisplay.textContent, change);
        this.updateCommentSection(change);
    }

    updateCommentSection(change) {
        const commentSection = document.getElementById('commentSection');
        commentSection.innerHTML = '';

        const commentBox = document.createElement('div');
        commentBox.className = 'comment-box';

        this.addNavigationInfo(commentBox);
        this.addCommentContent(commentBox, change);
        this.addActionButtons(commentBox);

        commentSection.appendChild(commentBox);
    }

    addNavigationInfo(commentBox) {
        const navigationInfo = document.createElement('div');
        navigationInfo.className = 'navigation-info';
        navigationInfo.innerHTML = `
            <small>
                Endring ${this.currentChangeIndex + 1} av ${this.changes.length}
                <br>
                <kbd>←</kbd> Forrige &nbsp; <kbd>→</kbd> Neste &nbsp; 
                <kbd>↑</kbd>/<kbd>↓</kbd>/<kbd>space</kbd> ${this.acceptedChanges.has(this.currentChangeIndex) ? 'Vis original' : 'Godta endring'}
            </small>
        `;
        commentBox.appendChild(navigationInfo);
    }

    addCommentContent(commentBox, change) {
        const commentContent = document.createElement('div');
        commentContent.className = 'comment-content';

        const isAccepted = this.acceptedChanges.has(this.currentChangeIndex);

        commentContent.innerHTML = `
            <p><strong>${isAccepted ? 'Endret fra:' : 'Forslag til endring:'}</strong></p>
            <p>${isAccepted ? change.original_setning : change.forbedret_setning}</p>
            <p><strong>Regler som er brukt:</strong></p>
            <ul>
                ${change.regler.map(rule => `<li>${rule}</li>`).join('')}
            </ul>
            <p><strong>Kommentar:</strong></p>
            <p>${change.kommentar}</p>
        `;
        commentBox.appendChild(commentContent);
    }

    addActionButtons(commentBox) {
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';
        const isAccepted = this.acceptedChanges.has(this.currentChangeIndex);

        actionButtons.innerHTML = `
            <button onclick="textEditor.${isAccepted ? 'handleRevert' : 'handleAccept'}()" class="${isAccepted ? 'secondary' : ''}">
                ${isAccepted ? 'Vis original' : 'Godta endring'}
            </button>
        `;
        commentBox.appendChild(actionButtons);
    }

    handleKeyDown(event) {
        if (!this.changes.length) return;
        if (document.getElementById('inputContainer').style.display !== 'none') return;
        if (document.getElementById('submitBtn').classList.contains('loading')) return;

        switch (event.key) {
            case 'ArrowRight':
                event.preventDefault();
                this.navigate('right');
                break;

            case 'ArrowLeft':
                event.preventDefault();
                this.navigate('left');
                break;

            case 'ArrowUp':
            case 'ArrowDown':
            case ' ':
                event.preventDefault();
                if (this.acceptedChanges.has(this.currentChangeIndex)) {
                    this.handleRevert();
                } else {
                    this.handleAccept();
                }
                break;
        }
    }

    handleResponse(data) {
        if (!data) return;

        this.changes = data.endringer;
        this.originalText = document.getElementById('textDisplay').textContent;
        this.currentText = this.originalText;
        this.currentChangeIndex = 0;
        this.acceptedChanges.clear();

        console.log('Original text:', this.originalText);
        console.log('First change:', this.changes[0]);

        // Show first change
        this.displayTextWithAnnotation(this.currentText, this.changes[0]);
        this.updateCommentSection(this.changes[0]);
    }

    showFinalComment() {
        const commentSection = document.getElementById('commentSection');
        commentSection.innerHTML = '';

        const commentBox = document.createElement('div');
        commentBox.className = 'comment-box';

        const finalMessage = document.createElement('div');
        finalMessage.className = 'comment-text';
        finalMessage.innerHTML = `<strong>Gjennomgang fullført!</strong><br><br>${mockApiResponse.gjennomgående_kommentar}`;

        commentBox.appendChild(finalMessage);
        commentSection.appendChild(commentBox);

        this.clearAnnotations();
    }

    setLoadingState(isLoading) {
        const elements = {
            submitBtn: document.getElementById('submitBtn'),
            editBtn: document.getElementById('editBtn'),
            userInput: document.getElementById('userInput'),
            textDisplay: document.getElementById('textDisplay')
        };

        if (isLoading) {
            elements.submitBtn.classList.add('loading');
            elements.submitBtn.disabled = true;
            elements.editBtn.classList.add('disabled', 'loading');
            elements.userInput.classList.add('disabled');
            elements.textDisplay.classList.add('disabled');
            elements.submitBtn.textContent = 'Analyserer...';
            elements.editBtn.textContent = 'Analyserer tekst...';
        } else {
            elements.submitBtn.classList.remove('loading');
            elements.submitBtn.disabled = false;
            elements.editBtn.classList.remove('disabled', 'loading');
            elements.userInput.classList.remove('disabled');
            elements.textDisplay.classList.remove('disabled');
            elements.submitBtn.textContent = 'Analyser tekst';
            elements.editBtn.textContent = 'Rediger tekst';
        }
    }

    handleEditClick() {
        const inputContainer = document.getElementById('inputContainer');
        const displayContainer = document.getElementById('textDisplayContainer');
        const userInput = document.getElementById('userInput');
        const textDisplay = document.getElementById('textDisplay');

        if (inputContainer.style.display === 'none') {
            inputContainer.style.display = 'block';
            displayContainer.style.display = 'none';
            userInput.textContent = textDisplay.textContent;
        }
    }

    handleSubmit() {
        const inputContainer = document.getElementById('inputContainer');
        const textDisplayContainer = document.getElementById('textDisplayContainer');
        const userInput = document.getElementById('userInput');
        const textDisplay = document.getElementById('textDisplay');

        if (userInput.textContent.trim()) {
            inputContainer.style.display = 'none';
            textDisplayContainer.style.display = 'block';
            textDisplay.textContent = userInput.textContent;

            this.setLoadingState(true);

            if (config.USE_MOCK) {
                // Use mock data
                setTimeout(() => {
                    this.setLoadingState(false);
                    this.handleResponse(mockApiResponse);
                }, 1000);
            } else {
                // Call real API
                callApi(userInput.textContent).then(response => {
                    this.setLoadingState(false);
                    if (response) {
                        this.handleResponse(response);
                    }
                });
            }
        }
    }
}

// Initialize the editor
const textEditor = new TextEditor();

async function callApi(text) {
    try {
        const response = await fetch(config.API.BASE_URL + config.API.ENDPOINTS.COMPLETIONS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.API.API_KEY}`
            },
            body: JSON.stringify({
                model: config.API.MODEL,
                messages: [
                    {
                        role: "system",
                        content: "Du er en hjelpsom språkassistent som skal forbedre norsk tekst. Gi konkrete forslag til forbedringer av setninger, med begrunnelse. Bruk dette formatet for svar:\n\n```json\n{\n  \"endringer\": [\n    {\n      \"original_setning\": \"original setning her\",\n      \"forbedret_setning\": \"forbedret setning her\",\n      \"regler\": [\"regel1\", \"regel2\"],\n      \"kommentar\": \"forklaring av endringer\",\n      \"annoteringer\": [{\"type\": \"underline\", \"tekst\": \"tekst som skal markeres\"}]\n    }\n  ],\n  \"kommentarer\": [\n    {\n      \"original_setning\": \"god setning her\",\n      \"kommentar\": \"hvorfor setningen er god\"\n    }\n  ],\n  \"gjennomgående_kommentar\": \"overordnet kommentar om teksten\"\n}\n```"
                    },
                    {
                        role: "user",
                        content: text
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return transformApiResponse(data);
    } catch (error) {
        console.error('Error calling API:', error);
        showError('Det oppstod en feil ved kontakt med API-et. Prøv igjen senere.');
        return null;
    }
}

function transformApiResponse(apiResponse) {
    try {
        // If it's already in the correct format, return as is
        if (apiResponse.endringer) {
            return apiResponse;
        }

        // Extract the JSON string from the markdown code block
        const content = apiResponse.choices[0].message.content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

        if (!jsonMatch) {
            throw new Error('Could not find JSON in response');
        }

        // Parse the JSON string
        const parsedData = JSON.parse(jsonMatch[1]);
        return parsedData;
    } catch (error) {
        console.error('Error transforming API response:', error);
        showError('Kunne ikke tolke svaret fra API-et. Prøv igjen senere.');
        return null;
    }
}

function formatText(text) {
    // Preserve the exact text formatting
    return text;
}

function switchToDisplayMode(text) {
    const inputContainer = document.getElementById('inputContainer');
    const textDisplayContainer = document.getElementById('textDisplayContainer');
    const textDisplay = document.getElementById('textDisplay');

    // Display the text as is
    textDisplay.textContent = text;

    // Switch containers
    inputContainer.style.display = 'none';
    textDisplayContainer.style.display = 'block';
}

function switchToEditMode() {
    // Don't allow editing during analysis
    if (document.getElementById('submitBtn').classList.contains('loading')) {
        return;
    }

    const inputContainer = document.getElementById('inputContainer');
    const textDisplayContainer = document.getElementById('textDisplayContainer');
    const textDisplay = document.getElementById('textDisplay');
    const userInput = document.getElementById('userInput');

    // Copy text exactly as is
    userInput.textContent = textDisplay.textContent;

    // Switch containers
    textDisplayContainer.style.display = 'none';
    inputContainer.style.display = 'block';

    // Clear any existing annotations and comments
    textEditor.clearAnnotations();
    document.getElementById('commentSection').innerHTML = '';
}

function showError(message) {
    const commentSection = document.getElementById('commentSection');
    commentSection.innerHTML = `
        <div class="comment-box" style="border-left-color: #dc3545;">
            <div class="comment-text">
                <strong>Feil:</strong><br>${message}
            </div>
        </div>
    `;
}
