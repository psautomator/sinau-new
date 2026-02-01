# Prisma Schema Cheatsheet voor AyoSinau

Dit document geeft een gedetailleerd overzicht van het `schema.prisma` bestand dat wordt gebruikt in de AyoSinau-applicatie. Het beschrijft elk model, de velden, en de relaties ertussen.

## 1. Overzicht

Het schema is ontworpen om alle aspecten van de leerapplicatie te ondersteunen, van gebruikersbeheer en voortgang tot de content van lessen en quizzen.

**Belangrijkste Entiteiten:**
-   **Gebruikers & Voortgang**: `User`, `UserProgressAchievement`, `UserLessonProgress`, `UserWordSpacedRepetition`, `UserXpEvent`.
-   **Content**: `Module`, `Lesson`, `Word`, `Quiz`.
-   **Interactie & Feedback**: `UserLessonNote`, `Feedback`.

---

## 2. Model Uitleg

Hieronder volgt een gedetailleerde beschrijving van elk model in het `schema.prisma`-bestand.

### `User`
-   **Doel**: Slaat de kerninformatie van elke gebruiker op, gesynchroniseerd met Firebase Authentication.
-   **Velden**:
    -   `id`: Unieke identifier, afkomstig van Firebase Auth UID.
    -   `email`: Uniek e-mailadres van de gebruiker.
    -   `name`: Weergavenaam van de gebruiker.
    -   `photoURL`: URL naar de profielfoto.
    -   `role`: De rol van de gebruiker (`USER`, `CONTENT_EDITOR`, `ADMIN`).
    -   `themePreference`: Het door de gebruiker gekozen UI-thema.
    -   `xp`, `level`: Voortgangsstatistieken.
    -   `learningStreak`, `lastActivityAt`: Voor het bijhouden van de dagelijkse leer-streak.
    -   `*Count`: Diverse tellers om snelle queries naar voortgang mogelijk te maken.

### `Module` & `Lesson`
-   **Doel**: Structureren de leerinhoud hiërarchisch. Een `Module` bevat meerdere `Lesson`-objecten.
-   **Velden `Module`**:
    -   `title`, `description`, `level`, `order`, `isPublished`.
-   **Velden `Lesson`**:
    -   Vergelijkbaar met `Module`, maar bevat ook `sectionsJson`.
    -   `sectionsJson`: Een `Json` veld dat een array van contentblokken bevat (Markdown, Flashcard-sets, etc.). Dit maakt de lesopbouw zeer flexibel.

### `Word`
-   **Doel**: Slaat individuele Javaanse woorden op met hun vertalingen en metadata. Dit is het hart van de vocabulaire-oefeningen.
-   **Velden**:
    -   `javanese`, `dutch`: Het kernpaar voor de vertaling.
    -   `audioJavanese`, `image`, `aiHint`: Media-assets voor de flashcards.
    -   `category`, `level`, `formality`, `tags`: Metadata voor filteren en categoriseren.
    -   `exampleSentenceJavanese/Dutch`, `notes`: Extra context voor de leerling.

### `Quiz`
-   **Doel**: Slaat een complete quiz op, inclusief de vragen, als een enkel `Json` object.
-   **Velden**:
    -   `title`, `description`, `isPublished`.
    -   `questions`: Een `Json` veld met een array van vraagobjecten. Elk object bevat de vraagtekst, het type (bv. `MULTIPLE_CHOICE`), de opties en het juiste antwoord.

### `UserProgressAchievement`
-   **Doel**: Een koppeltabel die bijhoudt welke gebruiker welke prestatie heeft ontgrendeld.
-   **Relatie**: Verbindt `User` en `Achievement`.

### `Achievement`
-   **Doel**: Definieert de vaste set van prestaties die in de app kunnen worden verdiend.
-   **Velden**: `code`, `name`, `description`, `iconName`, `xpValue`.

### `UserLessonProgress`
-   **Doel**: Houdt de voortgang van een gebruiker per les bij (bv. `IN_PROGRESS`, `COMPLETED`).
-   **Relatie**: Verbindt `User` en `Lesson`.

### `UserWordSpacedRepetition`
-   **Doel**: Slaat de data op voor het Spaced Repetition System (SRS).
-   **Velden**: `interval`, `easinessFactor`, `repetitions`, `nextReviewDate`.
-   **Relatie**: Verbindt `User` en `Word`.

### `UserXpEvent`
-   **Doel**: Logt elke keer dat een gebruiker XP verdient, met een beschrijving van de actie. Handig voor gamification en het volgen van activiteit.

### `UserLessonNote` & `Feedback`
-   **Doel**: Slaan door gebruikers gegenereerde content op.
-   `UserLessonNote`: Persoonlijke notities per les.
-   `Feedback`: Algemene feedback over de app.

---

## 3. Relaties Overzicht

-   **Een-op-veel**:
    -   `Module` -> `Lesson`: Een module heeft veel lessen.
    -   `User` -> `UserProgressAchievement`, `UserLessonProgress`, etc.: Een gebruiker heeft veel voortgangsrecords.
-   **Veel-op-veel (impliciet via koppeltabel)**:
    -   `User` <-> `Achievement` via `UserProgressAchievement`.
-   **Referenties in `Json`**:
    -   `Lesson.sectionsJson` kan verwijzen naar `Word.id`'s (in flashcard-sets) en `Quiz.id`'s (in quiz-links). Deze relaties worden niet op database-niveau afgedwongen maar in de applicatielogica.
