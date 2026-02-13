import { getPronunciationVocabulary } from "@/dal/vocabulary";
import { MOCK_USER_ID } from "@/lib/mock-auth";
import PronunciationClient from "./PronunciationClient";

export default async function PronunciationPage() {
    const vocabulary = await getPronunciationVocabulary(MOCK_USER_ID);

    return (
        <PronunciationClient vocabulary={vocabulary as any} />
    );
}
