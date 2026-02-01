# Admin Data Tools Handleiding

Dit document beschrijft de functionaliteiten die beschikbaar zijn in het Admin-paneel onder "Data Tools" en andere gerelateerde tools zoals de TTS Generator. Deze tools zijn essentieel voor het beheer, onderhoud en de uitbreiding van de content van de applicatie.

---

## 1. Data Tools Pagina (`/admin/data-tools`)

Deze pagina centraliseert verschillende krachtige functies voor databasebeheer en contentvalidatie.

### a. Dialogue Audio Validator
-   **Doel**: Controleren van `<audio>` tags in de Markdown-content van de lessen en het opsporen van ontbrekende dialoogbestanden. Dit garandeert dat alle luisteroefeningen in de lessen correct functioneren.
-   **Werkwijze**:
    1.  Klik op de knop **"Scan Database Lessen"**.
    2.  De tool doorloopt alle **gepubliceerde** lessen in de database.
    3.  Het zoekt specifiek naar HTML `<audio>` tags binnen de Markdown-blokken van elke les.
    4.  Voor elke gevonden `src`-path (bv. `/audio/dialogs/m01-l01-d1.mp3`) wordt gecontroleerd of het corresponderende audiobestand daadwerkelijk bestaat op de server (in de `public` map).
    5.  **Resultaat**: Een lijst van alle dialoogfragmenten waarvoor het audiobestand ontbreekt. Voor de context wordt ook de bijbehorende dialoogtekst uit de les getoond.
-   **Actie**: U kunt de ontbrekende bestanden selecteren en deze in bulk genereren met de ingebouwde Text-to-Speech (TTS) tool. Dit versnelt het proces van het repareren van content aanzienlijk.

### b. Word Audio Path Validator
-   **Doel**: Controleren of de `audioJavanese` paden in de `Word` tabel correct zijn en of de bijbehorende audiobestanden daadwerkelijk bestaan in de `public/audio/uploads` map.
-   **Werkwijze**:
    1.  Klik op **"Valideer Woorden Paden"**.
    2.  De tool toont een lijst van alle problemen, gecategoriseerd als:
        -   `MISSING_FILE`: Het pad in de database klopt, maar het bestand bestaat niet.
        -   `INCORRECT_PATH`: Het bestand bestaat wel, maar het pad in de database is incorrect.
    3.  Voor `INCORRECT_PATH` problemen kunt u op "Herstel" klikken om het pad in de database automatisch te corrigeren.
-   **Belangrijk**: Deze tool is essentieel om te zorgen dat alle audiofragmenten bij de woorden correct werken.

### c. Find Duplicate Words
-   **Doel**: De `Word` tabel opschonen door dubbele woorden te identificeren. Dit helpt om de consistentie en kwaliteit van de vocabulaire-database te garanderen.
-   **Definitie van een duplicaat**: Twee of meer woorden die exact dezelfde `javanese` én `dutch` term hebben (hoofdletterongevoelig).
-   **Werkwijze**:
    1.  Klik op de knop **"Find Duplicates"**.
    2.  Het systeem haalt alle woorden op en groepeert ze op basis van een genormaliseerde, hoofdletterongevoelige sleutel (bv. "kucing|kat").
    3.  **Resultaat**: Een lijst van alle groepen die meer dan één woord bevatten. Dit zijn de duplicaten.
-   **Actie**: Voor elk gedupliceerd woord wordt de unieke ID en een directe "Edit Word" knop getoond. Hiermee kunt u direct naar de bewerkpagina navigeren om het duplicaat te corrigeren of te verwijderen.

### d. Generate Seed Script
-   **Doel**: Een compleet TypeScript-script (`prisma/seed.ts`) genereren op basis van de *huidige staat* van de database.
-   **Gebruik**:
    1.  Klik op de knop "Generate Seed Script".
    2.  Het script verschijnt in het tekstvak.
    3.  Kopieer het script.
    4.  Plak de inhoud in je `prisma/seed.ts` bestand om een back-up te maken van de huidige databasestaat of om een nieuwe database te vullen met identieke data.
    5.  Draai `npx prisma db seed` om het script uit te voeren.
-   **Belangrijk**: Dit is een krachtige tool om een "snapshot" van je data te maken, ideaal voor het opzetten van een nieuwe ontwikkelomgeving of het herstellen van data.

---

## 2. TTS Generator Pagina (`/admin/tts-generator`)

Dit is een zelfstandige tool voor het snel genereren van audio.

-   **Doel**: Tekst omzetten naar spraak (audio) met behulp van een externe Text-to-Speech API.
-   **Gebruik**:
    1.  Voer de gewenste tekst in (bv. een Javaans woord of een zin).
    2.  Selecteer de juiste taal en een stem.
    3.  Klik op "Genereer Audio".
    4.  Je kunt het resultaat direct beluisteren en downloaden.
    5.  **Belangrijk**: Kopieer de bestandsnaam van het gedownloade bestand en gebruik deze om het `audioJavanese` veld in te vullen op de "Edit Word" pagina. Zorg ervoor dat je het bestand uploadt naar de `public/audio/uploads/` map.
-   **Tip**: Je kunt vanaf de "Edit Word" pagina direct naar de TTS Generator navigeren, waarbij de Javaanse term al is ingevuld.

Deze tools samen vormen een krachtig systeem om de content van AyoSinau efficiënt en met hoge kwaliteit te beheren.