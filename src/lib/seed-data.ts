import { db } from "@/db";
import {
  users,
  problems,
  submissions,
  segments,
  segmentProblems,
  solutionEvidence,
  verificationRecords,
  techniques,
  patterns,
  variations,
  techniqueCombinations,
  problemKnowledge,
  representativeProblems,
  patternAliases,
  masteryRecords,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function seedDatabaseIfEmpty() {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    return; // Already seeded
  }

  console.log("Seeding canonical CP knowledge base and solved problems...");

  // 1. Primary User
  await db.insert(users).values({
    id: "user_primary",
    email: "coder@codeforces.user",
    name: "CP Grandmaster Learner",
    avatarUrl: "https://userpic.codeforces.org/no-avatar.jpg",
    codeforcesHandle: "tourist_apprentice",
    rating: 1842,
    maxRating: 1910,
    rank: "Candidate Master",
    totalSolved: 612,
    lastSyncedAt: new Date().toISOString(),
  });

  // 2. Canonical Techniques
  const techList = [
    {
      id: "greedy",
      name: "Greedy Algorithms",
      slug: "greedy",
      description: "Making locally optimal choices at each step that provably lead to a globally optimal solution.",
      color: "emerald",
      icon: "Zap",
      commonality: "COMMON",
    },
    {
      id: "binary-search",
      name: "Binary Search",
      slug: "binary-search",
      description: "Logarithmic domain reduction relying on monotonicity of feasibility predicates.",
      color: "amber",
      icon: "Search",
      commonality: "COMMON",
    },
    {
      id: "dp",
      name: "Dynamic Programming",
      slug: "dynamic-programming",
      description: "Decomposing problems into overlapping subproblems with optimal substructure.",
      color: "indigo",
      icon: "Layers",
      commonality: "COMMON",
    },
    {
      id: "graph",
      name: "Graph Theory",
      slug: "graph-theory",
      description: "Modeling relationships, state-transitions, flows, components, and reachability.",
      color: "sky",
      icon: "GitFork",
      commonality: "COMMON",
    },
    {
      id: "math",
      name: "Number Theory & Math",
      slug: "number-theory-math",
      description: "Combinatorics, modular arithmetic, prime factorization, GCD, and algebraic invariants.",
      color: "purple",
      icon: "Binary",
      commonality: "COMMON",
    },
    {
      id: "two-pointers",
      name: "Two Pointers & Sliding Window",
      slug: "two-pointers",
      description: "Iterating two directional indices over linear or sorted sequences to maintain invariants in O(N).",
      color: "teal",
      icon: "MoveHorizontal",
      commonality: "COMMON",
    },
    {
      id: "data-structures",
      name: "Advanced Data Structures",
      slug: "data-structures",
      description: "Segment trees, Fenwick trees, DSU with rollbacks, and monotonic stacks.",
      color: "rose",
      icon: "Database",
      commonality: "UNCOMMON",
    },
    {
      id: "rare-advanced",
      name: "Advanced Structural Techniques",
      slug: "advanced-structural",
      description: "2-SAT, Meet-in-the-Middle, Centroid Decomposition, and Min-Cut transformations.",
      color: "violet",
      icon: "Sparkles",
      commonality: "RARE",
    },
  ];

  for (const t of techList) {
    await db.insert(techniques).values(t);
  }

  // 3. Canonical Patterns (Full 14-point structure)
  const patternList = [
    {
      id: "bs-on-answer",
      techniqueId: "binary-search",
      name: "Binary Search on Answer",
      slug: "binary-search-on-answer",
      coreIdea: "Instead of directly computing an optimal value X, define a check(mid) boolean predicate that decides whether answer <= mid is achievable, leveraging monotonicity to find the transition boundary in O(log(Range) * checkTime).",
      mentalModel: "The Guessing Gauge: Imagine turning a temperature knob. Too cold? Impossible. Warm enough? Feasible. Once it is hot enough, every higher temperature is also feasible. Find the exact click where feasibility turns from false to true.",
      realLifeAnalogy: "Testing the minimum rope length needed to cross a chasm. If a 15-meter rope reaches, any longer rope will also reach. If a 10-meter rope falls short, any shorter rope also fails. You don't guess every centimeter; you binary halve the rope lengths.",
      discoveryFlow: `1. Problem asks for 'Minimize the maximum ...' or 'Maximize the minimum ...'
2. Constructing the optimal value directly requires complex inter-dependent choices.
3. INVERSION: What if someone gave us candidate answer X for free?
4. Observation: If X is achievable, is X+1 strictly easier or harder?
5. Monotonicity confirmed: check(X) is monotonic (e.g. F, F, F, T, T, T).
6. Result: Binary search the answer range [low, high] with a greedy/O(N) check(mid) function.`,
      recognitionSignals: JSON.stringify([
        "Minimizing the maximum cost or bottleneck",
        "Maximizing the minimum distance or capacity",
        "Checking feasibility of a fixed target is dramatically simpler than direct optimization",
        "Monotonicity property: if target K is valid, any K+1 (or K-1) remains valid",
        "The search space for the answer is clearly bounded and discrete or continuous"
      ]),
      standardApproach: `1. Identify lower and upper bounds [low, high] for the answer.
2. Formulate boolean check(target): Return true if target is achievable under constraints.
3. While low <= high:
   mid = low + (high - low) / 2
   if check(mid): ans = mid, high = mid - 1 (for minimization)
   else: low = mid + 1
4. Return ans.`,
      whyItWorksProof: "Monotonicity Invariant: The domain partitions into two contiguous intervals [low ... K-1] where check is false, and [K ... high] where check is true. Each comparison halves the remaining interval. At termination, the interval width is 1, pinpointing the unique boundary K.",
      whyNotOthers: "Dynamic programming would require tracking the target as part of the state, resulting in O(N * Value) time (TLE/MLE). Direct greedy fails because local choices without knowing the global threshold make sub-optimal commitments.",
      commonMistakes: JSON.stringify([
        "Setting search boundaries [low, high] too narrow, missing extreme answers",
        "Integer overflow during (low + high) calculation or check function multiplications (use 64-bit int / long long)",
        "Off-by-one errors in while condition or boundary updates (stick to invariant: ans stores best valid mid)",
        "Failing to verify that check(mid) is strictly monotonic across all edge cases"
      ]),
      implementationInsights: "Use `long long mid = low + (high - low) / 2` to prevent overflow. If continuous/real numbers, use 60 to 100 fixed iterations instead of `while(high - low > eps)` to avoid floating-point precision traps.",
      rarityTier: "COMMON",
      usedCount: 42,
    },
    {
      id: "interval-greedy",
      techniqueId: "greedy",
      name: "Interval Scheduling & Finishing-Time Greedy",
      slug: "interval-scheduling-greedy",
      coreIdea: "Order intervals by a critical endpoint (typically earliest finishing time or earliest start time) to minimize conflicts and preserve maximal remaining resource freedom for future choices.",
      mentalModel: "Preserving Future Freedom: At any crossroads, choose the option that consumes the least remaining territory or finishes earliest, leaving maximum possible room for all subsequent decisions.",
      realLifeAnalogy: "Booking meeting rooms or attending festival gigs. If you want to attend as many talks as possible, picking a talk that finishes at 10:15 AM leaves room for a 10:30 AM talk, whereas picking a talk that runs until 1:00 PM blocks out half your day.",
      discoveryFlow: `1. Problem involves intervals [L_i, R_i] that compete for shared resources or non-overlapping selection.
2. Initial instinct: Shortest duration first? Counterexample: [1, 10], [9, 11], [10, 20]. Shortest [9, 11] eliminates two others.
3. Second instinct: Earliest start time? Counterexample: [1, 100] eliminates [2, 3], [4, 5].
4. Crucial Observation: What leaves the most remaining room for future intervals? Earliest END time!
5. Proof by exchange argument: Replacing any interval in an optimal solution with the earliest finishing one cannot increase overlap with remaining elements.`,
      recognitionSignals: JSON.stringify([
        "Set of 1D intervals [l_i, r_i] with selection or coverage criteria",
        "Non-overlapping subset maximization",
        "Minimum number of machines/rooms needed to service all intervals",
        "Events with deadlines and durations where earliest deadline first (EDF) applies"
      ]),
      standardApproach: `1. Store intervals as structs/pairs (start, end).
2. Sort intervals primarily by end time ascending (or start time if tracking active machines).
3. Initialize last_end = -infinity, count = 0.
4. For each interval:
   if interval.start >= last_end:
      count++
      last_end = interval.end
5. Return count.`,
      whyItWorksProof: "Exchange Argument: Let S* be an optimal solution and g_1 be the interval with earliest end time. If g_1 is not in S*, let s_1 be the first interval in S*. Since g_1 ends no later than s_1, replacing s_1 with g_1 cannot conflict with any subsequent intervals in S*. By induction, the greedy choice is always part of an optimal set.",
      whyNotOthers: "Dynamic programming on intervals O(N^2) or O(N log N) works but is unnecessary when the matroid/greedy exchange property holds. Brute force is O(2^N).",
      commonMistakes: JSON.stringify([
        "Sorting by start time instead of end time for max independent set",
        "Sorting by interval length (duration) which fails on bottleneck overlaps",
        "Strict vs non-strict inequalities (e.g. interval touches endpoint: can start == prev_end or must start > prev_end?)"
      ]),
      implementationInsights: "Use `std::sort` with custom lambda or `std::pair<int, int>` sorted by `.second`. When managing multiple concurrent rooms, combine with `std::priority_queue` tracking earliest available room.",
      rarityTier: "COMMON",
      usedCount: 38,
    },
    {
      id: "prefix-sum-hashmap",
      techniqueId: "two-pointers",
      name: "Prefix Sum with Frequency Map (Contribution Invariant)",
      slug: "prefix-sum-frequency-map",
      coreIdea: "Convert subarray sum queries sum(L..R) == Target into algebraic differences Pref[R] - Pref[L-1] == Target. Rearrange to Pref[L-1] == Pref[R] - Target and query frequency map in O(1) time.",
      mentalModel: "The Relative Elevation Tracker: Instead of measuring every dip between mountains, measure the elevation from sea level at every step. A drop of 100 meters between two points means elevation(A) - elevation(B) = 100.",
      realLifeAnalogy: "Bank account statement: To know if you had an exact $500 expense period, look at your running balance today. If your balance today is $1200, check if your balance was ever $700 in the past.",
      discoveryFlow: `1. Problem asks to count subarrays or subsegments satisfying a condition (e.g. sum divisible by K, equal 0s and 1s, exact sum).
2. Naive approach checks all pairs (L, R) in O(N^2).
3. Reformulate subarray property as difference between prefix cumulative states.
4. Algebraic transformation: Pref[R] - Pref[L-1] = K <=> Pref[L-1] = Pref[R] - K.
5. Invariant: As R advances from 1 to N, all valid L-1 have already been computed and stored in a hash table / frequency array.`,
      recognitionSignals: JSON.stringify([
        "Count of contiguous subarrays with sum equal to K or divisible by K",
        "Subarrays with equal number of positive and negative elements (+1/-1 transformation)",
        "Parity or modular condition over range queries",
        "Constraints where O(N^2) is TLE (N = 2 * 10^5) requiring O(N) linear scan"
      ]),
      standardApproach: `1. Map/Frequency array freq initialized with freq[0] = 1 (empty prefix).
2. Running sum current_sum = 0, total_count = 0.
3. Loop through array:
   current_sum += a[i]
   needed = current_sum - target
   if needed in freq: total_count += freq[needed]
   freq[current_sum]++
4. Return total_count.`,
      whyItWorksProof: "Algebraic Bijection: Every valid pair (L, R) corresponds to an occurrence of Pref[L-1] = Pref[R] - target with L-1 < R. By streaming R linearly and maintaining the history of prefixes strictly before R, every valid subarray ending at R is counted exactly once.",
      whyNotOthers: "Two pointers cannot handle negative numbers because prefix sum ceases to be monotonic. Hash map handles arbitrary integers without monotonicity requirements.",
      commonMistakes: JSON.stringify([
        "Forgetting the base case freq[0] = 1, which misses valid subarrays starting from index 0",
        "Using `std::unordered_map` with default hash on Codeforces, which gets hacked to O(N^2) by Anti-Hash test cases (use `custom_hash` or direct array when bounded)",
        "Mod arithmetic with negative numbers (must compute ((sum % K) + K) % K)"
      ]),
      implementationInsights: "On Codeforces, NEVER use default `std::unordered_map<long long, int>`. Use `custom_hash` with `chrono::steady_clock::now().time_since_epoch().count()` to prevent worst-case O(N^2) collision hacks.",
      rarityTier: "COMMON",
      usedCount: 51,
    },
    {
      id: "tree-dp-rerooting",
      techniqueId: "dp",
      name: "Tree DP with Rerooting (In-Out Tree DP)",
      slug: "tree-dp-rerooting",
      coreIdea: "Compute an objective function for every node in a tree as if that node were the root, in O(N) total time instead of O(N^2), by first doing a bottom-up DP (inside subtree) and then a top-down rerooting DP (outside subtree).",
      mentalModel: "The Global Spokesperson: When a company reorganizes, moving headquarters from city A to neighboring city B doesn't recalculate the whole world—only the relationship between A and B flips! The rest of the tree stays attached to their respective local centers.",
      realLifeAnalogy: "Moving the capital city of an empire. When moving the capital from Rome to Milan, the travel distance from Milan to all cities inside Milan's old province stays identical. Only the branch connecting back to Rome needs adjustment. You roll the hub forward across edges.",
      discoveryFlow: `1. Problem asks to solve a subtree-style query for EVERY vertex v in 1..N (e.g. sum of distances to all other nodes, maximum path from v).
2. Rooting at a single node and running DP takes O(N). Doing this for all N nodes is O(N^2), which TLEs for N = 2 * 10^5.
3. Critical observation: Moving root across an edge (u -> v) only changes the parent-child relationship between u and v! All subtrees of children of v remain completely unchanged.
4. Two-pass paradigm:
   Pass 1 (Bottom-up DFS): Compute dp_in[u] (answer considering only u's subtree when rooted at 1).
   Pass 2 (Top-down DFS): Pass dp_out[u] down to child v, combining u's contribution excluding v with v's own dp_in[v].`,
      recognitionSignals: JSON.stringify([
        "Problem on trees asking to evaluate an aggregate for ALL vertices as root",
        "N up to 2 * 10^5 (demands strictly O(N) time)",
        "Operations that are reversible or easily combined (e.g. addition, max with prefix/suffix sweeps)",
        "Distance sums, diameter through each node, or tree center variations"
      ]),
      standardApproach: `1. Pass 1 DFS(u, parent):
   Compute subtree sizes, depth sums, or dp_in[u] from children.
2. Pass 2 Reroot(u, parent):
   ans[u] = combine(dp_in[u], dp_out[u])
   For each child v of u:
     Compute transition: remove v's contribution from u, add it to parent-branch of v.
     Reroot(v, u).
3. Collect ans[1..N].`,
      whyItWorksProof: "Inductive Decomposition of Tree Topology: For any edge (u, v), removing (u, v) partitions the tree into two disjoint components: T_u and T_v. When rooted at u, T_v is a subtree. When rooted at v, T_u becomes the parent component. Because trees have no cycles, the transition equations are exact and preserve conservation of total nodes and paths.",
      whyNotOthers: "Heavy-light decomposition or Centroid decomposition can answer queries in O(N log N) or O(N log^2 N), but rerooting DP achieves optimal O(N) with vastly simpler code and zero heavy data structure overhead.",
      commonMistakes: JSON.stringify([
        "Failing to handle non-invertible operations (e.g. max instead of sum): When taking max, subtracting a child isn't possible, so you must use prefix and suffix maximum arrays over children",
        "Mod arithmetic errors when subtracting child contribution",
        "Stack overflow on deep bamboo trees without sufficient stack size (prefer recursion unrolling or pragmas)"
      ]),
      implementationInsights: "If the combination operator is not invertible (like `std::max`), maintain prefix and suffix arrays of children's DP values for each node. Then excluding child `i` is simply `max(prefix[i-1], suffix[i+1])`.",
      rarityTier: "UNCOMMON",
      usedCount: 16,
    },
    {
      id: "monotonic-queue-dp",
      techniqueId: "dp",
      name: "Monotonic Queue DP Optimization",
      slug: "monotonic-queue-dp-optimization",
      coreIdea: "Optimize DP transitions of the form DP[i] = min/max_{i-K <= j < i} (DP[j] + cost(j)) from O(N * K) to O(N) amortized by maintaining candidates in a double-ended queue (deque) with strictly monotonic values.",
      mentalModel: "The Younger and Stronger Principle: If candidate j arrives after candidate k (j > k) and candidate j is cheaper/better than candidate k (val[j] <= val[k]), candidate k is completely obsolete. Candidate k will never be used because j will outlast k and is strictly better.",
      realLifeAnalogy: "Sports roster management: If a new 20-year-old player is faster and scores more goals than a 34-year-old veteran, the veteran will never be chosen over the rookie for any upcoming match before retirement. The veteran is safely dropped from the depth chart.",
      discoveryFlow: `1. Formulate standard DP: DP[i] = min_{j in [i-K, i-1]} { DP[j] } + cost[i].
2. Notice inner loop scans a sliding window of length K. Overall time is O(N * K).
3. If K is up to N, O(N^2) TLEs.
4. Realize: We only care about the MINIMUM in the window.
5. Invariant: Maintain a deque of indices where values are strictly increasing:
   - Elements outside window [i-K] are popped from front.
   - New element pops all worse elements from back before inserting.
6. Front of deque always holds the optimal j in O(1)!`,
      recognitionSignals: JSON.stringify([
        "DP state depends on the extremum (min/max) over a sliding index range [i-K, i-1]",
        "Transition cost decomposes into f(i) + g(j) without cross-multiplication (no i * j terms)",
        "Constraints: N, K up to 10^5 or 10^6 where O(N * K) TLEs but O(N) is required",
        "Sliding window maximum / minimum subproblems"
      ]),
      standardApproach: `1. Deque<int> dq (stores indices).
2. For i = 1 to N:
   // 1. Evict expired indices outside window [i-K, i-1]
   while (!dq.empty() && dq.front() < i - K) dq.pop_front();
   // 2. Best candidate is at front
   dp[i] = dp[dq.front()] + cost[i];
   // 3. Maintain monotonic order (remove worse candidates)
   while (!dq.empty() && dp[dq.back()] >= dp[i]) dq.pop_back();
   dq.push_back(i);`,
      whyItWorksProof: "Amortized Complexity & Invariant: Every index is pushed to the deque exactly once and popped at most once (either from the back due to monotonicity violation or from the front due to window expiry). Total operations across all N steps is bounded by 2N, yielding strictly O(1) amortized per transition.",
      whyNotOthers: "Segment Tree or Fenwick Tree over DP values gives O(N log N). While O(N log N) passes some time limits, Monotonic Queue gives true O(N) with minimal constant factor and zero memory overhead.",
      commonMistakes: JSON.stringify([
        "Confusing deque indices with deque values (store indices, look up DP values)",
        "Popping from front before updating DP versus after",
        "Strict vs non-strict inequalities in `dp[dq.back()] >= dp[i]` (using `>=` keeps the deque minimal)"
      ]),
      implementationInsights: "Use `std::deque<int>` or a static array circular buffer for maximum cache locality and speed on high-frequency time limits.",
      rarityTier: "UNCOMMON",
      usedCount: 14,
    },
    {
      id: "segment-tree-lazy",
      techniqueId: "data-structures",
      name: "Segment Tree with Lazy Propagation",
      slug: "segment-tree-lazy-propagation",
      coreIdea: "Support range updates (e.g. add X to [L..R], assign X to [L..R]) and range aggregate queries in O(log N) by deferring update execution to children until those subtrees are explicitly accessed.",
      mentalModel: "The Procrastinating Manager: When a memo comes to update 10,000 files in storage room B, don't walk into room B and update all 10,000 files immediately. Stick a sticky note on the door of room B: '+5 to everything inside'. Only when a worker actually opens a specific cabinet do you push the note down one level.",
      realLifeAnalogy: "Credit card batch statement: The bank doesn't update every individual receipt into your master ledger on the exact second you tap. They record an unposted transaction ledger and reconcile the leaf accounts at end-of-day billing.",
      discoveryFlow: `1. Problem requires both Range Updates (modifying elements in [L, R]) and Range Queries (sum, min, max in [Q_L, Q_R]).
2. Point-update segment tree takes O(N log N) per range update (too slow).
3. Difference array handles range updates in O(1) but cannot handle dynamic range queries.
4. Solution: Segment Tree where each node maintains a lazy tag.
5. Whenever visiting a node, call push_down(node) to cascade deferred operations to its children before recursing.`,
      recognitionSignals: JSON.stringify([
        "Both updates and queries apply to arbitrary ranges [L, R]",
        "N and Q up to 2 * 10^5",
        "The update operation is associative and distributes cleanly over the query aggregate (e.g. Addition distributes over Sum: Sum += Length * AddVal)",
        "Dynamic range queries with interval modifications"
      ]),
      standardApproach: `1. Maintain tree[4*N] and lazy[4*N].
2. push(node, l, r): If lazy[node] != 0:
   apply lazy to children, update tree[child], push lazy tags, clear lazy[node].
3. update(node, l, r, ql, qr, val):
   if [l, r] in [ql, qr]: apply tag, return.
   push(node, l, r)
   recurse left and right, pull(node).
4. query(node, l, r, ql, qr):
   if [l, r] in [ql, qr]: return tree[node].
   push(node, l, r)
   return combine(query(left), query(right)).`,
      whyItWorksProof: "Canonical Interval Decomposition: Any query or update interval [L, R] intersects at most 2 nodes per level of the segment tree. Because tree height is ceil(log2 N), at most 4 * log2 N nodes are visited. All deferred invariants are restored along the active search path by push(), guaranteeing exact correctness.",
      whyNotOthers: "Fenwick tree can support range updates and range sums via two auxiliary trees, but cannot easily support complex combinations like range assignment + range sum or range add + range min.",
      commonMistakes: JSON.stringify([
        "Multiplying lazy additions without accounting for node interval length (sum += lazy * (r - l + 1))",
        "Forgetting to call push() before querying children or updating children",
        "Tree array size allocated as 2*N instead of 4*N leading to Out-Of-Bounds memory errors"
      ]),
      implementationInsights: "Always allocate arrays to size `4 * MAXN`. Structuring nodes into a clean `struct Node` with `apply()` and `push()` methods reduces bug surface area by 80%.",
      rarityTier: "UNCOMMON",
      usedCount: 22,
    },
    {
      id: "two-sat",
      techniqueId: "rare-advanced",
      name: "2-Satisfiability (2-SAT) via Strongly Connected Components",
      slug: "2-sat-scc-implication-graph",
      coreIdea: "Determine if a boolean formula in 2-CNF form (conjunction of clauses with 2 literals: (x or y) and (not x or z)...) is satisfiable in linear O(V + E) time by constructing an implication graph and finding Strongly Connected Components using Kosaraju or Tarjan.",
      mentalModel: "The Domino Chain of Necessity: (A or B) means: 'If NOT A, then B MUST be true' (NOT A => B), and 'If NOT B, then A MUST be true' (NOT B => A). If a domino chain forces A => NOT A and also NOT A => A, the system locks into an impossible paradox!",
      realLifeAnalogy: "Wedding seating constraints: Each rule says 'Either Alice or Bob must sit at table 1'. This implies 'If Alice doesn't, Bob must'. If the chain of obligations forces someone to simultaneously be present and absent, no valid seating exists.",
      discoveryFlow: `1. Problem presents a set of N binary decisions (take / leave, horizontal / vertical, true / false).
2. Constraints restrict pairs of items: At least one must be true, or they cannot both be true.
3. This is exact 2-CNF (Boolean Satisfiability with 2 variables per clause).
4. Note: 3-SAT is NP-Complete, but 2-SAT is solvable in linear time!
5. Transform clause (u or v) into two directed implication edges: (!u -> v) and (!v -> u).
6. Run Tarjan's or Kosaraju's SCC algorithm.
7. Theorem: Satisfiable if and only if for every variable x, x and !x belong to DIFFERENT strongly connected components!`,
      recognitionSignals: JSON.stringify([
        "Objects have exactly 2 valid states or choices",
        "Pairwise conflict constraints: 'cannot pick both', 'must pick at least one', 'if this is chosen, that must not be chosen'",
        "Decision problem asking 'Is there any valid configuration?' or 'Find any valid assignment'",
        "Graph vertex count up to 2 * 10^5 where O(V + E) SCC runs well within 1.0s"
      ]),
      standardApproach: `1. For N variables, create 2N graph nodes: 2*i for x_i, 2*i + 1 for !x_i.
2. For each clause (u or v):
   add_edge(!u, v)
   add_edge(!v, u)
3. Run Tarjan's SCC to assign scc_id to each vertex.
4. For each variable i:
   if scc_id[2*i] == scc_id[2*i + 1]: return UNSATISFIABLE.
5. If satisfiable: assign value based on topological order of SCCs:
   val[i] = (scc_id[2*i] < scc_id[2*i + 1]).`,
      whyItWorksProof: "Topological Soundness of Directed Implications: If x and !x are in the same SCC, there exists a cycle x => ... => !x => ... => x, meaning x implies its own negation and vice-versa, which is a formal contradiction. If they are in different SCCs, contracting SCCs produces a DAG where assigning variables in reverse topological order guarantees no implication false => true is violated.",
      whyNotOthers: "Backtracking or recursion is exponential O(2^N). Network flow can model some closure problems, but 2-SAT is strictly linear O(V + E) and handles full boolean 2-CNF logic.",
      commonMistakes: JSON.stringify([
        "Index representation mistakes when converting between 1-based variables and 0-based 2N graph nodes",
        "Only adding one implication edge (!u -> v) and forgetting the contrapositive (!v -> u)",
        "Assigning true to whichever SCC has larger ID vs smaller ID without verifying topological sorting convention"
      ]),
      implementationInsights: "Use Tarjan's algorithm. In Tarjan's algorithm, SCC IDs are naturally discovered in REVERSE topological order, meaning `assignment[i] = (scc[2*i] < scc[2*i+1])` immediately yields a valid satisfying assignment.",
      rarityTier: "RARE",
      usedCount: 7,
    },
  ];

  for (const p of patternList) {
    await db.insert(patterns).values(p);
  }

  // 4. Canonical Variations
  const variationList = [
    {
      id: "var-bs-greedy",
      patternId: "bs-on-answer",
      name: "Binary Search on Answer + Greedy Feasibility",
      slug: "bs-answer-greedy-feasibility",
      description: "The check(mid) function uses a greedy scan (e.g. partition into K segments with sum <= mid) to verify validity.",
      constraintContext: "Continuous array partitioning, resource allocations with monotonic capacity.",
      representativeProblemId: "1840D",
    },
    {
      id: "var-bs-graph",
      patternId: "bs-on-answer",
      name: "Binary Search on Answer + BFS/Dijkstra Feasibility",
      slug: "bs-answer-graph-feasibility",
      description: "Binary search over maximum edge weight or bottleneck capacity, where check(mid) tests reachability via BFS over edges <= mid.",
      constraintContext: "Graph routing with bottleneck min-max objectives.",
      representativeProblemId: "1850H",
    },
    {
      id: "var-greedy-pq",
      patternId: "interval-greedy",
      name: "Interval Greedy with Priority Queue (Room Allocation)",
      slug: "interval-greedy-priority-queue",
      description: "Greedily allocate intervals across multiple concurrent servers/rooms by querying a min-heap of room release times.",
      constraintContext: "Resource contention where intervals cannot be dropped and minimum machines must be found.",
      representativeProblemId: "1872D",
    },
    {
      id: "var-reroot-prefix-suffix",
      patternId: "tree-dp-rerooting",
      name: "Tree DP Rerooting with Non-Invertible Aggregates (Prefix/Suffix)",
      slug: "tree-dp-rerooting-prefix-suffix",
      description: "When the tree aggregate is non-invertible (e.g. max path length), compute prefix and suffix sweeps of sibling children.",
      constraintContext: "Trees with max-distance or bottleneck diameters.",
      representativeProblemId: "1850E",
    },
  ];

  for (const v of variationList) {
    await db.insert(variations).values(v);
  }

  // 5. Technique Combinations
  const combList = [
    {
      id: "comb-greedy-pq",
      name: "Greedy + Priority Queue",
      techniqueAId: "greedy",
      techniqueBId: "data-structures",
      rationale: "Greedy decisions determine candidate order, while Priority Queue dynamically maintains the best available resource in O(log N).",
      roleA: "Provides the heuristic ordering and invariant choices.",
      roleB: "Tracks live available deadlines/resources with logarithmic maintenance.",
      emergenceClue: "When intervals arrive dynamically or tasks have variable execution times and deadlines.",
      representativeProblemId: "1872D",
      frequency: 24,
    },
    {
      id: "comb-bs-greedy",
      name: "Binary Search + Greedy",
      techniqueAId: "binary-search",
      techniqueBId: "greedy",
      rationale: "Binary search locks in a candidate threshold value, transforming an optimization problem into an easily verifiable greedy feasibility check.",
      roleA: "Explores the monotonic solution space in O(log Range).",
      roleB: "Verifies if the threshold is attainable in O(N) linear time.",
      emergenceClue: "'Minimize maximum capacity' where greedy packing works once the capacity is fixed.",
      representativeProblemId: "1840D",
      frequency: 31,
    },
    {
      id: "comb-dp-graph",
      name: "Dynamic Programming + Graph Theory",
      techniqueAId: "dp",
      techniqueBId: "graph",
      rationale: "Formulating DP transitions along the topological sort of a Directed Acyclic Graph (DAG) or Tree structure.",
      roleA: "Maintains optimal subproblem state values and transitions.",
      roleB: "Provides the dependency ordering and acyclic structure.",
      emergenceClue: "Longest paths, number of paths, or state transitions defined over graph edges.",
      representativeProblemId: "1850H",
      frequency: 19,
    },
  ];

  for (const c of combList) {
    await db.insert(techniqueCombinations).values(c);
  }

  // 6. Pattern Aliases
  const aliasList = [
    { id: "al-1", patternId: "bs-on-answer", alias: "BS on Answer" },
    { id: "al-2", patternId: "bs-on-answer", alias: "Parametric Binary Search" },
    { id: "al-3", patternId: "bs-on-answer", alias: "Binary Search over Answer" },
    { id: "al-4", patternId: "interval-greedy", alias: "Interval Scheduling" },
    { id: "al-5", patternId: "interval-greedy", alias: "Earliest Deadline First" },
    { id: "al-6", patternId: "tree-dp-rerooting", alias: "Rerooting DP" },
    { id: "al-7", patternId: "tree-dp-rerooting", alias: "In-Out Tree DP" },
    { id: "al-8", patternId: "monotonic-queue-dp", alias: "Sliding Window DP" },
    { id: "al-9", patternId: "two-sat", alias: "2-SAT" },
  ];

  for (const a of aliasList) {
    await db.insert(patternAliases).values(a);
  }

  // 7. Real Codeforces Solved Problems Dataset
  const sampleProblems = [
    {
      id: "1872A",
      contestId: 1872,
      index: "A",
      name: "Two Vessels",
      rating: 800,
      tags: JSON.stringify(["greedy", "math"]),
      problemUrl: "https://codeforces.com/contest/1872/problem/A",
      solvedAt: 1694098200,
      primaryPatternId: "interval-greedy",
      secondaryTechs: JSON.stringify(["math"]),
      keyObservation: "The absolute volume difference |a - b| must be transferred in increments of up to 2c. The minimum number of steps is ceil(|a - b| / (2 * c)).",
      whyThisApproach: "Direct greedy arithmetic: each move should transfer the maximum allowed water (c) from the fuller vessel to the emptier vessel.",
      safeDecisionProof: "Moving maximal water at each step reduces distance to equality by exactly 2c, which is the maximal possible convergence rate.",
      implTechs: JSON.stringify(["Integer division with ceil"]),
      commonTraps: JSON.stringify(["Forgetting integer rounding ceiling: use (diff + 2*c - 1) / (2*c)"]),
      editorialSnippet: "Let the difference between a and b be d = |a - b|. Each move can decrease this difference by at most 2c. Thus the minimum number of moves is ceil(d / (2c)).",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 100,
    },
    {
      id: "1872B",
      contestId: 1872,
      index: "B",
      name: "The Corridor or There and Back Again",
      rating: 900,
      tags: JSON.stringify(["greedy", "implementation"]),
      problemUrl: "https://codeforces.com/contest/1872/problem/B",
      solvedAt: 1694098800,
      primaryPatternId: "interval-greedy",
      secondaryTechs: JSON.stringify(["greedy"]),
      keyObservation: "A trap at room d_i with timer s_i triggers when we reach room d_i. We must return to room 1 before room d_i + s_i trap springs.",
      whyThisApproach: "Calculate the furthest reach allowed by each trap independently: d_i + (s_i - 1) / 2. The global limit is the minimum over all traps.",
      safeDecisionProof: "Since corridors are 1D, triggering any trap imposes a strict upper bound on how far forward one can walk before having to turn back.",
      implTechs: JSON.stringify(["Running minimum tracking"]),
      commonTraps: JSON.stringify(["Forgetting the round-trip distance back to room d_i takes 2 * delta steps"]),
      editorialSnippet: "When you reach room d_i, you have s_i seconds until the trap activates. If you go to room d_i + k and return to d_i, you spend 2k seconds. Hence 2k < s_i, k <= (s_i - 1)/2.",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 98,
    },
    {
      id: "1872C",
      contestId: 1872,
      index: "C",
      name: "Non-coprime Split",
      rating: 1100,
      tags: JSON.stringify(["math", "number theory"]),
      problemUrl: "https://codeforces.com/contest/1872/problem/C",
      solvedAt: 1694099500,
      primaryPatternId: "prefix-sum-hashmap",
      secondaryTechs: JSON.stringify(["math"]),
      keyObservation: "If any even number > 2 exists in [l, r], we can split it into (2, x - 2). If l == r is odd, find its smallest prime divisor d, and split into (d, x - d).",
      whyThisApproach: "Even numbers automatically share gcd >= 2. For an odd number, any non-trivial factor d allows splitting into d * 1 and d * (k - 1).",
      safeDecisionProof: "gcd(d, x - d) = gcd(d, x) = d >= 2, which satisfies the non-coprime criterion by definition.",
      implTechs: JSON.stringify(["Trial division up to sqrt(x)"]),
      commonTraps: JSON.stringify(["Numbers <= 3 have no valid split", "l == r being prime has no answer (-1)"]),
      editorialSnippet: "If r >= 4 and r - l >= 1, there is always an even number >= 4 in [l, r]. If l == r, test if l has any divisor d <= sqrt(l). If so, answer is (d, l - d).",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 100,
    },
    {
      id: "1872D",
      contestId: 1872,
      index: "D",
      name: "Plus Minus Permutation",
      rating: 1200,
      tags: JSON.stringify(["greedy", "math"]),
      problemUrl: "https://codeforces.com/contest/1872/problem/D",
      solvedAt: 1694100200,
      primaryPatternId: "interval-greedy",
      secondaryTechs: JSON.stringify(["math", "data-structures"]),
      keyObservation: "Indices divisible by both x and y cancel out (they are both added and subtracted). Only indices divisible by x but not y get added, and indices divisible by y but not x get subtracted.",
      whyThisApproach: "Greedy rearrangement inequality: assign the largest available integers from {1..n} to positive positions, and smallest to negative positions.",
      safeDecisionProof: "By the Rearrangement Inequality, to maximize sum(P[i]) - sum(P[j]), the top-k elements must be placed in positive slots and bottom-m elements in negative slots.",
      implTechs: JSON.stringify(["LCM calculation: lcm(x, y) = (x * y) / gcd(x, y)", "Arithmetic progression sum formulas"]),
      commonTraps: JSON.stringify(["Overflow in x * y before gcd division (use 64-bit int)"]),
      editorialSnippet: "Count positions divisible by x as c_x = n / x, positions divisible by y as c_y = n / y, and common positions as c_xy = n / lcm(x, y). Assign largest c_x - c_xy numbers to positive and smallest c_y - c_xy to negative.",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 100,
    },
    {
      id: "1872E",
      contestId: 1872,
      index: "E",
      name: "Data Structures Fan",
      rating: 1300,
      tags: JSON.stringify(["data structures", "bitmasks"]),
      problemUrl: "https://codeforces.com/contest/1872/problem/E",
      solvedAt: 1694101100,
      primaryPatternId: "prefix-sum-hashmap",
      secondaryTechs: JSON.stringify(["data-structures"]),
      keyObservation: "Flipping bits in range [l, r] inverts their character. XOR sum is associative: XORing the total sum of 0s with range_xor[l, r] accurately updates both the 0-XOR and 1-XOR in O(1).",
      whyThisApproach: "Prefix XOR array allows querying XOR sum of any range in O(1). Maintain global XOR0 and XOR1 and toggle with range XOR.",
      safeDecisionProof: "XOR involution property: A ^ B ^ B = A. Toggling a subset of elements simply XORs both accumulators with the range XOR.",
      implTechs: JSON.stringify(["Prefix XOR array"]),
      commonTraps: JSON.stringify(["Using a full segment tree which is unnecessarily complex and slower than O(1) prefix XOR"]),
      editorialSnippet: "Precalculate prefix XORs of array a. Maintain total XOR sum of elements with s[i] == '0' and s[i] == '1'. An update on [l, r] simply XORs both totals with pref[r] ^ pref[l-1].",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 96,
    },
    {
      id: "1840D",
      contestId: 1840,
      index: "D",
      name: "Wooden Toy Festival",
      rating: 1300,
      tags: JSON.stringify(["binary search", "greedy", "sortings"]),
      problemUrl: "https://codeforces.com/contest/1840/problem/D",
      solvedAt: 1686067200,
      primaryPatternId: "bs-on-answer",
      secondaryTechs: JSON.stringify(["greedy"]),
      keyObservation: "If 3 carvers can achieve maximum wait time <= W, then each carver can cover a continuous sorted interval of toy patterns of width <= 2 * W. Feasibility is monotonic with respect to W.",
      whyThisApproach: "Directly clustering into 3 optimal centers is difficult, but verifying if 3 intervals of width 2*W can cover the sorted array is a trivial O(N) greedy sweep.",
      safeDecisionProof: "Monotonicity: If wait time W is achievable, any W' > W can only make coverage intervals wider and thus remains achievable. Greedy choice: start first carver at a[0] + W, second at next uncovered + W, third at next uncovered + W.",
      implTechs: JSON.stringify(["Sort array", "Binary search range [0, 10^9]"]),
      commonTraps: JSON.stringify(["Not sorting array before greedy sweep", "Off-by-one in interval span: range covered is [x, x + 2*W]"]),
      editorialSnippet: "Sort the array a. Binary search for answer W. Check function: first carver covers [a[0], a[0] + 2W]. Find first element not covered, second carver covers up to that + 2W. If third covers the rest, return true.",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 100,
    },
    {
      id: "1850H",
      contestId: 1850,
      index: "H",
      name: "The Third Letter",
      rating: 1700,
      tags: JSON.stringify(["dfs and similar", "dsu", "graphs"]),
      problemUrl: "https://codeforces.com/contest/1850/problem/H",
      solvedAt: 1689955200,
      primaryPatternId: "bs-on-answer",
      secondaryTechs: JSON.stringify(["graph"]),
      keyObservation: "Each condition 'person b is at a + d' is a directed weighted edge in a relative coordinate graph. Consistency requires no contradicting path weights in any connected component.",
      whyThisApproach: "Run DFS from unvisited nodes, fixing the first node at coordinate 0. If a node is visited again with a conflicting coordinate, the system is impossible (NO).",
      safeDecisionProof: "Tree components have unique relative distances. If a cycle exists, the algebraic sum of weights around the cycle must equal 0; otherwise, no 1D coordinate embedding exists.",
      implTechs: JSON.stringify(["Weighted Graph DFS / Weighted DSU with potentials"]),
      commonTraps: JSON.stringify(["Coordinates can exceed 32-bit int: use long long for positional coordinates"]),
      editorialSnippet: "Build a graph where an edge (a, b) has weight d. In each connected component, fix pos[root] = 0 and run DFS. If for any visited vertex, pos[v] != pos[u] + weight, print NO.",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 97,
    },
    {
      id: "1850E",
      contestId: 1850,
      index: "E",
      name: "Cardboard for Pictures",
      rating: 1100,
      tags: JSON.stringify(["binary search", "geometry", "math"]),
      problemUrl: "https://codeforces.com/contest/1850/problem/E",
      solvedAt: 1689953400,
      primaryPatternId: "bs-on-answer",
      secondaryTechs: JSON.stringify(["math"]),
      keyObservation: "Total cardboard area is sum_{i=1}^n (s_i + 2*w)^2. This function is strictly monotonically increasing with respect to border width w.",
      whyThisApproach: "Binary search on w in range [1, 10^9]. For a candidate w, evaluate total cardboard. If total == c, found; if > c, w is too large; if < c, w is too small.",
      safeDecisionProof: "Strict monotonicity of quadratic polynomial with positive coefficients guarantees exactly one positive root.",
      implTechs: JSON.stringify(["Binary search", "Early break in check function to prevent 64-bit int overflow"]),
      commonTraps: JSON.stringify(["Overflow when squaring (s_i + 2*w) for large w (break immediately if sum exceeds c)"]),
      editorialSnippet: "Binary search for w. The sum of (s_i + 2w)^2 strictly increases with w. Range is [1, 10^9]. During summation, if sum > c, terminate early to prevent overflow.",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 100,
    },
    {
      id: "1618D",
      contestId: 1618,
      index: "D",
      name: "Array Eversion",
      rating: 1200,
      tags: JSON.stringify(["greedy"]),
      problemUrl: "https://codeforces.com/contest/1618/problem/D",
      solvedAt: 1639500000,
      primaryPatternId: "interval-greedy",
      secondaryTechs: JSON.stringify(["greedy"]),
      keyObservation: "To minimize floor(x / y), pair identical numbers together if possible, or pair with larger elements. Specifically, match the largest k elements with the next largest k elements.",
      whyThisApproach: "Sort array ascending. The largest 2k elements should be paired with an offset of k: pair a[n - 2k + i] with a[n - k + i] to minimize duplicate quotients.",
      safeDecisionProof: "Pigeonhole principle: by separating the largest elements by k positions, identical elements can only match if their count strictly exceeds k.",
      implTechs: JSON.stringify(["Sorting", "Pigeonhole counting"]),
      commonTraps: JSON.stringify(["Greedily pairing adjacent elements (e.g. a[i] with a[i+1]), which maximizes equal-pair floor division"]),
      editorialSnippet: "Sort a. The optimal strategy pairs a[n - 2k + i] with a[n - k + i] for i in 0..k-1, summing floor(a[n - 2k + i] / a[n - k + i]), and adds remaining elements directly.",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 95,
    },
    {
      id: "1538C",
      contestId: 1538,
      index: "C",
      name: "Number of Pairs",
      rating: 1300,
      tags: JSON.stringify(["binary search", "two pointers"]),
      problemUrl: "https://codeforces.com/contest/1538/problem/C",
      solvedAt: 1623340000,
      primaryPatternId: "bs-on-answer",
      secondaryTechs: JSON.stringify(["two-pointers"]),
      keyObservation: "For a sorted array, for each element a[i], the condition l <= a[i] + a[j] <= r translates to l - a[i] <= a[j] <= r - a[i]. This is a contiguous index range query in the sorted array.",
      whyThisApproach: "Sort array in O(N log N). For each i, use std::lower_bound and std::upper_bound to find count of valid j > i in O(log N).",
      safeDecisionProof: "Sortedness gives monotonicity of a[i] + a[j] with respect to j, enabling binary search.",
      implTechs: JSON.stringify(["std::lower_bound", "std::upper_bound"]),
      commonTraps: JSON.stringify(["Double counting pairs (only count j > i)", "32-bit integer overflow for pair counts (up to N*(N-1)/2, use long long)"]),
      editorialSnippet: "Sort the array. For each i, valid j must satisfy l - a[i] <= a[j] <= r - a[i]. Use binary search (lower_bound, upper_bound) to find range [L, R] and add max(0, min(R, n-1) - max(L, i+1) + 1).",
      status: "VERIFIED_HIGH_CONFIDENCE",
      confidence: 100,
    }
  ];

  for (const prob of sampleProblems) {
    await db.insert(problems).values({
      id: prob.id,
      contestId: prob.contestId,
      index: prob.index,
      name: prob.name,
      rating: prob.rating,
      tags: prob.tags,
      problemUrl: prob.problemUrl,
      solvedAt: prob.solvedAt,
    });

    await db.insert(submissions).values({
      id: Math.floor(prob.solvedAt / 10),
      problemId: prob.id,
      verdict: "OK",
      language: "GNU C++20 (64)",
      passedTestCount: 35,
      timeConsumedMillis: 45,
      memoryConsumedBytes: 1500000,
      submissionTime: prob.solvedAt,
      codeSnippet: `// Solution for ${prob.id} - ${prob.name}\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // Solved with accepted complexity\n    return 0;\n}`,
    });

    await db.insert(solutionEvidence).values({
      id: `ev_${prob.id}`,
      problemId: prob.id,
      sourceType: "OFFICIAL_EDITORIAL",
      editorialUrl: `https://codeforces.com/blog/entry/${prob.contestId}`,
      editorialSnippet: prob.editorialSnippet,
      author: "Codeforces Official Editorialist",
      rawReference: `CF Contest ${prob.contestId} Tutorial`,
    });

    await db.insert(verificationRecords).values({
      id: `ver_${prob.id}`,
      problemId: prob.id,
      status: prob.status,
      confidenceScore: prob.confidence,
      algorithmCrosscheck: "User accepted C++ code structure matches official editorial invariant.",
      complexityVerified: "O(N log N) or O(N), well within time limit.",
      correctnessReasoning: prob.safeDecisionProof,
    });

    await db.insert(problemKnowledge).values({
      id: `pk_${prob.id}`,
      problemId: prob.id,
      primaryPatternId: prob.primaryPatternId,
      secondaryTechniqueIds: prob.secondaryTechs,
      keyObservation: prob.keyObservation,
      whyThisApproach: prob.whyThisApproach,
      safeDecisionProof: prob.safeDecisionProof,
      variationId: null,
      implementationTechniques: prob.implTechs,
      commonTraps: prob.commonTraps,
    });
  }

  // 8. Representative Solved Problems (Progression 1-8)
  const repList = [
    {
      id: "rep-1",
      patternId: "bs-on-answer",
      problemId: "1850E",
      progressionTier: 1,
      progressionLabel: "Basic Form",
      whyRepresentative: "Clean mathematical equation (s_i + 2w)^2 where monotonicity is immediate and domain is strictly positive.",
    },
    {
      id: "rep-2",
      patternId: "bs-on-answer",
      problemId: "1840D",
      progressionTier: 3,
      progressionLabel: "Variation (BS + Greedy)",
      whyRepresentative: "Pairs binary search on maximum wait time with an internal greedy 3-carver interval coverage sweep.",
    },
    {
      id: "rep-3",
      patternId: "bs-on-answer",
      problemId: "1850H",
      progressionTier: 5,
      progressionLabel: "Combination (BS + Graph)",
      whyRepresentative: "Combines binary search/relative coordinate positioning with graph DFS cycle consistency checks.",
    },
    {
      id: "rep-4",
      patternId: "interval-greedy",
      problemId: "1872A",
      progressionTier: 1,
      progressionLabel: "Basic Form",
      whyRepresentative: "Canonical greedy choice: transfer maximal possible volume at every operation to achieve fastest convergence.",
    },
    {
      id: "rep-5",
      patternId: "interval-greedy",
      problemId: "1872B",
      progressionTier: 2,
      progressionLabel: "Typical Application",
      whyRepresentative: "Calculates independent safety horizons for corridor traps and takes the global lower bound.",
    },
    {
      id: "rep-6",
      patternId: "interval-greedy",
      problemId: "1872D",
      progressionTier: 4,
      progressionLabel: "Constraint Twist (Math + Greedy)",
      whyRepresentative: "Uses rearrangement inequality and set inclusion-exclusion LCM math to place top values into positive slots.",
    },
  ];

  for (const r of repList) {
    await db.insert(representativeProblems).values(r);
  }

  // 9. Chronological 200-Problem Segments
  const segment1 = {
    id: "segment-1",
    segmentNumber: 1,
    startProblemIdx: 401,
    endProblemIdx: 612,
    totalProblems: 212,
    newConceptsCount: 14,
    repeatedConceptsCount: 168,
    newVariationsCount: 8,
    uncommonIdeasCount: 5,
    newCombinationsCount: 4,
    summaryNotes: "Latest 200 problems focused on hardening Binary Search on Answer variations, Tree DP rerooting, and greedy rearrangement invariants.",
  };

  const segment2 = {
    id: "segment-2",
    segmentNumber: 2,
    startProblemIdx: 201,
    endProblemIdx: 400,
    totalProblems: 200,
    newConceptsCount: 22,
    repeatedConceptsCount: 142,
    newVariationsCount: 12,
    uncommonIdeasCount: 4,
    newCombinationsCount: 6,
    summaryNotes: "Middle segment expanding into advanced graph DFS components, 2-SAT implications, and prefix sum hash maps.",
  };

  const segment3 = {
    id: "segment-3",
    segmentNumber: 3,
    startProblemIdx: 1,
    endProblemIdx: 200,
    totalProblems: 200,
    newConceptsCount: 38,
    repeatedConceptsCount: 120,
    newVariationsCount: 10,
    uncommonIdeasCount: 2,
    newCombinationsCount: 3,
    summaryNotes: "Foundational segment establishing fundamental interval greedy, simple dynamic programming, and binary search.",
  };

  await db.insert(segments).values(segment1);
  await db.insert(segments).values(segment2);
  await db.insert(segments).values(segment3);

  // Link sample problems to segment 1
  for (let i = 0; i < sampleProblems.length; i++) {
    const prob = sampleProblems[i];
    await db.insert(segmentProblems).values({
      id: `sp_${prob.id}`,
      segmentId: "segment-1",
      problemId: prob.id,
      solvedAt: prob.solvedAt,
      orderInSegment: i + 1,
    });
  }

  // 10. Mastery Records
  const masteryList = [
    {
      id: "m_bs",
      patternId: "bs-on-answer",
      exposureCount: 42,
      variationCoverage: 80,
      combinationCoverage: 75,
      revisionScore: 88,
      lastRevisedAt: new Date().toISOString(),
    },
    {
      id: "m_greedy",
      patternId: "interval-greedy",
      exposureCount: 38,
      variationCoverage: 85,
      combinationCoverage: 70,
      revisionScore: 92,
      lastRevisedAt: new Date().toISOString(),
    },
    {
      id: "m_prefix",
      patternId: "prefix-sum-hashmap",
      exposureCount: 51,
      variationCoverage: 90,
      combinationCoverage: 80,
      revisionScore: 95,
      lastRevisedAt: new Date().toISOString(),
    },
    {
      id: "m_tree_dp",
      patternId: "tree-dp-rerooting",
      exposureCount: 16,
      variationCoverage: 60,
      combinationCoverage: 50,
      revisionScore: 78,
      lastRevisedAt: new Date().toISOString(),
    },
    {
      id: "m_mono_q",
      patternId: "monotonic-queue-dp",
      exposureCount: 14,
      variationCoverage: 55,
      combinationCoverage: 40,
      revisionScore: 72,
      lastRevisedAt: new Date().toISOString(),
    },
    {
      id: "m_2sat",
      patternId: "two-sat",
      exposureCount: 7,
      variationCoverage: 40,
      combinationCoverage: 30,
      revisionScore: 65,
      lastRevisedAt: new Date().toISOString(),
    },
  ];

  for (const m of masteryList) {
    await db.insert(masteryRecords).values(m);
  }

  console.log("Canonical CP Knowledge Base seeded successfully!");
}
