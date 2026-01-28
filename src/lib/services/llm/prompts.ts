import type { GenerationType } from './types';

export function buildPrompt(
  word: string,
  sourceLang: string,
  targetLang: string,
  types: GenerationType[]
): string {
  const typeInstructions = types.map((t) => getTypeInstruction(t, word, targetLang)).join('\n');

  return `You are a language learning assistant. Generate flashcard content for learning vocabulary.

Word: "${word}"
Source language: ${sourceLang}
Target language: ${targetLang}

Generate the following content for this word:
${typeInstructions}

Respond in JSON format with this structure:
{
  "cards": [
    {
      "type": "<type>",
      "front": "<question/prompt in ${sourceLang}>",
      "back": "<answer in ${targetLang}>"
    }
  ]
}

Keep responses concise and appropriate for flashcard learning. Use natural, commonly-used language.`;
}

function getTypeInstruction(type: GenerationType, word: string, targetLang: string): string {
  switch (type) {
    case 'sentence':
      return `- sentence: An example sentence using "${word}" in ${targetLang} with its translation`;
    case 'conjugation':
      return `- conjugation: Common conjugations of "${word}" (present, past, future) if it's a verb`;
    case 'declension':
      return `- declension: Declension forms if applicable (singular/plural, gender variations)`;
    case 'synonym':
      return `- synonym: 2-3 synonyms of "${word}" in ${targetLang}`;
    case 'antonym':
      return `- antonym: 1-2 antonyms of "${word}" in ${targetLang}`;
    case 'collocation':
      return `- collocation: 2-3 common expressions or collocations using "${word}"`;
    case 'context':
      return `- context: A short context or usage note explaining when/how to use "${word}"`;
    default:
      return '';
  }
}

export function parseResponse(response: string): Array<{ type: GenerationType; front: string; back: string }> {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.cards || [];
  } catch {
    return [];
  }
}
