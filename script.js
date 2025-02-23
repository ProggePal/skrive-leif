import config from './config.js';
import { annotate } from 'https://unpkg.com/rough-notation?module';

// Test data
const mockApiResponse = {
    "endringer": [
        {
            "original_setning": "Denne intervjuguiden er designet for bruk i en bacheloroppgave som undersøker innovasjonskultur i en organisasjon.",
            "forbedret_setning": "Intervjuguiden skal brukes i en bacheloroppgave. Oppgaven undersøker innovasjonskultur i en organisasjon.",
            "regler": [
                "Det er ingen skam å sette punktum",
                "Sløs ikke med ord og bokstaver"
            ],
            "kommentar": "Jeg har delt opp den lange setningen og gjort den mer direkte."
        },
        {
            "original_setning": "Spørsmålene er semistrukturerte, noe som betyr at de er ment å veilede samtalen, men intervjueren bør være fleksibel og tilpasse spørsmålene etter behov.",
            "forbedret_setning": "Spørsmålene er semistrukturerte. De skal veilede samtalen. Intervjueren må likevel være fleksibel og tilpasse spørsmålene.",
            "regler": [
                "Det er ingen skam å sette punktum"
            ],
            "kommentar": "Nok en lang setning delt opp for bedre flyt."
        },
        {
            "original_setning": "Hvert spørsmål er basert på elementer fra Competing Values Framework (CVF) og Dobni's rammeverk for innovasjonsberedskap.",
            "forbedret_setning": "Spørsmålene bygger på elementer fra Competing Values Framework (CVF) og Dobni's rammeverk for innovasjonsberedskap.",
            "regler": [
                "Sløs ikke med ord og bokstaver"
            ],
            "kommentar": "Forenklet formuleringen litt."
        }
    ],
    "gjennomgående_kommentar": "Teksten er grei, men kan bli enda bedre med kortere setninger og litt mindre omstendelige formuleringer. Husk å tenke på leseren!"
};

let currentChangeIndex = 0;
let changes = [];
let currentAnnotation = null;

async function callApi(text) {
    try {
        const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.COMPLETIONS}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.API.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.API.MODEL,
                messages: [
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
        return data;
    } catch (error) {
        console.error('Error calling API:', error);
        showError('Det oppstod en feil ved kontakt med API-et. Prøv igjen senere.');
        return null;
    }
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
    if (currentAnnotation) {
        currentAnnotation.remove();
    }
    document.getElementById('commentSection').innerHTML = '';
}

function displayTextWithAnnotation(text, change) {
    const textDisplay = document.getElementById('textDisplay');
    
    // Create a temporary div to search for the text
    const tempDiv = document.createElement('div');
    tempDiv.textContent = text;
    const textContent = tempDiv.textContent;

    // Find the position of the original sentence
    const startIndex = textContent.indexOf(change.original_setning);
    if (startIndex === -1) return;

    // Split the text into three parts: before, target, and after
    const beforeText = text.substring(0, startIndex);
    const targetText = text.substring(startIndex, startIndex + change.original_setning.length);
    const afterText = text.substring(startIndex + change.original_setning.length);

    // Create the HTML structure
    textDisplay.innerHTML = '';
    
    if (beforeText) {
        textDisplay.appendChild(document.createTextNode(beforeText));
    }

    // Create span for the target text
    const targetSpan = document.createElement('span');
    targetSpan.textContent = targetText;
    textDisplay.appendChild(targetSpan);

    if (afterText) {
        textDisplay.appendChild(document.createTextNode(afterText));
    }

    // Apply the annotation to the span
    if (currentAnnotation) {
        currentAnnotation.remove();
    }
    currentAnnotation = annotate(targetSpan, { 
        type: 'highlight',
        color: '#ffd70066',
        multiline: true,
        iterations: 1
    });
    currentAnnotation.show();
}

function handleAccept(change) {
    const textDisplay = document.getElementById('textDisplay');
    const text = textDisplay.textContent;
    
    // Find and replace the text
    const updatedText = text.replace(change.original_setning, change.forbedret_setning);
    textDisplay.textContent = updatedText;
    
    if (currentAnnotation) {
        currentAnnotation.remove();
    }
    
    currentChangeIndex++;
    showNextChange();
}

function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const editBtn = document.getElementById('editBtn');
    const userInput = document.getElementById('userInput');
    const textDisplay = document.getElementById('textDisplay');

    if (isLoading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        editBtn.classList.add('disabled');
        editBtn.classList.add('loading');
        userInput.classList.add('disabled');
        textDisplay.classList.add('disabled');
        submitBtn.textContent = 'Analyserer...';
        editBtn.textContent = 'Analyserer tekst...';
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        editBtn.classList.remove('disabled');
        editBtn.classList.remove('loading');
        userInput.classList.remove('disabled');
        textDisplay.classList.remove('disabled');
        submitBtn.textContent = 'Analyser tekst';
        editBtn.textContent = 'Rediger tekst';
    }
}

document.getElementById('editBtn').addEventListener('click', switchToEditMode);

document.getElementById('submitBtn').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput');
    const text = userInput.textContent.trim();
    
    if (!text) {
        showError('Vennligst skriv inn tekst før du analyserer.');
        return;
    }

    // Switch to display mode with formatted text
    switchToDisplayMode(text);

    // Set loading state
    setLoadingState(true);

    try {
        if (config.USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            handleResponse(mockApiResponse);
        } else {
            const apiResponse = await callApi(text);
            if (apiResponse) {
                const transformedResponse = transformApiResponse(apiResponse);
                handleResponse(transformedResponse);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Det oppstod en feil. Vennligst prøv igjen.');
    } finally {
        setLoadingState(false);
    }
});

function transformApiResponse(apiResponse) {
    try {
        // Extract the JSON string from the markdown code block
        const content = apiResponse.choices[0].message.content;
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        
        if (!jsonMatch) {
            throw new Error('Could not find JSON in response');
        }

        // Parse the JSON string
        const parsedData = JSON.parse(jsonMatch[1]);
        
        // The parsed data should already be in the correct format
        return parsedData;
    } catch (error) {
        console.error('Error transforming API response:', error);
        showError('Kunne ikke tolke svaret fra API-et. Vennligst prøv igjen.');
        return null;
    }
}

function handleResponse(data) {
    if (!data) return;
    
    changes = data.endringer;
    currentChangeIndex = 0;
    showNextChange();
}

function showNextChange() {
    if (currentChangeIndex >= changes.length) {
        showFinalComment();
        return;
    }

    const change = changes[currentChangeIndex];
    const textDisplay = document.getElementById('textDisplay');
    const text = textDisplay.textContent;

    // Display text with annotation
    displayTextWithAnnotation(text, change);

    // Show the comment
    showComment(change);
}

function showComment(change) {
    const commentSection = document.getElementById('commentSection');
    commentSection.innerHTML = '';

    const commentBox = document.createElement('div');
    commentBox.className = 'comment-box';

    // Add the comment text
    const commentText = document.createElement('div');
    commentText.className = 'comment-text';
    commentText.textContent = change.kommentar;
    commentBox.appendChild(commentText);

    // Add the suggested improvement
    const improvement = document.createElement('div');
    improvement.innerHTML = `<strong>Forslag:</strong><br>${change.forbedret_setning}`;
    improvement.style.marginBottom = '1rem';
    commentBox.appendChild(improvement);

    // Add the rules
    const rulesList = document.createElement('div');
    rulesList.className = 'rules-list';
    rulesList.innerHTML = '<strong>Regler:</strong>';
    change.regler.forEach(rule => {
        const ruleItem = document.createElement('div');
        ruleItem.className = 'rule-item';
        ruleItem.textContent = rule;
        rulesList.appendChild(ruleItem);
    });
    commentBox.appendChild(rulesList);

    // Add action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'accept-btn';
    acceptBtn.textContent = 'Godta endring';
    acceptBtn.onclick = () => handleAccept(change);

    const declineBtn = document.createElement('button');
    declineBtn.className = 'decline-btn';
    declineBtn.textContent = 'Behold original';
    declineBtn.onclick = () => handleDecline();

    actionButtons.appendChild(acceptBtn);
    actionButtons.appendChild(declineBtn);
    commentBox.appendChild(actionButtons);

    commentSection.appendChild(commentBox);
}

function handleDecline() {
    if (currentAnnotation) {
        currentAnnotation.remove();
    }
    
    currentChangeIndex++;
    showNextChange();
}

function showFinalComment() {
    const commentSection = document.getElementById('commentSection');
    commentSection.innerHTML = '';

    const commentBox = document.createElement('div');
    commentBox.className = 'comment-box';

    const finalMessage = document.createElement('div');
    finalMessage.className = 'comment-text';
    finalMessage.innerHTML = `<strong>Gjennomgang fullført!</strong><br><br>${mockApiResponse.gjennomgående_kommentar}`;

    commentBox.appendChild(finalMessage);
    commentSection.appendChild(commentBox);
    
    // Clear any remaining annotations
    if (currentAnnotation) {
        currentAnnotation.remove();
    }
}
