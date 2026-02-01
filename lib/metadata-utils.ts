/**
 * Utility to extract level and language style from lesson content and description.
 * This is safe to use in both client and server components as it only uses regex.
 */
export function extractLessonMetadata(data: { description?: string, content?: any }) {
    const levelPattern = /Niveau[:\s*]+([A-C][1-2](?:\s*\([^)]+\))?)/i;
    const stylePattern = /Taalstijl[:\s*]+([a-z\/\-\s]+)/i;

    let detectedLevel: string | null = null;
    let detectedStyle: string | null = null;

    const extractFromText = (text: string) => {
        const levelMatch = text.match(levelPattern);
        const styleMatch = text.match(stylePattern);
        return {
            level: levelMatch ? levelMatch[1].trim() : null,
            style: styleMatch ? styleMatch[1].trim() : null
        };
    };

    // 1. Search in description
    if (data.description) {
        const descMeta = extractFromText(data.description);
        if (descMeta.level) detectedLevel = descMeta.level;
        if (descMeta.style) detectedStyle = descMeta.style;
    }

    // 2. Search in content (Markdown blocks)
    if (data.content && data.content.sections) {
        for (const section of data.content.sections) {
            if (section.type === 'MARKDOWN' && section.content?.markdownText) {
                const blockMeta = extractFromText(section.content.markdownText);
                if (blockMeta.level && (!detectedLevel || detectedLevel === 'A1')) detectedLevel = blockMeta.level;
                if (blockMeta.style && (!detectedStyle || detectedStyle === 'Ngoko' || detectedStyle === 'Mixed')) detectedStyle = blockMeta.style;
            }
        }
    }

    // Normalization
    if (detectedLevel) {
        if (detectedLevel.includes('A2')) detectedLevel = 'A2';
        else if (detectedLevel.includes('B1')) detectedLevel = 'B1';
        else if (detectedLevel.includes('B2')) detectedLevel = 'B2';
        else if (detectedLevel.includes('C1')) detectedLevel = 'C1';
        else if (detectedLevel.includes('A1')) detectedLevel = 'A1';
    }

    if (detectedStyle) {
        const low = detectedStyle.toLowerCase();
        if (low.includes('krama') && low.includes('ngoko')) detectedStyle = 'Mixed';
        else if (low.includes('krama')) detectedStyle = 'Krama';
        else if (low.includes('ngoko')) detectedStyle = 'Ngoko';
        else if (low.length < 2) detectedStyle = null; // Junk
    }

    return {
        level: detectedLevel,
        languageStyle: detectedStyle
    };
}
