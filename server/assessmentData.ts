export interface SeedAssessment {
  id: string;
  title: string;
  category: 'Frontend' | 'Backend' | 'Full Stack' | 'Cloud';
  description: string;
  total_questions: number;
  time_limit_minutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  passing_percentage: number;
  icon: string;
}

export interface SeedQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export const SEED_ASSESSMENTS: SeedAssessment[] = [
  {
    id: 'asmt-frontend-01',
    title: 'Frontend Development Assessment',
    category: 'Frontend',
    description: 'Test your mastery of modern frontend engineering, React component architecture, hooks lifecycle, TypeScript type safety, CSS layout systems, and DOM performance optimization.',
    total_questions: 10,
    time_limit_minutes: 15,
    difficulty: 'Intermediate',
    passing_percentage: 60,
    icon: 'Code2'
  },
  {
    id: 'asmt-backend-02',
    title: 'Backend Development Assessment',
    category: 'Backend',
    description: 'Assess your backend engineering capabilities across Node.js runtime, RESTful architectural design, relational and document database indexing, asynchronous event loops, authentication security, and caching strategies.',
    total_questions: 10,
    time_limit_minutes: 15,
    difficulty: 'Intermediate',
    passing_percentage: 60,
    icon: 'Server'
  },
  {
    id: 'asmt-fullstack-03',
    title: 'Full Stack Development Assessment',
    category: 'Full Stack',
    description: 'Evaluate your end-to-end web engineering proficiencies, including client-server contract synchronization, state management, security mitigation (XSS, CSRF, SQLi), CI/CD pipelines, and microservices tradeoffs.',
    total_questions: 10,
    time_limit_minutes: 20,
    difficulty: 'Advanced',
    passing_percentage: 65,
    icon: 'Layers'
  },
  {
    id: 'asmt-cloud-04',
    title: 'Cloud Computing & DevOps Assessment',
    category: 'Cloud',
    description: 'Evaluate your knowledge of cloud infrastructure architectures (AWS/GCP), Docker containerization, Kubernetes orchestration, serverless execution, IAM security policies, and continuous deployment workflows.',
    total_questions: 10,
    time_limit_minutes: 15,
    difficulty: 'Intermediate',
    passing_percentage: 60,
    icon: 'Cloud'
  }
];

export const SEED_QUESTIONS: SeedQuestion[] = [
  // ==========================================
  // 1. FRONTEND DEVELOPMENT (10 QUESTIONS)
  // ==========================================
  {
    id: 'q-fe-01',
    assessment_id: 'asmt-frontend-01',
    question_text: 'In React, what is the primary operational difference between useEffect and useLayoutEffect?',
    options: [
      'useEffect runs asynchronously after the browser paints, whereas useLayoutEffect fires synchronously after all DOM mutations before paint.',
      'useEffect only triggers on component mount, whereas useLayoutEffect triggers on every state re-render.',
      'useEffect runs in Node.js server environments, whereas useLayoutEffect is exclusively client-side.',
      'useEffect cannot return a cleanup function, whereas useLayoutEffect requires a cleanup callback.'
    ],
    correct_option_index: 0,
    explanation: 'useLayoutEffect runs synchronously immediately after DOM mutations before the browser paints the screen, making it suitable for measuring layout geometry to avoid visual flicker.'
  },
  {
    id: 'q-fe-02',
    assessment_id: 'asmt-frontend-01',
    question_text: 'Which CSS Flexbox property is used to align flex items along the cross axis inside their container?',
    options: [
      'justify-content',
      'align-items',
      'flex-direction',
      'align-self-content'
    ],
    correct_option_index: 1,
    explanation: 'align-items aligns flex items along the cross axis of the current flex line, while justify-content aligns items along the main axis.'
  },
  {
    id: 'q-fe-03',
    assessment_id: 'asmt-frontend-01',
    question_text: 'In JavaScript, what will `typeof null` and `[] instanceof Object` evaluate to?',
    options: [
      "'null' and false",
      "'object' and true",
      "'undefined' and true",
      "'object' and false"
    ],
    correct_option_index: 1,
    explanation: '`typeof null` returns "object" due to a historical JavaScript bug, and Arrays are instances of Object in JS prototype inheritance.'
  },
  {
    id: 'q-fe-04',
    assessment_id: 'asmt-frontend-01',
    question_text: 'What is the primary purpose of the React useCallback hook?',
    options: [
      'To memoize heavy computational return values between renders.',
      'To memoize a callback function instance between renders to prevent unnecessary re-renders of memoized child components.',
      'To automatically synchronize component state with browser localStorage.',
      'To initiate asynchronous API fetch requests during render phase.'
    ],
    correct_option_index: 1,
    explanation: 'useCallback returns a memoized version of the callback function that only changes when its dependencies change, preventing child re-renders triggered by new function references.'
  },
  {
    id: 'q-fe-05',
    assessment_id: 'asmt-frontend-01',
    question_text: 'What is the correct sequential order of steps in the browser Critical Rendering Path?',
    options: [
      'Layout -> Paint -> DOM Tree -> CSSOM Tree -> Render Tree',
      'DOM Tree -> CSSOM Tree -> Render Tree -> Layout -> Paint',
      'CSSOM Tree -> DOM Tree -> Paint -> Layout -> Render Tree',
      'Render Tree -> DOM Tree -> CSSOM Tree -> Paint -> Layout'
    ],
    correct_option_index: 1,
    explanation: 'The browser builds the DOM from HTML, builds CSSOM from styles, combines them into the Render Tree, computes coordinates in Layout, and renders pixels in Paint.'
  },
  {
    id: 'q-fe-06',
    assessment_id: 'asmt-frontend-01',
    question_text: 'In TypeScript, what is a key difference between an `interface` and a `type` alias regarding declaration merging?',
    options: [
      'Interfaces with the same name automatically merge declarations, while type aliases cannot be reopened.',
      'Type aliases merge declarations automatically, while interfaces generate duplicate identifier errors.',
      'Neither interfaces nor type aliases support any form of declaration merging.',
      'Interfaces can only declare primitive strings and numbers, while types declare objects.'
    ],
    correct_option_index: 0,
    explanation: 'TypeScript interfaces are open and support declaration merging across multiple definitions with the same name, whereas type aliases cannot be reopened once declared.'
  },
  {
    id: 'q-fe-07',
    assessment_id: 'asmt-frontend-01',
    question_text: 'Which Web Storage mechanism retains stored key-value data with NO expiration time across browser tab sessions until explicitly cleared?',
    options: [
      'sessionStorage',
      'localStorage',
      'Session Cookie',
      'Memory Cache'
    ],
    correct_option_index: 1,
    explanation: 'localStorage persists across browser sessions and computer restarts until cleared programmatically via JavaScript or manually by the user.'
  },
  {
    id: 'q-fe-08',
    assessment_id: 'asmt-frontend-01',
    question_text: 'What performance benefit does the CSS property `contain: content` or `contain: layout` provide?',
    options: [
      'It isolates element subtrees from the rest of the document, allowing the browser engine to optimize layout and repaint cycles.',
      'It automatically converts all nested elements into responsive flex grid cells.',
      'It prevents text selection and right-click context menus on protected assets.',
      'It forces hardware-accelerated 3D transforms on all child elements.'
    ],
    correct_option_index: 0,
    explanation: 'CSS Containment informs the browser that an element subtree is independent, allowing the browser to recalculate layout and paint only within that subtree.'
  },
  {
    id: 'q-fe-09',
    assessment_id: 'asmt-frontend-01',
    question_text: 'What core engineering problem does React Virtual DOM solve?',
    options: [
      'It eliminates the need for JavaScript by compiling directly to WebAssembly.',
      'It minimizes costly real DOM manipulations by computing tree diffs in memory and batching real DOM mutations.',
      'It executes client-side code directly on the GPU without CPU overhead.',
      'It automatically sanitizes all user input against SQL injection.'
    ],
    correct_option_index: 1,
    explanation: 'Direct DOM manipulation is computationally expensive. React computes differences between virtual DOM trees (reconciliation) and applies only the minimum required changes to the real DOM.'
  },
  {
    id: 'q-fe-10',
    assessment_id: 'asmt-frontend-01',
    question_text: 'Which HTTP response header effectively mitigates Cross-Site Scripting (XSS) by restricting where scripts and assets can be loaded from?',
    options: [
      'X-Frame-Options',
      'Content-Security-Policy',
      'Access-Control-Allow-Origin',
      'Strict-Transport-Security'
    ],
    correct_option_index: 1,
    explanation: 'Content-Security-Policy (CSP) allows server administrators to specify valid sources and restrictions for scripts, stylesheets, images, and other resources.'
  },

  // ==========================================
  // 2. BACKEND DEVELOPMENT (10 QUESTIONS)
  // ==========================================
  {
    id: 'q-be-01',
    assessment_id: 'asmt-backend-02',
    question_text: 'In REST API architectural standards, which HTTP method is idempotent and intended to completely replace an existing resource?',
    options: [
      'POST',
      'PUT',
      'PATCH',
      'CONNECT'
    ],
    correct_option_index: 1,
    explanation: 'PUT is idempotent and replaces the entire representation of the target resource with the request payload. PATCH is used for partial updates.'
  },
  {
    id: 'q-be-02',
    assessment_id: 'asmt-backend-02',
    question_text: 'In relational database index design, which data structure is most standard for primary and composite indexes?',
    options: [
      'Hash Map',
      'B+ Tree',
      'Doubly Linked List',
      'Binary Min-Heap'
    ],
    correct_option_index: 1,
    explanation: 'B+ Trees provide sorted keys and balanced depths, making range scans, ordered lookups, insertions, and deletions fast and efficient for disk I/O.'
  },
  {
    id: 'q-be-03',
    assessment_id: 'asmt-backend-02',
    question_text: 'In Node.js internals, which C/C++ library handles the event loop, thread pool, and asynchronous I/O abstractions?',
    options: [
      'V8 Engine',
      'libuv',
      'NPM Package Manager',
      'OpenSSL'
    ],
    correct_option_index: 1,
    explanation: 'libuv is the multi-platform support library providing asynchronous I/O based on event loops and thread pools for file and DNS operations in Node.js.'
  },
  {
    id: 'q-be-04',
    assessment_id: 'asmt-backend-02',
    question_text: 'In database transaction theory, what does the "I" in ACID stand for?',
    options: [
      'Integrity',
      'Isolation',
      'Idempotence',
      'Indexing'
    ],
    correct_option_index: 1,
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Isolation guarantees that concurrent transactions execute independently without cross-transaction interference.'
  },
  {
    id: 'q-be-05',
    assessment_id: 'asmt-backend-02',
    question_text: 'Which HTTP status code should a backend API return when a client makes a request without valid authentication credentials?',
    options: [
      '400 Bad Request',
      '401 Unauthorized',
      '403 Forbidden',
      '404 Not Found'
    ],
    correct_option_index: 1,
    explanation: '401 Unauthorized indicates authentication credentials are required or invalid. 403 Forbidden means the identity is authenticated but lacks required access privileges.'
  },
  {
    id: 'q-be-06',
    assessment_id: 'asmt-backend-02',
    question_text: 'What is the "N+1 Query Problem" commonly encountered when using Object-Relational Mappers (ORMs)?',
    options: [
      'A deadlock condition where N+1 threads simultaneously acquire exclusive table locks.',
      'Executing 1 initial query to fetch parent records, followed by N separate queries to fetch related child entities in a loop.',
      'A memory overflow caused by requesting N+1 fields in a single SELECT statement.',
      'An authentication loop exceeding the maximum number of JWT retries.'
    ],
    correct_option_index: 1,
    explanation: 'The N+1 query problem occurs when an application executes 1 query for parents and then N queries for related data instead of performing an eager JOIN or batched IN query.'
  },
  {
    id: 'q-be-07',
    assessment_id: 'asmt-backend-02',
    question_text: 'Why is a cryptographic salt appended to passwords before hashing with algorithms like bcrypt or Argon2?',
    options: [
      'To compress the plaintext password to a fixed 64-character string.',
      'To ensure identical passwords generate unique hash values, neutralizing rainbow table attacks.',
      'To enable reversible two-way decryption when password reset is requested.',
      'To accelerate server verification throughput on high-traffic login endpoints.'
    ],
    correct_option_index: 1,
    explanation: 'A salt is a random value added to passwords before hashing so that identical passwords result in distinct hashes, thwarting dictionary and precomputed rainbow table attacks.'
  },
  {
    id: 'q-be-08',
    assessment_id: 'asmt-backend-02',
    question_text: 'In Redis caching architectures, what behavior does the LRU eviction policy implement when maxmemory is reached?',
    options: [
      'It evicts the least frequently accessed keys.',
      'It evicts the least recently used keys first.',
      'It deletes keys with the shortest time-to-live (TTL) expiration timestamps.',
      'It drops random volatile keys without inspecting access timestamps.'
    ],
    correct_option_index: 1,
    explanation: 'LRU (Least Recently Used) evicts keys that have not been read or written to for the longest period of time when cache capacity is exceeded.'
  },
  {
    id: 'q-be-09',
    assessment_id: 'asmt-backend-02',
    question_text: 'What primary performance advantage does Database Connection Pooling provide to web applications?',
    options: [
      'It caches query results in browser localStorage automatically.',
      'It reuses an established pool of active database connections, eliminating the latency of creating new TCP connections per request.',
      'It converts relational SQL tables into GraphQL schemas on the fly.',
      'It encrypts all stored disk blocks using AES-256 without CPU overhead.'
    ],
    correct_option_index: 1,
    explanation: 'Creating a new database connection involves TCP and TLS handshakes plus authentication. Connection pools keep a set of warm connections ready for reuse.'
  },
  {
    id: 'q-be-010',
    assessment_id: 'asmt-backend-02',
    question_text: 'Which mechanism prevents Cross-Origin Resource Sharing (CORS) security issues when a browser frontend calls a backend API on a different domain?',
    options: [
      'Server sending appropriate Access-Control-Allow-Origin headers in response to preflight requests.',
      'Client disabling browser sandbox security settings.',
      'Using UDP datagram sockets instead of HTTP connections.',
      'Encoding all request JSON payloads using Base64 encryption.'
    ],
    correct_option_index: 0,
    explanation: 'The backend server must configure CORS response headers (Access-Control-Allow-Origin, Methods, Headers) to authorize requests coming from distinct origin origins.'
  },

  // ==========================================
  // 3. FULL STACK DEVELOPMENT (10 QUESTIONS)
  // ==========================================
  {
    id: 'q-fs-01',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'What is the principal architectural distinction between Server-Side Rendering (SSR) and Client-Side Rendering (CSR)?',
    options: [
      'SSR generates full HTML on the server per request boosting SEO and initial paint, whereas CSR sends minimal HTML and constructs the UI via browser JavaScript.',
      'SSR cannot use CSS stylesheets, whereas CSR natively supports styling.',
      'CSR only functions on mobile devices, whereas SSR is restricted to desktop browsers.',
      'SSR requires WebAssembly runtimes, whereas CSR requires Node.js on the client.'
    ],
    correct_option_index: 0,
    explanation: 'SSR renders HTML on the server before transmitting to the browser for faster First Contentful Paint and SEO indexing, while CSR relies on client-side JS rendering.'
  },
  {
    id: 'q-fs-02',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'Which vulnerability occurs when an attacker tricks an authenticated browser into submitting unauthorized requests to a trusted application?',
    options: [
      'Cross-Site Request Forgery (CSRF)',
      'SQL Injection (SQLi)',
      'Server-Side Request Forgery (SSRF)',
      'Distributed Denial of Service (DDoS)'
    ],
    correct_option_index: 0,
    explanation: 'CSRF exploits automatic cookie transmission in browsers to execute state-changing actions on a trusted site on behalf of an authenticated victim.'
  },
  {
    id: 'q-fs-03',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'In fullstack client-state design, what is an "Optimistic UI Update"?',
    options: [
      'Rendering mock placeholder data when backend databases are offline.',
      'Updating the client UI immediately assuming server mutation success, then rolling back state if the API call fails.',
      'Prompting a modal confirmation dialog before every POST request.',
      'Caching static assets indefinitely inside Content Delivery Networks.'
    ],
    correct_option_index: 1,
    explanation: 'Optimistic UI updates give users instantaneous UI feedback without waiting for server network roundtrips, reverting the UI state only if an error response is received.'
  },
  {
    id: 'q-fs-04',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'What is the core function of a JSON Web Token (JWT) cryptographic signature?',
    options: [
      'To encrypt token payload fields so they cannot be inspected in browser devtools.',
      'To verify token authenticity and ensure payload claims were not modified in transit.',
      'To automatically renew database connection pool sessions.',
      'To compress request payloads for cellular network optimization.'
    ],
    correct_option_index: 1,
    explanation: 'The JWT signature validates that the issuer created the token and that claims have not been altered or forged by any intermediary.'
  },
  {
    id: 'q-fs-05',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'When comparing WebSockets to HTTP Long Polling for real-time bidirectional messaging, which statement is true?',
    options: [
      'WebSockets establish a persistent, full-duplex TCP connection with low frame overhead after initial HTTP upgrade handshake.',
      'HTTP Long Polling produces less server memory overhead and faster message throughput.',
      'WebSockets cannot pass through standard HTTP port 80/443 firewalls.',
      'WebSockets only support text strings and cannot transfer binary Buffers or ArrayBuffers.'
    ],
    correct_option_index: 0,
    explanation: 'WebSockets maintain an open, full-duplex connection over a single TCP socket, removing repeated HTTP header overhead and latency.'
  },
  {
    id: 'q-fs-06',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'What is the critical role of Database Migrations in continuous deployment workflows?',
    options: [
      'To randomly transfer relational tables to document databases.',
      'To version-control, apply, and rollback incremental database schema changes deterministically across environments.',
      'To automatically purge student session records on server boot.',
      'To compress SQL backup archives onto cold storage disks.'
    ],
    correct_option_index: 1,
    explanation: 'Database migrations provide programmatic, reproducible, versioned schema modifications ensuring schema consistency across dev, staging, and production.'
  },
  {
    id: 'q-fs-07',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'Why do modern browsers initiate CORS Preflight `OPTIONS` requests before sending certain HTTP requests?',
    options: [
      'To verify server availability before initiating large file downloads.',
      'To check whether the server permits the specific cross-origin method and custom headers before sending the actual request payload.',
      'To convert XML request bodies into JSON format.',
      'To authenticate user biometrics with cloud identity providers.'
    ],
    correct_option_index: 1,
    explanation: 'Preflight OPTIONS requests allow the browser to verify permissions with the target server before dispatching potentially state-altering cross-origin calls.'
  },
  {
    id: 'q-fs-08',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'Which cookie attribute protects authentication session cookies from being accessed via client-side JavaScript `document.cookie`?',
    options: [
      'SameSite=Strict',
      'HttpOnly',
      'Secure',
      'Max-Age=3600'
    ],
    correct_option_index: 1,
    explanation: 'The HttpOnly flag blocks client-side scripts from reading or manipulating the cookie, preventing cookie theft via XSS vulnerabilities.'
  },
  {
    id: 'q-fs-09',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'In GraphQL API architecture, how is the common REST issue of over-fetching and under-fetching solved?',
    options: [
      'By allowing clients to query and receive exactly the specific fields and nested relational entities required in a single request.',
      'By enforcing binary compression on all REST endpoints.',
      'By requiring server-side caching of all relational database tables.',
      'By replacing HTTP transport layers with WebRTC connections.'
    ],
    correct_option_index: 0,
    explanation: 'GraphQL empowers clients to declare the exact schema fields needed in a single query payload, avoiding extraneous data transfer and multiple network waterfalls.'
  },
  {
    id: 'q-fs-010',
    assessment_id: 'asmt-fullstack-03',
    question_text: 'What primary advantage does multi-container Docker Compose configuration provide fullstack developers?',
    options: [
      'It completely removes the need for automated integration testing.',
      'It ensures environment parity by running identical containerized runtimes and service dependencies across dev and prod.',
      'It automatically doubles physical CPU clock frequencies.',
      'It replaces SQL relational tables with in-memory arrays.'
    ],
    correct_option_index: 1,
    explanation: 'Docker Compose orchestrates multi-container applications with isolated networking and storage, guaranteeing identical runtime behavior on any host machine.'
  },

  // ==========================================
  // 4. CLOUD COMPUTING (10 QUESTIONS)
  // ==========================================
  {
    id: 'q-cc-01',
    assessment_id: 'asmt-cloud-04',
    question_text: 'Which cloud service model provides virtual machines, raw storage, and virtual networks where users manage the OS, runtime, and software stack?',
    options: [
      'SaaS (Software as a Service)',
      'PaaS (Platform as a Service)',
      'IaaS (Infrastructure as a Service)',
      'FaaS (Function as a Service)'
    ],
    correct_option_index: 2,
    explanation: 'Infrastructure as a Service (IaaS, e.g., AWS EC2, GCP Compute Engine) delivers raw compute and networking resources where the customer manages the OS and runtime.'
  },
  {
    id: 'q-cc-02',
    assessment_id: 'asmt-cloud-04',
    question_text: 'In Docker containerization best practices, what is the primary benefit of utilizing Multi-stage builds?',
    options: [
      'Running multiple Docker daemons on a single host machine.',
      'Minimizing final production image size by discarding build tools and intermediate artifacts from the runtime image.',
      'Bypassing container registry authentication requirements.',
      'Encrypting the source Dockerfile with AES-256.'
    ],
    correct_option_index: 1,
    explanation: 'Multi-stage builds compile artifacts in an intermediate build container and copy only the finalized production bundle into a lean base image (e.g. Alpine), reducing image size.'
  },
  {
    id: 'q-cc-03',
    assessment_id: 'asmt-cloud-04',
    question_text: 'In Kubernetes cluster orchestration, what is the smallest deployable compute unit that can be created and managed?',
    options: [
      'Cluster',
      'Pod',
      'Worker Node',
      'Namespace'
    ],
    correct_option_index: 1,
    explanation: 'A Pod is the smallest execution unit in Kubernetes, wrapping one or more co-located containers that share network IP addresses and storage volumes.'
  },
  {
    id: 'q-cc-04',
    assessment_id: 'asmt-cloud-04',
    question_text: 'In Cloud Identity & Access Management (IAM), what does the Principle of Least Privilege (PoLP) dictate?',
    options: [
      'Granting all developers unrestricted root access to accelerate troubleshooting.',
      'Granting users, services, and roles only the minimum permissions strictly necessary to perform their intended tasks.',
      'Disabling all TLS encryption certificates to reduce CPU latency.',
      'Restricting cloud infrastructure access to a single static IP address.'
    ],
    correct_option_index: 1,
    explanation: 'The Principle of Least Privilege ensures that identities and service accounts possess only the explicit permissions required for their tasks, minimizing the blast radius of any breach.'
  },
  {
    id: 'q-cc-05',
    assessment_id: 'asmt-cloud-04',
    question_text: 'What causes a "Cold Start" latency spike in Serverless computing environments (e.g., AWS Lambda, GCP Cloud Functions)?',
    options: [
      'Functions executing during low temperature weather conditions.',
      'The cloud provider initializing a new container environment, loading runtime engines, and importing dependencies for a newly invoked function.',
      'A hardware motherboard failure requiring manual technician reboot.',
      'Database connection pools dropping below 1 idle connection.'
    ],
    correct_option_index: 1,
    explanation: 'When a serverless function scales up or has been idle, the cloud platform must provision a container, download code, and start the runtime before processing the event.'
  },
  {
    id: 'q-cc-06',
    assessment_id: 'asmt-cloud-04',
    question_text: 'Which Infrastructure as Code (IaC) tool enables declarative multi-cloud resource provisioning using HashiCorp Configuration Language (HCL)?',
    options: [
      'Kubernetes Helm',
      'Terraform',
      'Docker Compose',
      'Git Bash'
    ],
    correct_option_index: 1,
    explanation: 'Terraform is an open-source IaC tool that allows developers to define, provision, and version infrastructure across multiple cloud providers using declarative configuration.'
  },
  {
    id: 'q-cc-07',
    assessment_id: 'asmt-cloud-04',
    question_text: 'In Cloud Disaster Recovery planning, what does the Recovery Point Objective (RPO) metric measure?',
    options: [
      'The maximum acceptable duration of service downtime before business operations resume.',
      'The maximum acceptable amount of data loss measured in time between the latest backup and a disaster occurrence.',
      'The total dollar value budget for disaster recovery infrastructure.',
      'The number of virtual machines destroyed during an outage.'
    ],
    correct_option_index: 1,
    explanation: 'RPO measures tolerable data loss in time units (e.g., maximum 1 hour of data loss), whereas RTO (Recovery Time Objective) measures tolerable downtime.'
  },
  {
    id: 'q-cc-08',
    assessment_id: 'asmt-cloud-04',
    question_text: 'Which Cloud storage category (such as AWS S3 or Google Cloud Storage) is engineered for storing user avatars, documents, and assets with massive scale and high durability?',
    options: [
      'Block Storage (EBS / Persistent Disk)',
      'Object Storage (Amazon S3 / Google Cloud Storage)',
      'Relational Database Storage (RDS / Cloud SQL)',
      'Key-Value In-Memory Storage (ElastiCache / Memorystore)'
    ],
    correct_option_index: 1,
    explanation: 'Object storage systems like Amazon S3 and Google Cloud Storage are optimized for storing unstructured files with virtually unlimited scalability and 99.999999999% durability.'
  },
  {
    id: 'q-cc-09',
    assessment_id: 'asmt-cloud-04',
    question_text: 'What is the primary function of an Application Load Balancer (ALB) in cloud deployments?',
    options: [
      'Distributing Layer 7 (HTTP/HTTPS) traffic across healthy application target groups with path-based routing and SSL termination.',
      'Converting relational database tables into CSV backups.',
      'Minifying JavaScript code inside client browser caches.',
      'Generating API authentication tokens for incoming requests.'
    ],
    correct_option_index: 0,
    explanation: 'Application Load Balancers operate at Layer 7 to route incoming HTTP/HTTPS traffic across multiple target instances based on content, path, and health checks.'
  },
  {
    id: 'q-cc-010',
    assessment_id: 'asmt-cloud-04',
    question_text: 'In modern Cloud deployment strategies, what is a "Canary Deployment"?',
    options: [
      'Deploying new software updates to 100% of production users simultaneously at midnight.',
      'Gradually routing a small percentage of real production traffic to a new version to validate stability and metrics before full rollout.',
      'Rolling back all git commits to the original repository master branch.',
      'Testing source code strictly on local developer workstations without cloud staging.'
    ],
    correct_option_index: 1,
    explanation: 'Canary deployment exposes a small subset of production users to the new release to monitor errors and performance metrics before rolling it out fleet-wide.'
  }
];
