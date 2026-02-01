# Gids voor Content Rendering

Dit document beschrijft de architectuur achter de weergave van lespagina's in AyoSinau, met een focus op hoe Markdown-content wordt omgezet in gestylde, interactieve HTML voor de eindgebruiker.

---

## 1. De Anatomie van een Les: `sectionsJson`

De inhoud van een les is niet opgeslagen als één enkel HTML- of Markdown-bestand. In plaats daarvan wordt het gestructureerd als een JSON-array in het `sectionsJson`-veld van het `Lesson`-model in de database. Elk element in deze array is een **contentblok**.

Dit modulaire ontwerp biedt grote flexibiliteit en maakt het mogelijk om verschillende soorten content naadloos te combineren. De belangrijkste bloktypes zijn:

-   **`MARKDOWN`**: Voor alle tekstuele inhoud. Dit omvat dialogen, grammaticale uitleg, culturele notities en algemene paragrafen.
-   **`FLASHCARD_SET`**: Een interactieve flashcard-viewer die wordt gekoppeld aan een specifieke set van `Word`-ID's.
-   **`QUIZ_LINK`**: Een link of ingebedde component die een `Quiz` start.
-   **`EMBEDDED_MEDIA`**: Voor het weergeven van externe media, zoals YouTube-video's of audiobestanden.

Wanneer een lespagina wordt geladen, worden deze blokken in de juiste volgorde, van boven naar beneden, op de pagina gerenderd.

---

## 2. Van Markdown naar HTML: Het Render-Proces

Het omzetten van een `MARKDOWN`-blok naar een visueel aantrekkelijke pagina gebeurt in de volgende stappen:

### Stap 1: Data Ophalen (Server-Side)
-   Wanneer een gebruiker naar een lespagina navigeert (bv. `/modules/1/lessons/1`), wordt de server-component `reference\lessons\[lessonId]\page.tsx` aangeroepen.
-   Deze component haalt via de Data Access Layer (`dal.ts`) de volledige les-entiteit uit de database, inclusief de cruciale `sectionsJson`-array.

### Stap 2: Data Doorgeven aan de Client-Side
-   De opgehaalde lesdata wordt als `prop` doorgegeven aan de client-component: `reference\lessons\[lessonId]\lesson-page-client.tsx`.

### Stap 3: Iteratie en Rendering
-   De `lesson-page-client.tsx` component ontvangt de data en itereert over de `sectionsJson`-array.
-   Met een `switch`-statement wordt voor elk blok het juiste component gerenderd op basis van het `type`-veld.
-   Voor een `MARKDOWN`-blok wordt de `<ReactMarkdown>`-component gebruikt.

### Stap 4: Markdown-conversie met `react-markdown`
-   De `<ReactMarkdown>`-component neemt de `markdownText`-string als input.
-   Het parseert de Markdown-syntax (zoals `## Titel`, `**vet**`, `- lijstitem`, `[link](url)`) en zet deze om naar de corresponderende HTML-tags (`<h2>`, `<strong>`, `<li>`, `<a>`, etc.).

### Stap 5: Styling met `@tailwindcss/typography` (`prose`)
-   De HTML-output van `react-markdown` is ongestyled. Om het eruit te laten zien als een goed opgemaakt document, wordt de `prose`-class van de `@tailwindcss/typography`-plugin gebruikt.
-   Deze class wordt toegevoegd aan de `<div>` of `<CardContent>` die de `<ReactMarkdown>`-component omhult.
-   `prose` past automatisch een prachtige set van stijlen toe:
    -   Correcte marges tussen paragrafen en titels.
    -   Esthetische lettergroottes voor `h1`, `h2`, `p`, etc.
    -   Styling voor lijsten (`ul`, `ol`), blockquotes, en links.
    -   Dit alles zorgt voor een consistente en leesbare weergave zonder handmatige CSS.

---

## 3. De Gebruikte Technologieën

-   **`react-markdown`**: De kernbibliotheek die de conversie van Markdown naar HTML (via React-componenten) uitvoert.
-   **`remark-gfm`**: Een **remark plugin** voor `react-markdown` die ondersteuning toevoegt voor GitHub Flavored Markdown (GFM). Dit is essentieel voor tabellen, doorgehaalde tekst (`~~tekst~~`), en automatische URL-links.
-   **`rehype-raw`**: Een **rehype plugin** die ervoor zorgt dat ruwe HTML-tags binnen de Markdown (zoals `<audio src="..."></audio>` voor dialogen) daadwerkelijk als HTML worden gerenderd in plaats van als platte tekst. Dit is cruciaal voor het insluiten van interactieve elementen.
-   **`@tailwindcss/typography`**: Een officiële Tailwind CSS-plugin die de `prose`-class levert voor het automatisch stylen van blokken met "rijk" tekstuele inhoud.

---

## 4. Belangrijke Bestanden in het Proces

-   **`reference\lessons\[lessonId]\page.tsx`**: De Server Component die de lesdata ophaalt.
-   **`reference\lessons\[lessonId]\lesson-page-client.tsx`**: De Client Component die de render-logica bevat en de `<ReactMarkdown>`-component daadwerkelijk gebruikt.
-   **`reference\data.ts`**: Definieert de TypeScript `types` voor `ContentBlock` en de bijbehorende sub-types.