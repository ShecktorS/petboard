# 🐾 PetBoard

Una web application minimalista e rilassante per la gestione dei tuoi animali domestici, ispirata all'atmosfera accogliente di Animal Crossing.

![PetBoard Banner](https://img.shields.io/badge/version-1.1-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Vanilla JS](https://img.shields.io/badge/vanilla-JS-yellow)

## ✨ Caratteristiche

### 📔 Diario Digitale
Cattura i momenti speciali con il tuo pet! Scrivi note giornaliere, aggiungi foto e crea un album dei ricordi che potrai rivivere in qualsiasi momento.

### 🏥 Calendario Salute
Tieni traccia di tutti gli appuntamenti veterinari, vaccinazioni e controlli medici. Il calendario interattivo ti mostra gli eventi del mese e ti avvisa degli appuntamenti imminenti.

### 🛒 Lista della Spesa
Organizza gli acquisti per il tuo pet in categorie intelligenti:
- 🍖 Cibo
- 🦴 Snack
- 🎾 Accessori
- 💊 Farmaci

**Drag & Drop**: Trascina e rilascia gli articoli tra le categorie per riorganizzarli facilmente!

### 📅 Timeline
Una vista cronologica completa che unifica tutti gli eventi: note del diario, appuntamenti medici e acquisti. Tieni sotto controllo la storia del tuo pet in un unico posto.

### 🎨 Personalizzazione
Rendi unica la tua esperienza:
- Scegli l'avatar del tuo pet tra 8 emoji disponibili
- Personalizza il nome
- Cambia tema stagionale (Primavera, Estate, Autunno, Inverno)

### 🎮 Minigioco Interattivo
Gioca con il tuo pet virtuale! Un minigioco coinvolgente con:
- **4 pattern di movimento intelligenti** (casuale, circolare, zigzag, rimbalzo)
- **Difficoltà progressiva** che aumenta con il tuo punteggio
- **Sistema combo** per moltiplicare i punti
- **3 power-ups speciali**: Rallentamento 🐌, Punti Doppi 💎, Bersaglio Ingrandito 🔍
- **Effetti visivi spettacolari**: esplosioni di particelle, animazioni elastiche
- **High score persistente** per battere il tuo record

## 🎨 Design Philosophy

PetBoard è progettata per essere **rilassante e giocosa**, non una fredda app gestionale. L'interfaccia richiama l'estetica cartoon di Animal Crossing con:

- 🌈 **Palette colori pastello** (verde minta, azzurro cielo, beige sabbia, rosa tenue)
- ✨ **Animazioni morbide ed elastiche**
- 🎯 **Bordi arrotondati e ombreggiature delicate**
- 🎪 **Pattern decorativi stratificati** per profondità visiva
- 🎭 **Microinterazioni ricche** (effetti shimmer, ripple, glow)
- 🌸 **4 temi stagionali** che trasformano completamente l'atmosfera

## 🚀 Installazione

PetBoard è una **single-page application vanilla** (no framework, no build tools). Funziona completamente lato client!

### Metodo 1: Apertura Diretta
```bash
# Clona la repository
git clone git@github.com:ShecktorS/petboard.git
cd petboard

# Apri index.html nel browser
# Su Windows:
start index.html
# Su Mac:
open index.html
# Su Linux:
xdg-open index.html
```

### Metodo 2: Server Locale
```bash
# Con Python
python -m http.server 8000

# Oppure con Node.js
npx serve

# Apri http://localhost:8000
```

## 🎮 Come Usare

1. **Primo Accesso**
   - Vai su "Personalizza" 🎨
   - Scegli nome e avatar del tuo pet
   - Seleziona il tema stagionale preferito

2. **Aggiungi il Primo Ricordo**
   - Vai su "Diario" 📔
   - Clicca "+ Nuova nota"
   - Scrivi il tuo primo ricordo e carica una foto!

3. **Pianifica le Visite**
   - Vai su "Salute" 🏥
   - Clicca "+ Nuovo evento"
   - Aggiungi vaccinazioni o visite veterinarie

4. **Crea Promemoria**
   - Vai su "Shopping" 🛒
   - Clicca "+ Nuovo promemoria"
   - Organizza gli acquisti per categoria
   - **Pro tip**: Trascina gli articoli tra le categorie per riorganizzarli!

5. **Gioca con il Minigioco**
   - Dalla Home, clicca sull'avatar del tuo pet
   - Cerca di catturarlo mentre si muove
   - Accumula combo e power-ups per punteggi più alti!

## 💾 Persistenza Dati

Tutti i dati sono salvati **localmente nel browser** tramite `localStorage`:
- ✅ Nessun account richiesto
- ✅ Totale privacy (i dati non escono mai dal tuo dispositivo)
- ✅ Funziona offline
- ⚠️ Limitato a ~5-10MB (le foto sono salvate in base64)

**Importante**: Se cancelli i dati del browser, perderai i ricordi salvati.

## 🛠️ Tecnologie

- **HTML5** - Struttura semantica
- **CSS3** - Design system avanzato con variabili custom
- **Vanilla JavaScript (ES6+)** - Zero dipendenze
- **LocalStorage API** - Persistenza dati
- **Notification API** - Promemoria browser (opzionale)
- **FileReader API** - Upload e preview foto

## 📱 Compatibilità

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Responsive (desktop e mobile)
❌ Internet Explorer (non supportato)

## 🔒 Privacy e Sicurezza

- ✅ Nessun dato inviato a server esterni
- ✅ Nessun cookie di tracciamento
- ✅ Protezione XSS integrata
- ✅ Dati salvati solo localmente
- ✅ Codice open source e trasparente

## 🐛 Risoluzione Problemi

**I dati non vengono salvati?**
- Verifica che il browser non sia in modalità privata/incognito
- Controlla che lo spazio localStorage non sia pieno (limite ~5-10MB)

**Le notifiche non funzionano?**
- Controlla di aver autorizzato le notifiche nelle impostazioni browser
- Verifica che le notifiche non siano disabilitate a livello di sistema operativo

**Le immagini non si caricano?**
- Le foto vengono salvate come base64 in localStorage
- File molto grandi potrebbero superare il limite di storage
- Suggerimento: usa foto compresse (< 1MB)

**Voglio cancellare tutti i dati?**
Apri la console del browser (F12) e digita:
```javascript
localStorage.clear()
location.reload()
```

## 🎯 Roadmap

### Prossime Features
- [ ] Export/import dati come JSON
- [ ] Ottimizzazione immagini (compressione automatica)
- [ ] PWA con service worker per uso offline
- [ ] Supporto multi-pet
- [ ] Grafici statistiche (peso, visite, spese)
- [ ] Dark mode toggle

### Future Ideas
- [ ] Backup su cloud (Firebase/Supabase)
- [ ] Integrazione Google Calendar
- [ ] Condivisione social dei ricordi
- [ ] Leaderboard minigioco globale
- [ ] Promemoria ricorrenti

## 🤝 Contribuire

I contributi sono benvenuti! Per favore:

1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha il branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Linee Guida
- Mantieni lo stile del codice esistente
- Testa su più browser prima di submittare
- Rispetta la filosofia di design (Animal Crossing vibes)
- Documenta le nuove features

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **MIT**. Vedi il file `LICENSE` per i dettagli.

## 🙏 Ringraziamenti

- Ispirato dall'estetica di **Animal Crossing** (Nintendo)
- Icone emoji native del sistema operativo
- Design system influenzato da principi di **Material Design** e **Fluent Design**

---

**Fatto con ❤️ per gli amanti degli animali**

*PetBoard - Perché prendersi cura del proprio pet dovrebbe essere divertente come giocare a Animal Crossing!* 🏝️
