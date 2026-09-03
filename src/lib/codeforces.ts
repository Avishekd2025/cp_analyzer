export interface CFUser {
  handle: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  titlePhoto?: string;
  avatar?: string;
}

export interface CFProblem {
  contestId?: number;
  problemsetName?: string;
  index: string;
  name: string;
  type: string;
  points?: number;
  rating?: number;
  tags: string[];
}

export interface CFSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: CFProblem;
  author: {
    contestId?: number;
    members: { handle: string }[];
    participantType: string;
    ghost: boolean;
  };
  programmingLanguage: string;
  verdict?: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

export async function fetchCFUserInfo(handle: string): Promise<CFUser | null> {
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`, {
      headers: { "User-Agent": "CP-Knowledge-System/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === "OK" && data.result && data.result.length > 0) {
      return data.result[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching CF user info:", error);
    return null;
  }
}

/**
 * Fetches the user's complete Codeforces submissions history without artificial truncation.
 * Uses pagination if necessary to ensure all submissions are retrieved.
 */
export async function fetchAllCFUserSubmissions(handle: string): Promise<CFSubmission[]> {
  try {
    // Attempt 1: Fetch without pagination limits (Codeforces API standard endpoint)
    const directUrl = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`;
    const res = await fetch(directUrl, {
      headers: { "User-Agent": "CP-Knowledge-System/1.0" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === "OK" && Array.isArray(data.result)) {
        // If result is non-empty and under 10000, it's the full history
        if (data.result.length < 10000) {
          return data.result;
        }
      }
    }

    // Fallback or pagination for ultra-large submission histories (10,000+)
    const allSubmissions: CFSubmission[] = [];
    let from = 1;
    const batchSize = 5000;
    let hasMore = true;

    while (hasMore) {
      const pageUrl = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=${from}&count=${batchSize}`;
      const pageRes = await fetch(pageUrl, {
        headers: { "User-Agent": "CP-Knowledge-System/1.0" },
        cache: "no-store",
      });

      if (!pageRes.ok) {
        break;
      }

      const pageData = await pageRes.json();
      if (pageData.status === "OK" && Array.isArray(pageData.result) && pageData.result.length > 0) {
        allSubmissions.push(...pageData.result);
        if (pageData.result.length < batchSize) {
          hasMore = false;
        } else {
          from += batchSize;
        }
      } else {
        hasMore = false;
      }
    }

    return allSubmissions;
  } catch (error) {
    console.error("Error fetching all CF submissions:", error);
    return [];
  }
}

// Backward-compatible alias
export async function fetchCFUserSubmissions(handle: string, count?: number): Promise<CFSubmission[]> {
  if (!count) {
    return fetchAllCFUserSubmissions(handle);
  }
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${count}`,
      {
        headers: { "User-Agent": "CP-Knowledge-System/1.0" },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status === "OK") return data.result || [];
    return [];
  } catch {
    return [];
  }
}

export interface SolvedProblemSummary {
  problemId: string;
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
  problemUrl: string;
  solvedAt: number;
  submissionId: number;
  language: string;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

/**
 * Extracts the exact number of UNIQUE Codeforces problems with verdict == "OK".
 * Stable unique identifier: contestId + index (e.g. 2254E).
 * Multiple accepted submissions for the same problem count as exactly ONE solved problem.
 */
export function extractUniqueSolvedProblems(submissions: CFSubmission[]): SolvedProblemSummary[] {
  const solvedMap = new Map<string, SolvedProblemSummary>();

  // Sort submissions chronologically ascending (earliest to latest)
  // so that earliest accepted time is preserved
  const sorted = [...submissions].sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds);

  for (const sub of sorted) {
    if (sub.verdict !== "OK") continue;

    const contestId = sub.problem?.contestId || sub.contestId;
    const index = (sub.problem?.index || "").trim().toUpperCase();

    if (!contestId || !index) continue;

    const problemKey = `${contestId}${index}`;

    if (!solvedMap.has(problemKey)) {
      const isGym = contestId >= 100000;
      const problemUrl = isGym
        ? `https://codeforces.com/gym/${contestId}/problem/${index}`
        : `https://codeforces.com/contest/${contestId}/problem/${index}`;

      solvedMap.set(problemKey, {
        problemId: problemKey,
        contestId,
        index,
        name: sub.problem.name || problemKey,
        rating: sub.problem.rating || 0,
        tags: sub.problem.tags || [],
        problemUrl,
        solvedAt: sub.creationTimeSeconds,
        submissionId: sub.id,
        language: sub.programmingLanguage,
        timeConsumedMillis: sub.timeConsumedMillis,
        memoryConsumedBytes: sub.memoryConsumedBytes,
      });
    }
  }

  // Return sorted chronologically by solvedAt
  return Array.from(solvedMap.values()).sort((a, b) => a.solvedAt - b.solvedAt);
}
