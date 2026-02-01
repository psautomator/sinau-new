# Content Structuur & Import Handleiding

Dit document beschrijft de bestandsgebaseerde structuur die wordt gebruikt voor het beheren van lesmateriaal en hoe dit wordt geïmporteerd in de database via het seed-script.

---

## 1. Overzicht van de Mappenstructuur

Alle content die geïmporteerd kan worden, bevindt zich in de `docs/lesmateriaal/` map. De structuur is hiërarchisch en volgt een duidelijke conventie:

```
docs/
└── lesmateriaal/
    └── module-[module-nummer]-[module-naam-kebab-case]/
        ├── 01-[les-naam].md
        ├── 01-[les-naam].json
        ├── 02-[les-naam].md
        ├── 02-[les-naam].json
        ├── 02-[les-naam]-quiz.json
        └── module.json
```

### Belangrijkste Componenten:

-   **Module Map**: Elke map vertegenwoordigt een module. De naamgeving is belangrijk voor de sortering (bv. `module-1-...`, `module-2-...`).
-   **`module.json`**: Dit bestand definieert de metadata voor de hele module.
-   **Lesbestanden**: Elke les bestaat uit een paar gekoppelde bestanden:
    -   **`.md` bestand**: De hoofdinhoud van de les in Markdown-formaat.
    -   **`.json` bestand**: De woordenlijst die bij die specifieke les hoort.
    -   **`-quiz.json` bestand (optioneel)**: De quizvragen die bij de les horen.

---

## 2. Bestandsdetails

### `module.json`

Dit is het hart van de moduledefinitie. Het bevat de metadata die nodig is om de module in de database aan te maken.

**Voorbeeld `module.json`:**
```json
{
  "title": "Module 1: Kennismaking & Begroeting",
  "description": "Aan het einde van deze module kun je: jezelf voorstellen, essentiële begroetingen gebruiken, en de culturele betekenis van respect begrijpen.",
  "level": "A1"
}
```
-   `title`: De officiële titel van de module.
-   `description`: Een samenvatting van de leerdoelen. Ondersteunt Markdown-opmaak voor lijsten.
-   `level`: Het CEFR-niveau (A1, A2, etc.).

### Les `.md` Bestand

Dit bestand bevat de daadwerkelijke lesinhoud. Het wordt geparseerd door de applicatie om dynamische lespagina's te creëren.

**Kenmerken:**
-   **Markdown**: Gebruik standaard Markdown voor opmaak (titels, lijsten, vetgedrukt, etc.).
-   **YAML Frontmatter (Optioneel)**: Je kunt metadata bovenaan het bestand toevoegen, hoewel de meeste metadata nu uit `module.json` en de bestandsnaam wordt gehaald.
-   **Speciale Componenten**: De Markdown-parser kan worden uitgebreid om speciale componenten te renderen, zoals interactieve audio-elementen (`<audio>`) of quiz-links.

### Les `.json` Bestand (Woordenlijst)

Dit bestand bevat een array van woordobjecten die de vocabulaire voor de bijbehorende les vormen.

**Voorbeeld van een woordobject:**
```json
{
  "javanese": "sugeng rawuh",
  "dutch": "Welkom",
  "aiHint": "welcome handshake",
  "audioJavanese": "/audio/uploads/sugeng_rawuh.mp3",
  "category": "Begroeting",
  "exampleSentenceJavanese": "Sugeng rawuh ing griya kula.",
  "exampleSentenceDutch": "Welkom in mijn huis.",
  "notes": "Een formele en zeer beleefde welkomstgroet.",
  "level": "A1",
  "formality": "KramaInggil",
  "tags": ["begroeting", "formeel"]
}
```
Alle velden zijn optioneel, behalve `javanese` en `dutch`.

### Les `-quiz.json` Bestand

Dit bestand definieert een volledige quiz die aan een les is gekoppeld.

**Kenmerken:**
-   **Structuur**: Bevat een `id`, `title`, `description` en een array van `questions`.
-   **Vraagtypen**: Ondersteunt diverse vraagtypen (`MULTIPLE_CHOICE`, `FILL_IN_THE_BLANK`, etc.).
-   **Koppeling met Woorden**: Quiz-opties kunnen een `wordId` bevatten om te verwijzen naar een specifiek woord in de database, wat diepgaandere feedback mogelijk maakt.

---

## 3. Het Importproces (Seeding)

Het vullen van de database met de content uit deze bestanden gebeurt via een seed-script (`prisma/seed.ts`).

### Hoe het werkt:
1.  **Script Starten**: Je draait het commando `npx prisma db seed`.
2.  **Mappen Scannen**: Het script scant de `docs/lesmateriaal/` map op module-mappen.
3.  **Modules Importeren**: Voor elke modulemap leest het script de `module.json` en maakt (of updateert) een `Module` record in de database.
4.  **Lessen, Woorden & Quizzen Importeren**:
    -   Het script doorloopt alle andere bestanden in de modulemap.
    -   `.md`-bestanden worden gelezen en hun inhoud wordt opgeslagen in het `sectionsJson` veld van het bijbehorende `Lesson` record in de database.
    -   `.json`-bestanden worden geparseerd als woordenlijsten. Elk woord wordt aangemaakt of bijgewerkt in de `Word` tabel.
    -   `-quiz.json`-bestanden worden gelezen en opgeslagen als een `Quiz` record.
5.  **Koppelingen**: Het script zorgt ervoor dat lessen aan de juiste module worden gekoppeld. De koppeling tussen lessen, woorden en quizzen gebeurt dynamisch in de applicatie op basis van de content in het `sectionsJson` veld van de les.

Dit systeem maakt het mogelijk om de content van de cursus direct in de codebase te beheren op een gestructureerde en versie-beheerbare manier.

