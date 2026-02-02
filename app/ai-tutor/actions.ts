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

    // 1. Fetch Scenario Data from DB
    const scenarioData = await (prisma as any).aITutorScenario.findUnique({
        where: { slug: scenario || 'kennismaking' }
    });

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

export async function getScenarios() {
    return await (prisma as any).aITutorScenario.findMany({
        orderBy: { order: 'asc' }
    });
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
