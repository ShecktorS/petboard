// ==========================================
// PETBOARD - APP PRINCIPALE
// ==========================================

// Stato dell'applicazione
const appState = {
    currentSection: 'home',
    petName: 'Fido',
    petAvatar: '🐶',
    theme: 'default',
    diaryEntries: [],
    healthEvents: [],
    shoppingItems: [],
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

// ==========================================
// INIZIALIZZAZIONE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initNavigation();
    initDiary();
    initHealth();
    initShopping();
    initTimeline();
    initCustomization();
    initMinigame();
    updateHomeStats();
    updateRecentActivities();
    applyTheme();
});

// ==========================================
// UTILITY - SANITIZZAZIONE
// ==========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// LOCAL STORAGE
// ==========================================

function saveToLocalStorage() {
    try {
        localStorage.setItem('petboard_data', JSON.stringify(appState));
        return true;
    } catch (e) {
        console.error('Errore nel salvataggio:', e);
        alert('⚠️ Impossibile salvare i dati. Lo spazio di archiviazione potrebbe essere pieno.');
        return false;
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('petboard_data');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(appState, data);
            document.getElementById('petName').textContent = appState.petName;
            document.querySelector('.avatar-placeholder').textContent = appState.petAvatar;
        }
    } catch (e) {
        console.error('Errore nel caricamento:', e);
        alert('⚠️ Errore nel caricamento dei dati salvati. Verranno usati i dati predefiniti.');
    }
}

// ==========================================
// NAVIGAZIONE
// ==========================================

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Aggiorna bottoni navigazione
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });

    // Aggiorna sezioni
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === sectionName);
    });

    appState.currentSection = sectionName;

    // Aggiorna contenuto specifico della sezione
    if (sectionName === 'health') {
        renderCalendar();
        renderHealthEvents();
    } else if (sectionName === 'timeline') {
        renderTimeline();
    }
}

// ==========================================
// DIARIO DIGITALE
// ==========================================

function initDiary() {
    const addBtn = document.getElementById('addDiaryBtn');
    const modal = document.getElementById('diaryModal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelDiaryBtn');
    const saveBtn = document.getElementById('saveDiaryBtn');
    const photoInput = document.getElementById('diaryPhoto');

    addBtn.addEventListener('click', () => openModal(modal));
    closeBtn.addEventListener('click', () => closeModal(modal));
    cancelBtn.addEventListener('click', () => closeModal(modal));
    saveBtn.addEventListener('click', saveDiaryEntry);

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = document.getElementById('photoPreview');
                preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Imposta data di oggi come default
    document.getElementById('diaryDate').valueAsDate = new Date();

    renderDiaryEntries();
}

function saveDiaryEntry() {
    const date = document.getElementById('diaryDate').value;
    const title = document.getElementById('diaryTitle').value;
    const text = document.getElementById('diaryText').value;
    const photoInput = document.getElementById('diaryPhoto');
    const photoPreview = document.getElementById('photoPreview').querySelector('img');

    if (!date || !text) {
        alert('Inserisci almeno la data e il testo! 🌸');
        return;
    }

    const entry = {
        id: Date.now(),
        date,
        title: title || 'Ricordo senza titolo',
        text,
        photo: photoPreview ? photoPreview.src : null,
        timestamp: new Date().toISOString()
    };

    appState.diaryEntries.unshift(entry);
    saveToLocalStorage();
    renderDiaryEntries();
    closeModal(document.getElementById('diaryModal'));
    resetDiaryForm();
    updateHomeStats();
    updateRecentActivities();
}

function resetDiaryForm() {
    document.getElementById('diaryDate').valueAsDate = new Date();
    document.getElementById('diaryTitle').value = '';
    document.getElementById('diaryText').value = '';
    document.getElementById('diaryPhoto').value = '';
    document.getElementById('photoPreview').innerHTML = '';
}

function renderDiaryEntries() {
    const container = document.getElementById('diaryEntries');

    if (appState.diaryEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🌸</span>
                <p>Inizia a scrivere i tuoi ricordi!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = appState.diaryEntries.map(entry => `
        <div class="diary-card" data-id="${entry.id}">
            ${entry.photo ? `<img src="${entry.photo}" alt="${escapeHtml(entry.title)}" class="diary-photo">` : '<div class="diary-photo"></div>'}
            <div class="diary-content">
                <div class="diary-date">📅 ${formatDate(entry.date)}</div>
                <h4 class="diary-title">${escapeHtml(entry.title)}</h4>
                <p class="diary-text">${escapeHtml(entry.text)}</p>
                <div class="diary-actions">
                    <button class="btn-icon btn-delete" title="Elimina">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');

    // Event delegation per i pulsanti di eliminazione
    container.querySelectorAll('.btn-delete').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.diary-card');
            const id = parseInt(card.dataset.id);
            deleteDiaryEntry(id);
        });
    });
}

function deleteDiaryEntry(id) {
    if (confirm('Sei sicuro di voler eliminare questo ricordo? 🥺')) {
        appState.diaryEntries = appState.diaryEntries.filter(e => e.id !== id);
        saveToLocalStorage();
        renderDiaryEntries();
        updateHomeStats();
        updateRecentActivities();
    }
}

// ==========================================
// GESTIONE SALUTE E CALENDARIO
// ==========================================

function initHealth() {
    const addBtn = document.getElementById('addHealthBtn');
    const modal = document.getElementById('healthModal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelHealthBtn');
    const saveBtn = document.getElementById('saveHealthBtn');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    addBtn.addEventListener('click', () => openModal(modal));
    closeBtn.addEventListener('click', () => closeModal(modal));
    cancelBtn.addEventListener('click', () => closeModal(modal));
    saveBtn.addEventListener('click', saveHealthEvent);
    prevBtn.addEventListener('click', () => changeMonth(-1));
    nextBtn.addEventListener('click', () => changeMonth(1));

    document.getElementById('healthDate').valueAsDate = new Date();

    renderCalendar();
    renderHealthEvents();
}

function saveHealthEvent() {
    const type = document.getElementById('healthType').value;
    const date = document.getElementById('healthDate').value;
    const time = document.getElementById('healthTime').value;
    const title = document.getElementById('healthTitle').value;
    const notes = document.getElementById('healthNotes').value;
    const reminder = document.getElementById('healthReminder').checked;

    if (!date) {
        alert('Inserisci una data! 💚');
        return;
    }

    const event = {
        id: Date.now(),
        type,
        date,
        time,
        title: title || getHealthTypeLabel(type),
        notes,
        reminder,
        timestamp: new Date().toISOString()
    };

    appState.healthEvents.push(event);
    appState.healthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveToLocalStorage();
    renderCalendar();
    renderHealthEvents();
    closeModal(document.getElementById('healthModal'));
    resetHealthForm();
    updateHomeStats();
    updateRecentActivities();
}

function resetHealthForm() {
    document.getElementById('healthType').value = 'vaccination';
    document.getElementById('healthDate').valueAsDate = new Date();
    document.getElementById('healthTime').value = '';
    document.getElementById('healthTitle').value = '';
    document.getElementById('healthNotes').value = '';
    document.getElementById('healthReminder').checked = false;
}

function getHealthTypeLabel(type) {
    const labels = {
        vaccination: 'Vaccinazione',
        visit: 'Visita veterinaria',
        therapy: 'Terapia',
        checkup: 'Controllo'
    };
    return labels[type] || type;
}

function renderCalendar() {
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                       'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

    document.getElementById('currentMonth').textContent =
        `${monthNames[appState.currentMonth]} ${appState.currentYear}`;

    const firstDay = new Date(appState.currentYear, appState.currentMonth, 1).getDay();
    const daysInMonth = new Date(appState.currentYear, appState.currentMonth + 1, 0).getDate();
    const today = new Date();

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // Intestazioni giorni
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day header';
        header.textContent = day;
        grid.appendChild(header);
    });

    // Giorni vuoti prima del primo giorno
    for (let i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
    }

    // Giorni del mese
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day day';
        dayEl.textContent = day;

        const currentDate = new Date(appState.currentYear, appState.currentMonth, day);
        const dateStr = formatDateISO(currentDate);

        // Evidenzia oggi
        if (currentDate.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }

        // Segna giorni con eventi
        if (appState.healthEvents.some(e => e.date === dateStr)) {
            dayEl.classList.add('has-event');
        }

        grid.appendChild(dayEl);
    }
}

function changeMonth(delta) {
    appState.currentMonth += delta;
    if (appState.currentMonth > 11) {
        appState.currentMonth = 0;
        appState.currentYear++;
    } else if (appState.currentMonth < 0) {
        appState.currentMonth = 11;
        appState.currentYear--;
    }
    renderCalendar();
}

function renderHealthEvents() {
    const container = document.getElementById('healthEventsList');
    const today = new Date();
    const upcomingEvents = appState.healthEvents.filter(e => new Date(e.date) >= today);

    if (upcomingEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🍀</span>
                <p>Nessun appuntamento in programma</p>
            </div>
        `;
        return;
    }

    container.innerHTML = upcomingEvents.map(event => `
        <div class="event-item" data-id="${event.id}">
            <div class="event-info">
                <span class="event-type ${event.type}">${getHealthTypeLabel(event.type)}</span>
                <div class="event-title">${escapeHtml(event.title)}</div>
                <div class="event-date">📅 ${formatDate(event.date)} ${event.time ? '🕐 ' + escapeHtml(event.time) : ''}</div>
                ${event.notes ? `<div class="event-notes">${escapeHtml(event.notes)}</div>` : ''}
            </div>
            <button class="btn-icon btn-delete-event" title="Elimina">🗑️</button>
        </div>
    `).join('');

    // Event delegation per i pulsanti di eliminazione
    container.querySelectorAll('.btn-delete-event').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventItem = btn.closest('.event-item');
            const id = parseInt(eventItem.dataset.id);
            deleteHealthEvent(id);
        });
    });
}

function deleteHealthEvent(id) {
    if (confirm('Eliminare questo evento? 🤔')) {
        appState.healthEvents = appState.healthEvents.filter(e => e.id !== id);
        saveToLocalStorage();
        renderCalendar();
        renderHealthEvents();
        updateHomeStats();
        updateRecentActivities();
    }
}

// ==========================================
// PROMEMORIA ACQUISTI
// ==========================================

function initShopping() {
    const addBtn = document.getElementById('addShoppingBtn');
    const modal = document.getElementById('shoppingModal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelShoppingBtn');
    const saveBtn = document.getElementById('saveShoppingBtn');

    addBtn.addEventListener('click', () => openModal(modal));
    closeBtn.addEventListener('click', () => closeModal(modal));
    cancelBtn.addEventListener('click', () => closeModal(modal));
    saveBtn.addEventListener('click', saveShoppingItem);

    renderShoppingItems();
}

function saveShoppingItem() {
    const category = document.getElementById('shoppingCategory').value;
    const item = document.getElementById('shoppingItem').value;
    const quantity = document.getElementById('shoppingQuantity').value;
    const date = document.getElementById('shoppingDate').value;
    const notes = document.getElementById('shoppingNotes').value;

    if (!item) {
        alert('Inserisci almeno il nome dell\'articolo! 🛒');
        return;
    }

    const shoppingItem = {
        id: Date.now(),
        category,
        item,
        quantity: quantity || 1,
        date,
        notes,
        completed: false,
        timestamp: new Date().toISOString()
    };

    appState.shoppingItems.push(shoppingItem);
    saveToLocalStorage();
    renderShoppingItems();
    closeModal(document.getElementById('shoppingModal'));
    resetShoppingForm();
    updateHomeStats();
    updateRecentActivities();
}

function resetShoppingForm() {
    document.getElementById('shoppingCategory').value = 'food';
    document.getElementById('shoppingItem').value = '';
    document.getElementById('shoppingQuantity').value = '1';
    document.getElementById('shoppingDate').value = '';
    document.getElementById('shoppingNotes').value = '';
}

function renderShoppingItems() {
    const categories = {
        food: document.getElementById('foodList'),
        snack: document.getElementById('snackList'),
        accessory: document.getElementById('accessoryList'),
        medicine: document.getElementById('medicineList')
    };

    // Reset tutti i container
    Object.values(categories).forEach(container => {
        container.innerHTML = '<div class="empty-state" style="padding: 1rem;"><span style="font-size: 2rem; opacity: 0.3;">📝</span></div>';

        // Abilita drop zone per ogni categoria
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragleave', handleDragLeave);
    });

    // Raggruppa items per categoria
    appState.shoppingItems.forEach(item => {
        const container = categories[item.category];
        if (container) {
            const emptyState = container.querySelector('.empty-state');
            if (emptyState) emptyState.remove();

            const itemEl = document.createElement('div');
            itemEl.className = `shopping-item ${item.completed ? 'completed' : ''}`;
            itemEl.dataset.id = item.id;
            itemEl.draggable = true;
            itemEl.innerHTML = `
                <div class="item-drag-handle">⋮⋮</div>
                <div class="item-info">
                    <div class="item-name">${escapeHtml(item.item)}</div>
                    <div class="item-quantity">Quantità: ${escapeHtml(item.quantity.toString())}</div>
                    ${item.date ? `<div class="item-date">Entro: ${formatDate(item.date)}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn-icon btn-toggle-shopping" title="${item.completed ? 'Segna come non completato' : 'Segna come completato'}">
                        ${item.completed ? '↩️' : '✅'}
                    </button>
                    <button class="btn-icon btn-delete-shopping" title="Elimina">🗑️</button>
                </div>
            `;
            container.appendChild(itemEl);

            // Aggiungi event listeners
            const toggleBtn = itemEl.querySelector('.btn-toggle-shopping');
            const deleteBtn = itemEl.querySelector('.btn-delete-shopping');

            toggleBtn.addEventListener('click', () => toggleShoppingItem(item.id));
            deleteBtn.addEventListener('click', () => deleteShoppingItem(item.id));

            // Drag and drop event listeners (Desktop)
            itemEl.addEventListener('dragstart', handleDragStart);
            itemEl.addEventListener('dragend', handleDragEnd);

            // Touch events per mobile
            itemEl.addEventListener('touchstart', handleTouchStart, { passive: false });
            itemEl.addEventListener('touchmove', handleTouchMove, { passive: false });
            itemEl.addEventListener('touchend', handleTouchEnd, { passive: false });
        }
    });
}

// ==========================================
// DRAG AND DROP HANDLERS
// ==========================================

let draggedItem = null;
let touchClone = null;
let touchStartX = 0;
let touchStartY = 0;
let currentDropZone = null;

function handleDragStart(e) {
    draggedItem = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');

    // Rimuovi classi drag-over da tutte le categorie
    document.querySelectorAll('.shopping-items').forEach(container => {
        container.classList.remove('drag-over');
    });
}

// ==========================================
// TOUCH HANDLERS PER MOBILE
// ==========================================

function handleTouchStart(e) {
    draggedItem = e.currentTarget;
    const touch = e.touches[0];

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    // Crea clone visivo per feedback
    touchClone = draggedItem.cloneNode(true);
    touchClone.classList.add('touch-dragging-clone');
    touchClone.style.position = 'fixed';
    touchClone.style.pointerEvents = 'none';
    touchClone.style.zIndex = '10000';
    touchClone.style.opacity = '0.8';
    touchClone.style.transform = 'scale(1.05)';
    touchClone.style.width = draggedItem.offsetWidth + 'px';
    touchClone.style.left = touch.clientX - (draggedItem.offsetWidth / 2) + 'px';
    touchClone.style.top = touch.clientY - 30 + 'px';
    document.body.appendChild(touchClone);

    // Aggiungi classe all'originale
    draggedItem.classList.add('touch-dragging');
}

function handleTouchMove(e) {
    if (!touchClone || !draggedItem) return;

    e.preventDefault(); // Previeni scroll durante drag

    const touch = e.touches[0];

    // Aggiorna posizione clone
    touchClone.style.left = touch.clientX - (draggedItem.offsetWidth / 2) + 'px';
    touchClone.style.top = touch.clientY - 30 + 'px';

    // Trova elemento sotto il tocco
    touchClone.style.display = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    touchClone.style.display = '';

    // Rimuovi highlight da tutte le zone
    document.querySelectorAll('.shopping-items').forEach(container => {
        container.classList.remove('drag-over');
    });

    // Trova la drop zone (il container .shopping-items più vicino)
    if (elementBelow) {
        const dropZone = elementBelow.closest('.shopping-items');
        if (dropZone) {
            currentDropZone = dropZone;
            dropZone.classList.add('drag-over');
        } else {
            currentDropZone = null;
        }
    }
}

function handleTouchEnd(e) {
    if (!draggedItem) return;

    // Rimuovi clone
    if (touchClone) {
        touchClone.remove();
        touchClone = null;
    }

    // Rimuovi classi
    draggedItem.classList.remove('touch-dragging');
    document.querySelectorAll('.shopping-items').forEach(container => {
        container.classList.remove('drag-over');
    });

    // Esegui drop se c'è una zona valida
    if (currentDropZone && currentDropZone.classList.contains('shopping-items')) {
        const itemId = parseInt(draggedItem.dataset.id);
        const item = appState.shoppingItems.find(i => i.id === itemId);

        if (item) {
            const newCategory = getCategoryFromContainer(currentDropZone);

            if (newCategory && newCategory !== item.category) {
                // Aggiorna categoria
                item.category = newCategory;
                saveToLocalStorage();

                // Animazione di feedback
                showCategoryChangeNotification(item.item, newCategory);

                // Re-render
                renderShoppingItems();
                updateRecentActivities();
            }
        }
    }

    // Reset
    draggedItem = null;
    currentDropZone = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    // Aggiungi classe visual feedback
    if (e.currentTarget.classList.contains('shopping-items')) {
        e.currentTarget.classList.add('drag-over');
    }

    return false;
}

function handleDragLeave(e) {
    if (e.currentTarget.classList.contains('shopping-items')) {
        e.currentTarget.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    e.preventDefault();

    const dropZone = e.currentTarget;
    dropZone.classList.remove('drag-over');

    if (draggedItem && dropZone.classList.contains('shopping-items')) {
        const itemId = parseInt(draggedItem.dataset.id);
        const item = appState.shoppingItems.find(i => i.id === itemId);

        if (item) {
            // Determina la nuova categoria dal container
            const newCategory = getCategoryFromContainer(dropZone);

            if (newCategory && newCategory !== item.category) {
                // Aggiorna categoria
                item.category = newCategory;
                saveToLocalStorage();

                // Animazione di feedback
                showCategoryChangeNotification(item.item, newCategory);

                // Re-render
                renderShoppingItems();
                updateRecentActivities();
            }
        }
    }

    return false;
}

function getCategoryFromContainer(container) {
    if (container.id === 'foodList') return 'food';
    if (container.id === 'snackList') return 'snack';
    if (container.id === 'accessoryList') return 'accessory';
    if (container.id === 'medicineList') return 'medicine';
    return null;
}

function showCategoryChangeNotification(itemName, newCategory) {
    const categoryLabels = {
        food: 'Cibo 🍖',
        snack: 'Snack 🦴',
        accessory: 'Accessori 🎾',
        medicine: 'Farmaci 💊'
    };

    // Crea notifica temporanea
    const notification = document.createElement('div');
    notification.className = 'drag-notification';
    notification.textContent = `"${itemName}" spostato in ${categoryLabels[newCategory]}`;
    document.body.appendChild(notification);

    // Rimuovi dopo animazione
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function toggleShoppingItem(id) {
    const item = appState.shoppingItems.find(i => i.id === id);
    if (item) {
        item.completed = !item.completed;
        saveToLocalStorage();
        renderShoppingItems();
        updateHomeStats();
    }
}

function deleteShoppingItem(id) {
    if (confirm('Eliminare questo promemoria? 🗑️')) {
        appState.shoppingItems = appState.shoppingItems.filter(i => i.id !== id);
        saveToLocalStorage();
        renderShoppingItems();
        updateHomeStats();
        updateRecentActivities();
    }
}

// ==========================================
// TIMELINE
// ==========================================

function initTimeline() {
    renderTimeline();
}

function renderTimeline() {
    const container = document.getElementById('timelineView');

    // Combina tutti gli eventi
    const allEvents = [
        ...appState.diaryEntries.map(e => ({...e, type: 'diary', icon: '📔'})),
        ...appState.healthEvents.map(e => ({...e, type: 'health', icon: '💚'})),
        ...appState.shoppingItems.filter(i => !i.completed).map(e => ({...e, type: 'shopping', icon: '🛒'}))
    ];

    // Ordina per data
    allEvents.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

    if (allEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🌟</span>
                <p>La tua storia insieme sta per iniziare!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = allEvents.map(event => {
        let content = '';
        const eventDate = event.date || event.timestamp;

        if (event.type === 'diary') {
            const truncatedText = event.text.substring(0, 150);
            content = `
                <div class="timeline-title">${escapeHtml(event.title)}</div>
                <div class="timeline-content">${escapeHtml(truncatedText)}${event.text.length > 150 ? '...' : ''}</div>
            `;
        } else if (event.type === 'health') {
            content = `
                <div class="timeline-title">${escapeHtml(event.title)}</div>
                <div class="timeline-content">${getHealthTypeLabel(event.type)}${event.time ? ' - ' + escapeHtml(event.time) : ''}</div>
            `;
        } else if (event.type === 'shopping') {
            content = `
                <div class="timeline-title">Promemoria acquisto</div>
                <div class="timeline-content">${escapeHtml(event.item)} (x${escapeHtml(event.quantity.toString())})</div>
            `;
        }

        return `
            <div class="timeline-item">
                <div class="timeline-dot">${event.icon}</div>
                <div class="timeline-card">
                    <div class="timeline-date">${formatDate(eventDate)}</div>
                    ${content}
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// PERSONALIZZAZIONE
// ==========================================

function initCustomization() {
    // Nome pet
    const saveNameBtn = document.getElementById('savePetNameBtn');
    const petNameInput = document.getElementById('customPetName');

    petNameInput.value = appState.petName;

    saveNameBtn.addEventListener('click', () => {
        const newName = petNameInput.value.trim();
        if (newName) {
            appState.petName = newName;
            document.getElementById('petName').textContent = newName;
            saveToLocalStorage();
            alert(`Nome aggiornato a ${newName}! 🎉`);
        }
    });

    // Avatar
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        if (option.dataset.avatar === appState.petAvatar) {
            option.classList.add('selected');
        }

        option.addEventListener('click', () => {
            avatarOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            appState.petAvatar = option.dataset.avatar;
            document.querySelector('.avatar-placeholder').textContent = appState.petAvatar;
            saveToLocalStorage();
        });
    });

    // Temi
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            themeOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            appState.theme = option.dataset.theme;
            saveToLocalStorage();
            applyTheme();
        });
    });
}

function applyTheme() {
    document.body.setAttribute('data-theme', appState.theme);
}

// ==========================================
// HOME - STATISTICHE E ATTIVITÀ
// ==========================================

function updateHomeStats() {
    document.getElementById('totalEntries').textContent = appState.diaryEntries.length;

    const nextVisit = appState.healthEvents
        .filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    document.getElementById('nextVisit').textContent = nextVisit
        ? formatDate(nextVisit.date)
        : '-';

    document.getElementById('remindersCount').textContent =
        appState.shoppingItems.filter(i => !i.completed).length;
}

function updateRecentActivities() {
    const container = document.getElementById('recentActivitiesList');

    const recentEvents = [
        ...appState.diaryEntries.slice(0, 3).map(e => ({
            icon: '📔',
            title: e.title,
            date: e.date
        })),
        ...appState.healthEvents.slice(0, 2).map(e => ({
            icon: '💚',
            title: e.title,
            date: e.date
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (recentEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🍃</span>
                <p>Inizia a creare ricordi con il tuo amico!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = recentEvents.map(event => `
        <div class="activity-item">
            <span class="activity-icon">${event.icon}</span>
            <div class="activity-content">
                <div class="activity-title">${event.title}</div>
                <div class="activity-date">${formatDate(event.date)}</div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// UTILITY - MODAL
// ==========================================

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// Click fuori dal modal per chiudere
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
});

// ==========================================
// UTILITY - DATE
// ==========================================

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('it-IT', options);
}

function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}

// ==========================================
// NOTIFICHE E PROMEMORIA
// ==========================================

function checkReminders() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateISO(tomorrow);

    // Controlla eventi salute con promemoria
    appState.healthEvents.forEach(event => {
        if (event.reminder && event.date === tomorrowStr) {
            if (Notification.permission === 'granted') {
                new Notification('PetBoard - Promemoria 💚', {
                    body: `Domani: ${event.title}`,
                    icon: '💚'
                });
            }
        }
    });

    // Controlla shopping in scadenza
    appState.shoppingItems.forEach(item => {
        if (!item.completed && item.date === tomorrowStr) {
            if (Notification.permission === 'granted') {
                new Notification('PetBoard - Promemoria acquisto 🛒', {
                    body: `Ricordati di comprare: ${item.item}`,
                    icon: '🛒'
                });
            }
        }
    });
}

// Richiedi permesso notifiche
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Controlla promemoria ogni ora
setInterval(checkReminders, 3600000);
checkReminders(); // Controlla subito all'avvio

// ==========================================
// MINIGIOCO AVATAR - VERSIONE AVANZATA
// ==========================================

let minigameActive = false;
let minigameScore = 0;
let minigameCombo = 0;
let minigameHighScore = 0;
let minigameInterval = null;
let minigameLastCatchTime = 0;
let minigamePowerUp = null;
let minigameMovementPattern = 'random';
let minigameMissedClicks = 0;

// Costanti di bilanciamento
const MINIGAME_CONFIG = {
    baseSpeed: 800,            // Velocità iniziale (ms) - ridotta per più velocità
    minSpeed: 200,             // Velocità massima raggiungibile (ms)
    speedDecrement: 40,        // Riduzione velocità per punto
    comboWindow: 2000,         // Tempo per mantenere combo (ms)
    comboThreshold: 3,         // Click necessari per attivare combo
    powerUpChance: 0.15,       // 15% chance di power-up
    powerUpDuration: 5000,     // Durata power-up (ms)
    patterns: ['random', 'circle', 'zigzag', 'bounce'],
    particleCount: 8           // Numero particelle per cattura
};

function initMinigame() {
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const petAvatar = document.getElementById('petAvatar');

    if (!avatarPlaceholder || !petAvatar) return;

    // Carica high score da localStorage
    const saved = localStorage.getItem('petboard_minigame_highscore');
    if (saved) {
        minigameHighScore = parseInt(saved, 10) || 0;
    }

    // Click sull'avatar per attivare/catturare
    avatarPlaceholder.addEventListener('click', (e) => {
        e.stopPropagation();

        if (!minigameActive) {
            // Attiva minigioco
            startMinigame();
        } else {
            // Cattura l'animaletto
            catchPet();
        }
    });

    // Penalità per click mancati (fuori dall'avatar)
    document.addEventListener('click', (e) => {
        if (minigameActive && !avatarPlaceholder.contains(e.target)) {
            handleMissedClick(e);
        }
    });

    // Disattiva minigioco allo scroll
    window.addEventListener('scroll', () => {
        if (minigameActive) {
            stopMinigame();
        }
    });
}

function startMinigame() {
    minigameActive = true;
    minigameScore = 0;
    minigameCombo = 0;
    minigameMissedClicks = 0;
    minigameLastCatchTime = Date.now();
    minigamePowerUp = null;
    minigameMovementPattern = 'random';

    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const petAvatar = document.getElementById('petAvatar');
    const scoreDisplay = document.getElementById('minigameScore');
    const scoreValue = document.getElementById('scoreValue');

    // Mostra interfaccia di gioco
    scoreDisplay.style.display = 'block';
    scoreValue.innerHTML = `
        <div class="score-main">${minigameScore}</div>
        <div class="score-high">Record: ${minigameHighScore}</div>
        <div class="score-combo" id="comboIndicator" style="display: none;">Combo x0</div>
    `;

    // Aggiungi classe minigioco attivo
    petAvatar.classList.add('minigame-active');
    avatarPlaceholder.classList.add('running');

    // Mostra tutorial breve
    showGameTutorial();

    // Inizia movimento con pattern casuale
    startSmartMovement();
}

function showGameTutorial() {
    const tutorial = document.createElement('div');
    tutorial.className = 'minigame-tutorial';
    tutorial.innerHTML = `
        <div class="tutorial-content">
            <span class="tutorial-icon">🎯</span>
            <p>Cattura il tuo pet!</p>
            <small>Combo = più punti | Click mancati = penalità</small>
        </div>
    `;
    document.body.appendChild(tutorial);

    setTimeout(() => {
        tutorial.classList.add('fade-out');
        setTimeout(() => tutorial.remove(), 300);
    }, 2500);
}

function startSmartMovement() {
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const container = document.querySelector('.pet-avatar-container');

    if (!container) return;

    let moveCount = 0;
    const patternChangeInterval = 5; // Cambia pattern ogni 5 movimenti (più varietà)

    const move = () => {
        if (!minigameActive) {
            clearInterval(minigameInterval);
            return;
        }

        // Cambia pattern periodicamente per varietà
        if (moveCount % patternChangeInterval === 0) {
            minigameMovementPattern = MINIGAME_CONFIG.patterns[
                Math.floor(Math.random() * MINIGAME_CONFIG.patterns.length)
            ];
        }

        // Calcola nuova posizione basata sul pattern
        const newPosition = calculateNextPosition(container, avatarPlaceholder, minigameMovementPattern, moveCount);

        // Applica movimento con transizione fluida
        const transitionDuration = getCurrentSpeed() * 0.7; // 70% del tempo di pausa per movimento più fluido
        avatarPlaceholder.style.position = 'absolute';
        avatarPlaceholder.style.left = newPosition.x + 'px';
        avatarPlaceholder.style.top = newPosition.y + 'px';
        avatarPlaceholder.style.transition = `all ${transitionDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;

        // Rotazione casuale per vivacità
        const rotation = (Math.random() - 0.5) * 20;
        avatarPlaceholder.style.transform = `rotate(${rotation}deg) scale(${minigamePowerUp === 'big' ? 1.3 : 1})`;

        moveCount++;
    };

    // Prima mossa immediata
    move();

    // Movimento continuo con velocità progressiva
    minigameInterval = setInterval(move, getCurrentSpeed());
}

function calculateNextPosition(container, avatar, pattern, moveCount) {
    const containerRect = container.getBoundingClientRect();
    const avatarSize = 150;
    const maxX = Math.max(containerRect.width - avatarSize, 0);
    const maxY = Math.max(containerRect.height - avatarSize, 0);

    // Ottieni posizione corrente (se esiste)
    const currentX = parseInt(avatar.style.left || maxX / 2);
    const currentY = parseInt(avatar.style.top || maxY / 2);

    let x, y;

    switch (pattern) {
        case 'circle':
            // Movimento circolare
            const angle = (moveCount * Math.PI) / 4;
            const radius = Math.min(maxX, maxY) / 3;
            const centerX = maxX / 2;
            const centerY = maxY / 2;
            x = centerX + Math.cos(angle) * radius;
            y = centerY + Math.sin(angle) * radius;
            break;

        case 'zigzag':
            // Pattern a zigzag
            x = (moveCount % 2 === 0) ? maxX * 0.2 : maxX * 0.8;
            y = (maxY / 8) * (moveCount % 8);
            break;

        case 'bounce':
            // Rimbalzo da bordi - movimento più ampio
            const stepSize = 150;
            x = currentX + (Math.random() - 0.5) * stepSize * 2;
            y = currentY + (Math.random() - 0.5) * stepSize * 2;
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));
            break;

        case 'random':
        default:
            // Completamente casuale - più spazio di movimento
            x = Math.random() * maxX;
            y = Math.random() * maxY;
            break;
    }

    return { x: Math.max(0, Math.min(x, maxX)), y: Math.max(0, Math.min(y, maxY)) };
}

function getCurrentSpeed() {
    // Velocità aumenta con il punteggio
    const speedReduction = minigameScore * MINIGAME_CONFIG.speedDecrement;
    const currentSpeed = Math.max(
        MINIGAME_CONFIG.minSpeed,
        MINIGAME_CONFIG.baseSpeed - speedReduction
    );

    // Power-up "slow" raddoppia il tempo
    return minigamePowerUp === 'slow' ? currentSpeed * 1.8 : currentSpeed;
}

function catchPet() {
    const now = Date.now();
    const timeSinceLastCatch = now - minigameLastCatchTime;

    // Calcola combo
    if (timeSinceLastCatch < MINIGAME_CONFIG.comboWindow) {
        minigameCombo++;
    } else {
        minigameCombo = 1;
    }

    minigameLastCatchTime = now;

    // Calcola punti (base + bonus combo)
    let points = 1;
    if (minigameCombo >= MINIGAME_CONFIG.comboThreshold) {
        points = minigameCombo;
    }

    // Power-up "double" raddoppia i punti
    if (minigamePowerUp === 'double') {
        points *= 2;
    }

    minigameScore += points;

    // Aggiorna velocità dinamicamente
    updateMovementSpeed();

    // Aggiorna UI
    updateScoreDisplay();

    // Animazioni feedback
    playFeedbackAnimations(points);

    // Chance di spawn power-up
    if (Math.random() < MINIGAME_CONFIG.powerUpChance && !minigamePowerUp) {
        spawnPowerUp();
    }

    // Reset missed clicks counter
    minigameMissedClicks = 0;
}

function handleMissedClick(e) {
    minigameMissedClicks++;

    // Penalità visiva
    const miss = document.createElement('div');
    miss.className = 'miss-indicator';
    miss.textContent = 'Miss!';
    miss.style.position = 'fixed';
    miss.style.left = e.clientX + 'px';
    miss.style.top = e.clientY + 'px';
    document.body.appendChild(miss);

    setTimeout(() => miss.remove(), 600);

    // Se troppi click mancati, termina gioco
    if (minigameMissedClicks >= 5) {
        stopMinigame();
        showNotification('Troppi click mancati! 🙈', 'warning');
    }
}

function updateMovementSpeed() {
    // Restart interval con nuova velocità
    if (minigameInterval) {
        clearInterval(minigameInterval);
        startSmartMovement(); // Riavvia movimento con nuova velocità
    }
}

function updateScoreDisplay() {
    const scoreValue = document.getElementById('scoreValue');
    const comboIndicator = document.getElementById('comboIndicator');

    scoreValue.querySelector('.score-main').textContent = minigameScore;

    // Mostra combo se attiva
    if (minigameCombo >= MINIGAME_CONFIG.comboThreshold) {
        comboIndicator.style.display = 'block';
        comboIndicator.textContent = `🔥 Combo x${minigameCombo}`;
        comboIndicator.classList.add('combo-pulse');
    } else {
        comboIndicator.style.display = 'none';
        comboIndicator.classList.remove('combo-pulse');
    }
}

function playFeedbackAnimations(points) {
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const petAvatar = document.getElementById('petAvatar');

    // Animazione cattura sull'avatar
    avatarPlaceholder.classList.add('caught');
    setTimeout(() => avatarPlaceholder.classList.remove('caught'), 400);

    // Effetto testo punti
    showCatchEffect(points);

    // Particelle esplosive
    createParticleExplosion(avatarPlaceholder);

    // Shake delicato del container
    petAvatar.classList.add('shake-gentle');
    setTimeout(() => petAvatar.classList.remove('shake-gentle'), 500);
}

function showCatchEffect(points) {
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');

    const effect = document.createElement('div');
    effect.className = 'catch-effect';

    let icon = '💚';
    if (minigameCombo >= 5) icon = '🌟';
    else if (minigameCombo >= 3) icon = '✨';

    effect.innerHTML = `+${points} ${icon}`;
    avatarPlaceholder.appendChild(effect);

    setTimeout(() => effect.remove(), 1200);
}

function createParticleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < MINIGAME_CONFIG.particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = ['✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 4)];

        const angle = (Math.PI * 2 * i) / MINIGAME_CONFIG.particleCount;
        const distance = 60 + Math.random() * 40;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', endX + 'px');
        particle.style.setProperty('--ty', endY + 'px');
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';

        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 800);
    }
}

function spawnPowerUp() {
    const powerUps = [
        { type: 'slow', icon: '🐌', label: 'Slow Motion', color: '#B8E6F0' },
        { type: 'double', icon: '💎', label: 'Double Points', color: '#FFB5C0' },
        { type: 'big', icon: '🔍', label: 'Target Più Grande', color: '#9ED5C5' }
    ];

    const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
    minigamePowerUp = powerUp.type;

    // Notifica power-up
    const notification = document.createElement('div');
    notification.className = 'powerup-notification';
    notification.style.background = powerUp.color;
    notification.innerHTML = `
        <span class="powerup-icon">${powerUp.icon}</span>
        <span class="powerup-label">${powerUp.label}</span>
    `;
    document.body.appendChild(notification);

    // Applica effetto visivo
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    avatarPlaceholder.classList.add('powerup-active');

    // Rimuovi power-up dopo durata
    setTimeout(() => {
        minigamePowerUp = null;
        avatarPlaceholder.classList.remove('powerup-active');
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, MINIGAME_CONFIG.powerUpDuration);
}

function stopMinigame() {
    if (!minigameActive) return;

    minigameActive = false;

    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const petAvatar = document.getElementById('petAvatar');
    const scoreDisplay = document.getElementById('minigameScore');

    // Rimuovi classi
    petAvatar.classList.remove('minigame-active');
    avatarPlaceholder.classList.remove('running', 'powerup-active');

    // Reset posizione e stile
    avatarPlaceholder.style.position = '';
    avatarPlaceholder.style.left = '';
    avatarPlaceholder.style.top = '';
    avatarPlaceholder.style.transition = '';
    avatarPlaceholder.style.transform = '';

    // Nascondi UI dopo delay
    setTimeout(() => {
        scoreDisplay.style.display = 'none';
    }, 2000);

    // Ferma movimento
    if (minigameInterval) {
        clearInterval(minigameInterval);
        minigameInterval = null;
    }

    // Salva e mostra punteggio finale
    if (minigameScore > 0) {
        handleGameEnd();
    }
}

function handleGameEnd() {
    // Controlla nuovo record
    const isNewRecord = minigameScore > minigameHighScore;

    if (isNewRecord) {
        minigameHighScore = minigameScore;
        localStorage.setItem('petboard_minigame_highscore', minigameHighScore.toString());
    }

    // Mostra schermata finale
    showFinalScore(isNewRecord);
}

function showFinalScore(isNewRecord) {
    const notification = document.createElement('div');
    notification.className = 'minigame-notification final-score';

    let message = `Hai catturato ${appState.petName} ${minigameScore} ${minigameScore === 1 ? 'volta' : 'volte'}!`;
    let icon = '🎉';

    if (isNewRecord) {
        icon = '🏆';
        message += '<br><strong>Nuovo Record!</strong>';
    }

    // Valutazione performance
    let rating = '';
    if (minigameScore >= 30) rating = '⭐⭐⭐ Incredibile!';
    else if (minigameScore >= 20) rating = '⭐⭐ Fantastico!';
    else if (minigameScore >= 10) rating = '⭐ Ben fatto!';
    else rating = 'Continua a esercitarti!';

    notification.innerHTML = `
        <div class="final-score-header">
            <span class="final-icon">${icon}</span>
            <h3>Game Over</h3>
        </div>
        <div class="final-score-body">
            <div class="final-score-number">${minigameScore}</div>
            <p>${message}</p>
            <p class="final-rating">${rating}</p>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 4500);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `minigame-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}
