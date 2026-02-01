
# Projectoverzicht: AyoSinau - Javaans voor Nederlanders

## 1. Overzicht

**Naam Applicatie**: AyoSinau: Javaans voor Nederlanders

**Doel**: Het creëren van een boeiende en interactieve webapplicatie die Nederlandstaligen helpt de Javaanse taal te leren en de cultuur te begrijpen.

**Kernfunctionaliteiten (huidige implementatiestatus):**

*   **Visuele Flashcards**: Geïmplementeerd met interactief omdraaien. Beschikt over client-side filtermogelijkheden op zoekterm, categorie en niveau, plus een willekeurige volgorde optie.
*   **Woordenschat Quizzen**: Diverse dynamische vraagtypen (inclusief Multiple Choice, Invuloefening en Sorteervraag) met directe feedback en scoring, afgehandeld via Server Actions.
*   **Interactieve Uitspraakoefeningen**: Een herontworpen, gebruiksvriendelijke oefenpagina (`/pronunciation`) waar gebruikers hun eigen uitspraak kunnen opnemen en directe AI-gestuurde feedback met een score van 0-100 ontvangen.
*   **Spaced Repetition Systeem (SRS)**: Speciale `/review`-pagina haalt woorden op die herhaald moeten worden voor de ingelogde gebruiker. Inclusief audio, notities en het opslaan van voortgang.
*   **AI Conversatie Tutor**: Een OpenAI-aangedreven chatbot op `/conversation` voor interactieve spreek- en schrijfvaardigheidsoefeningen.
*   **Admin- & Content Editor Rollen**:
    *   **Admin Dashboard**: Toont dynamische statistieken en een "Publicatie Wachtrij" voor ongepubliceerde content.
    *   **Contentbeheer (CRUD)**: Functionele pagina's voor het beheren van Modules, Lessen, Woorden en Quizzen, voornamelijk afgehandeld via **Server Actions** die een centrale Data Access Layer (DAL) aanroepen.
    *   **AI & Data Tools**: Een verzameling tools voor contentbeheer, waaronder een **TTS Generator**, een **Duplicatenvinder** en een **Seed Script Generator**. Voor een gedetailleerde walkthrough, zie de **[Admin Data Tools Handleiding](./projects/admin-data-tools-guide.md)**.
    *   **Gebruikersbeheer** & **Feedbackbeheer**.
*   **Dynamisch Gebruikersdashboard**: Uitgebreid dashboard met XP, level, leer-streak, achievements, klassement en voortgang.
*   **Leermodules & Lessen**: Gebruikers navigeren door modules en lessen, markeren ze als voltooid en maken privénotities. De lesinhoud is flexibel opgebouwd met dynamische secties (Markdown, flashcard-sets, quiz-links, **ingebedde YouTube/audio**). Een template-structuur en seed-script maken het mogelijk om content efficiënt vanuit bestanden te beheren (zie de **[Content Structuur Handleiding](./projects/content-structure-and-import.md)**).
*   **Gebruikersprofiel**: Gebruikers kunnen hun profiel bekijken, hun weergavenaam wijzigen en hun voorkeursthema voor de applicatie selecteren.
*   **Prestatiesysteem (Achievements)**: Dynamisch systeem om prestaties toe te kennen op basis van gebruikersacties.
*   **Authenticatie & Thema's**: Inloggen met Google, waarbij gebruikersgegevens worden opgeslagen in een lokale database. Meerdere UI-thema's beschikbaar, met gebruikersvoorkeur opgeslagen in hun profiel.

**Technologie Stack:**
*   **Framework**: Next.js (AppRouter, Server Components, Server Actions)
*   **UI Bibliotheek**: React
*   **Componenten**: ShadCN UI (aangepast)
*   **Styling**: Tailwind CSS (with theme support)
*   **Database**: Neon(PostgreSQL)
*   **ORM**: Prisma
*   **Authenticatie**: Supabase Auth (Google & Email/Password)
*   **AI & Externe Services**: Genkit (Text-to-Speech, Proofread Text, Pronunciation Evaluation), OpenAI (voor conversatie-tutor). *Opmerking: AI-beeldgeneratie is niet geïmplementeerd vanwege regionale EU-beperkingen op de onderliggende service.*
*   **State Management**: Ingebouwde React state, `useToast`, `AuthContext`.

## 2. Huidige Status van Belangrijke Pagina's/Features

*   **Homepage (`/`)**: Hero-sectie, uitgelichte features.
*   **Dashboard (`/dashboard`)**: Uitgebreid, data uit DB via Server Action.
*   **Modules (`/modules`, `/modules/[moduleId]`)**: Lijst- en detailpagina's. Data uit DB.
*   **Lessen (`/modules/[moduleId]/lessons/[lessonId]`)**: Dynamische contentsecties. Data uit DB.
*   **Flashcards (`/flashcards`)**: Interactieve viewer met dynamische filtering.
*   **Quizzen (`/quizzes`)**: Lijst en quiz-interface.
*   **Review (`/review`)**: Spaced Repetition Systeem met audio en notities.
*   **Pronunciation (`/pronunciation`)**: Gebruikersgerichte oefenpagina met AI-scoring.
*   **Grammar (`/grammar`)**: Toont lessen uit "Grammatica" modules.
*   **Profile (`/profile`)**: Gebruikersinfo, thema-selectie, naam bewerken.
*   **Admin (`/admin/*`)**: Alle pagina's zijn functioneel en gebruiken Server Actions voor alle mutaties en data-ophaling.

## 3. Suggesties voor Toekomstige Implementatie

*   **Volledige Media Uploads**: Implementeer een systeem voor directe upload van audio/afbeeldingsbestanden in het admin-paneel, in plaats van afhankelijk te zijn van externe URLs.
*   **Menselijke Audio Opnames**: Integreer een workflow voor het toevoegen van authentieke, door mensen ingesproken audio voor woordenschat.
*   **Verbeterd SRS**: Breid het Spaced Repetition Systeem uit met meer gebruikersinstellingen en feedbackopties.
*   **Gedetailleerde Toegangscontrole (RBAC)**: Implementeer een op permissies gebaseerd systeem bovenop de bestaande rollen (ADMIN, CONTENT_EDITOR) voor nauwkeuriger beheer van acties.

Dit overzicht zou een goed startpunt en een roadmap moeten bieden voor verdere ontwikkeling!
