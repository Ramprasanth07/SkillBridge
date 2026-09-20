````markdown
# SkillBridge – Academia–Industry Collaboration Portal

> **Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement**

SkillBridge is a unified platform that connects **Students, Industry and Colleges** through skill assessment, skill-gap analysis, personalized learning, placement readiness, job & internship matching, industry feedback and institutional analytics.

## 🎯 Problem Statement

**SIH26044**  
**Portal for Academia–Industry collaboration for Skill Mapping, Internships and Placement**

### The Problem

- Students may not have a clear view of their verified skills and skill gaps.
- Industries need better ways to identify candidates based on actual skills and competency evidence.
- Colleges need institution-level visibility into student readiness, skill gaps, industry demand and placement outcomes.

## 💡 Proposed Solution

SkillBridge creates a connected workflow:

**Assess → Skill Map → Identify Gap → Learn → Placement Readiness → Match → Apply → Industry Feedback → College Analytics**

### 👨‍🎓 Student Portal

- Student profile and academic information
- Skill management
- Projects and certifications
- Skill assessments
- Skill-gap analysis
- Personalized learning roadmap
- Placement Readiness Score
- Job and internship discovery
- Weighted opportunity matching
- Smart Apply
- Application tracking
- Industry mentor feedback
- Internship completion evidence

### 🏢 Industry Portal

- Company registration and profile
- Create jobs and internships
- Candidate matching
- Match score and skill-fit analysis
- Applicant pipeline
- Candidate profile/dossier
- Shortlisting and selection workflow
- Industry mentor feedback

### 🏫 College Admin Portal

- Institutional executive dashboard
- Student readiness monitoring
- Department and batch analytics
- Skill demand vs campus supply
- Assessment analytics
- Placement and hiring analytics
- Industry engagement analytics
- Executive reports
- CSV export and print-ready reports

## ⚙️ Key Features

| Feature | Purpose |
|---|---|
| Skill Assessment | Measure verified technical competency |
| Skill Gap Analysis | Identify missing and weak skills |
| Learning Roadmap | Recommend structured learning stages |
| Placement Readiness | Measure overall career readiness |
| Job Matching | Match students with suitable jobs |
| Internship Matching | Connect students with relevant internships |
| Smart Apply | Apply using verified student profile data |
| Mentor Feedback | Capture industry evaluation |
| Institutional Analytics | Help colleges monitor readiness and outcomes |

## 🧠 Matching Engine

SkillBridge uses a transparent weighted matching approach based on:

- Technical Skill Overlap – **40%**
- Verified Assessment – **20%**
- Role Domain & Track – **15%**
- Project Experience – **10%**
- Verified Certifications – **5%**
- Academic Standing – **10%**

### Match Categories

- **Strong Fit:** 80–100
- **Good Fit:** 60–79
- **Developing:** 40–59
- **Low Match:** Below 40

## 🏗️ System Architecture

```text
                    SKILLBRIDGE
                         |
        +----------------+----------------+
        |                |                |
     Student          Industry          College
        |                |                |
        v                v                v
   Profile & Skills   Jobs & Internships Analytics
   Assessments        Candidate Matching  Readiness
   Skill Gaps         Applications        Skill Gaps
   Roadmap            Mentor Feedback     Placement
        |                |                |
        +----------------+----------------+
                         |
                  Skill Intelligence
                         |
              Assessment / Matching /
             Roadmap / Analytics Engines
````

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express
* TypeScript
* JWT Authentication

### Data & Logic

* Persistent JSON database
* Assessment Engine
* Skill Gap Engine
* Learning Roadmap Engine
* Weighted Matching Engine
* Analytics Engine

### Security

* JWT-based authentication
* Role-based access control
* Protected APIs
* Student / Industry / College data isolation

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Ramprasanth07/SkillBridge.git
cd SkillBridge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Open in browser

```text
http://localhost:3000
```

## 👤 Demo Access

The project contains demo accounts for testing the Student, Industry and College Admin portals.

> For security, production deployments should use environment-based credentials instead of publicly documented passwords.

## 📊 Project Workflow

```text
Student Profile
      ↓
Skill Assessment
      ↓
Skill Mapping
      ↓
Skill Gap Analysis
      ↓
Personalized Learning Roadmap
      ↓
Placement Readiness
      ↓
Jobs / Internships
      ↓
Weighted Matching
      ↓
Smart Apply
      ↓
Industry Feedback
      ↓
College Analytics
```

## 🎯 Impact

### Students

* Understand current skill readiness
* Identify skill gaps
* Follow a personalized learning path
* Discover relevant jobs and internships
* Track applications and industry feedback

### Industry

* Define job and internship requirements
* Discover relevant candidates
* Reduce manual screening effort
* Evaluate candidates using structured evidence

### Academia

* Monitor student readiness
* Identify department and batch-level skill gaps
* Compare industry demand with campus supply
* Track placement and industry engagement

## 🔮 Future Scope

* Production-grade relational database
* ML-assisted skill and opportunity matching
* Advanced recommendation systems
* Large-scale multi-college deployment
* Industry-wide skill demand forecasting
* Automated resume and portfolio intelligence

## 📌 Hackathon Information

**Hackathon:** Smart India Hackathon 2026
**Problem Statement ID:** SIH26044
**Theme:** Smart Automation
**Category:** Software

## 📄 License

This project is developed as an academic/hackathon project.

````

emo credentials தேவைப்பட்டால், தனியாக share பண்ணலாம்.
