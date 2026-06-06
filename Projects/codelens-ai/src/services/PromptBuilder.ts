import { DepthLevel } from '../utils/types';
import { LANGUAGE_PROMPTS } from '../utils/constants';

const DEFAULT_PROMPT = 'You are an expert programming instructor. Explain code clearly and thoroughly.';

const DEPTH_INSTRUCTIONS: Record<DepthLevel, string> = {
  what: 'Provide a basic description of what the code does at a high level. Focus on purpose and behavior.',
  how: 'Explain how the code works including implementation details, algorithms, and data flow.',
  why: 'Explain the design decisions, trade-offs, and alternatives. Discuss why this approach was chosen over others.',
};

const DEFAULT_LANGUAGE = 'typescript';

export class PromptBuilder {
  buildSystemPrompt(language: string, depth: DepthLevel, options?: {
    analogy?: boolean;
    socratic?: boolean;
    simplify?: boolean;
    quiz?: boolean;
  }): string {
    if (!language) {
      const parts: string[] = [DEFAULT_PROMPT];
      parts.push(`Depth level: ${depth}. ${DEPTH_INSTRUCTIONS[depth] || DEPTH_INSTRUCTIONS.what}`);
      if (options?.analogy) parts.push('Use analogies and metaphors to explain concepts. Relate technical ideas to everyday experiences.');
      if (options?.socratic) parts.push('Use the Socratic method: ask guiding questions instead of giving direct answers. Encourage the user to think through the solution themselves.');
      if (options?.simplify) parts.push('Use simple terms. Avoid all jargon. Use one sentence per concept. Explain as if teaching a complete beginner.');
      if (options?.quiz) parts.push('Format the response as a quiz question. Include code, a question, multiple choice answers, and indicate the correct answer.');
      parts.push('Keep explanations concise but complete. Use code examples where helpful.');
      parts.push('Format any code blocks with proper language tags.');
      return parts.join('\n');
    }
    const lang = language.toLowerCase();
    const basePrompt = LANGUAGE_PROMPTS[lang] || DEFAULT_PROMPT;

    const parts: string[] = [basePrompt];
    parts.push(`Depth level: ${depth}. ${DEPTH_INSTRUCTIONS[depth] || DEPTH_INSTRUCTIONS.what}`);

    if (options?.analogy) {
      parts.push('Use analogies and metaphors to explain concepts. Relate technical ideas to everyday experiences.');
    }
    if (options?.socratic) {
      parts.push('Use the Socratic method: ask guiding questions instead of giving direct answers. Encourage the user to think through the solution themselves.');
    }
    if (options?.simplify) {
      parts.push('Use simple terms. Avoid all jargon. Use one sentence per concept. Explain as if teaching a complete beginner.');
    }
    if (options?.quiz) {
      parts.push('Format the response as a quiz question. Include code, a question, multiple choice answers, and indicate the correct answer.');
    }

    parts.push('Keep explanations concise but complete. Use code examples where helpful.');
    parts.push('Format any code blocks with proper language tags.');

    return parts.join('\n');
  }

  buildExplanationPrompt(code: string, filePath: string, lineStart: number, lineEnd: number): string {
    const lines: string[] = [];
    lines.push('Explain the following code. Include:');
    lines.push('- What the code does');
    lines.push('- Key concepts and patterns used');
    lines.push('- Any potential issues or improvements');
    lines.push('');
    if (filePath) {
      lines.push(`File: ${filePath}`);
    }
    lines.push(`Lines: ${lineStart}-${lineEnd}`);
    lines.push('');
    lines.push('```');
    lines.push(code);
    lines.push('```');
    return lines.join('\n');
  }

  buildCodeSmellPrompt(code: string): string {
    const lines: string[] = [];
    lines.push('Analyze the following code for code smells and anti-patterns.');
    lines.push('For each issue found, provide:');
    lines.push('- The line number');
    lines.push('- The type of smell (long-function, magic-number, unclear-name, duplicate, complex-condition, deep-nesting)');
    lines.push('- A brief explanation');
    lines.push('- severity (info, warning, error)');
    lines.push('');
    lines.push('```');
    lines.push(code);
    lines.push('```');
    return lines.join('\n');
  }

  buildAnalogyPrompt(code: string, concept: string): string {
    const lines: string[] = [];
    lines.push(`Explain the concept of "${concept}" in the following code using analogies and metaphors.`);
    lines.push('Relate the technical concept to everyday experiences that a beginner would understand.');
    lines.push('');
    lines.push('```');
    lines.push(code);
    lines.push('```');
    return lines.join('\n');
  }

  buildVocabularyPrompt(term: string, context: string): string {
    const lines: string[] = [];
    lines.push(`Define the term "${term}" in the context of programming.`);
    if (context) {
      lines.push(`Context: ${context}`);
    }
    lines.push('Provide:');
    lines.push('- A simple one-line definition');
    lines.push('- A code example showing usage');
    lines.push('- Related terms the learner should know');
    return lines.join('\n');
  }

  buildPracticePrompt(code: string, count: number): string {
    const lines: string[] = [];
    lines.push(`Generate ${count} practice exercises based on the following code.`);
    lines.push('For each exercise:');
    lines.push('- State the exercise clearly');
    lines.push('- Provide starter code if applicable');
    lines.push('- Show the expected output or behavior');
    lines.push('- Include the solution');
    lines.push('Vary the difficulty from easy to challenging.');
    lines.push('');
    lines.push('```');
    lines.push(code);
    lines.push('```');
    return lines.join('\n');
  }

  buildErrorExplanationPrompt(error: string, code: string): string {
    const lines: string[] = [];
    lines.push('Explain the following error in simple terms:');
    lines.push('');
    lines.push(`Error: ${error}`);
    lines.push('');
    if (code) {
      lines.push('Relevant code:');
      lines.push('```');
      lines.push(code);
      lines.push('```');
    }
    lines.push('');
    lines.push('Include:');
    lines.push('- What caused the error');
    lines.push('- How to fix it');
    lines.push('- How to prevent it in the future');
    return lines.join('\n');
  }

  buildQuizPrompt(code: string, concept: string): string {
    const lines: string[] = [];
    lines.push('Generate a quiz question about programming.');
    if (concept) {
      lines.push(`Focus on the concept: ${concept}`);
    }
    if (code) {
      lines.push('Based on this code:');
      lines.push('```');
      lines.push(code);
      lines.push('```');
    }
    lines.push('');
    lines.push('Format:');
    lines.push('- Question text');
    lines.push('- 4 multiple choice options labeled A, B, C, D');
    lines.push('- Indicate the correct answer');
    lines.push('- A brief explanation of why it is correct');
    return lines.join('\n');
  }

  buildLearningPathPrompt(mastered: string[], learning: string[]): string {
    const lines: string[] = [];
    lines.push('Based on the learner\'s current knowledge, recommend a learning path.');
    lines.push('');
    lines.push('Topics already mastered:');
    if (mastered.length > 0) {
      mastered.forEach(t => lines.push(`- ${t}`));
    } else {
      lines.push('- None');
    }
    lines.push('');
    lines.push('Topics currently learning:');
    if (learning.length > 0) {
      learning.forEach(t => lines.push(`- ${t}`));
    } else {
      lines.push('- None');
    }
    lines.push('');
    lines.push('Recommend:');
    lines.push('- Next 3-5 topics to learn in order');
    lines.push('- Resources or practice ideas for each');
    lines.push('- Prerequisites to review before advancing');
    return lines.join('\n');
  }

  buildSocraticPrompt(code: string, previousAnswer?: string): string {
    const lines: string[] = [];
    lines.push('Use the Socratic method to help the user understand the following code.');
    lines.push('Ask guiding questions that lead the user to discover the answer themselves.');
    lines.push('Do NOT provide the answer directly. Instead, ask questions that build understanding step by step.');
    lines.push('');
    lines.push('```');
    lines.push(code);
    lines.push('```');
    if (previousAnswer) {
      lines.push('');
      lines.push('The user provided this response to the previous question:');
      lines.push(previousAnswer);
      lines.push('');
      lines.push('Based on their response, ask the next guiding question.');
    }
    return lines.join('\n');
  }
}
