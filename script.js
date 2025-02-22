import config from './config.js';

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

document.getElementById('submitBtn').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput');
    const text = userInput.textContent.trim();
    
    if (!text) {
        showError('Vennligst skriv inn tekst før du analyserer.');
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Analyserer...';
    submitBtn.disabled = true;

    try {
        if (config.USE_MOCK) {
            handleResponse(mockApiResponse);
        } else {
            const apiResponse = await callApi(text);
            if (apiResponse) {
                const transformedResponse = transformApiResponse(apiResponse);
                handleResponse(transformedResponse);
            }
        }
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
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
    const userInput = document.getElementById('userInput');
    const text = userInput.textContent;

    // Find the position of the original text
    const startIndex = text.indexOf(change.original_setning);
    if (startIndex === -1) return;

    // Create the highlight span
    const highlightSpan = document.createElement('span');
    highlightSpan.className = 'highlight-wrapper';
    highlightSpan.textContent = change.original_setning;

    // Replace the text with the highlighted version
    const beforeText = text.substring(0, startIndex);
    const afterText = text.substring(startIndex + change.original_setning.length);
    
    userInput.innerHTML = '';
    if (beforeText) userInput.appendChild(document.createTextNode(beforeText));
    userInput.appendChild(highlightSpan);
    if (afterText) userInput.appendChild(document.createTextNode(afterText));

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

function handleAccept(change) {
    const userInput = document.getElementById('userInput');
    const text = userInput.textContent;
    const updatedText = text.replace(change.original_setning, change.forbedret_setning);
    userInput.textContent = updatedText;
    
    currentChangeIndex++;
    showNextChange();
}

function handleDecline() {
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
}
