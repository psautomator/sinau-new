# Gids voor het Bewerken van Lesinhoud

Dit document beschrijft hoe beheerders en content-editors de inhoud van een les kunnen bewerken via de admin-omgeving. Het proces is ontworpen om flexibel en gebruiksvriendelijk te zijn, dankzij een modulair "blokken"-systeem.

---

## 1. Twee Stappen voor het Bewerken van een Les

Het bewerken van een les is opgesplitst in twee delen:

1.  **Metadata Bewerken**: Op de hoofdpagina (`/admin/lessons/[lessonId]/edit`) pas je de algemene gegevens aan, zoals de **titel**, **beschrijving**, en de **module** waartoe de les behoort.
2.  **Inhoud Bewerken**: Via de knop **"Edit Lesson Content"** navigeer je naar de speciale content-editor (`/admin/lessons/[lessonId]/edit-content`). Hier wordt de daadwerkelijke lesinhoud samengesteld.

---

## 2. De Content-Editor: Een Blok-gebaseerd Systeem

De kern van de content-editor is een visuele weergave van de `sectionsJson`-array uit de database. Elk element in deze array wordt getoond als een apart, beheersbaar contentblok.

### a. Overzicht en Beheer

-   **Lijst van Blokken**: Je ziet een lijst van alle huidige contentblokken in de les, gesorteerd op volgorde. Elk blok toont zijn type (bv. `MARKDOWN`, `FLASHCARD_SET`) en een korte samenvatting.
-   **Blokken Toevoegen**: Bovenaan de pagina vind je knoppen om nieuwe blokken toe te voegen, zoals `+ Tekstblok`, `+ Flashcards`, `+ Quiz`, etc.
-   **Volgorde Wijzigen**: Elk blok heeft pijltjes (omhoog/omlaag) waarmee je de positie in de les eenvoudig kunt aanpassen.
-   **Verwijderen**: Met een prullenbak-icoon kun je een blok permanent uit de les verwijderen.

### b. De `BlockEditorDialog`: Het Bewerkingsvenster

Wanneer je op de "Bewerk"-knop van een blok klikt, opent een dialoogvenster dat specifiek is afgestemd op het type blok:

-   **Voor `MARKDOWN`-blokken**:
    -   Een groot tekstveld met twee tabbladen: "Bewerken" (voor het schrijven van Markdown) en "Preview" (om direct het visuele resultaat te zien, inclusief styling).
    -   Een **AI-assistent** knop ("Controleer Tekst (AI)") die de tekst analyseert en suggesties doet voor verbeteringen in grammatica en stijl.

-   **Voor `FLASHCARD_SET`-blokken**:
    -   Een zoekveld en een doorzoekbare, scrollbare lijst van **alle** woorden in de database.
    -   Je kunt eenvoudig de woorden die je in deze set wilt opnemen aan- of uitvinken.

-   **Voor `QUIZ_LINK`-blokken**:
    -   Een dropdown-menu dat alle bestaande quizzen in het systeem toont.
    -   Je selecteert simpelweg de quiz die je aan dit deel van de les wilt koppelen.

-   **Voor `EMBEDDED_MEDIA`-blokken**:
    -   Velden voor een titel, een URL, en een keuzemenu voor het mediatype (YouTube of Audio URL).

### c. Opslaan van Wijzigingen

Dit is een belangrijk concept om te begrijpen:

1.  **Lokale Wijzigingen**: Het aanpassen van een blok in de dialoog, het toevoegen van een nieuw blok, of het wijzigen van de volgorde werkt in eerste instantie alleen *in je browser*. De wijzigingen zijn nog niet opgeslagen in de database.
2.  **Definitief Opslaan**: Pas wanneer je op de hoofdknop **"Alle Lesinhoud Blokken Opslaan"** onderaan de pagina klikt, worden je wijzigingen doorgevoerd.
    -   Deze knop roept de `updateLessonContentAction` Server Action aan.
    -   De volledige, bijgewerkte array van contentblokken wordt naar de server gestuurd.
    -   De server valideert de data en overschrijft het `sectionsJson`-veld in de database voor de betreffende les.

Dit systeem zorgt ervoor dat je rustig en zonder risico de les volledig kunt herschikken en bewerken, en pas als je tevreden bent, sla je alles in één keer definitief op.
