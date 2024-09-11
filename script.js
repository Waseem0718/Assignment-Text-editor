let canvas = document.getElementById('canvas');

let undoStack = [];
let redoStack = [];

undoStack.push(canvas.innerHTML);


canvas.addEventListener('input', function() {
    undoStack.push(canvas.innerHTML);
    redoStack = [];
});

// Undo functionality
document.getElementById('undo').addEventListener('click', () => {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        canvas.innerHTML = undoStack[undoStack.length - 1];
        placeCaretAtEnd(canvas); 
    }
});

// Redo functionality
document.getElementById('redo').addEventListener('click', () => {
    if (redoStack.length > 0) {
        const redoContent = redoStack.pop();
        undoStack.push(redoContent);
        canvas.innerHTML = redoContent;
        placeCaretAtEnd(canvas);
    }
});

function placeCaretAtEnd(el) {
    el.focus();
    let range = document.createRange();
    let sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

// Bold selected text
document.getElementById('bold').addEventListener('click', () => {
    document.execCommand('bold', false, null);
});

// Italicize selected text
document.getElementById('italic').addEventListener('click', () => {
    document.execCommand('italic', false, null);
});

// Underline selected text
document.getElementById('underline').addEventListener('click', () => {
    document.execCommand('underline', false, null);
});

// Alignment event listeners
const alignmentActions = { 
    'align-left': 'justifyLeft', 
    'align-center': 'justifyCenter', 
    'align-right': 'justifyRight' 
};

Object.entries(alignmentActions).forEach(([btnId, command]) => {
    document.getElementById(btnId).addEventListener('click', () => {
        
        document.execCommand(command, false, null);
        changeAlignIcon(`fas fa-${btnId}`);
        
     
        clearSelection();
    });
});

// Function to change the current align icon
const changeAlignIcon = (newIcon) => {
    document.getElementById('current-align-icon').className = newIcon;
};

// Function to clear the selection after applying a command
function clearSelection() {
    if (window.getSelection) {
        const selection = window.getSelection();
        selection.removeAllRanges(); 
    } else if (document.selection) {
        document.selection.empty(); 
    }
}

document.getElementById('align-toggle').addEventListener('click', () => {
    const alignOptions = document.getElementById('align-options');
    alignOptions.style.display = alignOptions.style.display === 'block' ? 'none' : 'block';
});

document.getElementById("font-select").addEventListener("change", function () {
    document.execCommand("fontName", false, this.value);
});

// Font size controls: Numeric input and buttons
const fontSizeInput = document.getElementById('font-size');

fontSizeInput.addEventListener('input', () => {
    changeFontSize(parseInt(fontSizeInput.value));
});

// Increase font size
document.getElementById('increase-font').addEventListener('click', () => {
    let currentSize = parseInt(fontSizeInput.value);
    if (currentSize < 100) {
        currentSize++;
        fontSizeInput.value = currentSize;
        changeFontSize(currentSize);
    }
});

// Decrease font size
document.getElementById('decrease-font').addEventListener('click', () => {
    let currentSize = parseInt(fontSizeInput.value);
    if (currentSize > 6) {
        currentSize--;
        fontSizeInput.value = currentSize;
        changeFontSize(currentSize);
    }
});

// Function to change font size within the canvas
function changeFontSize(size) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return; 
    const range = selection.getRangeAt(0);

    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;

    range.surroundContents(span);

    selection.removeAllRanges();
}

let isDragging = false;
let draggedElement = null;
let startX, startY, initialX, initialY;

canvas.addEventListener('mousedown', (event) => {
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0 && !isDragging) {
        const selectedRange = selection.getRangeAt(0);
        const selectedText = selectedRange.toString();

        if (selectedText.trim().length > 0) {
            event.preventDefault(); 
            
            const span = document.createElement('span');
            span.textContent = selectedText;
            span.style.position = 'absolute';
            span.style.cursor = 'move';
            span.style.whiteSpace = 'pre'; 
            span.setAttribute('draggable', true);

            selectedRange.deleteContents();
            selectedRange.insertNode(span);

            // Start dragging
            isDragging = true;
            draggedElement = span;
            startX = event.clientX;
            startY = event.clientY;
            
            const canvasRect = canvas.getBoundingClientRect();
            initialX = draggedElement.offsetLeft;
            initialY = draggedElement.offsetTop;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', finalizeDrag);
        }
    }
});

// Handle dragging with mouse move event
function handleMouseMove(event) {
    if (isDragging && draggedElement) {
        const canvasRect = canvas.getBoundingClientRect();
        
        
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;

        
        let newLeft = initialX + deltaX;
        let newTop = initialY + deltaY;

        // Prevent moving outside canvas bounds
        if (newLeft < 0) newLeft = 0; 
        if (newTop < 0) newTop = 0; 
        if (newLeft + draggedElement.offsetWidth > canvasRect.width) {
            newLeft = canvasRect.width - draggedElement.offsetWidth; 
        }
        if (newTop + draggedElement.offsetHeight > canvasRect.height) {
            newTop = canvasRect.height - draggedElement.offsetHeight; 
        }

        
        draggedElement.style.left = `${newLeft}px`;
        draggedElement.style.top = `${newTop}px`;
    }
}

// Finalize dragging and drop the text in the new position
function finalizeDrag() {
    if (isDragging) {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', finalizeDrag);
        
       
        draggedElement.style.position = 'absolute';
        draggedElement = null; 
    }
}
