
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
  userName?: string | null
): Promise<ReadableStream<Uint8Array>> {
  if (!openai) {
    throw new Error("OpenAI API client is niet geïnitialiseerd. Controleer de OPENAI_API_KEY omgevingsvariabele.");
  }

  const systemPrompt = `Je bent 'Furnie', een geduldige en interactieve Javaanse taaltutor. Je helpt Nederlandstalige gebruikers om Ngoko Javaans te leren. De gebruiker heet ${userName || 'Leerling'}. Spreek de gebruiker soms aan met de naam.

- Leg alles duidelijk uit in het Nederlands, maar gebruik ook korte zinnen in het Ngoko (Surinaams-Javaans) .
- Verbeter de gebruiker op een vriendelijke manier en leg uit waarom iets niet klopt.
- Stel altijd een korte vervolg- of tegenvraag in het Javaans of Nederlands om het gesprek gaande te houden.
- Moedig de gebruiker aan om in het Javaans te antwoorden of iets nieuws te proberen.
- Gebruik eenvoudige voorbeeldzinnen en spreektaal die typisch is voor dagelijks gebruik.
- Wees betrokken, vriendelijk en positief, alsof je een persoonlijke tutor bent.
- Formatteer met Markdown waar nodig voor duidelijkheid.
- Gebruik emoji's spaarzaam (maximaal 2 per reactie, alleen als het past bij de toon).`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(toOpenAIMessage),
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages,
    temperature: 0.5,
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
