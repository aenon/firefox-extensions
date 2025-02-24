/* Initialize variables */

const inputTitle = document.querySelector('.new-note input');
const inputBody = document.querySelector('.new-note textarea');
const noteContainer = document.querySelector('.note-container');
const clearButton = document.querySelector('.clear');
const addButton = document.querySelector('.add');

/* Add event listeners to buttons */

addButton.addEventListener('click', addNote);
clearButton.addEventListener('click', clearAll);

/* Generic error handler */
const onError = (error) => {
  console.error(error);
};

/* Display previously-saved stored notes on startup */

const initialize = () => {
  const gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    const noteKeys = Object.keys(results);
    for (const noteKey of noteKeys) {
      const currentValue = results[noteKey];
      displayNote(noteKey, currentValue);
    }
  }, onError);
};

initialize();

/* Add a note to the display and storage */

const addNote = () => {
  const noteTitle = inputTitle.value;
  const noteBody = inputBody.value;
  const gettingItem = browser.storage.local.get(noteTitle);
  gettingItem.then((result) => {
    const objectTest = Object.keys(result);
    if (objectTest.length < 1 && noteBody !== '') {
      inputTitle.value = '';
      inputBody.value = '';
      storeNote(noteTitle, noteBody);
    }
  }, onError);
};

/* Function to store a new note in storage */

const storeNote = (title, body) => {
  const storingNote = browser.storage.local.set({ [title]: body });
  storingNote.then(() => {
    displayNote(title, body);
  }, onError);
};

/* Function to display a note in the note box */

const displayNote = (title, body) => {
  /* Create note display box */
  const note = document.createElement('div');
  const noteDisplay = document.createElement('div');
  const noteHeader = document.createElement('h2');
  const noteParagraph = document.createElement('p');
  const deleteButton = document.createElement('button');
  const clearFix = document.createElement('div');

  note.setAttribute('class', 'note');
  noteHeader.textContent = title;
  noteParagraph.textContent = body;
  deleteButton.setAttribute('class', 'delete');
  deleteButton.textContent = 'Delete note';
  clearFix.setAttribute('class', 'clearfix');

  noteDisplay.appendChild(noteHeader);
  noteDisplay.appendChild(noteParagraph);
  noteDisplay.appendChild(deleteButton);
  noteDisplay.appendChild(clearFix);
  note.appendChild(noteDisplay);

  /* Set up listener for the delete functionality */
  deleteButton.addEventListener('click', (e) => {
    const eventTarget = e.target;
    eventTarget.parentNode.parentNode.parentNode.removeChild(eventTarget.parentNode.parentNode);
    browser.storage.local.remove(title);
  });

  /* Create note edit box */
  const noteEdit = document.createElement('div');
  const noteTitleEdit = document.createElement('input');
  const noteBodyEdit = document.createElement('textarea');
  const clearFix2 = document.createElement('div');
  const updateButton = document.createElement('button');
  const cancelButton = document.createElement('button');

  updateButton.setAttribute('class', 'update');
  updateButton.textContent = 'Update note';
  cancelButton.setAttribute('class', 'cancel');
  cancelButton.textContent = 'Cancel update';

  noteEdit.appendChild(noteTitleEdit);
  noteTitleEdit.value = title;
  noteEdit.appendChild(noteBodyEdit);
  noteBodyEdit.textContent = body;
  noteEdit.appendChild(updateButton);
  noteEdit.appendChild(cancelButton);
  noteEdit.appendChild(clearFix2);
  clearFix2.setAttribute('class', 'clearfix');
  note.appendChild(noteEdit);
  noteContainer.appendChild(note);
  noteEdit.style.display = 'none';

  /* Set up listeners for the update functionality */
  noteHeader.addEventListener('click', () => {
    noteDisplay.style.display = 'none';
    noteEdit.style.display = 'block';
  });

  noteParagraph.addEventListener('click', () => {
    noteDisplay.style.display = 'none';
    noteEdit.style.display = 'block';
  });

  cancelButton.addEventListener('click', () => {
    noteDisplay.style.display = 'block';
    noteEdit.style.display = 'none';
    noteTitleEdit.value = title;
    noteBodyEdit.value = body;
  });

  updateButton.addEventListener('click', () => {
    if (noteTitleEdit.value !== title || noteBodyEdit.value !== body) {
      updateNote(title, noteTitleEdit.value, noteBodyEdit.value);
      note.parentNode.removeChild(note);
    }
  });
};

/* Function to update notes */

const updateNote = (oldTitle, newTitle, newBody) => {
  const storingNote = browser.storage.local.set({ [newTitle]: newBody });
  storingNote.then(() => {
    if (oldTitle !== newTitle) {
      const removingNote = browser.storage.local.remove(oldTitle);
      removingNote.then(() => {
        displayNote(newTitle, newBody);
      }, onError);
    } else {
      displayNote(newTitle, newBody);
    }
  }, onError);
};

/* Clear all notes from the display/storage */

const clearAll = () => {
  while (noteContainer.firstChild) {
    noteContainer.removeChild(noteContainer.firstChild);
  }
  browser.storage.local.clear();
};
