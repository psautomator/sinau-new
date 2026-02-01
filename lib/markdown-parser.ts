/**
 * Markdown Parser for Lesson Content
 * 
 * Parses markdown lesson files into structured lesson data with:
 * - Extracted description from ## 📜 Beschrijving
 * - Sections for each heading
 * - Special handling for cultural notes
 */

interface SectionContent {
    title?: string;
    markdownText?: string;
    rawMarkdown?: string;
    wordIds?: string[];
    quizId?: string;
    quizSlug?: string;
}

interface ParsedLesson {
    description: string;
    level?: string;
    languageStyle?: string;
    sections: Section[];
}

export interface Section {
    id: string;
    type: 'MARKDOWN' | 'FLASHCARD_SET' | 'QUIZ_LINK' | 'CULTURAL_INSIGHT';
    order: number;
    content: SectionContent;
}

/**
 * Parse a markdown lesson file into structured data
 */
export function parseMarkdownLesson(markdown: string): ParsedLesson {
    const lines = markdown.split('\n');
    let description = '';
    const sections: Section[] = [];
    let currentSection: { title: string; content: string[] } | null = null;
    let order = 1;
    let level: string | undefined;
    let languageStyle: string | undefined;
    let hasSeenMetadata = false;

    // Cultural note token
    const culturalToken = '### 🌱 Samenvatting & Cultuurreflectie';
    let inCulturalSection = false;
    let culturalContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 0. Metadata Extraction (e.g., **Niveau:** A1 (Beginner), **Taalstijl:** Ngoko / Krama)
        if (!line.startsWith('## ') && !line.startsWith('### ') && !currentSection && sections.length === 0) {
            // Check for metadata line patterns
            const levelMatch = line.match(/\*\*Niveau:\*\*\s*(.+?)(,|$)/);
            const styleMatch = line.match(/\*\*Taalstijl:\*\*\s*(.+?)(,|$)/);

            if (levelMatch || styleMatch) {
                if (levelMatch) level = levelMatch[1].trim();
                if (styleMatch) languageStyle = styleMatch[1].trim();
                hasSeenMetadata = true;
                continue; // Skip adding this as content
            }

            // Ignore empty lines at start
            if (!line.trim()) continue;

            // Only treat as intro if it's substantial text AND we haven't just seen metadata
            if (!hasSeenMetadata) {
                currentSection = { title: "Lesson Intro", content: [line] };
            }
            continue;
        }

        // 2. Extract description from ## 📜 Beschrijving (and skip header + content as section)
        if (line.startsWith('## 📜 Beschrijving') || line.startsWith('## Beschrijving')) {
            // Save previous section if exists
            if (currentSection) {
                sections.push(createSection(currentSection, order++));
                currentSection = null;
            }

            // Get the next lines as description until next heading
            for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim();
                if (nextLine.startsWith('## ') || nextLine.startsWith('### ')) {
                    i = j - 1;
                    break;
                }
                if (nextLine) {
                    if (description) description += " " + nextLine;
                    else description = nextLine;
                    i = j;
                }
            }
            continue;
        }

        // 3. Cultural section special handling
        if (line.trim() === culturalToken) {
            if (currentSection) {
                sections.push(createSection(currentSection, order++));
                currentSection = null;
            }
            inCulturalSection = true;
            culturalContent = [line];
            continue;
        }

        if (inCulturalSection) {
            if (line.match(/^###?\s+/)) { // Stop cultural section on any heading
                if (culturalContent.length > 0) {
                    sections.push({
                        id: `section-${order}`,
                        type: 'MARKDOWN',
                        order: order++,
                        content: {
                            title: 'Samenvatting & Cultuurreflectie',
                            markdownText: culturalContent.join('\n')
                        }
                    });
                    culturalContent = [];
                }
                inCulturalSection = false;
                // Don't continue, let the code below handle the new heading
            } else {
                culturalContent.push(line);
                continue;
            }
        }

        // 4. Detect section headings (## or ###)
        if (line.match(/^###?\s+/)) {
            if (currentSection) {
                sections.push(createSection(currentSection, order++));
            }

            const title = line.replace(/^###?\s+/, '').trim();
            currentSection = { title, content: [line] };
            continue;
        }

        // 5. Add content to current section
        if (currentSection) {
            currentSection.content.push(line);
        }
    }

    // Save last section
    if (currentSection) {
        sections.push(createSection(currentSection, order++));
    }

    // Cultural note fallback
    if (inCulturalSection && culturalContent.length > 0) {
        sections.push({
            id: `section-${order}`,
            type: 'MARKDOWN',
            order: order++,
            content: {
                title: 'Samenvatting & Cultuurreflectie',
                markdownText: culturalContent.join('\n')
            }
        });
    }

    // Final Fallback
    if (sections.length === 0 && markdown.trim()) {
        sections.push({
            id: `section-${order}`,
            type: 'MARKDOWN',
            order: order++,
            content: {
                title: 'Lesson Content',
                markdownText: markdown.trim()
            }
        });
    }

    return { description, sections, level, languageStyle };
}

/**
 * Create a section object from parsed markdown
 */
function createSection(section: { title: string; content: string[] }, order: number): Section {
    let contentLines = section.content;
    const title = section.title;

    // 1. Remove the header line if it's identical to the title (to avoid double headers)
    if (contentLines.length > 0 && contentLines[0].replace(/^###?\s+/, '').trim() === title) {
        contentLines = contentLines.slice(1);
    }

    let content = contentLines.join('\n').trim();

    // 2. Detect quiz link
    if (content.includes('[Verwijzing naar Lesquiz:') || title.includes('Kennischeck')) {
        const quizMatch = content.match(/\[Verwijzing naar Lesquiz:\s*([^\]]+)\]/);

        // Remove the [Verwijzing...] text and redundant intro text from the markdown portion
        const cleanMarkdown = content
            .replace(/\[Verwijzing naar Lesquiz:\s*[^\]]+\]/g, '')
            .replace(/Tijd om te testen wat je hebt geleerd\.?/gi, '')
            .replace(/Tijd om te testen\.\.\./gi, '') // Added this line
            .replace(/Klaar voor de test\??/gi, '') // Also strip this if it appears in markdown, as the card says it
            .trim();

        return {
            id: `section-${order}`,
            type: 'QUIZ_LINK',
            order,
            content: {
                title: title || 'Quiz',
                markdownText: cleanMarkdown,
                quizId: '',
                quizSlug: quizMatch ? quizMatch[1].replace('.json', '').trim() : ''
            }
        };
    }

    // 3. Detect vocabulary section (explicit tables or titles)
    const vocabKeywords = ['Kernvocabulaire', 'Vocabulaire', 'Woordenlijst'];
    const hasVocabTitle = vocabKeywords.some(k => title.includes(k));
    const hasVocabTable = (
        content.includes('| Javaans') ||
        content.includes('| Javanese') ||
        content.includes('| Klank') ||
        content.includes('| Betekenis')
    );

    if (hasVocabTitle || hasVocabTable) {
        // Remove the table from the markdown text since it will be rendered as flashcards
        // This regex looks for lines starting with | and ending with |
        const cleanMarkdown = content.replace(/^\|[\s\S]+?\|$/gm, '').replace(/---/g, '').trim();

        return {
            id: `section-${order}`,
            type: 'FLASHCARD_SET',
            order,
            content: {
                title: title || 'Vocabulary',
                markdownText: cleanMarkdown,
                rawMarkdown: content,
                wordIds: []
            }
        };
    }

    // 4. Detect cultural insight / summary
    if (title.includes('Samenvatting') || title.includes('Cultuurreflectie')) {
        return {
            id: `section-${order}`,
            type: 'CULTURAL_INSIGHT',
            order,
            content: {
                title: title,
                markdownText: content,
                rawMarkdown: content
            }
        };
    }

    // Default: markdown section
    return {
        id: `section-${order}`,
        type: 'MARKDOWN',
        order,
        content: {
            title: title || 'Content',
            markdownText: content
        }
    };
}

/**
 * Extract vocabulary words from markdown table
 */
export function extractVocabularyFromMarkdown(markdown: string): Array<{ word: string; translation: string; context?: string }> {
    const words: Array<{ word: string; translation: string; context?: string }> = [];
    const lines = markdown.split('\n');
    let inTable = false;

    for (const line of lines) {
        if (line.includes('| Javaans | Nederlands |')) {
            inTable = true;
            continue;
        }

        if (line.match(/^\|[-\s|]+\|$/)) {
            continue;
        }

        if (inTable && line.startsWith('|')) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p);
            if (parts.length >= 2) {
                const word = parts[0].replace(/`/g, '').trim();
                const translation = parts[1].trim();
                const context = parts[2]?.trim();

                if (word && translation) {
                    words.push({ word, translation, context });
                }
            }
        } else if (inTable) {
            break;
        }
    }

    return words;
}
