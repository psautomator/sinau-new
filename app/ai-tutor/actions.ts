'use server';

import { openai } from '@/lib/openai';
import { type ChatCompletionMessageParam } from 'openai/resources/chat';

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

function toOpenAIMessage(msg: ChatMessage): ChatCompletionMessageParam {
    return {
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content,
    };
}

export async function streamTutorResponse(
    history: ChatMessage[],
    userName?: string | null,
    scenario?: string
): Promise<ReadableStream<Uint8Array>> {
    if (!openai) {
        throw new Error("OpenAI API client is niet geïnitialiseerd. Controleer de OPENAI_API_KEY omgevingsvariabele.");
    }

    // 1. Fetch Scenario Data from DB or Defaults
    let scenarioData = await (prisma as any).aITutorScenario.findUnique({
        where: { slug: scenario || 'kennismaking' }
    });

    if (!scenarioData) {
        scenarioData = DEFAULT_SCENARIOS.find(s => s.slug === (scenario || 'kennismaking'));
    }

    const scenarioText = scenarioData ? `De context is: ${scenarioData.title}. ${scenarioData.description}` : "";
    const moduleId = scenarioData?.moduleId || null;

    // 2. Fetch User Progress
    const progress = await getUserProgress();

    // 3. Fetch Vocabulary
    let officialVocab = "";
    if (moduleId) {
        const words = await prisma.vocabulary.findMany({
            where: { moduleId },
            take: 15,
            select: { word: true, translation: true, exampleJavanese: true }
        });
        officialVocab = words.map(w => `- ${w.word} (${w.translation})${w.exampleJavanese ? ': ' + w.exampleJavanese : ''}`).join('\n');
    }

    const systemPrompt = `Je bent 'Furnie', een geduldige en interactieve Javaanse taaltutor. Je helpt Nederlandstalige gebruikers om Ngoko Javaans te leren. De gebruiker heet ${userName || progress.name || 'Leerling'}.

### Gebruikersvoortgang:
- Niveau: ${progress.level}
- XP: ${progress.xp}
- Voltooide lessen: ${progress.completedLessons}
(Pas je complexiteit aan op basis van dit niveau. Als de gebruiker beginner is, houd het dan simpel.)

${scenarioText}

### Officiële Woordenschat (Prioriteit):
Gebruik bij voorkeur deze woorden en zinnen uit onze database:
${officialVocab || "Nog geen specifieke lijst geladen."}

### Belangrijke Regels:
1. **Topic Steering**: Als de gebruiker totaal van het onderwerp afwijkt (bijvoorbeeld over auto's praten in een Warung), antwoord dan kort en beleefd, maar stuur het gesprek DAARNA direct terug naar het scenario. Zeg iets als: "Dat is interessant, maar zullen we weer verder gaan met [Scenario]?"
2. **Consistentie**: Als de gebruiker een van jouw suggesties kiest, mag je deze NOOIT verbeteren of afkeuren. Het is dan per definitie 100% goed.
3. **Uitleg**: Leg alles duidelijk uit in het Nederlands, maar gebruik ook korte zinnen in het Ngoko.
4. **Opmaak**: Noem Javaanse woorden **dikgedrukt**. Sluit ALTIJD af met <suggestions>["Suggestie A", "Suggestie B"]</suggestions>.
5. **Scenario-Focus**: Blijf strikt binnen het scenario (${scenario || 'Algemeen'}).`;

    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(toOpenAIMessage),
    ];

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Faster and cheaper for tutoring
        messages,
        temperature: 0.7,
        stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            for await (const chunk of response) {
                const delta = chunk.choices[0]?.delta?.content;
                if (delta) {
                    controller.enqueue(encoder.encode(delta));
                }
            }
            controller.close();
        },
    });

    return stream;
}

export async function translateMessage(text: string): Promise<string> {
    if (!openai) return "Translation unavailable";

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "Vertaal de volgende Javaanse tekst naar natuurlijk Nederlands. Geef ALLEEN de vertaling terug." },
            { role: "user", content: text }
        ],
        temperature: 0.3
    });

    return response.choices[0]?.message?.content || "Translation error";
}

import { prisma } from '@/dal';
import { MOCK_USER_ID } from '@/lib/mock-auth';

export async function saveWordToLibrary(java: string, dutch: string) {
    // 1. Check if word exists in general vocabulary
    let word = await prisma.vocabulary.findFirst({
        where: {
            word: { equals: java, mode: 'insensitive' }
        }
    });

    // 2. If not, create it
    if (!word) {
        word = await prisma.vocabulary.create({
            data: {
                word: java,
                translation: dutch,
                category: "AI Tutor",
                formality: "NGOKO"
            }
        });
    }

    // 3. Link to user via SRS
    await prisma.userWordSpacedRepetition.upsert({
        where: {
            userId_wordId: {
                userId: MOCK_USER_ID,
                wordId: word.id
            }
        },
        create: {
            userId: MOCK_USER_ID,
            wordId: word.id,
            easinessFactor: 2.5,
            interval: 0,
            repetitions: 0,
            nextReviewDate: new Date()
        },
        update: {} // Already exists
    });

    return { success: true, wordId: word.id };
}

const DEFAULT_SCENARIOS = [
    {
        id: 'default-intro',
        slug: 'kennismaking',
        title: 'Kennismaking',
        description: 'Leer jezelf voorstellen en begroet Furnie in het Ngoko.',
        icon: 'waving_hand',
        category: 'Recommended',
        initialMessage: "Halo! Sapa jenengmu? (Hallo! Wat is je naam?) Laten we beginnen met een korte kennismaking in het Ngoko Javaans!",
        initialSuggestions: ["Jenengku Leerling.", "Dino iki kabare apik!", "Sapa jenengmu?"],
        order: -10,
        published: true
    },
    {
        id: 'default-warung',
        slug: 'warung',
        title: 'Eten Bestellen',
        description: 'Oefen met het bestellen van eten en drinken in een Javaanse Warung.',
        icon: 'restaurant',
        category: 'Recommended',
        initialMessage: "Sugeng rawuh! Je bent in een gezellige Warung. Er staat veel lekkers op het menu. Wat wil je bestellen?",
        initialSuggestions: ["Aku njaluk sega goreng siji.", "Mangan apa sing enak?", "Njaluk ngombe es teh."],
        order: -9,
        published: true
    },
    {
        id: 'default-market',
        slug: 'markt',
        title: 'Boodschappen doen',
        description: 'Koop vers fruit en groenten op een drukke Javaanse pasar.',
        icon: 'shopping_basket',
        category: 'Explore',
        initialMessage: "Mampir, mampir! Het is druk op de markt vandaag. Er is vers fruit en groenten. Wat heb je nodig?",
        initialSuggestions: ["Pira regane jeruk iki?", "Aku tuku gedhang siji sisir.", "Ana apel sing manis?"],
        order: -8,
        published: true
    },
    {
        id: 'default-directions',
        slug: 'wegvragen',
        title: 'De Weg Vragen',
        description: 'Vraag de weg naar bekende plekken in de stad.',
        icon: 'map',
        category: 'Explore',
        initialMessage: "Ben je de weg kwijt? Geen zorgen! Vraag het aan iemand op straat. Waar wil je naartoe?",
        initialSuggestions: ["Ning ngendi omahe Pak Joko?", "Dalan sing neng pasar lewat ngendi?", "Adoh ora seko kene?"],
        order: -7,
        published: true
    }
];

export async function getScenarios() {
    const dbScenarios = await (prisma as any).aITutorScenario.findMany({
        orderBy: { order: 'asc' }
    });

    // Merge defaults with DB scenarios, prioritizing DB if slug matches
    const combined = [...DEFAULT_SCENARIOS];

    dbScenarios.forEach((dbS: any) => {
        const index = combined.findIndex(s => s.slug === dbS.slug);
        if (index !== -1) {
            combined[index] = dbS; // Override default with DB if same slug
        } else {
            combined.push(dbS);
        }
    });

    return combined.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function saveScenario(data: any) {
    if (data.id) {
        return await (prisma as any).aITutorScenario.update({
            where: { id: data.id },
            data
        });
    } else {
        return await (prisma as any).aITutorScenario.create({
            data
        });
    }
}

export async function deleteScenario(id: string) {
    return await (prisma as any).aITutorScenario.delete({
        where: { id }
    });
}

export async function getUserProgress(userId: string = MOCK_USER_ID) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            stats: true,
            progress: true,
        }
    });

    const completedLessons = user?.progress?.length || 0;
    const level = user?.stats?.level || user?.level || 1;
    const xp = user?.stats?.xp || user?.xp || 0;

    return {
        level,
        xp,
        completedLessons,
        name: user?.name || "Leerling"
    };
}
