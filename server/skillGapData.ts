export interface IndustrySkillRequirement {
  skill_name: string;
  aliases: string[];
  required_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  importance: string;
  recommended_learning: string;
  recommended_projects: string;
  related_assessment_category?: 'Frontend' | 'Backend' | 'Full Stack' | 'Cloud';
}

export interface JobRoleDefinition {
  id: string;
  title: string;
  category: string;
  short_description: string;
  detailed_overview: string;
  market_demand: string;
  average_salary_range: string;
  key_responsibilities: string[];
  required_skills: IndustrySkillRequirement[];
}

export const INDUSTRY_ROLES: JobRoleDefinition[] = [
  {
    id: 'full-stack-engineer',
    title: 'Full-Stack Software Engineer',
    category: 'Software Engineering',
    short_description: 'Architects and builds responsive user interfaces, robust backend APIs, database schemas, and integration pipelines.',
    detailed_overview: 'Full-Stack Software Engineers bridge client-side user experience with server-side microservices, database schemas, and production deployments. They must write clean, type-safe code, design RESTful APIs, and implement automated testing.',
    market_demand: 'Very High (Top hiring priority across tech startups and enterprises)',
    average_salary_range: '$95,000 - $150,000 / ₹10L - ₹28L PA',
    key_responsibilities: [
      'Design modular, accessible web applications using modern component frameworks like React.',
      'Construct high-throughput server backends and REST APIs in Node.js or TypeScript.',
      'Model relational databases, write optimized SQL queries, and enforce ACID transactions.',
      'Write comprehensive unit and integration test suites to maintain zero-regression deployments.',
      'Collaborate using Git branching workflows, pull requests, and automated CI pipelines.'
    ],
    required_skills: [
      {
        skill_name: 'HTML/CSS',
        aliases: ['html', 'css', 'html5', 'css3', 'html/css', 'tailwind css', 'tailwind'],
        required_level: 'Intermediate',
        importance: 'Foundation for accessible layout design, semantic web standards, and modern responsive CSS styling.',
        recommended_learning: 'Master modern CSS Flexbox, Grid, CSS Variables, and accessibility (a11y) ARIA attributes.',
        recommended_projects: 'Design a pixel-perfect, fully responsive multi-theme dashboard without external UI libraries.',
        related_assessment_category: 'Frontend'
      },
      {
        skill_name: 'JavaScript/TypeScript',
        aliases: ['javascript', 'typescript', 'js', 'ts', 'ecmascript'],
        required_level: 'Advanced',
        importance: 'Core language for client-side interactivity and robust type-safe server backends.',
        recommended_learning: 'Deep-dive into event loops, asynchronous promises, TypeScript generics, strict typing, and utility types.',
        recommended_projects: 'Build an end-to-end type-safe monorepo sharing validation schemas between client and server.',
        related_assessment_category: 'Full Stack'
      },
      {
        skill_name: 'React',
        aliases: ['react', 'react.js', 'reactjs', 'next.js', 'nextjs'],
        required_level: 'Advanced',
        importance: 'Industry-standard frontend architecture for single-page applications and interactive state management.',
        recommended_learning: 'Study React 18 concurrent rendering, custom hooks composition, memoization patterns, and Context/Zustand.',
        recommended_projects: 'Construct a real-time collaborative workspace with optimistic UI updates and custom hooks.',
        related_assessment_category: 'Frontend'
      },
      {
        skill_name: 'Node.js',
        aliases: ['node.js', 'nodejs', 'node', 'express', 'express.js', 'nest.js', 'nestjs'],
        required_level: 'Intermediate',
        importance: 'Scalable event-driven backend runtime powering asynchronous microservices and API gateways.',
        recommended_learning: 'Master Node.js streams, cluster modules, middleware chains, authentication JWTs, and error handling.',
        recommended_projects: 'Create a rate-limited RESTful microservice with JWT auth, file uploads, and streaming loggers.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'REST APIs',
        aliases: ['rest apis', 'rest api', 'restful apis', 'api design', 'restful web services', 'rest'],
        required_level: 'Intermediate',
        importance: 'Standard communication protocol between frontend clients, microservices, and third-party SaaS integrations.',
        recommended_learning: 'Study HTTP verbs, idempotent endpoints, pagination, filtering query params, and OpenAPI 3.0 specs.',
        recommended_projects: 'Design and document an OpenAPI/Swagger compliant eCommerce API with comprehensive validation.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'SQL',
        aliases: ['sql', 'postgresql', 'postgres', 'mysql', 'sqlite', 'relational databases'],
        required_level: 'Intermediate',
        importance: 'Essential for structured data storage, relational integrity, analytical querying, and index optimization.',
        recommended_learning: 'Practice complex multi-table joins, subqueries, indexing strategies, window functions, and migrations.',
        recommended_projects: 'Architect a relational database for an analytics platform with indexed queries and transaction rollbacks.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'Git',
        aliases: ['git', 'git & github', 'github', 'gitlab', 'version control'],
        required_level: 'Intermediate',
        importance: 'Standard version control system enabling collaborative branching, code reviews, and CI automation.',
        recommended_learning: 'Master interactive rebasing, merge conflict resolution, git stash, commit hooks, and release tagging.',
        recommended_projects: 'Configure a multi-contributor GitHub repo with branch protections, PR templates, and automated lint checks.',
        related_assessment_category: 'Full Stack'
      },
      {
        skill_name: 'Testing',
        aliases: ['testing', 'unit testing', 'jest', 'vitest', 'cypress', 'playwright', 'automated testing'],
        required_level: 'Intermediate',
        importance: 'Guarantees software correctness, catches edge-case regressions, and facilitates confident refactoring.',
        recommended_learning: 'Learn Jest/Vitest unit mocking, React Testing Library user-event simulations, and E2E Playwright flows.',
        recommended_projects: 'Write full unit and integration test coverage for a critical checkout authentication flow.',
        related_assessment_category: 'Full Stack'
      }
    ]
  },
  {
    id: 'cloud-devops-engineer',
    title: 'Cloud & DevOps Engineer',
    category: 'Cloud & Infrastructure',
    short_description: 'Automates CI/CD deployment pipelines, manages scalable cloud infrastructure, orchestrates containers, and monitors system reliability.',
    detailed_overview: 'Cloud & DevOps Engineers automate the entire software delivery lifecycle. They build immutable infrastructure using Infrastructure-as-Code, manage containerized clusters, configure load balancers, and maintain 99.99% service availability.',
    market_demand: 'High (Surging demand as organizations migrate workloads to hybrid cloud platforms)',
    average_salary_range: '$105,000 - $165,000 / ₹12L - ₹32L PA',
    key_responsibilities: [
      'Provision and manage fault-tolerant cloud architecture across AWS and Google Cloud Platform.',
      'Containerize microservices with Docker and orchestrate resilient clusters with Kubernetes.',
      'Construct automated CI/CD deployment pipelines with zero downtime and automated rollbacks.',
      'Configure cloud networking, VPC peering, TLS certificates, load balancers, and IAM security policies.',
      'Establish observability dashboards, distributed tracing, and automated alerting systems.'
    ],
    required_skills: [
      {
        skill_name: 'Linux',
        aliases: ['linux', 'unix', 'ubuntu', 'bash', 'shell scripting', 'system administration'],
        required_level: 'Intermediate',
        importance: 'Operating system foundation for container environments, cloud virtual machines, and automation scripts.',
        recommended_learning: 'Master Bash scripting, process signals, systemd service units, permissions, and network debugging tools (netstat, curl).',
        recommended_projects: 'Write an automated Bash health-check script that monitors CPU/memory thresholds and auto-restarts failed services.',
        related_assessment_category: 'Cloud'
      },
      {
        skill_name: 'AWS/GCP',
        aliases: ['aws', 'gcp', 'cloud computing (aws/gcp)', 'cloud computing', 'amazon web services', 'google cloud', 'cloud'],
        required_level: 'Advanced',
        importance: 'Industry-leading public cloud providers for compute (EC2/GCE), storage (S3/GCS), IAM, and serverless architectures.',
        recommended_learning: 'Master IAM role least-privilege principles, VPC subnetting, CloudWatch/Cloud Monitoring, and Auto-Scaling Groups.',
        recommended_projects: 'Deploy a highly available, multi-AZ web service with automated autoscaling and S3 asset delivery.',
        related_assessment_category: 'Cloud'
      },
      {
        skill_name: 'Docker',
        aliases: ['docker', 'containers', 'containerization', 'dockerfile', 'docker-compose'],
        required_level: 'Intermediate',
        importance: 'Standard containerization technology ensuring consistent environment execution across dev, test, and production.',
        recommended_learning: 'Learn multi-stage Dockerfiles, image layer caching, non-root security principles, and docker-compose networking.',
        recommended_projects: 'Containerize a full-stack polyglot application with optimized multi-stage build caching.',
        related_assessment_category: 'Cloud'
      },
      {
        skill_name: 'Kubernetes',
        aliases: ['kubernetes', 'k8s', 'helm', 'cluster management'],
        required_level: 'Intermediate',
        importance: 'Leading container orchestrator for automated scaling, self-healing, rolling deployments, and ingress routing.',
        recommended_learning: 'Understand Pods, Deployments, Services, ConfigMaps/Secrets, Ingress Controllers, and HPA (Horizontal Pod Autoscaler).',
        recommended_projects: 'Deploy a replicated microservice application onto a local Minikube/K3s cluster with automated ingress and secrets.',
        related_assessment_category: 'Cloud'
      },
      {
        skill_name: 'CI/CD',
        aliases: ['ci/cd', 'ci/cd (github actions / jenkins)', 'continuous integration', 'github actions', 'jenkins', 'gitlab ci'],
        required_level: 'Intermediate',
        importance: 'Automates testing, linting, image building, security scanning, and automated production deployments.',
        recommended_learning: 'Build GitHub Actions workflows with matrix builds, artifact caching, environment secrets, and automated release tags.',
        recommended_projects: 'Create a zero-downtime CI/CD pipeline that tests code, builds Docker images, and deploys to cloud upon merge.',
        related_assessment_category: 'Cloud'
      },
      {
        skill_name: 'Networking',
        aliases: ['networking', 'computer networks', 'dns', 'tcp/ip', 'http/https', 'load balancers', 'vpn'],
        required_level: 'Intermediate',
        importance: 'Essential for configuring VPC subnets, route tables, SSL/TLS termination, reverse proxies, and CDN caching.',
        recommended_learning: 'Study the OSI model, TCP handshakes, DNS propagation, HTTP/2 & HTTP/3 protocols, and firewall rules.',
        recommended_projects: 'Set up an Nginx reverse proxy with automated Let\'s Encrypt SSL renewal and rate limiting.',
        related_assessment_category: 'Cloud'
      },
      {
        skill_name: 'Git',
        aliases: ['git', 'git & github', 'github', 'version control', 'gitops'],
        required_level: 'Intermediate',
        importance: 'Core foundation for GitOps workflows, Infrastructure-as-Code repository management, and deployment automation.',
        recommended_learning: 'Study Git tags, release branches, GitOps synchronization (ArgoCD), and automated webhook triggers.',
        recommended_projects: 'Implement GitOps infrastructure manifests that trigger automatic staging deployments upon PR merge.',
        related_assessment_category: 'Full Stack'
      },
      {
        skill_name: 'Infrastructure basics',
        aliases: ['infrastructure basics', 'terraform', 'iac', 'infrastructure as code', 'cloudformation', 'ansible'],
        required_level: 'Intermediate',
        importance: 'Infrastructure-as-Code enables repeatable, declarative, version-controlled cloud infrastructure provisioning.',
        recommended_learning: 'Learn Terraform HCL syntax, state management, remote backends, modules, and variable definitions.',
        recommended_projects: 'Write reusable Terraform modules to provision a complete VPC, security groups, and compute cluster in AWS or GCP.',
        related_assessment_category: 'Cloud'
      }
    ]
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI/ML Engineer',
    category: 'Artificial Intelligence',
    short_description: 'Builds predictive machine learning models, engineers data pipelines, fine-tunes LLMs, and deploys intelligent APIs into production.',
    detailed_overview: 'AI & Machine Learning Engineers design mathematical algorithms and neural networks to extract predictive insights from data. They curate datasets, train models, evaluate precision/recall, and deploy low-latency inference services.',
    market_demand: 'Extremely High (Explosive growth in generative AI, natural language processing, and automation)',
    average_salary_range: '$115,000 - $175,000 / ₹14L - ₹36L PA',
    key_responsibilities: [
      'Develop and train supervised and unsupervised machine learning models for classification and regression.',
      'Build scalable data ingestion, normalization, and feature engineering transformation pipelines in Python.',
      'Integrate Large Language Models (LLMs) via prompt engineering, embeddings, and RAG architectures.',
      'Benchmark model metrics (Accuracy, ROC-AUC, F1-Score, Latency) and monitor drift in production.',
      'Serve ML models through low-latency REST/gRPC endpoints containerized in Docker.'
    ],
    required_skills: [
      {
        skill_name: 'Python',
        aliases: ['python', 'python 3', 'py', 'object-oriented python'],
        required_level: 'Advanced',
        importance: 'The primary ecosystem language for scientific computing, neural network frameworks, and data manipulation.',
        recommended_learning: 'Master Python list/dict comprehensions, generators, vectorization, object-oriented design, and type hints.',
        recommended_projects: 'Build a modular Python package with clean API documentation and high-performance vectorized operations.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'Statistics',
        aliases: ['statistics', 'probability', 'applied math', 'linear algebra', 'mathematics'],
        required_level: 'Intermediate',
        importance: 'Theoretical foundation for hypothesis testing, probability distributions, loss function optimization, and regression.',
        recommended_learning: 'Study Bayes Theorem, Central Limit Theorem, ANOVA tests, gradient descent math, and variance analysis.',
        recommended_projects: 'Conduct comprehensive A/B test statistical analysis with confidence intervals and p-value validation.',
        related_assessment_category: 'Full Stack'
      },
      {
        skill_name: 'Machine Learning',
        aliases: ['machine learning', 'ml', 'deep learning', 'scikit-learn', 'tensorflow', 'pytorch'],
        required_level: 'Advanced',
        importance: 'Core algorithms (Random Forests, Gradient Boosting, SVMs, Neural Networks) that power predictive intelligence.',
        recommended_learning: 'Learn supervised/unsupervised algorithms, hyperparameter grid search, regularization (L1/L2), and PyTorch/TensorFlow.',
        recommended_projects: 'Train and fine-tune an end-to-end customer churn classification model with Scikit-Learn and PyTorch.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'SQL',
        aliases: ['sql', 'postgresql', 'mysql', 'analytical sql', 'relational databases'],
        required_level: 'Intermediate',
        importance: 'Essential for querying relational data warehouses, feature stores, and preparing training datasets.',
        recommended_learning: 'Master complex aggregations, window ranking functions, table unions, and temporal data filtering.',
        recommended_projects: 'Write complex SQL extraction queries that transform raw transactional logs into training feature sets.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'Data Processing',
        aliases: ['data processing', 'pandas', 'numpy', 'data wrangling', 'feature engineering', 'data analysis'],
        required_level: 'Intermediate',
        importance: 'Handling missing values, outlier detection, one-hot encoding, and feature scaling before model training.',
        recommended_learning: 'Master Pandas DataFrame manipulation, NumPy array broadcasting, categorical encodings, and missing data imputation.',
        recommended_projects: 'Construct a reusable feature transformation pipeline that handles messy real-world datasets with missing values.',
        related_assessment_category: 'Full Stack'
      },
      {
        skill_name: 'Model Evaluation',
        aliases: ['model evaluation', 'model validation', 'metrics', 'cross validation', 'model performance'],
        required_level: 'Intermediate',
        importance: 'Quantifies model accuracy, precision/recall trade-offs, confusion matrices, and prevents overfitting.',
        recommended_learning: 'Learn K-fold cross-validation, Precision-Recall curves, ROC-AUC, classification reports, and latency benchmarks.',
        recommended_projects: 'Build a model evaluation dashboard that visualizes confusion matrices and feature importance rankings.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'Git',
        aliases: ['git', 'git & github', 'github', 'experiment tracking', 'dvc'],
        required_level: 'Intermediate',
        importance: 'Enables reproducible experiment tracking, code versioning, and collaborative ML model development.',
        recommended_learning: 'Learn to version code alongside model parameters, dataset schemas, and training logs using Git and DVC.',
        recommended_projects: 'Set up a GitHub repository with reproducible ML experiments and automated validation workflows.',
        related_assessment_category: 'Full Stack'
      }
    ]
  },
  {
    id: 'data-systems-engineer',
    title: 'Data Systems Engineer',
    category: 'Data Engineering',
    short_description: 'Designs enterprise data pipelines, scalable storage warehouses, high-throughput ETL jobs, and dimensional analytical schemas.',
    detailed_overview: 'Data Systems Engineers design and maintain high-volume data architectures. They extract data from transactional databases, transform it with batch and streaming engines, and load it into analytical warehouses for business intelligence.',
    market_demand: 'High (Critical across finance, e-commerce, healthcare, and enterprise analytics)',
    average_salary_range: '$100,000 - $160,000 / ₹11L - ₹30L PA',
    key_responsibilities: [
      'Architect relational and dimensional data schemas (Star and Snowflake schemas) for reporting.',
      'Construct fault-tolerant, automated ETL pipelines that ingest millions of records reliably.',
      'Optimize complex analytical SQL queries, partition keys, and warehouse indexing strategies.',
      'Implement data quality validation, anomaly detection, and schema migration workflows.',
      'Manage cloud-hosted data warehouses (BigQuery, Redshift, Snowflake, PostgreSQL).'
    ],
    required_skills: [
      {
        skill_name: 'SQL',
        aliases: ['sql', 'postgresql', 'mysql', 'analytical sql', 'advanced sql'],
        required_level: 'Advanced',
        importance: 'The fundamental query language for data warehousing, analytical transformations, and relational modeling.',
        recommended_learning: 'Master window functions, recursive Common Table Expressions (CTEs), execution plan analysis (EXPLAIN ANALYZE), and partitioning.',
        recommended_projects: 'Optimize a sluggish analytical query pipeline by rewiring joins and implementing table partitioning.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'Python',
        aliases: ['python', 'python 3', 'py', 'scripting'],
        required_level: 'Intermediate',
        importance: 'Primary scripting language for building ETL connectors, orchestrating workflows, and transforming data.',
        recommended_learning: 'Learn data pipeline libraries (PySpark, Pandas, SQLAlchemy), API pagination ingestion, and logging best practices.',
        recommended_projects: 'Build an automated Python script that pulls third-party REST API records, validates schemas, and inserts into SQL.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'Database Design',
        aliases: ['database design', 'db design', 'rdbms', 'schema design', 'normalization', 'data modeling'],
        required_level: 'Advanced',
        importance: 'Crucial for determining 3NF normalization, foreign key constraints, index design, and data integrity.',
        recommended_learning: 'Study 1NF through 3NF normalization, entity-relationship diagrams (ERDs), primary keys, and ACID isolation levels.',
        recommended_projects: 'Design an enterprise ERD schema for a multi-tenant SaaS application with strict integrity rules.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'Data Modeling',
        aliases: ['data modeling', 'dimensional modeling', 'star schema', 'snowflake schema', 'data mart'],
        required_level: 'Intermediate',
        importance: 'Creates optimal fact and dimension tables for fast business intelligence reporting and OLAP queries.',
        recommended_learning: 'Learn Kimball dimensional modeling methodologies, slowly changing dimensions (SCD Type 1/2), and fact table design.',
        recommended_projects: 'Design a Star-schema data mart for an e-commerce platform tracking daily sales and customer dimensions.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'ETL',
        aliases: ['etl', 'elt', 'data pipelines', 'airflow', 'dbt', 'apache airflow'],
        required_level: 'Intermediate',
        importance: 'The process of extracting data from varied sources, transforming it for consistency, and loading into storage.',
        recommended_learning: 'Understand DAGs (Directed Acyclic Graphs), retry mechanisms, idempotency, data lineage, and dbt models.',
        recommended_projects: 'Build an idempotent ETL pipeline with automated error alerting and data quality checks.',
        related_assessment_category: 'Backend'
      },
      {
        skill_name: 'Data Processing',
        aliases: ['data processing', 'pandas', 'spark', 'pyspark', 'batch processing', 'stream processing'],
        required_level: 'Intermediate',
        importance: 'Transforming and cleaning high-velocity structured and semi-structured datasets efficiently.',
        recommended_learning: 'Learn chunk-based data processing, batch transformation strategies, deduplication, and schema validation.',
        recommended_projects: 'Process a 1-million-row dataset using chunked batch processing with automated validation logs.',
        related_assessment_category: 'Full Stack'
      },
      {
        skill_name: 'Cloud basics',
        aliases: ['cloud basics', 'cloud', 'cloud computing (aws/gcp)', 'aws', 'gcp', 's3', 'bigquery', 'snowflake'],
        required_level: 'Intermediate',
        importance: 'Cloud object storage (S3/GCS) and managed analytical query engines power modern data platforms.',
        recommended_learning: 'Understand cloud data lakes, managed cloud SQL instances, IAM access policies, and serverless compute.',
        recommended_projects: 'Set up an automated pipeline that uploads processed CSV datasets to cloud storage and triggers ingestion.',
        related_assessment_category: 'Cloud'
      }
    ]
  }
];
