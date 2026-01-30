import type { GenerationType, WordForm } from './types';

export function buildPrompt(
  word: string,
  sourceLang: string,
  targetLang: string,
  types: GenerationType[]
): string {
  const typeInstructions = types.map((t) => getTypeInstruction(t, word, sourceLang, targetLang)).join('\n');

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
      "front": "<text in ${sourceLang}>",
      "back": "<translation in ${targetLang}>"
    }
  ]
}

Keep responses concise and appropriate for flashcard learning. Use natural, commonly-used language.`;
}

export function buildWordAnalysisPrompt(
  word: string,
  sourceLang: string
): string {
  return `You are a language learning assistant. Analyze the word "${word}" in ${sourceLang}.

Identify all grammatical forms this word can take. Return a JSON response with this structure:

{
  "word": "${word}",
  "forms": [
    {
      "category": "verb|noun|adjective|adverb",
      "formType": "infinitive|past|plural|comparative|etc",
      "text": "the actual form"
    }
  ]
}

Common form types:
- Verbs: infinitive, 3rd_person, past, past_participle, gerund, present_participle
- Nouns: singular, plural
- Adjectives: positive, comparative, superlative
- Include gender variations if applicable (masculine/feminine)

If the word can function as multiple parts of speech, include forms for each. Be thorough but realistic.`;
}

export function buildWordFormSentencesPrompt(
  word: string,
  sourceLang: string,
  targetLang: string,
  forms: WordForm[],
  includeExpressions: boolean
): string {
  const formInstructions = forms
    .map(f => `- Generate a natural example sentence using "${f.text}" (${f.category} - ${f.formType}) in ${sourceLang}`)
    .join('\n');

  const expressionInstructions = includeExpressions
    ? `\n- Generate 2-3 common expressions, idioms, or collocations using "${word}" in ${sourceLang}`
    : '';

  return `You are a language learning assistant. Generate flashcard content for learning vocabulary.

Word: "${word}"
Source language: ${sourceLang}
Target language: ${targetLang}

Generate example sentences for the following word forms:
${formInstructions}${expressionInstructions}

Respond in JSON format:
{
  "cards": [
    {
      "type": "<category:formType or 'expression'>",
      "front": "<sentence in ${sourceLang}>",
      "back": "<translation in ${targetLang}>"
    }
  ]
}

Keep sentences natural, concise, and appropriate for flashcard learning. Use contexts that clearly demonstrate the word form's usage.`;
}

export function parseWordAnalysis(response: string): { word: string; forms: WordForm[] } {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { word: '', forms: [] };
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      word: parsed.word || '',
      forms: parsed.forms || []
    };
  } catch {
    return { word: '', forms: [] };
  }
}

function getTypeInstruction(type: GenerationType, word: string, sourceLang: string, targetLang: string): string {
  switch (type) {
    case 'sentence':
      return `- sentence: An example sentence using "${word}" in ${sourceLang} on the front, with its translation in ${targetLang} on the back`;
    case 'conjugation':
      return `- conjugation: Common conjugations of "${word}" (present, past, future) if it's a verb in ${sourceLang} on the front, with translations in ${targetLang} on the back`;
    case 'declension':
      return `- declension: Declension forms if applicable (singular/plural, gender variations) in ${sourceLang} on the front, with translations in ${targetLang} on the back`;
    case 'synonym':
      return `- synonym: 2-3 synonyms of "${word}" in ${sourceLang} on the front, with translations in ${targetLang} on the back`;
    case 'antonym':
      return `- antonym: 1-2 antonyms of "${word}" in ${sourceLang} on the front, with translations in ${targetLang} on the back`;
    case 'collocation':
      return `- collocation: 2-3 common expressions or collocations using "${word}" in ${sourceLang} on the front, with translations in ${targetLang} on the back`;
    case 'context':
      return `- context: A short context or usage note explaining when/how to use "${word}" in ${sourceLang} on the front, with its translation in ${targetLang} on the back`;
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
