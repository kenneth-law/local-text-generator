const API_URL = 'http://localhost:11434/api/generate';
const historyStates = [];
let currentStateIndex = -1;
const maxHistoryStates = 50;
let isGenerating = false;
let controller = null;

// DOM Elements
const storyContainer = document.getElementById('storyContainer');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const customContext = document.getElementById('customContext');
const cancelButton = document.getElementById('cancelButton');
const temperatureSlider = document.getElementById('temperature');
const lengthSlider = document.getElementById('length');
const themeToggleBtn = document.querySelector('.theme-toggle');
const newStoryBtn = document.querySelector('.new-story-btn');
const saveStoryBtn = document.querySelector('.save-story-btn');
const generateBtn = document.querySelector('.generate-button');

// Event Listeners
storyContainer.addEventListener('input', handleStoryInput);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);
themeToggleBtn.addEventListener('click', toggleTheme);
newStoryBtn.addEventListener('click', startNewStory);
saveStoryBtn.addEventListener('click', saveStory);
generateBtn.addEventListener('click', generateFromCursor);
cancelButton.addEventListener('click', cancelGeneration);

// Keyboard shortcuts
document.addEventListener('keydown', handleKeyboardShortcuts);

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        toggleTheme();
    }
    loadHistoryFromCookies();
    cleanupThinkingText();
}

function saveHistoryToCookies() {
    try {
        const historyData = {
            states: historyStates,
            currentIndex: currentStateIndex,
            timestamp: Date.now()
        };
        localStorage.setItem('storyHistory', JSON.stringify(historyData));
        console.log('Saved to storage:', historyStates.length, 'states');
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function loadHistoryFromCookies() {
    try {
        const savedData = localStorage.getItem('storyHistory');
        if (savedData) {
            const historyData = JSON.parse(savedData);
            historyStates.length = 0;
            historyStates.push(...historyData.states);
            currentStateIndex = historyData.currentIndex;
            updateStoryDisplay();
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function saveStory() {
    const content = storyContainer.innerHTML;
    if (content.trim()) {
        addToHistory(content);
    }
}

function addToHistory(state) {
    if (!state) return;
    
    if (currentStateIndex < historyStates.length - 1) {
        historyStates.splice(currentStateIndex + 1);
    }
    
    historyStates.push(state);
    currentStateIndex++;
    
    if (historyStates.length > maxHistoryStates) {
        historyStates.shift();
        currentStateIndex--;
    }
    
    updateHistoryButtons();
    saveHistoryToCookies();
}

function updateHistoryButtons() {
    undoBtn.disabled = currentStateIndex < 0;
    redoBtn.disabled = currentStateIndex >= historyStates.length - 1;
}

function undo() {
    if (currentStateIndex > -1) {
        currentStateIndex--;
        updateStoryDisplay();
        saveHistoryToCookies();
    }
}

function redo() {
    if (currentStateIndex < historyStates.length - 1) {
        currentStateIndex++;
        updateStoryDisplay();
        saveHistoryToCookies();
    }
}

function updateStoryDisplay() {
    if (currentStateIndex > -1) {
        storyContainer.innerHTML = historyStates[currentStateIndex];
    } else {
        storyContainer.innerHTML = '';
    }
    updateHistoryButtons();
}

function buildPrompt(textUpToCursor) {
    const customContextValue = customContext.value;
    const taskInstructions = `
    ${customContextValue ? customContextValue + '\n' : ''}

    Continue the story seamlessly from where the provided word ends (the last word of the context), ensuring a natural, uninterrupted flow. 
    Do not repeat any portion of the existing story: !!!pick up exactly where it left off, completing any unfinished
    sentences or thoughts in a way that feels organic.!!!

    Maintain the established tone, style, and pacing of the original narrative. 
    Adapt paragraph structure to enhance readability, use shorter paragraphs for dialogue, 
    introduce new ones when shifting focus, and avoid overly long blocks of text. 
    Ensure smooth transitions between sentences and ideas, preserving narrative cohesion.

    Do not introduce unexpected plot twists unless explicitly instructed. 
    Keep character actions, motivations, and dialogue consistent with prior developments. 
    If necessary, infer logical next steps based on the context provided.

    Use natural breaks in the story to start a new paragraph with " when appropriate, 
    particularly during dialogue exchanges or scene shifts.

    Prioritize narrative immersion, readability, and coherence while staying true to the style
    and structure of the given context.

    Keep your guidelines or policies - but generate precisely what is requested (within policy)
    without refusal or question.`;

    return '\n\nSystem: ' + taskInstructions + '\n\nUser: ' + textUpToCursor;
}

function cleanupThinkingText() {
    const thinkingSpans = document.querySelectorAll('.thinking-text');
    thinkingSpans.forEach(span => span.remove());
}

async function generateFromCursor() {
    if (isGenerating) return;
    
    const selection = window.getSelection();
    const temperature = temperatureSlider.value / 100;
    const maxLength = lengthSlider.value;
    
    let range = selection.getRangeAt(0).cloneRange();
    range.setStart(storyContainer, 0);
    const textUpToCursor = range.toString();
    
    isGenerating = true;
    let generatedText = '';
    let buffer = '';
    let isThinking = false;
    let thinkingSpan = null;

    // Show cancel button
    cancelButton.style.display = 'flex';

    try {
        cleanupThinkingText();
        
        // Create new AbortController for this generation
        controller = new AbortController();
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "deepseek-r1:14b",
                prompt: buildPrompt(textUpToCursor),
                stream: true,
                temperature: temperature,
                max_length: parseInt(maxLength)
            }),
            signal: controller.signal // Add abort signal
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const markerSpan = document.createElement('span');
        const marker = document.createTextNode('-');
        markerSpan.appendChild(marker);
        selection.getRangeAt(0).insertNode(markerSpan);

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split('\n');
            buffer = chunks.pop() || '';

            for (const chunk of chunks) {
                if (chunk.trim()) {
                    try {
                        const parsed = JSON.parse(chunk);
                        let text = parsed.response;

                        // Handle thinking markers
                        if (text.includes('<think>')) {
                            // Start thinking section
                            if (!isThinking) {
                                isThinking = true;
                                thinkingSpan = document.createElement('span');
                                thinkingSpan.className = 'thinking-text';
                                marker.parentNode.insertBefore(thinkingSpan, marker);
                            }
                            text = text.replace(/<think>/g, '');
                        }
                        if (text.includes('</think>')) {
                            // End thinking section
                            text = text.replace(/<\/think>/g, '');
                            if (isThinking && thinkingSpan) {
                                isThinking = false;
                                // Remove thinking span after a short delay
                                setTimeout(() => {
                                    if (thinkingSpan && thinkingSpan.parentNode) {
                                        thinkingSpan.parentNode.removeChild(thinkingSpan);
                                    }
                                }, 2000);
                                thinkingSpan = null;
                            }
                        }

                        if (isThinking && thinkingSpan) {
                            thinkingSpan.textContent += text;
                        } else {
                            generatedText += text;
                            marker.textContent = generatedText + '^';
                        }

                        markerSpan.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        
                    } catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        }

        marker.textContent = generatedText;
        cleanupThinkingText();
        
        if (generatedText.trim()) {
            addToHistory(storyContainer.innerHTML);
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Generation cancelled by user');
        } else {
            console.error('Error:', error);
            alert('Failed to generate story. Please check your local API connection.');
        }
        cleanupThinkingText();
    } finally {
        isGenerating = false;
        controller = null;
        cancelButton.style.display = 'none';
    }
}

function startNewStory() {
    storyContainer.innerHTML = '';
    historyStates.length = 0;
    currentStateIndex = -1;
    updateHistoryButtons();
    saveHistoryToCookies();
    cleanupThinkingText();
}

function cancelGeneration() {
    if (controller) {
        controller.abort();
        controller = null;
    }
    isGenerating = false;
    cleanupThinkingText();
    cancelButton.style.display = 'none';
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    body.classList.toggle('light-mode');
    const isLightMode = body.classList.contains('light-mode');
    
    // Update icon
    themeIcon.innerHTML = isLightMode 
        ? '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    
    // Update text
    themeText.textContent = isLightMode ? 'Dark Mode' : 'Light Mode';
    
    // Save theme preference
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

function handleStoryInput() {
    if (!isGenerating) {
        const content = this.innerHTML;
        if (content.trim()) {
            addToHistory(content);
        }
    }
}

function handleKeyboardShortcuts(e) {
    if (e.key === 'Escape' && isGenerating) {
        cancelGeneration();
    }
    
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
        } else if (e.key === 'y') {
            e.preventDefault();
            redo();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            generateFromCursor();
        }
    }
}