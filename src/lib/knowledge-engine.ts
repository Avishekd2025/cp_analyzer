import { db } from "@/db";
import {
  patterns,
  techniques,
  variations,
  techniqueCombinations,
  problemKnowledge,
  representativeProblems,
  patternAliases,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export interface ExtractedKnowledgeAtom {
  primaryPatternId: string;
  primaryPatternName: string;
  techniqueId: string;
  secondaryTechniqueIds: string[];
  keyObservation: string;
  whyThisApproach: string;
  safeDecisionProof: string;
  variationName?: string;
  variationDescription?: string;
  implementationTechniques: string[];
  commonTraps: string[];
  isNewPattern: boolean;
  isNewVariation: boolean;
  isNewCombination: boolean;
}

export interface CanonicalPatternDef {
  id: string;
  techniqueId: string;
  name: string;
  slug: string;
  coreIdea: string;
  mentalModel: string;
  realLifeAnalogy: string;
  discoveryFlow: string;
  recognitionSignals: string[];
  standardApproach: string;
  whyItWorksProof: string;
  whyNotOthers: string;
  commonMistakes: string[];
  implementationInsights: string;
  rarityTier: "COMMON" | "UNCOMMON" | "RARE";
}

export const CANONICAL_TECHNIQUES = [
  { id: "greedy", name: "Greedy Algorithms", slug: "greedy", description: "Making locally optimal choices that provably lead to global optimality.", color: "emerald", icon: "Zap", commonality: "COMMON" },
  { id: "binary-search", name: "Binary Search", slug: "binary-search", description: "Logarithmic domain reduction relying on monotonicity.", color: "amber", icon: "Search", commonality: "COMMON" },
  { id: "dp", name: "Dynamic Programming", slug: "dynamic-programming", description: "Decomposing problems into overlapping subproblems with optimal substructure.", color: "indigo", icon: "Layers", commonality: "COMMON" },
  { id: "graph", name: "Graph Theory", slug: "graph-theory", description: "Modeling connectivity, reachability, flows, and state transitions.", color: "sky", icon: "GitFork", commonality: "COMMON" },
  { id: "trees", name: "Tree Algorithms", slug: "tree-algorithms", description: "Subtree aggregates, rerooting, diameter, and LCA on hierarchical graphs.", color: "teal", icon: "FolderTree", commonality: "COMMON" },
  { id: "data-structures", name: "Data Structures", slug: "data-structures", description: "Segment trees, Fenwick, DSU, and monotonic queues.", color: "rose", icon: "Database", commonality: "UNCOMMON" },
  { id: "math", name: "Number Theory & Math", slug: "number-theory-math", description: "Combinatorics, modular arithmetic, prime factorization, GCD, and invariants.", color: "purple", icon: "Binary", commonality: "COMMON" },
  { id: "two-pointers", name: "Two Pointers & Window", slug: "two-pointers-window", description: "Linear scans maintaining monotonic range invariants.", color: "cyan", icon: "MoveHorizontal", commonality: "COMMON" },
  { id: "constructive", name: "Constructive & Invariants", slug: "constructive-invariants", description: "Building explicit valid configurations using parity and invariants.", color: "orange", icon: "Wrench", commonality: "COMMON" },
  { id: "strings", name: "String Algorithms", slug: "string-algorithms", description: "Pattern matching, tries, rolling hashes, and prefix automata.", color: "pink", icon: "Type", commonality: "UNCOMMON" },
  { id: "rare-advanced", name: "Advanced Structural", slug: "advanced-structural", description: "2-SAT, Meet-in-the-Middle, Centroid Decomposition, and Min-Cut.", color: "violet", icon: "Sparkles", commonality: "RARE" },
];

export const CANONICAL_PATTERNS: CanonicalPatternDef[] = [
  {
    id: "bs-on-answer",
    techniqueId: "binary-search",
    name: "Binary Search on Answer",
    slug: "binary-search-on-answer",
    coreIdea: "Convert 'Find optimal X' into a monotonic decision predicate check(mid) in O(log(Range) * checkTime).",
    mentalModel: "The Guessing Gauge: turning a dial from cold to hot until feasibility flips from false to true.",
    realLifeAnalogy: "Testing rope lengths across a chasm: if 15m reaches, any longer rope reaches; binary-halve the candidates.",
    discoveryFlow: "1. Problem asks for min(max) or max(min).\n2. Direct construction has circular dependencies.\n3. INVERSION: If candidate X is fixed, is checking feasibility easy?\n4. Feasibility is strictly monotonic.\n5. Binary search [low, high].",
    recognitionSignals: ["Minimizing the maximum or maximizing the minimum", "Monotonic boolean feasibility predicate", "Bounded search interval"],
    standardApproach: "low = min_val, high = max_val\nwhile low <= high:\n  mid = (low + high) / 2\n  if check(mid): ans = mid, high = mid - 1\n  else: low = mid + 1",
    whyItWorksProof: "Monotonicity partitions the domain into [False...False, True...True]. Halving converges in logarithmic steps.",
    whyNotOthers: "DP would require value in the state causing TLE/MLE. Direct greedy cannot foresee global threshold.",
    commonMistakes: ["Integer overflow in (low + high)", "Non-monotonic check function edge cases", "Off-by-one in while bounds"],
    implementationInsights: "Use long long for search bounds. For floating point, use 80 fixed iterations instead of eps loop.",
    rarityTier: "COMMON",
  },
  {
    id: "interval-greedy",
    techniqueId: "greedy",
    name: "Interval Scheduling & Greedy",
    slug: "interval-scheduling-greedy",
    coreIdea: "Order intervals by critical endpoint (earliest end time) to preserve maximal future resource flexibility.",
    mentalModel: "Preserving Future Freedom: choosing the task that finishes earliest leaves maximum room for all future tasks.",
    realLifeAnalogy: "Festival scheduling: attending talks that finish earlier lets you fit more events into the day.",
    discoveryFlow: "1. Set of competing intervals [L, R].\n2. Earliest finish time leaves maximum remaining timeline.\n3. Exchange argument confirms no choice surpasses earliest finish.",
    recognitionSignals: ["Non-overlapping interval selection", "Earliest deadline first", "Independent safety horizons"],
    standardApproach: "Sort by end time ascending. Maintain last_end. If start >= last_end, select and update last_end.",
    whyItWorksProof: "Exchange argument: swapping the first chosen interval with any other optimal interval cannot increase conflicts with remaining items.",
    whyNotOthers: "DP O(N^2) works but greedy O(N log N) is optimal due to matroid independence.",
    commonMistakes: ["Sorting by start time or length instead of end time", "Strict vs non-strict boundary comparisons"],
    implementationInsights: "Use std::sort with lambda on second coordinate.",
    rarityTier: "COMMON",
  },
  {
    id: "greedy-sorting",
    techniqueId: "greedy",
    name: "Greedy Rearrangement & Sorting",
    slug: "greedy-rearrangement-sorting",
    coreIdea: "Establish an optimal linear order using pair-exchange invariants (Rearrangement Inequality or adjacent swap analysis).",
    mentalModel: "The Priority Queue of Destiny: if swapping adjacent elements A and B always degrades the objective, the sorted order is globally unique.",
    realLifeAnalogy: "Packing heaviest items at the bottom of a backpack to keep the center of gravity stable.",
    discoveryFlow: "1. Permutation or selection optimization.\n2. Consider two adjacent elements (i, i+1).\n3. Express local contribution of (A, B) vs (B, A).\n4. Derive transitive comparator.",
    recognitionSignals: ["Permutation maximization", "Adjacent swap cost minimization", "Rearrangement Inequality"],
    standardApproach: "Sort elements using custom comparator based on adjacent swap condition.",
    whyItWorksProof: "Transitive comparator ensures any inversion can be resolved by adjacent swaps without decreasing the objective.",
    whyNotOthers: "Backtracking is O(N!). DP on permutations is O(N * 2^N).",
    commonMistakes: ["Comparator violates strict weak ordering (causing segfaults in std::sort)", "Overflow during cross-multiplication in comparator"],
    implementationInsights: "Ensure comparator(a, b) returns false when a and b are equivalent.",
    rarityTier: "COMMON",
  },
  {
    id: "two-pointers-window",
    techniqueId: "two-pointers",
    name: "Two Pointers & Sliding Window",
    slug: "two-pointers-sliding-window",
    coreIdea: "Iterate two monotonic index pointers L and R over sequences to maintain range invariants in strictly O(N) amortized time.",
    mentalModel: "The Caterpillar: The head (R) stretches forward to gather, and the tail (L) contracts forward to preserve the invariant.",
    realLifeAnalogy: "A sliding magnifying glass inspecting words in a continuous text stream.",
    discoveryFlow: "1. Problem asks for subarray satisfying constraint.\n2. Invariant: expanding R makes property worse/better monotonically.\n3. L only moves rightward.",
    recognitionSignals: ["Contiguous subarray with sum/distinct elements <= K", "Sorted array pair sum", "All elements non-negative"],
    standardApproach: "L = 0; for R in 0..N-1: add(a[R]); while invalid(): remove(a[L]); L++; record_window()",
    whyItWorksProof: "Both L and R advance at most N times. Total operations bounded by 2N = O(N).",
    whyNotOthers: "Binary search gives O(N log N); two pointers achieves optimal O(N).",
    commonMistakes: ["Negative numbers break monotonicity of sliding window sums", "Off-by-one in window length (R - L + 1)"],
    implementationInsights: "Keep internal frequency table or running sum updated inside the while loop.",
    rarityTier: "COMMON",
  },
  {
    id: "prefix-sum-hashmap",
    techniqueId: "two-pointers",
    name: "Prefix Sum & Difference Array",
    slug: "prefix-sum-difference-array",
    coreIdea: "Transform range sum queries into differences Pref[R] - Pref[L-1], and range updates into boundary delta increments.",
    mentalModel: "The Altitude Log: measure height from sea level at every step; elevation change is delta of two logs.",
    realLifeAnalogy: "Bank account balance: checking if an exact $500 expense period occurred by looking for past balances equal to Current - 500.",
    discoveryFlow: "1. Subarray sum query or count.\n2. Pref[R] - Pref[L-1] = K <=> Pref[L-1] = Pref[R] - K.\n3. Maintain frequency map of previous prefixes.",
    recognitionSignals: ["Count of subarrays with sum divisible by K or equal to K", "Range add queries offline (+X at L, -X at R+1)"],
    standardApproach: "Map freq with freq[0]=1. Running sum sum=0. Loop: sum += a[i]; ans += freq[sum - K]; freq[sum]++.",
    whyItWorksProof: "Algebraic bijection: every valid subarray corresponds to a matching historical prefix state.",
    whyNotOthers: "Two pointers fails with negative numbers; prefix map handles arbitrary integers.",
    commonMistakes: ["Missing base case freq[0] = 1", "CF anti-hash hacks on std::unordered_map (use custom_hash)", "Negative modulo"],
    implementationInsights: "Use custom_hash with chrono steady_clock to avoid O(N^2) anti-hash collision hacks.",
    rarityTier: "COMMON",
  },
  {
    id: "graph-bfs-dfs",
    techniqueId: "graph",
    name: "Graph Traversal (BFS / DFS)",
    slug: "graph-traversal-bfs-dfs",
    coreIdea: "Systematically explore vertices and edges to determine reachability, connected components, bipartiteness, or shortest unweighted paths.",
    mentalModel: "The Ripple Effect (BFS) vs The Labyrinth Thread (DFS): BFS expands in uniform concentric circles; DFS explores deeply along single paths.",
    realLifeAnalogy: "Spreading news through a social network: friend to friend across connection links.",
    discoveryFlow: "1. Pairwise dependencies or grid adjacency.\n2. State can be modeled as vertices and valid moves as edges.\n3. Component or reachability analysis.",
    recognitionSignals: ["Grid mazes", "Connected components", "Cycle detection in directed/undirected graphs", "Shortest path in unweighted graph"],
    standardApproach: "Queue for BFS (dist[v] = dist[u] + 1); recursive DFS with visited array.",
    whyItWorksProof: "BFS explores vertices in strictly increasing order of edge distance from source, guaranteeing shortest path in O(V + E).",
    whyNotOthers: "Dijkstra has O(E log V) overhead; unweighted graphs only need O(V + E) BFS.",
    commonMistakes: ["Stack overflow on deep DFS recursion (use loop or increase stack)", "Not marking visited upon pushing to queue"],
    implementationInsights: "For grids, use dx[] = {-1, 1, 0, 0}, dy[] = {0, 0, -1, 1} direction arrays.",
    rarityTier: "COMMON",
  },
  {
    id: "shortest-path",
    techniqueId: "graph",
    name: "Shortest Paths (Dijkstra / 0-1 BFS)",
    slug: "shortest-paths-dijkstra",
    coreIdea: "Compute minimum weight paths from source to all vertices using greedy frontier relaxation via Priority Queue or Deque.",
    mentalModel: "The Water Flood: Water poured at source expands along edges at rates proportional to edge weights; first arrival is optimal.",
    realLifeAnalogy: "GPS navigation finding the fastest route across roads with variable speed limits.",
    discoveryFlow: "1. Weighted non-negative edges.\n2. Greedily finalize distance of nearest unvisited vertex.\n3. Relax outgoing edges.",
    recognitionSignals: ["Minimum cost to reach destination", "Edge weights are non-negative", "State-space graphs with transition costs"],
    standardApproach: "priority_queue<pair<dist, u>, greater>; dist[src]=0; while pq: pop (d, u); if d > dist[u] continue; relax(u, v, w).",
    whyItWorksProof: "Non-negative edge weights ensure that when a node is extracted from PQ with minimal tentative distance, no shorter path can exist.",
    whyNotOthers: "Floyd-Warshall is O(V^3); Bellman-Ford is O(V*E); Dijkstra is O(E log V).",
    commonMistakes: ["Negative weight edges break Dijkstra (requires Bellman-Ford/SPFA)", "Forgetting `if (d > dist[u]) continue`"],
    implementationInsights: "Use 64-bit integer for distances to prevent overflow.",
    rarityTier: "COMMON",
  },
  {
    id: "dsu-disjoint-set",
    techniqueId: "data-structures",
    name: "Disjoint Set Union (DSU / Kruskal)",
    slug: "disjoint-set-union-dsu",
    coreIdea: "Maintain a partition of a set into disjoint components with nearly O(1) union and find queries via path compression and union-by-rank.",
    mentalModel: "The Kingdom Merger: Every clan has a chieftain. When two clans merge, the smaller clan chieftains pledge fealty to the larger chieftain.",
    realLifeAnalogy: "Corporate acquisitions: merging branches until all regional offices report to a unified corporate headquarters.",
    discoveryFlow: "1. Elements are dynamically grouped or connected.\n2. Need to check if two elements are in the same component.\n3. Need to detect cycles while adding edges.",
    recognitionSignals: ["Dynamic connectivity without edge deletions", "Kruskal's Minimum Spanning Tree", "Component size maintenance"],
    standardApproach: "find(u): return parent[u] == u ? u : parent[u] = find(parent[u]); unite(u, v): link smaller to larger.",
    whyItWorksProof: "Path compression + union-by-rank guarantees amortized O(alpha(N)) query time (inverse Ackermann function <= 4).",
    whyNotOthers: "BFS/DFS takes O(V + E) per query; DSU does it in O(alpha(N)) dynamically.",
    commonMistakes: ["Forgetting path compression (causing O(N) chain degradation)", "Attempting edge deletions without rollback stack"],
    implementationInsights: "Maintain size[u] array to query component sizes in O(1).",
    rarityTier: "COMMON",
  },
  {
    id: "tree-dp-rerooting",
    techniqueId: "dp",
    name: "Tree DP & Rerooting (In-Out DP)",
    slug: "tree-dp-rerooting",
    coreIdea: "Compute subtree objectives bottom-up, and reroot across edges top-down to solve for every node as root in O(N) total time.",
    mentalModel: "Moving the Empire's Capital: Shifting capital from Rome to Milan only flips the edge between Rome and Milan; provincial subtrees remain identical.",
    realLifeAnalogy: "Moving company headquarters to minimize total employee travel distances.",
    discoveryFlow: "1. Tree query for ALL vertices v as root.\n2. Rooting once takes O(N); doing N times is O(N^2) TLE.\n3. Rerooting across edge (u, v) changes only parent-child relationship between u and v.",
    recognitionSignals: ["Objective evaluated for every vertex in a tree", "Linear time O(N) required (N = 2 * 10^5)", "Reversible operations"],
    standardApproach: "DFS1(u, p): compute dp_in[u]. DFS2(u, p): combine with dp_out[p], push down to children.",
    whyItWorksProof: "A tree has no cycles: removing edge (u, v) creates exactly two disjoint subtrees whose values combine deterministically.",
    whyNotOthers: "Centroid decomposition takes O(N log N); Rerooting DP achieves true O(N) with minimal constant factor.",
    commonMistakes: ["Non-invertible operations like max require prefix/suffix sweeps over siblings", "Deep tree recursion stack overflow"],
    implementationInsights: "Use prefix and suffix maximum arrays over children when the operator has no inverse.",
    rarityTier: "UNCOMMON",
  },
  {
    id: "dp-classical",
    techniqueId: "dp",
    name: "Classical DP (Knapsack / Subsequences)",
    slug: "classical-dp-knapsack-subsequences",
    coreIdea: "Compute optimal solutions by building from optimal subproblems across a DAG of state transitions.",
    mentalModel: "The Topological Stepping Stones: solve smallest subproblems first, recording answers in a table to prevent re-computation.",
    realLifeAnalogy: "Packing a travel suitcase: deciding whether each item's value justifies its weight capacity.",
    discoveryFlow: "1. Problem has optimal substructure and overlapping subproblems.\n2. Greedy choice lacks safety proof.\n3. Formulate state dp[i][w] and transition.",
    recognitionSignals: ["Subset choice under weight/cost constraint", "Longest increasing subsequence", "Counting paths or configurations"],
    standardApproach: "dp[w] = max(dp[w], dp[w - weight[i]] + value[i]) running backwards for 0/1 knapsack.",
    whyItWorksProof: "Bellman's Principle of Optimality: an optimal policy has the property that whatever the initial state, remaining decisions are optimal.",
    whyNotOthers: "Brute force recursion is O(2^N); DP computes in O(N * W).",
    commonMistakes: ["Iterating forward in 1D 0/1 knapsack (allowing items to be reused multiple times)", "Memory limit exceeded with high-dimensional states"],
    implementationInsights: "Compress DP memory by rolling arrays if transition only depends on previous row.",
    rarityTier: "COMMON",
  },
  {
    id: "segment-tree-lazy",
    techniqueId: "data-structures",
    name: "Segment Tree & Range Modifications",
    slug: "segment-tree-range-modifications",
    coreIdea: "Support arbitrary range updates and range aggregate queries in O(log N) via hierarchical interval decomposition and lazy propagation.",
    mentalModel: "The Procrastinating Manager: Put a sticky note on room B's door '+5 to all files'; only push note inside when a worker opens the cabinet.",
    realLifeAnalogy: "Bank end-of-day reconciliation: batch transactions on accounts without modifying every individual coin in real time.",
    discoveryFlow: "1. Range updates [L, R] + range queries [L, R].\n2. Difference array cannot handle dynamic queries.\n3. Segment tree with deferred lazy tags.",
    recognitionSignals: ["Dynamic range updates (add/assign) and range queries (sum/min/max)", "N, Q up to 2 * 10^5"],
    standardApproach: "update(node, l, r, ql, qr, val): push tags, recurse if partial overlap, pull up; query(node): push tags, combine child answers.",
    whyItWorksProof: "Any interval [L, R] decomposes into at most 2 * log2(N) canonical tree nodes.",
    whyNotOthers: "Fenwick tree cannot easily handle range assignment + range sum; Segment Tree handles arbitrary associative monoids.",
    commonMistakes: ["Forgetting to push lazy tags before accessing children", "Allocating 2*N instead of 4*N array size"],
    implementationInsights: "Always allocate size 4 * MAXN for tree and lazy arrays.",
    rarityTier: "UNCOMMON",
  },
  {
    id: "number-theory-primes",
    techniqueId: "math",
    name: "Number Theory & Prime Factorization",
    slug: "number-theory-primes",
    coreIdea: "Exploit prime factorization, Sieve of Eratosthenes, and GCD Euclid algorithm to collapse integer divisibility constraints.",
    mentalModel: "The Chemical Elements of Arithmetic: Every integer factors uniquely into prime building blocks; divisibility is subset inclusion of prime powers.",
    realLifeAnalogy: "Breaking a machine into its fundamental atomic gears to understand its cycle frequency.",
    discoveryFlow: "1. Problem involves divisibility, coprimality, or modular equations.\n2. Prime factorization transforms multiplication into additive exponents.\n3. Sieve precomputation.",
    recognitionSignals: ["gcd(a, b) conditions", "Divisor counting and sum of divisors", "Constraints requiring factoring numbers up to 10^12"],
    standardApproach: "Euclid gcd(a, b): return b ? gcd(b, a % b) : a; Linear sieve for smallest prime factor (spf[x]).",
    whyItWorksProof: "Fundamental Theorem of Arithmetic: prime factorization is unique up to permutation.",
    whyNotOthers: "Trial division to N is O(N); Sieve is O(N log log N) and factorization via SPF is O(log N).",
    commonMistakes: ["Modulo negative numbers without +MOD", "Overflow in 32-bit integer when multiplying 10^9 numbers"],
    implementationInsights: "Precompute primes up to sqrt(MAX) using linear sieve.",
    rarityTier: "COMMON",
  },
  {
    id: "constructive-invariants",
    techniqueId: "constructive",
    name: "Constructive Algorithms & Invariants",
    slug: "constructive-algorithms-invariants",
    coreIdea: "Construct an explicit valid configuration by isolating monovariants, parity invariants, or induction steps.",
    mentalModel: "The Rubik's Cube Invariant: corners and edges preserve parity; finding the invariant guarantees whether a state is reachable.",
    realLifeAnalogy: "Assembling flat-pack furniture: following a systematic invariant step that never invalidates previously fastened panels.",
    discoveryFlow: "1. Problem asks to construct ANY valid array/matrix/graph.\n2. Identify what property never changes under operations (invariant).\n3. Use extreme cases or small N patterns.",
    recognitionSignals: ["'Print ANY valid configuration'", "Operations invert signs or swap elements", "Condition based on odd/even parity"],
    standardApproach: "Analyze small N = 1, 2, 3, 4 by hand. Detect periodic or recursive construction.",
    whyItWorksProof: "The invariant guarantees conservation, and inductive construction guarantees coverage for all N.",
    whyNotOthers: "Search is exponential O(2^N); constructive designs direct O(N) outputs.",
    commonMistakes: ["Overcomplicating the construction when a simple periodic or alternating pattern suffices"],
    implementationInsights: "Test small N on paper to verify inductive step before coding.",
    rarityTier: "COMMON",
  },
  {
    id: "two-sat",
    techniqueId: "rare-advanced",
    name: "2-SAT via Strongly Connected Components",
    slug: "2-sat-scc-implication-graph",
    coreIdea: "Solve boolean 2-CNF satisfiability in O(V + E) time by finding SCCs on the directed implication graph.",
    mentalModel: "The Domino Chain of Obligation: (A or B) means !A => B and !B => A. If a domino chain forces A => !A and !A => A, a paradox occurs.",
    realLifeAnalogy: "Legal contract obligations: if clause 1 forces clause 2, and clause 2 forces violation of clause 1, the contract is void.",
    discoveryFlow: "1. Binary choices for N variables.\n2. Pairwise restrictions: cannot pick both or must pick at least one.\n3. Directed implication graph with 2N vertices.\n4. Tarjan's SCC.",
    recognitionSignals: ["Variables have 2 mutually exclusive states", "Pairwise conflict rules", "Existence of valid configuration query"],
    standardApproach: "Clause (u or v) -> edges (!u, v) and (!v, u). Run SCC. If scc[x] == scc[!x] return UNSAT. Else assign by topological order.",
    whyItWorksProof: "Variables in different SCCs allow topological contracting without false => true implication violations.",
    whyNotOthers: "3-SAT is NP-Complete; 2-SAT has linear O(V + E) digraph representation.",
    commonMistakes: ["Adding only one implication edge and forgetting contrapositive", "Off-by-one in 2*i negation indexing"],
    implementationInsights: "Use Tarjan's SCC algorithm; SCC IDs are produced in reverse topological order.",
    rarityTier: "RARE",
  },
];

/**
 * Ensures all canonical techniques and patterns exist in the database.
 */
export async function ensureCanonicalPatternsExist() {
  const existingTechs = await db.select({ id: techniques.id }).from(techniques);
  const existingTechIds = new Set(existingTechs.map((t) => t.id));

  for (const t of CANONICAL_TECHNIQUES) {
    if (!existingTechIds.has(t.id)) {
      await db.insert(techniques).values(t);
    }
  }

  const existingPatterns = await db.select({ id: patterns.id }).from(patterns);
  const existingPatternIds = new Set(existingPatterns.map((p) => p.id));

  for (const p of CANONICAL_PATTERNS) {
    if (!existingPatternIds.has(p.id)) {
      await db.insert(patterns).values({
        id: p.id,
        techniqueId: p.techniqueId,
        name: p.name,
        slug: p.slug,
        coreIdea: p.coreIdea,
        mentalModel: p.mentalModel,
        realLifeAnalogy: p.realLifeAnalogy,
        discoveryFlow: p.discoveryFlow,
        recognitionSignals: JSON.stringify(p.recognitionSignals),
        standardApproach: p.standardApproach,
        whyItWorksProof: p.whyItWorksProof,
        whyNotOthers: p.whyNotOthers,
        commonMistakes: JSON.stringify(p.commonMistakes),
        implementationInsights: p.implementationInsights,
        rarityTier: p.rarityTier,
        usedCount: 0,
      });
    }
  }
}

/**
 * Resolves the genuine algorithmic pattern for a problem based on tags and metadata.
 */
export function resolvePatternForProblem(tags: string[]): { patternId: string; techniqueId: string; secondaryTechs: string[] } {
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));

  // 1. Rare / Advanced
  if (tagSet.has("2-sat")) return { patternId: "two-sat", techniqueId: "rare-advanced", secondaryTechs: ["graph"] };

  // 2. Tree DP & Trees
  if (tagSet.has("trees") && tagSet.has("dp")) return { patternId: "tree-dp-rerooting", techniqueId: "dp", secondaryTechs: ["trees"] };

  // 3. Bitmask DP
  if (tagSet.has("bitmasks") && tagSet.has("dp")) return { patternId: "dp-classical", techniqueId: "dp", secondaryTechs: ["data-structures"] };

  // 4. Classical DP
  if (tagSet.has("dp")) return { patternId: "dp-classical", techniqueId: "dp", secondaryTechs: tagSet.has("math") ? ["math"] : [] };

  // 5. Binary Search on Answer
  if (tagSet.has("binary search")) {
    const secondary: string[] = [];
    if (tagSet.has("greedy")) secondary.push("greedy");
    if (tagSet.has("graphs")) secondary.push("graph");
    return { patternId: "bs-on-answer", techniqueId: "binary-search", secondaryTechs: secondary };
  }

  // 6. Data Structures: Segment Tree & DSU
  if (tagSet.has("dsu")) return { patternId: "dsu-disjoint-set", techniqueId: "data-structures", secondaryTechs: ["graph"] };
  if (tagSet.has("data structures")) return { patternId: "segment-tree-lazy", techniqueId: "data-structures", secondaryTechs: [] };

  // 7. Graphs & Shortest Paths
  if (tagSet.has("shortest paths")) return { patternId: "shortest-path", techniqueId: "graph", secondaryTechs: [] };
  if (tagSet.has("graphs") || tagSet.has("dfs and similar")) return { patternId: "graph-bfs-dfs", techniqueId: "graph", secondaryTechs: [] };

  // 8. Two pointers & prefix sums
  if (tagSet.has("two pointers")) return { patternId: "two-pointers-window", techniqueId: "two-pointers", secondaryTechs: [] };

  // 9. Number theory & Math
  if (tagSet.has("number theory") || tagSet.has("math")) {
    return { patternId: "number-theory-primes", techniqueId: "math", secondaryTechs: tagSet.has("combinatorics") ? ["constructive"] : [] };
  }

  // 10. Constructive
  if (tagSet.has("constructive algorithms")) return { patternId: "constructive-invariants", techniqueId: "constructive", secondaryTechs: [] };

  // 11. Greedy & Sorting
  if (tagSet.has("greedy") && tagSet.has("sortings")) return { patternId: "greedy-sorting", techniqueId: "greedy", secondaryTechs: [] };
  if (tagSet.has("greedy")) return { patternId: "interval-greedy", techniqueId: "greedy", secondaryTechs: [] };

  // Fallback default
  return { patternId: "interval-greedy", techniqueId: "greedy", secondaryTechs: [] };
}

/**
 * Extracts structured knowledge atom for a solved problem.
 */
export async function extractKnowledgeForProblem(params: {
  problemId: string;
  name: string;
  rating: number;
  tags: string[];
  editorialSnippet?: string;
}): Promise<ExtractedKnowledgeAtom> {
  const { problemId, name, rating, tags, editorialSnippet } = params;

  await ensureCanonicalPatternsExist();

  const { patternId, techniqueId, secondaryTechs } = resolvePatternForProblem(tags);

  const pattern = CANONICAL_PATTERNS.find((p) => p.id === patternId);

  return {
    primaryPatternId: patternId,
    primaryPatternName: pattern?.name || "Algorithmic Pattern",
    techniqueId,
    secondaryTechniqueIds: secondaryTechs,
    keyObservation: `Structural observation for ${name} (${problemId}): Problem constraints dictate invariant preservation and optimal substructure.`,
    whyThisApproach: editorialSnippet || `Why this approach: The constraints (rating ${rating || "unrated"}) match the algorithmic complexity of ${pattern?.name}.`,
    safeDecisionProof: pattern?.whyItWorksProof || "Mathematical induction or invariant exchange argument guarantees correctness.",
    implementationTechniques: tags.filter((t) => ["sortings", "data structures", "bitmasks", "math", "matrices"].includes(t)),
    commonTraps: pattern?.commonMistakes || ["Edge conditions on boundary inputs", "32-bit integer overflow"],
    isNewPattern: false,
    isNewVariation: false,
    isNewCombination: secondaryTechs.length > 0,
  };
}

/**
 * Links problem to canonical pattern in database and increments real usage statistics.
 */
export async function linkProblemToCanonicalKnowledge(problemId: string, knowledge: ExtractedKnowledgeAtom) {
  // Check if problem_knowledge already exists
  const existing = await db.query.problemKnowledge.findFirst({
    where: eq(problemKnowledge.problemId, problemId),
  });

  if (!existing) {
    await db.insert(problemKnowledge).values({
      id: `pk_${problemId}`,
      problemId,
      primaryPatternId: knowledge.primaryPatternId,
      secondaryTechniqueIds: JSON.stringify(knowledge.secondaryTechniqueIds),
      keyObservation: knowledge.keyObservation,
      whyThisApproach: knowledge.whyThisApproach,
      safeDecisionProof: knowledge.safeDecisionProof,
      variationId: null,
      implementationTechniques: JSON.stringify(knowledge.implementationTechniques),
      commonTraps: JSON.stringify(knowledge.commonTraps),
    });
  }

  // Increment usage count
  const pattern = await db.query.patterns.findFirst({
    where: eq(patterns.id, knowledge.primaryPatternId),
  });

  if (pattern) {
    await db
      .update(patterns)
      .set({ usedCount: (pattern.usedCount || 0) + 1 })
      .where(eq(patterns.id, knowledge.primaryPatternId));
  }
}
