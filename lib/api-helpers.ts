/**
 * API helpers for managing API calls, retries, and rate limits
 */

/**
 * Retries a function with exponential backoff
 * @param fn The function to retry
 * @param retries The maximum number of retries
 * @param initialDelay The initial delay in ms
 * @param maxDelay The maximum delay in ms
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  initialDelay: number = 500,
  maxDelay: number = 10000
): Promise<T> {  try {
    return await fn();
  } catch (error: unknown) {
    if (retries <= 0) {
      throw error;
    }

    const delay = Math.min(initialDelay, maxDelay);
    console.info(`API call failed. Retrying in ${delay}ms... (${retries} retries left)`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(
      fn,
      retries - 1,
      Math.min(initialDelay * 2, maxDelay), // Exponential backoff
      maxDelay
    );
  }
}

/**
 * Execute an API call with retry logic
 * Specifically handles 429 (Too Many Requests) and 503 (Service Unavailable) errors
 */
export async function fetchWithRetry(
  url: string, 
  options: RequestInit,
  retries: number = 3
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, options);
      
      // If we get rate limited (429) or service unavailable (503), we should retry
      if (response.status === 429 || response.status === 503) {
        // Parse retry-after header if available
        const retryAfter = response.headers.get('retry-after');
        let waitTime = 0;
        
        if (retryAfter) {
          // Retry-After can be a date string or seconds
          if (isNaN(Number(retryAfter))) {
            waitTime = new Date(retryAfter).getTime() - Date.now();
          } else {
            waitTime = Number(retryAfter) * 1000;
          }
          
          // If waitTime is reasonable (less than 30s), wait before retrying
          if (waitTime > 0 && waitTime < 30000) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        
        throw new Error(`API rate limited or unavailable: ${response.status} ${response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response;
    },
    retries
  );
}

/**
 * Get a compatible Hugging Face model for a specific task type
 * This helps handle cases where the primary model (e.g., Mixtral-8x7B) 
 * doesn't support a particular task.
 */
export function getCompatibleModel(task: string, _primaryModel: string): string {
  // Map of fallbacks for each task type
  const fallbackModels: Record<string, string> = {
    'text-generation': 'google/gemma-7b-it', // Alternative model that supports text generation
    'conversational': 'facebook/blenderbot-400M-distill', // Alternative conversational model
    'feature-extraction': 'sentence-transformers/all-MiniLM-L6-v2', // Text embedding model
    'default': 'google/gemma-7b-it' // Default fallback
  };

  // Return the fallback model for the task, or the primary model if no fallback is defined
  return fallbackModels[task] || fallbackModels['default'];
}
