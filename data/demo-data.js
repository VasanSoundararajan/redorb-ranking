/**
 * @fileoverview Demo Data Module for Redrob Candidate Ranking System.
 *
 * Provides a realistic job description and a diverse set of 8 candidate
 * profiles for testing and demonstration purposes. Candidates range from
 * strong matches to deliberate edge cases (keyword stuffers, honeypot
 * profiles) to exercise the ranking engine's detection capabilities.
 *
 * @namespace Redrob.DemoData
 */
window.Redrob = window.Redrob || {};

Redrob.DemoData = (function () {
  // ---------------------------------------------------------------------------
  // Job Description
  // ---------------------------------------------------------------------------

  /**
   * Realistic job description for a Senior Full-Stack Engineer role at a
   * fictional mid-stage fintech startup.
   * @type {string}
   */
  const jobDescription = `
## Senior Full-Stack Engineer — Nextera Finance

### About Us
Nextera Finance is a mid-stage fintech startup on a mission to democratize access to intelligent financial planning. Backed by $42M in Series B funding, our platform serves over 200,000 users across North America with AI-driven budgeting, investment tracking, and credit optimization tools. We're a team of 60 passionate engineers, designers, and financial experts building the future of personal finance — and we're growing fast.

### Role Overview
We're looking for a Senior Full-Stack Engineer to join our Core Platform team. You'll own critical features end-to-end, from database schema design through API development to polished, responsive front-end experiences. This is a high-impact role where you'll collaborate closely with product, design, and data science to ship features that directly improve our users' financial lives.

### Responsibilities
- Architect, build, and maintain scalable web applications using React and Node.js across our platform.
- Design and optimize PostgreSQL schemas, queries, and data pipelines to support millions of daily transactions.
- Develop and maintain RESTful and GraphQL APIs that power our web and mobile clients.
- Collaborate with product managers and UX designers to translate requirements into elegant, performant interfaces.
- Lead code reviews, establish best practices, and mentor mid-level and junior engineers on the team.
- Implement comprehensive testing strategies including unit, integration, and end-to-end tests.
- Monitor, profile, and optimize application performance across the full stack, targeting sub-200ms API response times.
- Participate in architecture discussions and contribute to technical roadmap planning for quarterly OKRs.

### Required Skills
- 5–8 years of professional software engineering experience.
- Strong proficiency in React (hooks, context, state management) for building complex SPAs.
- Production experience with Node.js and Express (or similar) for backend API development.
- Working knowledge of TypeScript across both frontend and backend codebases.
- Hands-on experience with PostgreSQL (schema design, indexing, query optimization).
- Practical experience deploying and operating services on AWS (EC2, Lambda, S3, RDS, CloudFront).

### Preferred Skills
- Experience with GraphQL (Apollo Server / Client).
- Containerization and orchestration with Docker and Kubernetes.
- Familiarity with Redis for caching, rate-limiting, or pub/sub workloads.
- Exposure to event-driven architectures (Kafka, SQS/SNS).

### Education
- Bachelor's degree in Computer Science, Software Engineering, or a related field — or equivalent practical experience.

### Culture & Values
Nextera Finance thrives on a fast-paced, collaborative, and innovative culture. We value intellectual curiosity, ownership mentality, and a bias toward action. We ship early, learn fast, and celebrate both wins and well-reasoned experiments that don't pan out. If you're energized by solving hard problems alongside talented teammates in a transparent, low-ego environment — we'd love to hear from you.
`.trim();

  // ---------------------------------------------------------------------------
  // Candidates
  // ---------------------------------------------------------------------------

  /**
   * @typedef {Object} Skill
   * @property {string} name - Skill / technology name.
   * @property {number} years - Years of hands-on experience.
   * @property {string} level - Proficiency: beginner | intermediate | advanced | expert.
   */

  /**
   * @typedef {Object} Experience
   * @property {string} title - Job title.
   * @property {string} company - Employer name.
   * @property {string} domain - Industry / domain.
   * @property {string} start_date - ISO-ish date 'YYYY-MM'.
   * @property {?string} end_date - 'YYYY-MM' or null for current role.
   * @property {string} description - Brief role description.
   * @property {string[]} achievements - Quantified accomplishments.
   */

  /**
   * @typedef {Object} Education
   * @property {string} degree - Degree type (e.g. 'B.S.').
   * @property {string} field - Field of study.
   * @property {string} institution - University / school name.
   * @property {?number} gpa - GPA on a 4.0 scale, or null.
   * @property {number} year - Graduation year.
   */

  /**
   * @typedef {Object} BehavioralSignals
   * @property {number} reliability
   * @property {number} adaptability
   * @property {number} communication
   * @property {number} leadership
   * @property {number} learning_ability
   * @property {number} consistency
   * @property {number} collaboration
   */

  /**
   * @typedef {Object} Candidate
   * @property {string} candidate_id
   * @property {string} name
   * @property {string} title
   * @property {string} summary
   * @property {Skill[]} skills
   * @property {Experience[]} experience
   * @property {Education[]} education
   * @property {string[]} certifications
   * @property {BehavioralSignals} behavioral_signals
   * @property {number} total_experience_years
   */

  /** @type {Candidate[]} */
  const candidates = [
    // ------------------------------------------------------------------
    // C001 — Sarah Chen — Strong Match
    // ------------------------------------------------------------------
    {
      candidate_id: 'C001',
      name: 'Sarah Chen',
      title: 'Senior Full-Stack Engineer',
      summary:
        'Full-stack engineer with 7 years of experience building high-traffic fintech applications. Proficient across the React/Node.js/TypeScript stack with deep PostgreSQL and AWS expertise. Passionate about clean architecture, automated testing, and mentoring junior developers.',
      skills: [
        { name: 'React', years: 5, level: 'expert' },
        { name: 'Node.js', years: 6, level: 'advanced' },
        { name: 'TypeScript', years: 4, level: 'advanced' },
        { name: 'PostgreSQL', years: 5, level: 'advanced' },
        { name: 'AWS', years: 4, level: 'advanced' },
        { name: 'Express', years: 6, level: 'advanced' },
        { name: 'Redis', years: 2, level: 'intermediate' },
        { name: 'Docker', years: 3, level: 'intermediate' },
        { name: 'Jest', years: 4, level: 'advanced' },
        { name: 'Git', years: 7, level: 'expert' }
      ],
      experience: [
        {
          title: 'Senior Full-Stack Engineer',
          company: 'Quantum Pay',
          domain: 'Fintech / Payments',
          start_date: '2021-03',
          end_date: null,
          description:
            'Lead engineer on the merchant payments platform, responsible for transaction processing APIs and the merchant dashboard SPA. Managed a cross-functional squad of 8 engineers.',
          achievements: [
            'Reduced API response time by 40% through query optimization and Redis caching, bringing p95 latency from 320ms to 190ms.',
            'Led team of 8 engineers delivering a real-time transaction monitoring dashboard used by 5,000+ merchants.',
            'Designed and shipped a PCI-compliant tokenization microservice handling 1.2M daily transactions.',
            'Introduced TypeScript across the frontend codebase, reducing production type-related bugs by 62%.'
          ]
        },
        {
          title: 'Full-Stack Developer',
          company: 'Meridian Labs',
          domain: 'Fintech / Wealth Management',
          start_date: '2018-06',
          end_date: '2021-02',
          description:
            'Built and maintained client-facing portfolio management tools and internal risk analytics dashboards using React and Node.js on AWS infrastructure.',
          achievements: [
            'Migrated legacy jQuery dashboard to React, improving load time by 55% and reducing support tickets by 30%.',
            'Implemented automated CI/CD pipeline on AWS CodePipeline, cutting deployment time from 45 minutes to 8 minutes.',
            'Built a real-time portfolio rebalancing engine processing 200K+ daily calculations with sub-second response.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.S.',
          field: 'Computer Science',
          institution: 'University of Washington',
          gpa: 3.7,
          year: 2018
        }
      ],
      certifications: [
        'AWS Certified Solutions Architect – Associate',
        'AWS Certified Developer – Associate'
      ],
      behavioral_signals: {
        reliability: 88,
        adaptability: 82,
        communication: 85,
        leadership: 80,
        learning_ability: 78,
        consistency: 85,
        collaboration: 87
      },
      total_experience_years: 7
    },

    // ------------------------------------------------------------------
    // C002 — Marcus Williams — Strong match, slightly mismatched stack
    // ------------------------------------------------------------------
    {
      candidate_id: 'C002',
      name: 'Marcus Williams',
      title: 'Full-Stack Software Engineer',
      summary:
        'Versatile full-stack engineer with 6 years building scalable web applications. Core expertise in React and Python/Django with strong database and cloud skills. Adept at translating product requirements into reliable, well-tested features.',
      skills: [
        { name: 'React', years: 4, level: 'advanced' },
        { name: 'Python', years: 6, level: 'expert' },
        { name: 'Django', years: 5, level: 'advanced' },
        { name: 'TypeScript', years: 3, level: 'intermediate' },
        { name: 'PostgreSQL', years: 4, level: 'advanced' },
        { name: 'GCP', years: 3, level: 'intermediate' },
        { name: 'Docker', years: 3, level: 'intermediate' },
        { name: 'REST APIs', years: 6, level: 'expert' },
        { name: 'Celery', years: 3, level: 'intermediate' },
        { name: 'Git', years: 6, level: 'advanced' }
      ],
      experience: [
        {
          title: 'Full-Stack Software Engineer',
          company: 'DataStream Inc',
          domain: 'Data Analytics / SaaS',
          start_date: '2022-01',
          end_date: null,
          description:
            'Core contributor to the analytics platform serving 15,000 B2B customers. Owns the reporting module front-end (React/TypeScript) and the data aggregation backend (Python/Django).',
          achievements: [
            'Architected a real-time data visualization module using React and D3.js, adopted by 80% of enterprise clients within 3 months.',
            'Optimized PostgreSQL reporting queries, reducing average dashboard load time from 4.2s to 1.1s.',
            'Built asynchronous export pipeline with Celery and GCS, handling 50K+ daily CSV/PDF exports.'
          ]
        },
        {
          title: 'Software Engineer',
          company: 'Apex Digital',
          domain: 'E-commerce',
          start_date: '2019-08',
          end_date: '2021-12',
          description:
            'Developed and maintained e-commerce platform features including product catalog, checkout flow, and inventory management.',
          achievements: [
            'Rebuilt the checkout flow in React, increasing conversion rate by 12% and reducing cart abandonment by 18%.',
            'Designed a Django REST API layer consumed by web and mobile clients, serving 2M+ requests/day.',
            'Implemented automated integration tests covering 85% of critical user paths.'
          ]
        },
        {
          title: 'Junior Developer',
          company: 'TechBridge Solutions',
          domain: 'Consulting / Enterprise Software',
          start_date: '2019-01',
          end_date: '2019-07',
          description:
            'Contributed to enterprise client projects, primarily building internal tools and dashboards.',
          achievements: [
            'Developed an internal time-tracking tool used by 120 consultants, replacing spreadsheet-based workflows.',
            'Assisted in migrating a legacy PHP application to Django, completing the project 2 weeks ahead of schedule.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.S.',
          field: 'Software Engineering',
          institution: 'Georgia Institute of Technology',
          gpa: 3.5,
          year: 2018
        }
      ],
      certifications: [
        'Google Cloud Professional Cloud Developer'
      ],
      behavioral_signals: {
        reliability: 82,
        adaptability: 78,
        communication: 80,
        leadership: 72,
        learning_ability: 85,
        consistency: 80,
        collaboration: 83
      },
      total_experience_years: 6
    },

    // ------------------------------------------------------------------
    // C003 — Priya Patel — Very Strong Match
    // ------------------------------------------------------------------
    {
      candidate_id: 'C003',
      name: 'Priya Patel',
      title: 'Staff Engineer / Tech Lead',
      summary:
        'Accomplished tech lead with 8 years of full-stack experience spanning fintech, healthtech, and SaaS. Deep expertise in React, Node.js, TypeScript, and cloud-native architectures on AWS. Proven track record leading engineering teams, driving architectural decisions, and shipping products at scale.',
      skills: [
        { name: 'React', years: 6, level: 'expert' },
        { name: 'Node.js', years: 7, level: 'expert' },
        { name: 'TypeScript', years: 5, level: 'expert' },
        { name: 'AWS', years: 6, level: 'expert' },
        { name: 'PostgreSQL', years: 5, level: 'advanced' },
        { name: 'GraphQL', years: 3, level: 'advanced' },
        { name: 'Docker', years: 4, level: 'advanced' },
        { name: 'Kubernetes', years: 3, level: 'intermediate' },
        { name: 'Redis', years: 4, level: 'advanced' },
        { name: 'Kafka', years: 2, level: 'intermediate' },
        { name: 'Terraform', years: 3, level: 'intermediate' },
        { name: 'Git', years: 8, level: 'expert' }
      ],
      experience: [
        {
          title: 'Staff Engineer / Tech Lead',
          company: 'Cloudvault Systems',
          domain: 'Fintech / Banking Infrastructure',
          start_date: '2021-09',
          end_date: null,
          description:
            'Technical lead for the Core Banking API team. Responsible for architecture, technical roadmap, and hands-on development of microservices powering account management, transfers, and compliance workflows.',
          achievements: [
            'Designed a microservices migration strategy that decomposed a monolith into 14 bounded-context services, reducing deployment failures by 73%.',
            'Led a team of 12 engineers across 3 squads, establishing RFC-driven architecture review processes.',
            'Built a GraphQL federation gateway consolidating 8 backend services into a unified API consumed by 3 client applications.',
            'Achieved 99.97% uptime on critical payment processing paths through circuit-breaker patterns and automated failover.',
            'Reduced AWS infrastructure costs by 28% through right-sizing, spot instance adoption, and Kubernetes autoscaling.'
          ]
        },
        {
          title: 'Senior Full-Stack Engineer',
          company: 'Pinnacle Software',
          domain: 'HealthTech / SaaS',
          start_date: '2019-02',
          end_date: '2021-08',
          description:
            'Senior engineer on the patient portal team, building HIPAA-compliant web applications with React, Node.js, and PostgreSQL on AWS.',
          achievements: [
            'Architected a real-time appointment scheduling system handling 30K daily bookings with sub-100ms write latency.',
            'Introduced TypeScript and strict linting across the codebase, reducing runtime errors by 45% in the first quarter.',
            'Mentored 4 junior engineers, with 2 promoted to mid-level within 18 months.'
          ]
        },
        {
          title: 'Software Engineer',
          company: 'Nextera Finance',
          domain: 'Fintech / Personal Finance',
          start_date: '2017-06',
          end_date: '2019-01',
          description:
            'Early engineer at Nextera, contributing to the budgeting tool MVP and initial API infrastructure.',
          achievements: [
            'Built the budgeting dashboard MVP in React that onboarded the first 10,000 users within 6 months of launch.',
            'Developed the initial Node.js/Express API layer with Plaid integration for bank account aggregation.',
            'Implemented PostgreSQL schema design supporting multi-tenant architecture from day one.'
          ]
        }
      ],
      education: [
        {
          degree: 'M.S.',
          field: 'Computer Science',
          institution: 'Stanford University',
          gpa: 3.9,
          year: 2017
        },
        {
          degree: 'B.S.',
          field: 'Computer Science',
          institution: 'University of California, Berkeley',
          gpa: 3.8,
          year: 2015
        }
      ],
      certifications: [
        'AWS Certified Solutions Architect – Professional',
        'Certified Kubernetes Administrator (CKA)',
        'HashiCorp Certified: Terraform Associate'
      ],
      behavioral_signals: {
        reliability: 90,
        adaptability: 85,
        communication: 88,
        leadership: 92,
        learning_ability: 80,
        consistency: 88,
        collaboration: 90
      },
      total_experience_years: 8
    },

    // ------------------------------------------------------------------
    // C004 — James Morrison — Moderate (under-experience, partial stack)
    // ------------------------------------------------------------------
    {
      candidate_id: 'C004',
      name: 'James Morrison',
      title: 'Frontend Developer',
      summary:
        'Frontend-focused developer with 4 years of experience building responsive web applications in React and JavaScript. Comfortable with REST APIs and NoSQL databases. Eager to grow into full-stack and senior responsibilities.',
      skills: [
        { name: 'React', years: 3, level: 'intermediate' },
        { name: 'JavaScript', years: 4, level: 'advanced' },
        { name: 'HTML/CSS', years: 4, level: 'advanced' },
        { name: 'MongoDB', years: 2, level: 'intermediate' },
        { name: 'Node.js', years: 1, level: 'beginner' },
        { name: 'Express', years: 1, level: 'beginner' },
        { name: 'Git', years: 4, level: 'intermediate' },
        { name: 'REST APIs', years: 3, level: 'intermediate' },
        { name: 'Figma', years: 2, level: 'intermediate' }
      ],
      experience: [
        {
          title: 'Frontend Developer',
          company: 'Apex Digital',
          domain: 'Digital Agency',
          start_date: '2022-05',
          end_date: null,
          description:
            'Develop client-facing web applications for agency customers in retail, hospitality, and healthcare verticals.',
          achievements: [
            'Built a responsive e-commerce storefront in React for a mid-size retailer, delivering on time and under budget.',
            'Improved Lighthouse performance scores from 55 to 82 across 3 client projects through code splitting and image optimization.',
            'Collaborated with designers to implement a reusable component library used across 6 client projects.'
          ]
        },
        {
          title: 'Junior Web Developer',
          company: 'TechBridge Solutions',
          domain: 'Consulting',
          start_date: '2021-02',
          end_date: '2022-04',
          description:
            'Contributed to internal tools and client websites using React, vanilla JavaScript, and WordPress.',
          achievements: [
            'Developed an internal project tracker in React, reducing project status update time by 25%.',
            'Converted 4 client WordPress sites to custom React SPAs with headless CMS backends.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.A.',
          field: 'Information Technology',
          institution: 'Arizona State University',
          gpa: 3.2,
          year: 2020
        }
      ],
      certifications: [
        'Meta Front-End Developer Professional Certificate'
      ],
      behavioral_signals: {
        reliability: 75,
        adaptability: 70,
        communication: 72,
        leadership: 55,
        learning_ability: 80,
        consistency: 70,
        collaboration: 75
      },
      total_experience_years: 4
    },

    // ------------------------------------------------------------------
    // C005 — Elena Rodriguez — Moderate (over-experienced, stack mismatch)
    // ------------------------------------------------------------------
    {
      candidate_id: 'C005',
      name: 'Elena Rodriguez',
      title: 'Principal Backend Engineer',
      summary:
        'Seasoned backend engineer with 10 years of experience, primarily in Java and Spring Boot ecosystems. Deep expertise in distributed systems, microservices architecture, and enterprise-scale applications. Recently expanding into React for full-stack capabilities.',
      skills: [
        { name: 'Java', years: 10, level: 'expert' },
        { name: 'Spring Boot', years: 8, level: 'expert' },
        { name: 'PostgreSQL', years: 7, level: 'expert' },
        { name: 'AWS', years: 5, level: 'advanced' },
        { name: 'React', years: 2, level: 'intermediate' },
        { name: 'Docker', years: 4, level: 'advanced' },
        { name: 'Kubernetes', years: 3, level: 'intermediate' },
        { name: 'Kafka', years: 4, level: 'advanced' },
        { name: 'Oracle DB', years: 6, level: 'advanced' },
        { name: 'Git', years: 10, level: 'expert' }
      ],
      experience: [
        {
          title: 'Principal Backend Engineer',
          company: 'Pinnacle Software',
          domain: 'Enterprise SaaS',
          start_date: '2020-04',
          end_date: null,
          description:
            'Technical owner of the billing and subscription management platform serving 2,000+ enterprise clients. Leads architecture decisions for the backend services team.',
          achievements: [
            'Re-architected the billing engine from a monolithic Java application to 6 Spring Boot microservices, improving deployment frequency from monthly to daily.',
            'Designed an event-driven invoicing pipeline using Kafka that processes 500K+ events/day with exactly-once semantics.',
            'Reduced annual infrastructure costs by $180K through JVM tuning, connection pooling, and database query optimization.'
          ]
        },
        {
          title: 'Senior Software Engineer',
          company: 'Meridian Labs',
          domain: 'Financial Services',
          start_date: '2017-01',
          end_date: '2020-03',
          description:
            'Backend engineer on the trade execution and settlement platform, building high-throughput Java services for real-time trade processing.',
          achievements: [
            'Built a trade matching engine in Java capable of processing 10K trades/second with sub-5ms latency.',
            'Implemented comprehensive monitoring and alerting with Prometheus and Grafana, reducing incident detection time by 70%.',
            'Led the Oracle-to-PostgreSQL migration for the settlements database (800M+ records), completing with zero downtime.'
          ]
        },
        {
          title: 'Software Engineer',
          company: 'DataStream Inc',
          domain: 'Data Infrastructure',
          start_date: '2015-06',
          end_date: '2016-12',
          description:
            'Developed data ingestion pipelines and batch processing jobs for enterprise data warehouse solutions.',
          achievements: [
            'Built ETL pipelines processing 2TB of daily data using Java and Apache Spark.',
            'Reduced batch job execution time by 60% through partitioning strategies and parallel processing optimization.'
          ]
        }
      ],
      education: [
        {
          degree: 'M.S.',
          field: 'Computer Science',
          institution: 'University of Texas at Austin',
          gpa: 3.6,
          year: 2015
        },
        {
          degree: 'B.S.',
          field: 'Computer Engineering',
          institution: 'University of Florida',
          gpa: 3.4,
          year: 2013
        }
      ],
      certifications: [
        'AWS Certified Solutions Architect – Associate',
        'Oracle Certified Professional, Java SE 11 Developer',
        'Certified Kubernetes Application Developer (CKAD)'
      ],
      behavioral_signals: {
        reliability: 92,
        adaptability: 65,
        communication: 78,
        leadership: 75,
        learning_ability: 60,
        consistency: 90,
        collaboration: 72
      },
      total_experience_years: 10
    },

    // ------------------------------------------------------------------
    // C006 — Kevin Zhang — Weak (too junior)
    // ------------------------------------------------------------------
    {
      candidate_id: 'C006',
      name: 'Kevin Zhang',
      title: 'Junior Frontend Developer',
      summary:
        'Recent coding bootcamp graduate with 2 years of experience including internships. Focused on React and modern JavaScript. Building foundational skills in full-stack development through personal projects and open-source contributions.',
      skills: [
        { name: 'React', years: 1, level: 'beginner' },
        { name: 'JavaScript', years: 2, level: 'intermediate' },
        { name: 'HTML/CSS', years: 2, level: 'intermediate' },
        { name: 'Node.js', years: 0.5, level: 'beginner' },
        { name: 'MongoDB', years: 0.5, level: 'beginner' },
        { name: 'Git', years: 2, level: 'intermediate' },
        { name: 'Python', years: 1, level: 'beginner' }
      ],
      experience: [
        {
          title: 'Junior Frontend Developer',
          company: 'TechBridge Solutions',
          domain: 'Web Development Agency',
          start_date: '2024-03',
          end_date: null,
          description:
            'Build and maintain client websites and web applications using React and JavaScript under senior developer supervision.',
          achievements: [
            'Completed onboarding and delivered first client feature (contact form with validation) within 2 weeks.',
            'Assisted in building a React component library with 15 reusable UI components.',
            'Participated in daily code reviews, resolving an average of 3 PR feedback items per review cycle.'
          ]
        },
        {
          title: 'Web Development Intern',
          company: 'Apex Digital',
          domain: 'Digital Marketing',
          start_date: '2023-06',
          end_date: '2024-02',
          description:
            'Supported the development team with bug fixes, minor feature implementation, and QA testing on client web projects.',
          achievements: [
            'Fixed 40+ bugs across 5 client projects during the internship period.',
            'Built a simple internal tool for tracking marketing campaign URLs using vanilla JavaScript.',
            'Completed internal training on React fundamentals and earned team certification.'
          ]
        }
      ],
      education: [
        {
          degree: 'Certificate',
          field: 'Full-Stack Web Development',
          institution: 'App Academy',
          gpa: null,
          year: 2023
        },
        {
          degree: 'B.A.',
          field: 'Mathematics',
          institution: 'University of Oregon',
          gpa: 3.1,
          year: 2022
        }
      ],
      certifications: [],
      behavioral_signals: {
        reliability: 65,
        adaptability: 72,
        communication: 68,
        leadership: 40,
        learning_ability: 85,
        consistency: 60,
        collaboration: 70
      },
      total_experience_years: 2
    },

    // ------------------------------------------------------------------
    // C007 — Alex Thompson — KEYWORD STUFFER
    // ------------------------------------------------------------------
    {
      candidate_id: 'C007',
      name: 'Alex Thompson',
      title: 'Synergistic Full-Stack Paradigm Architect',
      summary:
        'Dynamic, results-oriented, synergistic full-stack paradigm architect with expertise in leveraging cutting-edge technologies to drive transformative digital solutions. Proven ability to synthesize cross-functional requirements into scalable, cloud-native, AI-powered, blockchain-ready architectures. Passionate about agile methodologies, DevOps culture, and delivering holistic end-to-end enterprise solutions across the entire technology landscape.',
      skills: [
        { name: 'React', years: 3, level: 'advanced' },
        { name: 'Node.js', years: 3, level: 'advanced' },
        { name: 'TypeScript', years: 2, level: 'advanced' },
        { name: 'PostgreSQL', years: 2, level: 'advanced' },
        { name: 'AWS', years: 2, level: 'advanced' },
        { name: 'GraphQL', years: 1, level: 'advanced' },
        { name: 'Docker', years: 1, level: 'advanced' },
        { name: 'Kubernetes', years: 1, level: 'advanced' },
        { name: 'Redis', years: 1, level: 'advanced' },
        { name: 'Python', years: 2, level: 'advanced' },
        { name: 'Java', years: 2, level: 'advanced' },
        { name: 'Go', years: 1, level: 'advanced' },
        { name: 'Rust', years: 1, level: 'advanced' },
        { name: 'C++', years: 1, level: 'intermediate' },
        { name: 'Vue.js', years: 1, level: 'advanced' },
        { name: 'Angular', years: 1, level: 'advanced' },
        { name: 'Svelte', years: 1, level: 'advanced' },
        { name: 'MongoDB', years: 1, level: 'advanced' },
        { name: 'MySQL', years: 1, level: 'advanced' },
        { name: 'DynamoDB', years: 1, level: 'advanced' },
        { name: 'Cassandra', years: 1, level: 'intermediate' },
        { name: 'Kafka', years: 1, level: 'advanced' },
        { name: 'RabbitMQ', years: 1, level: 'intermediate' },
        { name: 'Terraform', years: 1, level: 'advanced' },
        { name: 'Jenkins', years: 1, level: 'advanced' },
        { name: 'CircleCI', years: 1, level: 'intermediate' },
        { name: 'GitHub Actions', years: 1, level: 'intermediate' },
        { name: 'Blockchain', years: 1, level: 'advanced' },
        { name: 'Machine Learning', years: 1, level: 'intermediate' },
        { name: 'TensorFlow', years: 0.5, level: 'intermediate' },
        { name: 'Solidity', years: 0.5, level: 'beginner' },
        { name: 'Elasticsearch', years: 1, level: 'intermediate' },
        { name: 'Neo4j', years: 0.5, level: 'beginner' },
        { name: 'GCP', years: 1, level: 'intermediate' },
        { name: 'Azure', years: 1, level: 'intermediate' },
        { name: 'Microservices', years: 2, level: 'advanced' },
        { name: 'REST APIs', years: 3, level: 'advanced' }
      ],
      experience: [
        {
          title: 'Full-Stack Developer',
          company: 'Pinnacle Software',
          domain: 'SaaS',
          start_date: '2023-01',
          end_date: null,
          description:
            'Leveraged a diverse technology stack to deliver synergistic digital transformation initiatives across multiple business verticals, driving innovation and operational excellence.',
          achievements: [
            'Contributed to various projects using multiple technologies.',
            'Participated in agile ceremonies and sprint planning sessions.',
            'Collaborated with cross-functional stakeholders to align technology solutions with business objectives.'
          ]
        },
        {
          title: 'Junior Developer',
          company: 'TechBridge Solutions',
          domain: 'Consulting',
          start_date: '2021-06',
          end_date: '2022-12',
          description:
            'Executed end-to-end full-stack development responsibilities across a wide range of transformative client engagements, utilizing cutting-edge frameworks and cloud-native paradigms.',
          achievements: [
            'Worked on client projects involving web development.',
            'Assisted senior developers with code implementation and testing.',
            'Maintained documentation for internal processes and technical workflows.'
          ]
        },
        {
          title: 'Development Intern',
          company: 'Apex Digital',
          domain: 'Digital Agency',
          start_date: '2021-01',
          end_date: '2021-05',
          description:
            'Supported the engineering team in delivering holistic digital solutions, gaining exposure to enterprise-grade technology ecosystems and agile delivery frameworks.',
          achievements: [
            'Completed assigned tasks and learning modules.',
            'Shadowed senior engineers during client meetings.',
            'Participated in team knowledge-sharing sessions.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.S.',
          field: 'Information Systems',
          institution: 'University of Central Florida',
          gpa: 2.9,
          year: 2020
        }
      ],
      certifications: [
        'AWS Cloud Practitioner',
        'Scrum Master Certified (SMC)',
        'Google Analytics Certified'
      ],
      behavioral_signals: {
        reliability: 58,
        adaptability: 62,
        communication: 55,
        leadership: 57,
        learning_ability: 65,
        consistency: 60,
        collaboration: 63
      },
      total_experience_years: 3
    },

    // ------------------------------------------------------------------
    // C008 — Jordan Blake — HONEYPOT CANDIDATE (fabricated profile)
    // ------------------------------------------------------------------
    {
      candidate_id: 'C008',
      name: 'Jordan Blake',
      title: 'VP of Engineering',
      summary:
        'Visionary engineering leader with 6 years of experience delivering world-class fintech platforms. Expert in React, Node.js, TypeScript, PostgreSQL, and AWS. Proven ability to build and scale engineering organizations from the ground up while maintaining hands-on technical excellence.',
      skills: [
        { name: 'React', years: 6, level: 'expert' },
        { name: 'Node.js', years: 6, level: 'expert' },
        { name: 'TypeScript', years: 8, level: 'expert' },  // ⚠ 8 years of TS — impossible timeline
        { name: 'PostgreSQL', years: 6, level: 'expert' },
        { name: 'AWS', years: 6, level: 'expert' },
        { name: 'GraphQL', years: 4, level: 'expert' },
        { name: 'Docker', years: 5, level: 'expert' },
        { name: 'Kubernetes', years: 4, level: 'expert' },
        { name: 'Redis', years: 5, level: 'expert' },
        { name: 'Terraform', years: 4, level: 'expert' },
        { name: 'Kafka', years: 3, level: 'advanced' },
        { name: 'Git', years: 6, level: 'expert' }
      ],
      experience: [
        {
          // ⚠ Overlaps with the next role (2022-03 to 2024-01)
          title: 'VP of Engineering',
          company: 'Quantum Pay',
          domain: 'Fintech / Payments',
          start_date: '2022-06',
          end_date: null,
          description:
            'Elevated from Senior Engineer to VP of Engineering within 18 months. Oversee all engineering operations for the payments platform at this 30-person startup.',
          achievements: [
            'Led a team of 50 engineers across 8 squads to deliver the next-generation payments infrastructure.',  // ⚠ 50 engineers at a 30-person startup
            'Achieved 99.999% uptime across all payment processing services.',
            'Drove a complete platform rewrite from legacy PHP to React/Node.js/TypeScript in 4 months.',  // ⚠ Unrealistic timeline
            'Reduced infrastructure costs by 75% while tripling transaction throughput.'
          ]
        },
        {
          // ⚠ Overlapping dates with the role above (starts 2022-03, VP role starts 2022-06)
          // AND overlapping with the role above until end_date 2024-01
          title: 'Lead Full-Stack Engineer',
          company: 'Cloudvault Systems',
          domain: 'Fintech / Banking',
          start_date: '2021-01',
          end_date: '2024-01',  // ⚠ Overlaps with Quantum Pay VP role (2022-06 onwards)
          description:
            'Led full-stack development for the banking-as-a-service platform, managing architecture and delivery for core banking APIs.',
          achievements: [
            'Architected a zero-downtime deployment pipeline supporting 100+ daily releases.',
            'Built a real-time fraud detection system processing 5M transactions/day with ML-powered scoring.',
            'Mentored 15 engineers and established the company\'s first formal engineering ladder.'
          ]
        },
        {
          // ⚠ Title progression: Junior Developer in 2019, VP of Engineering by 2022 = 3 years
          title: 'Junior Developer',
          company: 'DataStream Inc',
          domain: 'Data Analytics',
          start_date: '2019-03',
          end_date: '2020-12',
          description:
            'Started career as a junior developer building data visualization dashboards and internal tools.',
          achievements: [
            'Built 3 internal dashboards used by the executive team for real-time KPI monitoring.',
            'Received the "Rising Star" award for exceptional performance in first year.',
            'Automated 20+ manual QA processes, saving the team 30 hours per week.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.S.',
          field: 'Computer Science',
          institution: 'MIT',
          gpa: 4.0,
          year: 2019
        }
      ],
      certifications: [
        'AWS Certified Solutions Architect – Professional',
        'AWS Certified DevOps Engineer – Professional',
        'Certified Kubernetes Administrator (CKA)',
        'Google Cloud Professional Cloud Architect',
        'HashiCorp Certified: Terraform Associate'
      ],
      behavioral_signals: {
        reliability: 99,
        adaptability: 98,
        communication: 100,
        leadership: 99,
        learning_ability: 98,
        consistency: 100,
        collaboration: 99
      },
      total_experience_years: 6
    }
  ];

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    jobDescription: jobDescription,
    candidates: candidates
  };
})();
