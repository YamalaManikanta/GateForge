import { Subject, MistakeType, SchedulePhase, KnowledgeItem, Flashcard } from './types';

export const SUBJECTS = Object.values(Subject);
export const MISTAKE_TYPES = Object.values(MistakeType);

export const STORAGE_KEYS = {
  USER_PROFILE: 'gate_forge_user_profile',
  MOCKS: 'gate_forge_mocks',
  ERRORS: 'gate_forge_errors',
  DAILY: 'gate_forge_daily',
  INFO_IMAGES: 'gate_forge_info_images',
  SYLLABUS: 'gate_forge_syllabus_status',
  SCHEDULE: 'gate_forge_schedule_v2',
  KNOWLEDGE: 'gate_forge_knowledge_base',
  CALC_STATS: 'gate_forge_calc_stats',
  CHEAT_SHEET: 'gate_forge_cheat_sheet',
  FLASHCARDS: 'gate_forge_flashcards',
  GAUNTLET_STATS: 'gate_forge_gauntlet_stats',
};

export const NEGATIVE_MARK_FACTOR_1_MARK = 0.33;
export const NEGATIVE_MARK_FACTOR_2_MARK = 0.66;
export const AVG_NEGATIVE_FACTOR = 0.45; 

export const DEFAULT_EXAM_DATE_TEMPLATE = '2027-02-06T09:00:00'; 

export const DEFAULT_SCHEDULE_TEMPLATE: SchedulePhase[] = [
  { id: 'Phase1', name: 'C Programming + Data Structures', start: '2025-12-15', end: '2026-01-15' },
  { id: 'Phase2', name: 'Discrete Structures', start: '2026-01-15', end: '2026-02-15' },
  { id: 'Phase3', name: 'Algorithms', start: '2026-02-15', end: '2026-03-15' },
  { id: 'Phase4', name: 'General Aptitude', start: '2026-03-15', end: '2026-04-15' },
  { id: 'Phase5', name: 'Engineering Mathematics', start: '2026-05-05', end: '2026-07-05' },
  { id: 'Phase6', name: 'DBMS', start: '2026-07-05', end: '2026-08-05' },
  { id: 'Phase7a', name: 'Operating Systems', start: '2026-08-05', end: '2026-08-25' }, 
  { id: 'Phase7b', name: 'Computer Networks', start: '2026-08-25', end: '2026-09-15' },
  { id: 'Phase7c', name: 'Digital Logic', start: '2026-09-15', end: '2026-10-05' },
  { id: 'Phase7d', name: 'Computer Organization', start: '2026-10-05', end: '2026-10-31' },
  { id: 'Phase8', name: 'Revision + Deep PYQs + Mocks', start: '2026-11-01', end: '2027-01-31' },
];

export const INITIAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // --- ALGORITHMS ---
  { id: 'k1', category: Subject.ALGO, keywords: ['quick', 'sort', 'complexity', 'worst', 'case', 'average'], answer: "Quick Sort: Divide & Conquer. \nTime: O(n log n) avg, O(n^2) worst (when sorted). \nSpace: O(log n) stack. \nNot Stable, In-place." },
  { id: 'k2', category: Subject.ALGO, keywords: ['merge', 'sort', 'complexity'], answer: "Merge Sort: Divide & Conquer. \nTime: O(n log n) always. \nSpace: O(n) auxiliary. \nStable, Not In-place." },
  { id: 'k3', category: Subject.ALGO, keywords: ['dijkstra', 'shortest', 'path'], answer: "Dijkstra's Algorithm: Greedy. Single source shortest path. Fails with negative edge weights. \nTime: O(E log V) with Binary Heap, O(E + V log V) with Fibonacci Heap." },
  { id: 'k4', category: Subject.ALGO, keywords: ['bellman', 'ford', 'negative'], answer: "Bellman-Ford: Dynamic Programming. Handles negative weights. Detects negative cycles. Time: O(VE)." },
  { id: 'k5', category: Subject.ALGO, keywords: ['master', 'theorem'], answer: "Master Theorem: T(n) = aT(n/b) + f(n). \n1. If f(n) = O(n^(log_b a - e)), T(n) = Theta(n^(log_b a)). \n2. If f(n) = Theta(n^(log_b a)), T(n) = Theta(n^(log_b a) * log n). \n3. If f(n) = Omega(n^(log_b a + e)), T(n) = Theta(f(n))." },
  { id: 'k5a', category: Subject.ALGO, keywords: ['prim', 'kruskal', 'mst'], answer: "MST Algorithms: \nPrim's: Greedy, grow tree from start node. O(E log V). Good for dense graphs. \nKruskal's: Greedy, pick smallest edge, check cycle (Union-Find). O(E log E). Good for sparse graphs."},
  { id: 'k5b', category: Subject.ALGO, keywords: ['floyd', 'warshall', 'all', 'pairs'], answer: "Floyd Warshall: Dynamic Programming. All-pairs shortest path. \nRecurrence: D[i][j] = min(D[i][j], D[i][k] + D[k][j]). \nTime: O(V^3). Space: O(V^2)."},

  // --- DATA STRUCTURES ---
  { id: 'k6', category: Subject.DS, keywords: ['bst', 'binary', 'search', 'tree', 'complexity'], answer: "BST: Left < Root < Right. \nSearch/Insert/Delete: O(h). \nWorst case h=n (skewed), Avg case h=log n. \nInorder traversal gives sorted sequence." },
  { id: 'k7', category: Subject.DS, keywords: ['avl', 'tree', 'height'], answer: "AVL Tree: Self-balancing BST. \nBalance Factor = Height(Left) - Height(Right) is {-1, 0, 1}. \nHeight is always O(log n). Rotations (LL, RR, LR, RL) maintain balance." },
  { id: 'k8', category: Subject.DS, keywords: ['stack', 'queue', 'application'], answer: "Stack (LIFO): Function calls, Expression evaluation, Backtracking (DFS). \nQueue (FIFO): Scheduling, Buffering, BFS." },
  { id: 'k8a', category: Subject.DS, keywords: ['hashing', 'collision', 'resolution'], answer: "Collision Resolution: \n1. Chaining: Linked list at index. Load factor > 1 possible. \n2. Open Addressing: Probing (Linear, Quadratic, Double Hashing). Load factor <= 1 required."},
  { id: 'k8b', category: Subject.DS, keywords: ['heap', 'min', 'max', 'priority'], answer: "Binary Heap: Complete Binary Tree. \nMax Heap: Root >= Children. \nInsert/Delete: O(log n). Build Heap: O(n). \nUsed in Priority Queues & Heap Sort."},

  // --- ENGINEERING MATHEMATICS & DISCRETE MATH ---
  { id: 'dm_logic', category: Subject.DM, keywords: ['propositional', 'logic', 'predicate', 'tautology'], answer: "Propositional Logic: Tautology (always true), Contradiction (always false). \nPredicates: ∀ (Universal), ∃ (Existential). \nNegation: ¬(∀x P(x)) ≡ ∃x ¬P(x)." },
  { id: 'dm_rel', category: Subject.DM, keywords: ['relations', 'equivalence', 'partial', 'order', 'poset'], answer: "Equivalence: Reflexive, Symmetric, Transitive. \nPOSET: Reflexive, Anti-symmetric, Transitive. \nLattice: POSET where every pair has LUB and GLB." },
  { id: 'dm_graph', category: Subject.DM, keywords: ['graph', 'theory', 'handshaking', 'planar', 'chromatic'], answer: "Handshaking: Σ deg(v) = 2|E|. \nPlanar: V - E + F = 2. \nChromatic No: Min colors for vertex coloring. \nEulerian: All vertices have even degree." },
  { id: 'em_la', category: Subject.EM, keywords: ['matrix', 'rank', 'eigenvalue', 'eigenvector', 'cayley'], answer: "Rank: No. of independent rows. \nEigenvalues (λ): Roots of |A - λI| = 0. \nCayley-Hamilton: Every square matrix satisfies its characteristic eq. \nTrace = Σλ, Det = Πλ." },
  { id: 'em_calc', category: Subject.EM, keywords: ['calculus', 'limits', 'continuity', 'maxima', 'minima'], answer: "Limit exists if LHL = RHL. \nContinuity: Limit = f(a). \nMaxima/Minima: f'(x)=0. f''(x)<0 (Max), f''(x)>0 (Min)." },
  { id: 'em_prob', category: Subject.EM, keywords: ['probability', 'bayes', 'conditional', 'random', 'variable'], answer: "P(A|B) = P(A∩B)/P(B). \nBayes: P(A|B) = P(B|A)P(A)/P(B). \nExpectation E[X] = ΣxP(x). Var(X) = E[X²] - (E[X])²." },

  // --- DIGITAL LOGIC ---
  { id: 'dld_bool', category: Subject.DLD, keywords: ['boolean', 'algebra', 'laws', 'kmap', 'minimization'], answer: "Boolean Laws: DeMorgan's, Distributive, Absorption. \nK-Map: Visual minimization. Groups of 2^n. \nPrime Implicant: Largest possible group. \nEssential PI: Covers a minterm not covered by others." },
  { id: 'dld_comb', category: Subject.DLD, keywords: ['combinational', 'circuit', 'mux', 'decoder', 'adder'], answer: "MUX: Selects 1 of N inputs. Universal logic gate. \nDecoder: N to 2^N. Used in memory select. \nFull Adder: Sum = A⊕B⊕Cin, Cout = AB + Cin(A⊕B)." },
  { id: 'dld_seq', category: Subject.DLD, keywords: ['sequential', 'flip', 'flop', 'counter', 'latch'], answer: "Flip Flops: SR (Invalid 11), JK (Toggle 11), D (Delay), T (Toggle). \nCounters: Async (Ripple) vs Sync (Simultaneous clock). \nMod-N counter needs ceil(log2 N) FFs." },
  { id: 'dld_num', category: Subject.DLD, keywords: ['floating', 'point', 'ieee', '754', 'number'], answer: "IEEE 754: (-1)^S * 1.M * 2^(E-Bias). \nSingle Precision (32-bit): S(1), E(8), M(23), Bias 127. \nDouble Precision (64-bit): S(1), E(11), M(52), Bias 1023." },

  // --- COMPUTER ORGANIZATION & ARCHITECTURE ---
  { id: 'coa_addr', category: Subject.COA, keywords: ['addressing', 'modes', 'immediate', 'direct', 'indirect'], answer: "Immediate: Op = Value. \nDirect: Op = Address. \nIndirect: Op = Ptr to Address. \nPC-Relative: Eff Addr = PC + Offset (Branching). \nRegister Indirect: Ptr in Register." },
  { id: 'coa_pipe', category: Subject.COA, keywords: ['pipelining', 'hazard', 'speedup', 'throughput'], answer: "Pipeline: Overlapping execution. Speedup = Tn / Tp. \nHazards: \n1. Structural (Resource conflict). \n2. Data (RAW, WAR, WAW). \n3. Control (Branching)." },
  { id: 'coa_cache', category: Subject.COA, keywords: ['cache', 'mapping', 'associative', 'hit', 'miss'], answer: "Direct Mapping: Block k -> Line k mod N. High conflict. \nSet Associative: Block k -> Set k mod S. Balanced. \nAvg Access Time = HitTime + MissRate * MissPenalty." },
  { id: 'coa_io', category: Subject.COA, keywords: ['io', 'interface', 'interrupt', 'dma'], answer: "Programmed I/O: CPU polls. \nInterrupt I/O: Device alerts CPU. \nDMA: Direct Memory Access controller handles transfer, CPU only initiates/concludes." },

  // --- PROGRAMMING & DATA STRUCTURES (Supplements) ---
  { id: 'pds_ptr', category: Subject.DS, keywords: ['pointer', 'array', 'c', 'programming'], answer: "Pointer: Stores address. *p dereferences. \nArray Name: Const pointer to first element. \ncalloc initializes to 0, malloc does not. \nDangling Ptr: Points to freed memory." },
  { id: 'pds_rec', category: Subject.DS, keywords: ['recursion', 'static', 'variable'], answer: "Recursion: Function calls itself. Needs base case. \nStatic Variables: Initialized once, retain value across function calls in recursion." },

  // --- THEORY OF COMPUTATION ---
  { id: 'toc_reg', category: Subject.TOC, keywords: ['regular', 'language', 'finite', 'automata', 'dfa'], answer: "Regular Lang: Recognized by DFA/NFA. Expressed by RegEx. \nClosed under: Union, Intersection, Complement, Concatenation, Kleene Star. \nPumping Lemma: Checks non-regularity." },
  { id: 'toc_cfl', category: Subject.TOC, keywords: ['cfl', 'context', 'free', 'pda', 'grammar'], answer: "CFL: Generated by CFG. Recognized by PDA. \nDCFL: Deterministic PDA. Subset of CFL. \nAmbiguous Grammar: More than 1 parse tree for a string. \nCFL NOT closed under: Intersection, Complement." },
  { id: 'toc_dec', category: Subject.TOC, keywords: ['decidability', 'undecidable', 'halting', 'turing'], answer: "Decidable: TM halts on all inputs (Yes/No). \nUndecidable: Halting Problem, PCP, Ambiguity of CFG. \nRecursive Enumerable (RE): TM halts on Accept, may loop on Reject." },

  // --- COMPILER DESIGN ---
  { id: 'cd_lex', category: Subject.CD, keywords: ['lexical', 'analysis', 'token', 'symbol', 'table'], answer: "Lexical Analysis: Scans source, produces tokens. Removes comments/whitespace. Uses Finite Automata. \nSymbol Table: Stores variable names, types, scope." },
  { id: 'cd_parse', category: Subject.CD, keywords: ['parsing', 'll1', 'lr0', 'slr', 'lalr'], answer: "Top-Down: LL(1) (Left-to-right, Leftmost derivation). No Left Recursion allowed. \nBottom-Up: Shift-Reduce. \nPower: LR(0) < SLR(1) < LALR(1) < CLR(1). \nCLR(1) is most powerful." },
  { id: 'cd_sdt', category: Subject.CD, keywords: ['sdt', 'syntax', 'directed', 'translation'], answer: "SDT: Context Free Grammar + Semantic Rules. \nSynthesized Attribute: Derived from children (Bottom-up). \nInherited Attribute: Derived from parent/siblings (Top-down)." },

  // --- OPERATING SYSTEMS ---
  { id: 'os_sched', category: Subject.OS, keywords: ['cpu', 'scheduling', 'algorithm', 'turnaround', 'waiting'], answer: "FCFS: Convoy effect. \nSJF: Optimal avg waiting time (Non-preemptive). \nRound Robin: Time quantum, good response time. \nTAT = Completion - Arrival. \nWT = TAT - Burst." },
  { id: 'os_sync', category: Subject.OS, keywords: ['synchronization', 'semaphore', 'mutex', 'deadlock'], answer: "Critical Section: Mutual Exclusion, Progress, Bounded Waiting. \nSemaphore: Integer variable (Wait/Signal). \nDeadlock Conditions: Mutex, Hold & Wait, No Preemption, Circular Wait." },
  { id: 'os_mem', category: Subject.OS, keywords: ['memory', 'management', 'paging', 'virtual', 'tlb'], answer: "Paging: Physical memory to Frames, Logical to Pages. No external frag. \nVirtual Memory: Demand paging. \nPage Fault: Page not in RAM. \nThrashing: High paging activity, low CPU util." },
  { id: 'os_fs', category: Subject.OS, keywords: ['file', 'system', 'inode', 'disk'], answer: "Unix Inode: Stores metadata (permissions, size, block ptrs). \nDisk Scheduling: FCFS, SSTF (Starvation possible), SCAN (Elevator), C-SCAN." },

  // --- DATABASES ---
  { id: 'dbms_norm', category: Subject.DBMS, keywords: ['normalization', 'nf', 'dependency', 'bcnf', '3nf'], answer: "1NF: Atomic values. \n2NF: No partial dependency. \n3NF: No transitive dependency. \nBCNF: For X->Y, X must be superkey. Stricter than 3NF. \nLossless Join: Common attr must be key in one table." },
  { id: 'dbms_trans', category: Subject.DBMS, keywords: ['transaction', 'acid', 'serializability', 'recoverability'], answer: "ACID: Atomicity, Consistency, Isolation, Durability. \nConflict Serializable: Can be swapped to serial schedule. \nView Serializable: Same read/write sequence." },
  { id: 'dbms_sql', category: Subject.DBMS, keywords: ['sql', 'join', 'aggregate', 'subquery'], answer: "SQL Order: SELECT > FROM > WHERE > GROUP BY > HAVING > ORDER BY. \nNatural Join: On common columns. \nOuter Join: Preserves unmatched rows." },
  { id: 'dbms_index', category: Subject.DBMS, keywords: ['indexing', 'b tree', 'b+ tree'], answer: "B+ Tree: Data only in leaf nodes. Leaves linked. Range queries efficient. \nB Tree: Data in internal nodes too. \nOrder p: Max p pointers, p-1 keys." },

  // --- COMPUTER NETWORKS ---
  { id: 'cn_layers', category: Subject.CN, keywords: ['osi', 'model', 'tcp/ip', 'layers'], answer: "OSI: Physical, Datalink, Network, Transport, Session, Presentation, Application. \nTCP/IP: Link, Internet, Transport, Application. \nPDU: Bit, Frame, Packet, Segment." },
  { id: 'cn_dl', category: Subject.CN, keywords: ['datalink', 'sliding', 'window', 'error', 'control'], answer: "Flow Control: Stop & Wait (Eff = 1/(1+2a)), GBN (Send W, Rej all), SR (Send W, Ack indv). \nError Det: CRC, Parity. \nCSMA/CD: Ethernet, Collision detection." },
  { id: 'cn_net', category: Subject.CN, keywords: ['network', 'ip', 'routing', 'subnet', 'fragmentation'], answer: "IPv4: 32-bit. Header 20-60 bytes. \nFragmentation: MTU limit. \nRouting: Distance Vector (Bellman Ford, Count-to-inf), Link State (Dijkstra). \nARP: IP to MAC." },
  { id: 'cn_trans', category: Subject.CN, keywords: ['transport', 'tcp', 'udp', 'congestion'], answer: "TCP: Conn-oriented, Reliable, Flow/Congestion control (Slow start, AIMD). 3-way handshake. \nUDP: Connectionless, Unreliable, Fast (DNS, Streaming)." },
  { id: 'cn_app', category: Subject.CN, keywords: ['application', 'http', 'dns', 'smtp', 'protocol'], answer: "DNS: UDP 53. Domain to IP. \nHTTP: TCP 80. Stateless. \nSMTP: TCP 25. Push mail. \nFTP: TCP 20(Data)/21(Control)." },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  { id: 'f1', front: "Number of edges in a complete graph K_n?", back: "n(n-1) / 2", subject: Subject.DM, box: 1, nextReviewDate: new Date().toISOString() },
];
