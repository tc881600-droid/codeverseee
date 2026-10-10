/**
 * Judge0 Adapter - Free code execution API
 * Uses the public Judge0 CE instance (no auth required)
 * https://ce.judge0.com/
 */

const JUDGE0_URL = 'https://ce.judge0.com';

// Map our language slugs to Judge0 language IDs
const LANGUAGE_IDS: Record<string, number> = {
  'c': 50,           // C (GCC 9.2.0)
  'cpp': 54,         // C++ (GCC 9.2.0)
  'java': 62,        // Java (OpenJDK 13.0.1)
  'javascript': 63,  // JavaScript (Node.js 12.14.0)
  'python': 71,      // Python (3.8.1)
  'typescript': 74,  // TypeScript (3.7.4)
  'go': 60,          // Go (1.13.5)
  'rust': 73,        // Rust (1.40.0)
  'php': 68,         // PHP (7.4.1)
  'csharp': 51,      // C# (Mono 6.6.0.161)
  'kotlin': 78,      // Kotlin (1.3.70) - might not be available
  'dart': 90,        // Dart - might not be available
  'sql': 82,         // SQLite3 - might not be available
};

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
  token: string;
}

// Judge0 status IDs:
// 1: In Queue
// 2: Processing
// 3: Accepted
// 4: Wrong Answer
// 5: Time Limit Exceeded
// 6: Compilation Error
// 7-12: Runtime Error (various)
// 13: Internal Error
// 14: Exec Format Error

// Helper function to encode string to base64
function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// Helper function to decode base64 string
function fromBase64(str: string | null): string | null {
  if (!str) return null;
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return str;
  }
}

export async function executeWithJudge0(
  code: string,
  language: string,
  stdin: string = ''
): Promise<Judge0Result> {
  const languageId = LANGUAGE_IDS[language];

  if (!languageId) {
    throw new Error(`Language ${language} not supported by Judge0`);
  }

  // Base64 encode source code and stdin
  const submission = {
    source_code: toBase64(code),
    language_id: languageId,
    stdin: stdin ? toBase64(stdin) : undefined,
    cpu_time_limit: 5,
    memory_limit: 256000, // 256MB
  };

  try {
    // Create submission with base64 encoding enabled
    const response = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 API error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    // Decode base64 responses
    return {
      ...result,
      stdout: fromBase64(result.stdout),
      stderr: fromBase64(result.stderr),
      compile_output: fromBase64(result.compile_output),
    };
  } catch (error) {
    console.error('Judge0 execution error:', error);
    throw error;
  }
}

// Check if Judge0 is available
export async function checkJudge0Health(): Promise<boolean> {
  try {
    const response = await fetch(`${JUDGE0_URL}/about`);
    return response.ok;
  } catch {
    return false;
  }
}

// Get supported languages from Judge0
export async function getJudge0Languages(): Promise<Array<{ id: number; name: string }>> {
  try {
    const response = await fetch(`${JUDGE0_URL}/languages`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}
