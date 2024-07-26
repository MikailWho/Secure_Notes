document.addEventListener('DOMContentLoaded', function () {
    // buat inisialisasi elemen-elemen dari DOM
    const noteForm = document.getElementById('note-form');
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const notesSidebar = document.getElementById('notes-sidebar');
    const encryptionKeyInput = document.getElementById('encryption-key');
    const setKeyButton = document.getElementById('set-key');
    const generateKeyButton = document.querySelector('.generate-key');
    const toggleKeyVisibilityButton = document.getElementById('toggle-key-visibility');
    const newNoteButton = document.getElementById('new-note');
    const noteDisplay = document.getElementById('note-display');
    const displayTitle = document.getElementById('display-title');
    const encryptedContentElement = document.getElementById('encrypted-content');
    const decryptionKeyInput = document.getElementById('display-decryption-key');

    let encryptionKey = ''; // Variabel buat simpan kunci enkripsi
    let currentNote = null; // Variabel buat simpan catatan yang lagi diproses

    // Event listener buat menetapkan kunci enkripsi
    setKeyButton.addEventListener('click', function () {
        encryptionKey = encryptionKeyInput.value;
        if (!encryptionKey) {
            alert('Please enter a valid encryption key.');
            return;
        }
        alert('Encryption key set successfully.');
    });

    // Event listener buat menghasilkan kunci enkripsi secara otomatis
    generateKeyButton.addEventListener('click', function () {
        const generatedKey = CryptoJS.lib.WordArray.random(16).toString();
        encryptionKeyInput.value = generatedKey;
    });

    // Event listener buat toggle show/hide kunci enkripsi
    toggleKeyVisibilityButton.addEventListener('click', function () {
        if (encryptionKeyInput.type === 'password') {
            encryptionKeyInput.type = 'text';
            toggleKeyVisibilityButton.classList.remove('fa-eye');
            toggleKeyVisibilityButton.classList.add('fa-eye-slash');
        } else {
            encryptionKeyInput.type = 'password';
            toggleKeyVisibilityButton.classList.remove('fa-eye-slash');
            toggleKeyVisibilityButton.classList.add('fa-eye');
        }
    });

    // Event listener buat catatan baru
    newNoteButton.addEventListener('click', function () {
        noteForm.style.display = 'block';
        noteDisplay.style.display = 'none';
        noteTitle.value = '';
        noteContent.value = '';
        currentNote = null;
    });

    // Event listener buat simpan catatan
    noteForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = noteTitle.value;
        const content = noteContent.value;
        if (!title || !content) {
            alert('Please fill in both the title and content fields.');
            return;
        }
        if (!encryptionKey) {
            alert('Please set an encryption key first.');
            return;
        }

        const encryptedContent = CryptoJS.AES.encrypt(content, encryptionKey).toString();
        const note = { title, content: encryptedContent };
        saveNoteToLocalStorage(note);

        noteForm.style.display = 'none';
        loadNotesFromLocalStorage();
    });

    // Fungsi buat simpan catatan ke local storage
    function saveNoteToLocalStorage(note) {
        let notes = JSON.parse(localStorage.getItem('notes')) || [];
        if (currentNote !== null) {
            notes = notes.filter(n => n.title !== currentNote.title);
        }
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        currentNote = note;
    }

    // Fungsi buat ngeload catatan dari local storage dan terus di display di sidebar
    function loadNotesFromLocalStorage() {
        notesSidebar.innerHTML = '';
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note.title;
            li.addEventListener('click', () => displayNoteContent(note));
            notesSidebar.appendChild(li);
        });
    }

    // Fungsi buat display konten catatan yang dipilih
    function displayNoteContent(note) {
        currentNote = note;
        noteForm.style.display = 'none';
        noteDisplay.style.display = 'block';
        displayTitle.innerText = note.title;
        encryptedContentElement.innerText = note.content;
        decryptionKeyInput.value = '';
    }

    // Fungsi dekripsi konten catatan
    window.decryptNoteContent = function () {
        const decryptionKey = decryptionKeyInput.value;
        if (!decryptionKey) {
            alert('Please enter a decryption key.');
            return;
        }
        try {
            const bytes = CryptoJS.AES.decrypt(currentNote.content, decryptionKey);
            const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
            encryptedContentElement.innerText = decryptedContent;
        } catch (error) {
            alert('Decryption failed. Please check your decryption key.');
        }
    };

    // Fungsi edit konten catatan
    window.editNoteContent = function () {
        if (!currentNote) return;
        const decryptionKey = decryptionKeyInput.value;
        if (!decryptionKey) {
            alert('Please enter a decryption key to edit this note.');
            return;
        }
        try {
            const bytes = CryptoJS.AES.decrypt(currentNote.content, decryptionKey);
            noteContent.value = bytes.toString(CryptoJS.enc.Utf8);
            noteTitle.value = currentNote.title;
            noteForm.style.display = 'block';
            noteDisplay.style.display = 'none';
        } catch (error) {
            alert('Decryption failed. Please check your decryption key.');
        }
    };

    // Fungsi hapus konten catatan
    window.deleteNoteContent = function () {
        if (!currentNote) return;
        const decryptionKey = decryptionKeyInput.value;
        if (!decryptionKey) {
            alert('Please enter a decryption key to delete this note.');
            return;
        }
        try {
            const bytes = CryptoJS.AES.decrypt(currentNote.content, decryptionKey);
            bytes.toString(CryptoJS.enc.Utf8); // Test decryption
            let notes = JSON.parse(localStorage.getItem('notes')) || [];
            notes = notes.filter(note => note.title !== currentNote.title);
            localStorage.setItem('notes', JSON.stringify(notes));
            cleanSelectedNotes();
            loadNotesFromLocalStorage();
        } catch (error) {
            alert('Decryption failed. Please check your decryption key.');
        }
    };

    // Fungsi untuk remove catatan yang dihapus
    function cleanSelectedNotes() {
        noteDisplay.innerHTML = '';
        noteDisplay.style.display = 'none';
        noteForm.style.display = 'none';
    }

    // untuk load catatan dari local storage pas halaman dibuka
    loadNotesFromLocalStorage();
});
