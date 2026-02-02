
'use server';
/**
 * @fileOverview A Text-to-Speech generation flow using speechgen.io API.
 *
 * - generateSpeech - A function that converts text to a speech audio data URI.
 * - GenerateSpeechInput - The input type for the generateSpeech function.
 * - GenerateSpeechOutput - The return type for the generateSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { removeDiacritics } from '@/lib/utils';
import { getAppSettings } from '@/lib/dal';

const GenerateSpeechInputSchema = z.object({
  textToSpeak: z.string().min(1).describe('The text to be converted to speech.'),
  languageCode: z.string().optional().default('jv-ID').describe('The BCP-47 language code for the speech, e.g., "jv-ID" for Javanese, "nl-NL" for Dutch. This is for informational purposes or if the flow supports other providers.'),
  voice: z.string().min(1).describe('The specific voice model to use for speech generation (e.g., "Siti", "Laura", "Bram"). This is directly passed to Speechgen.io.'),
});
export type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

const GenerateSpeechOutputSchema = z.object({
  audioDataUri: z.string().optional().describe("The generated speech as a base64 encoded audio data URI. Expected format: 'data:audio/mpeg;base64,<encoded_data>'. Undefined if error."),
  error: z.string().optional().describe("Error message if speech generation failed."),
});
export type GenerateSpeechOutput = z.infer<typeof GenerateSpeechOutputSchema>;

export async function generateSpeech(input: GenerateSpeechInput): Promise<GenerateSpeechOutput> {
  return generateSpeechFlow(input);
}

const generateSpeechFlow = ai.defineFlow(
  {
    name: 'generateSpeechFlow_SpeechGenIO_V2', // Version updated to reflect voice param change
    inputSchema: GenerateSpeechInputSchema,
    outputSchema: GenerateSpeechOutputSchema,
  },
  async (input: GenerateSpeechInput): Promise<GenerateSpeechOutput> => {
    const appSettings = await getAppSettings();
    const apiToken = appSettings.SPEECHGEN_API_TOKEN;
    const userEmail = appSettings.SPEECHGEN_EMAIL;
    
    const apiUrl = 'https://speechgen.io/index.php?r=api/text';
    
    if (!apiToken) {
      const errorMsg = "Speech generatie service is niet geconfigureerd (API token ontbreekt). Contacteer de site beheerder.";
      console.error("[generateSpeechFlow speechgen.io] CRITICAL ERROR: SPEECHGEN_API_TOKEN missing.");
      return { error: errorMsg };
    }
    if (!userEmail) {
      const errorMsg = "Speech generatie service is niet geconfigureerd (Speechgen e-mailadres ontbreekt). Contacteer de site beheerder.";
      console.error("[generateSpeechFlow speechgen.io] CRITICAL ERROR: SPEECHGEN_EMAIL missing.");
      return { error: errorMsg };
    }
    if (!input.voice) { // Check if voice is provided
        const errorMsg = "Stemnaam is niet opgegeven. Selecteer een stem voor de gekozen taal.";
        console.error(`[generateSpeechFlow speechgen.io] ERROR: input.voice is missing.`);
        return { error: errorMsg };
    }

    // Remove diacritics before sending to TTS service
    const textToSynthesize = removeDiacritics(input.textToSpeak);

    const requestBodyParams = new URLSearchParams({
      token: apiToken,
      email: userEmail,
      text: textToSynthesize, // Use the sanitized text
      voice: input.voice, // Use the voice from input
    });
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBodyParams.toString(),
        cache: 'no-store', // Explicitly disable caching for this request
      });

      const responseText = await response.text(); 

      if (!response.ok) {
        let detailMessage = `Onbekende fout van Speechgen.io API (HTTP ${response.status}). Body: ${responseText.substring(0,200)}`;
        let clientFriendlyMessage = `Fout van spraakservice (${response.status}): `;
         try {
            const errorBodyJson = JSON.parse(responseText); 
            detailMessage = errorBodyJson.error || errorBodyJson.message || JSON.stringify(errorBodyJson);
            if (errorBodyJson.status === -1 || (typeof detailMessage === 'string' && (detailMessage.toLowerCase().includes("limit") || detailMessage.toLowerCase().includes("credits")))) {
                clientFriendlyMessage += `Onvoldoende credits of limiet overschreden. (API status: ${errorBodyJson.status || 'onbekend'})`;
            } else {
                clientFriendlyMessage += detailMessage;
            }
          } catch (jsonParseError) {
            clientFriendlyMessage += responseText.substring(0,200);
          }
        console.error(`[generateSpeechFlow speechgen.io] API Fout (Not OK): ${clientFriendlyMessage} (Details: ${detailMessage})`);
        return { error: clientFriendlyMessage };
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error(`[generateSpeechFlow speechgen.io] API response 200 OK, maar body is geen valide JSON. Content-Type: ${response.headers.get('content-type')}. Body: ${responseText.substring(0,500)}`);
        return { error: `Onverwachte response van spraakservice. De service gaf geen valide JSON terug.` };
      }

      if (responseData.status === 1 && responseData.file) {
        const audioFileResponse = await fetch(responseData.file, { cache: 'no-store' }); 
        if (!audioFileResponse.ok) {
          const audioFileErrorText = await audioFileResponse.text();
          console.error(`[generateSpeechFlow speechgen.io] Fout bij downloaden audiobestand van ${responseData.file}. Status: ${audioFileResponse.status}. Body: ${audioFileErrorText.substring(0,200)}`);
          return { error: `Kon gegenereerd audiobestand niet downloaden (HTTP ${audioFileResponse.status}).` };
        }

        const audioContentType = audioFileResponse.headers.get('content-type') || 'audio/mpeg'; 
        if (!audioContentType.startsWith('audio/')) {
             console.error(`[generateSpeechFlow speechgen.io] Gedownload bestand van ${responseData.file} is geen audio. Content-Type: ${audioContentType}`);
             return { error: `Gedownload bestand van spraakservice is geen audio (type: ${audioContentType}).` };
        }
        
        const audioBuffer = await audioFileResponse.arrayBuffer();
        if (!audioBuffer || audioBuffer.byteLength === 0) {
          console.error("[generateSpeechFlow speechgen.io] Lege audio buffer ontvangen na downloaden van bestand.");
          return { error: "Leeg audiobestand ontvangen van spraakgeneratie service." };
        }
        const base64String = Buffer.from(audioBuffer).toString('base64');
        const audioDataUri = `data:${audioContentType};base64,${base64String}`;
        return { audioDataUri };

      } else {
        const apiErrorMessage = responseData.error || responseData.message || "Onbekende fout van Speechgen API (status niet 1 of geen bestandsurl).";
        console.error(`[generateSpeechFlow speechgen.io] Speechgen API Fout (JSON): ${apiErrorMessage}. Response data:`, responseData);
        if (responseData.status === -1 || (typeof apiErrorMessage === 'string' && (apiErrorMessage.toLowerCase().includes("limit") || apiErrorMessage.toLowerCase().includes("credits")))) {
            return { error: `SpeechGen API Fout: ${apiErrorMessage}. Mogelijk onvoldoende credits of limiet overschreden.` };
        }
        return { error: `SpeechGen API Fout: ${apiErrorMessage}` };
      }

    } catch (e: unknown) {
      let clientMessage = "Spraakgeneratie ondervond een onverwacht serverprobleem.";
      let logMessage = "[generateSpeechFlow speechgen.io] Exceptie tijdens TTS proces. ";

      if (e instanceof Error) {
        logMessage += `Error: ${e.name} - ${e.message}. `;
        const cause = (e as any).cause; 
        if (cause && typeof cause === 'object' && (cause as any).code) {
            logMessage += `Onderliggende oorzaak: Code - ${(cause as any).code}, Bericht - ${(cause as any).message}. Hostname: ${(cause as any).hostname}.`;
            if ((cause as any).code === 'ENOTFOUND') {
                clientMessage = `Netwerkfout: Kan de spraakservice host '${(cause as any).hostname || apiUrl}' niet vinden. Controleer of de API URL correct is en of er DNS/netwerkproblemen zijn.`;
            } else if ((cause as any).code === 'ECONNREFUSED') {
                clientMessage = `Netwerkfout: Verbinding met de spraakservice (${apiUrl}) geweigerd. Controleer serverstatus of firewall.`;
            }
        } else if (e.message.toLowerCase().includes('fetch failed')) {
           clientMessage = "Netwerkfout: De request naar de spraakservice is mislukt. Verzeker dat de server speechgen.io kan bereiken.";
        } else {
           clientMessage = `Fout: ${String(e.message).substring(0, 150)}.`;
        }
      } else {
        logMessage += `Niet-Error object gevangen: ${String(e)}.`;
        clientMessage = `Onbekende fout opgetreden: ${String(e).substring(0,150)}.`;
      }
      console.error(logMessage, e); 
      return { error: clientMessage };
    }
  }
);
