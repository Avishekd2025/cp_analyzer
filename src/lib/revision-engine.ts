export type RevisionMode =
  | "RECOGNITION"
  | "WHY"
  | "OBSERVATION"
  | "VARIATION"
  | "COMPARISON"
  | "UNCOMMON";

export interface RevisionCard {
  id: string;
  problemId: string;
  problemName: string;
  contestId: number;
  problemRating: number;
  patternId: string;
  patternName: string;
  mode: RevisionMode;
  modeTitle: string;
  promptText: string;
  contextSnippet: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  mentalModelTakeaway: string;
}

export const CANONICAL_REVISION_CARDS: RevisionCard[] = [
  {
    id: "rev-1",
    problemId: "1840D",
    problemName: "Wooden Toy Festival",
    contestId: 1840,
    problemRating: 1300,
    patternId: "bs-on-answer",
    patternName: "Binary Search on Answer",
    mode: "RECOGNITION",
    modeTitle: "Pattern Recognition",
    promptText:
      "You are given N toy carving patterns. You have 3 carvers who can each pick a target pattern and serve all clients whose request differs by at most W. You need to minimize the maximum wait time W. Which pattern should immediately trigger?",
    contextSnippet: "N <= 2 * 10^5, patterns up to 10^9. Minimize the maximum difference W.",
    options: [
      { id: "opt-1", text: "Binary Search on Answer + Greedy interval coverage", isCorrect: true },
      { id: "opt-2", text: "Dynamic Programming on Subsequences O(N^2)", isCorrect: false },
      { id: "opt-3", text: "Graph Shortest Path Dijkstra", isCorrect: false },
      { id: "opt-4", text: "Segment Tree Range Minimum Query", isCorrect: false },
    ],
    explanation:
      "The phrase 'Minimize the maximum ...' combined with an easily verifiable condition for a fixed target W is the signature of Binary Search on Answer. For a fixed W, each carver covers a sorted span [x, x + 2W], verified via 3 greedy steps.",
    mentalModelTakeaway: "Turn the optimization knob into a monotonic yes/no thermometer check.",
  },
  {
    id: "rev-2",
    problemId: "1872A",
    problemName: "Two Vessels",
    contestId: 1872,
    problemRating: 800,
    patternId: "interval-greedy",
    patternName: "Interval Scheduling & Greedy",
    mode: "WHY",
    modeTitle: "Why Does It Work?",
    promptText:
      "In 'Two Vessels', why is transferring the maximum possible water c (or whatever remains to equalize) strictly optimal at every step?",
    contextSnippet: "Vessels have volumes a and b. Spoon has capacity c. Equalize in minimum moves.",
    options: [
      {
        id: "opt-1",
        text: "Because each step transfers up to 2c difference, which strictly maximizes the convergence rate towards equality without overshoot.",
        isCorrect: true,
      },
      {
        id: "opt-2",
        text: "Because water transfers form an alternating sequence requiring parity balancing.",
        isCorrect: false,
      },
      {
        id: "opt-3",
        text: "Because DP table states overlap across multiple cup levels.",
        isCorrect: false,
      },
    ],
    explanation:
      "Exchange argument: Any move transferring strictly less than min(c, diff/2) achieves strictly less progress per unit time, requiring at least as many future steps.",
    mentalModelTakeaway: "A greedy choice is provably safe when moving the maximum permitted step rate is strictly unconstrained by future choices.",
  },
  {
    id: "rev-3",
    problemId: "1872B",
    problemName: "The Corridor or There and Back Again",
    contestId: 1872,
    problemRating: 900,
    patternId: "interval-greedy",
    patternName: "Interval Scheduling & Greedy",
    mode: "OBSERVATION",
    modeTitle: "Key Structural Observation",
    promptText:
      "A corridor contains traps at room d_i with timers s_i. What is the pivotal observation that simplifies the problem to a trivial O(N) scan?",
    contextSnippet: "You start at room 1. Walk forward, then return safely to room 1 before traps spring.",
    options: [
      {
        id: "opt-1",
        text: "Each trap d_i independently bounds your max forward reach to d_i + (s_i - 1) / 2 because of the 2-way round trip back to room d_i.",
        isCorrect: true,
      },
      {
        id: "opt-2",
        text: "Traps must be disarmed in chronological order using a priority queue.",
        isCorrect: false,
      },
      {
        id: "opt-3",
        text: "The path must be modeled as a tree where rooms are vertices.",
        isCorrect: false,
      },
    ],
    explanation:
      "Because the corridor is 1-dimensional, walking past room d_i forces you to walk back through room d_i before timer s_i expires. Thus, every trap independently sets an upper bound on reach, and the global answer is simply the minimum of these independent bounds.",
    mentalModelTakeaway: "Decompose composite constraints into independent single-variable bounds whenever topology is strictly 1D.",
  },
  {
    id: "rev-4",
    problemId: "1840D",
    problemName: "Wooden Toy Festival",
    contestId: 1840,
    problemRating: 1300,
    patternId: "bs-on-answer",
    patternName: "Binary Search on Answer",
    mode: "VARIATION",
    modeTitle: "Pattern Variation",
    promptText:
      "Which specific variation of Binary Search on Answer is demonstrated in 'Wooden Toy Festival'?",
    contextSnippet: "Binary search on max wait time W where check(W) sorts and sweeps 3 intervals.",
    options: [
      { id: "opt-1", text: "Binary Search on Answer + Greedy Feasibility Scan", isCorrect: true },
      { id: "opt-2", text: "Binary Search on Answer + Max Flow / Min Cut Feasibility", isCorrect: false },
      { id: "opt-3", text: "Binary Search on Answer + 2-SAT Implication Verification", isCorrect: false },
      { id: "opt-4", text: "Parallel Binary Search with DSU Rollbacks", isCorrect: false },
    ],
    explanation:
      "The check function does not solve a complex sub-problem; it greedily places the 3 carvers to cover the sorted array prefixes [a[0] .. a[0] + 2W]. This is the classic BS on Answer + Greedy variation.",
    mentalModelTakeaway: "Recognize that feasibility tests often collapse into simple linear greedy scans once the global metric is fixed.",
  },
  {
    id: "rev-5",
    problemId: "1872D",
    problemName: "Plus Minus Permutation vs Wooden Toy Festival",
    contestId: 1872,
    problemRating: 1200,
    patternId: "interval-greedy",
    patternName: "Interval Scheduling & Greedy",
    mode: "COMPARISON",
    modeTitle: "Problem Comparison",
    promptText:
      "Both 1872D (Plus Minus Permutation) and 1872A (Two Vessels) use Greedy concepts. How do their mathematical foundations fundamentally contrast?",
    contextSnippet: "1872D uses permutation assignment; 1872A uses transfer rate ceiling.",
    options: [
      {
        id: "opt-1",
        text: "1872D relies on the Rearrangement Inequality and LCM set exclusion to assign extremal values, whereas 1872A relies on direct linear convergence rate maximization.",
        isCorrect: true,
      },
      {
        id: "opt-2",
        text: "1872D requires Dynamic Programming with bitmasks while 1872A is simple math.",
        isCorrect: false,
      },
      {
        id: "opt-3",
        text: "1872D is non-deterministic and heuristic, whereas 1872A is exact.",
        isCorrect: false,
      },
    ],
    explanation:
      "Comparing greedy problems reveals their proof style: 1872D uses Rearrangement Inequality (pair largest values with positive weights), while 1872A uses greedy stays ahead/convergence rates.",
    mentalModelTakeaway: "Greedy is not a single tool—it manifests through algebraic rearrangement, exchange arguments, or matroid independence.",
  },
  {
    id: "rev-6",
    problemId: "rare-2sat",
    problemName: "Boolean State Conflicts",
    contestId: 1200,
    problemRating: 1900,
    patternId: "two-sat",
    patternName: "2-SAT via Strongly Connected Components",
    mode: "UNCOMMON",
    modeTitle: "Uncommon Knowledge Drill",
    promptText:
      "When modeling a pairwise constraint where two variables X and Y cannot both be true (NOT(X AND Y)), how must the directed implication edges be constructed in a 2-SAT implication graph?",
    contextSnippet: "NOT (X AND Y) is equivalent to (!X or !Y).",
    options: [
      { id: "opt-1", text: "Add directed edges (X -> !Y) and (Y -> !X)", isCorrect: true },
      { id: "opt-2", text: "Add only one directed edge (X -> Y)", isCorrect: false },
      { id: "opt-3", text: "Add undirected edge between X and Y", isCorrect: false },
      { id: "opt-4", text: "Add directed edges (!X -> Y) and (!Y -> X)", isCorrect: false },
    ],
    explanation:
      "Clause (!X or !Y) means: 'If X is chosen, then Y must NOT be chosen' (X -> !Y), and by contrapositive, 'If Y is chosen, then X must NOT be chosen' (Y -> !X). Both edges are mandatory.",
    mentalModelTakeaway: "Every boolean OR clause always produces two contrapositive domino implication arrows.",
  },
];
