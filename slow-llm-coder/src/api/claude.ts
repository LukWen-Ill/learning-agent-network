import type { ChatContext } from '../types';

/**
 * Ask Claude a question about the current code state
 *
 * Sends the current code, explanation, and user's question to Claude API.
 * Claude responds as a patient programming teacher in the context of the step.
 *
 * @param question - The student's question
 * @param context - The current code state context
 * @returns The AI's response
 */
export async function askClaude(
  question: string,
  context: ChatContext
): Promise<string> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    return 'API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file.';
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: buildPrompt(question, context),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude API error:', errorData);
      return `Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`;
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Failed to call Claude API:', error);
    return 'Failed to connect to Claude. Please check your internet connection and API key.';
  }
}

/**
 * Build the prompt for Claude with context
 */
function buildPrompt(question: string, context: ChatContext): string {
  return `You are a patient programming teacher helping a student learn to code.

The student is working through a tutorial called "${context.projectName}".
They are on step ${context.stateId + 1}.

Here is the current code:
\`\`\`python
${context.code}
\`\`\`

The explanation for this step is: "${context.explanation}"

The student asks: "${question}"

Respond helpfully and pedagogically. Keep your response concise but clear.
Use simple language appropriate for a beginner.
If referencing specific code, quote it.
Do not use markdown formatting - respond in plain text.`;
}

/**
 * Mock response for development without API key
 */
export function getMockResponse(_question: string): string {
  const responses = [
    "That's a great question! This code is using a fundamental Python concept.",
    "Let me explain this step by step. The key thing to understand here is how the code flows.",
    "Good thinking! This is actually a common pattern in Python programming.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
