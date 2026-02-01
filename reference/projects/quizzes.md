
# Quizzen Systeem Documentatie

Dit document biedt een gedetailleerd overzicht van de datastructuur die wordt gebruikt voor quizzen in de AyoSinau-applicatie. Het is bedoeld als leidraad voor ontwikkelaars en contentbeheerders.

---

## 1. Basis Quiz Structuur

Een quiz wordt gedefinieerd door een hoofdobject met de volgende velden. Dit object kan worden geëxporteerd of geïmporteerd als een JSON-array van quizzen.

**Hoofdvelden:**
- `id` (string, optioneel bij creatie): Een unieke identifier voor de quiz. Wordt automatisch gegenereerd.
- `title` (string, verplicht): De titel van de quiz.
- `description` (string, optioneel): Een korte beschrijving van wat de quiz behandelt.
- `isPublished` (boolean, optioneel): Bepaalt of de quiz zichtbaar is voor gebruikers. Standaard `false`.
- `questions` (array, verplicht): Een array van vraagobjecten.

**Voorbeeld `quiz.json` (Array met één quiz):**
```json
[
  {
    "title": "Module 1 Eindquiz",
    "description": "Test je kennis van de hele module.",
    "isPublished": true,
    "questions": [
      // ... Vraagobjecten komen hier ...
    ]
  }
]
```

---

## 2. Vraag Structuur (`QuizQuestion`)

Elk object binnen de `questions` array heeft de volgende structuur:

**Basisvelden (voor elke vraag):**
- `id` (string, optioneel bij creatie): Een unieke identifier voor de vraag. Wordt automatisch gegenereerd.
- `questionText` (string, verplicht): De daadwerkelijke vraag die aan de gebruiker wordt getoond.
- `questionType` (string, verplicht): Bepaalt hoe de vraag wordt weergegeven en geëvalueerd. Zie de sectie "Vraagtypen" hieronder.
- `explanation` (string, optioneel): Uitleg die wordt getoond nadat de gebruiker de vraag heeft beantwoord.
- `order` (number, optioneel): Bepaalt de volgorde van de vragen. Wordt automatisch toegewezen indien niet opgegeven.
- `wordId` (string, optioneel): Koppelt de vraag aan een specifiek woord in de `Word` tabel voor contextuele feedback.
- `imagePromptUrl` (string, optioneel): URL naar een afbeelding die bij de vraag wordt getoond.
- `aiHint` (string, optioneel): Twee keywords voor het genereren van een placeholder-afbeelding als `imagePromptUrl` niet is opgegeven.
- `audioPromptUrl` (string, optioneel): URL naar een audiobestand dat bij de vraag wordt afgespeeld.

---

## 3. Gedetailleerde Vraagtypen (`questionType`)

Hieronder volgt een overzicht van alle ondersteunde vraagtypen en de specifieke velden die ze vereisen.

### a. `MULTIPLE_CHOICE`
**Beschrijving:** Een standaard meerkeuzevraag waarbij de gebruiker één correct antwoord moet selecteren.
**Extra Velden:**
- `options` (array van `QuizOption` objecten, verplicht):
    - `text` (string): De tekst van de optie.
    - `isCorrect` (boolean): Moet `true` zijn voor exact één optie.
    - `wordId` (string, optioneel): Koppelt deze specifieke optie aan een woord.

**Voorbeeld:**
```json
{
  "questionText": "Wat is 'Welkom' in beleefd Javaans?",
  "questionType": "MULTIPLE_CHOICE",
  "options": [
    { "text": "Halo", "isCorrect": false, "wordId": "hallo" },
    { "text": "Sugeng rawuh", "isCorrect": true, "wordId": "sugeng-rawuh-id" },
    { "text": "Matur nuwun", "isCorrect": false, "wordId": "matur-nuwun-id" }
  ],
  "explanation": "'Sugeng rawuh' is de meest formele welkomstgroet."
}
```

### b. `FILL_IN_THE_BLANK`
**Beschrijving:** Een invulvraag waarbij de gebruiker het juiste woord moet typen.
**Extra Velden:**
- `fillInAnswers` (array van strings, verplicht): Een lijst van alle mogelijke correcte antwoorden (hoofdletterongevoelig).

**Voorbeeld:**
```json
{
  "questionText": "Vul het ontbrekende woord in: '___ kabaré?'",
  "questionType": "FILL_IN_THE_BLANK",
  "fillInAnswers": ["Piye", "piye"],
  "explanation": "De correcte vraag is 'Piye kabaré?' (Hoe gaat het?)."
}
```

### c. `MATCH_PAIRS`
**Beschrijving:** Een combineervraag waarbij de gebruiker paren moet vormen.
**Extra Velden:**
- `matchItemsLeft` (array van `{ "value": "..." }`, verplicht): De items in de linkerkolom.
- `matchItemsRight` (array van `{ "value": "..." }`, verplicht): De items in de rechterkolom. De volgorde moet corresponderen met `matchItemsLeft`. De UI zal de rechterkolom automatisch shuffelen.

**Voorbeeld:**
```json
{
  "questionText": "Combineer het Javaanse woord met de juiste vertaling.",
  "questionType": "MATCH_PAIRS",
  "matchItemsLeft": [
    {"value": "Aku"}, 
    {"value": "Kowé"}
  ],
  "matchItemsRight": [
    {"value": "Ik"}, 
    {"value": "Jij"}
  ],
  "explanation": "Dit zijn de correcte voornaamwoorden."
}
```

### d. `REORDER_SENTENCE`
**Beschrijving:** Een vraag waarbij de gebruiker woorden in de juiste volgorde moet plaatsen om een zin te vormen.
**Extra Velden:**
- `sentencePartsToReorder` (array van `{ "value": "..." }`, verplicht): De zinsdelen in de **correcte** volgorde. De UI zal deze automatisch shuffelen.

**Voorbeeld:**
```json
{
  "questionText": "Zet de woorden in de juiste volgorde.",
  "questionType": "REORDER_SENTENCE",
  "sentencePartsToReorder": [
    {"value": "Aku"},
    {"value": "arep"},
    {"value": "turu."}
  ],
  "explanation": "De correcte zin is 'Aku arep turu' (Ik ga slapen)."
}
```

### e. Audio Vraagtypen
Voor alle audio-gerelateerde vragen is het veld `audioPromptUrl` (string) verplicht.

#### `AUDIO_CHOICE`
**Beschrijving:** Een meerkeuzevraag op basis van een audiofragment.
**Extra Velden:** `audioPromptUrl`, `options`.

**Voorbeeld:**
```json
{
  "questionText": "Luister naar de audio. Wat betekent het woord?",
  "questionType": "AUDIO_CHOICE",
  "audioPromptUrl": "/audio/uploads/sae.mp3",
  "options": [
    { "text": "Goed (beleefd)", "isCorrect": true, "wordId": "sae-id" },
    { "text": "Welkom", "isCorrect": false, "wordId": "sugeng-rawuh-id" }
  ]
}
```

#### `TYPE_HEARD_AUDIO`
**Beschrijving:** De gebruiker luistert naar audio en typt wat hij/zij hoort.
**Extra Velden:** `audioPromptUrl`, `fillInAnswers`.

**Voorbeeld:**
```json
{
  "questionText": "Luister naar de audio en typ wat je hoort.",
  "questionType": "TYPE_HEARD_AUDIO",
  "audioPromptUrl": "/audio/uploads/rokok.mp3",
  "fillInAnswers": ["rokok"],
  "explanation": "Je hoorde 'rokok' (sigaret)."
}
```

#### `AUDIO_STORY_MCQ`
**Beschrijving:** De gebruiker luistert naar een langer audioverhaal en beantwoordt een meerkeuzevraag over de inhoud.
**Extra Velden:** `audioPromptUrl`, `options`.

#### `MULTI_SELECT_AUDIO_WORDS`
**Beschrijving:** De gebruiker luistert naar een audiofragment (bv. een zin) en selecteert alle woorden die hij/zij herkent uit een lijst. Meerdere opties kunnen correct zijn.
**Extra Velden:** `audioPromptUrl`, `options` (waarbij meerdere `isCorrect: true` mogelijk zijn).

---

## 4. Beheer en Import

-   **Admin Panel**: Quizzen kunnen handmatig worden aangemaakt en beheerd via het admin-paneel (`/admin/quizzes`).
-   **Bulk Import**: Het is mogelijk om meerdere quizzen of vragen tegelijk te importeren door een JSON-bestand te uploaden/plakken dat voldoet aan de hierboven beschreven structuur. Dit is de meest efficiënte manier om content te beheren.

Deze documentatie zou moeten helpen bij het creëren en beheren van effectieve en consistente quizzen voor de AyoSinau-applicatie.
