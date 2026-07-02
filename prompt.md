# Mother Resume JSON — Update Prompt (for Cursor)

Paste this into Cursor pointed at your `Meysam-Soheilipour_Resume.json` (cv.allseen.com source file). Apply as targeted diffs against the existing structure, not a full rewrite.

---

## 1. `header` — add links

```json
"header": {
  "_dynamic": false,
  "name": "Meysam Soheilipour",
  "address": "US Citizen, Based in Mexico City (Remote)",
  "email": "Soheil_dot@yahoo.com",
  "phone": "(971) 267-9430",
  "links": {
    "linkedin": "https://linkedin.com/in/meysamsoheili/",
    "website": "https://tripways.com",
    "portfolio": "https://cv.allseen.com"
  }
}
```

## 2. `professionalExperience[0]` (Trip Ways) — fold in GTTD + UGC video win

Replace the `description.value` string with the version below. Adds: a bullet on Google Things To Do (GTTD) partner status + compliance pass + agentic curation at scale (high-level only — no internal architecture names), and a bullet on the UGC video campaign ROAS win. Everything else preserved.

```json
"description": {
  "_dynamic": true,
  "value": "Founded in 2018 as ChinaWayz.com and later consolidated under the Trip Ways brand; resumed full-time leadership after Red Ventures with P&L ownership for scaling the marketplace globally, including market research and partnership strategy to expand reach and supply.\n\nEstablished the organizational infrastructure for product, growth, engineering, and vendor operations from the ground up—aligning stakeholders across a distributed team of 20 and 900 vendor companies serving 15,000 bookable products and 5,000 travelers.\n\nScaled a two-sided marketplace by owning product and growth execution end-to-end: catalog quality, traveler access to authentic affordable experiences, and transaction efficiency—measured by sustained supply growth and operational reliability.\n\nDirected development of a high-performance cloud WordPress platform for multi-vendor travel commerce, integrating real-time booking, automated inventory lifecycles, and agentic AI workflows that reduced manual publishing overhead and accelerated time-to-market for new tours.\n\nLed a large-scale replatform and content migration while preserving marketplace continuity; improved discoverability and technical SEO/AEO foundations for long-term scale.\n\nImproved activation and conversion as measured by funnel lift, by shipping website personalization and AI-powered semantic search and recommendations across live inventory.\n\nSecured and maintained Google Things To Do (GTTD) partner status by passing Google's data-quality and compliance review, building an agentic AI curation pipeline that vetted and structured thousands of tours across 900+ global vendor partners for accuracy, policy compliance, and search eligibility.\n\nGrew partnership revenue channels as measured by affiliate and OTA performance, by managing global programs with Viator, TourRadar, Travelzoo, and aligning stakeholders on tracking, deals, and channel mix across organic and paid.\n\nDelivered an estimated 8x return on ad spend on Meta with a self-produced UGC video campaign—writing, filming, and editing destination content in Khao Sok, Phuket, and Bali—demonstrating that low-cost, founder-led creative could outperform traditional paid media production.\n\nDirected cross-functional execution across internal teams and vendor partners in 70 countries; hired and scaled distributed support for 24/7 coverage with clear operating cadences and accountability."
}
```

## 3. Consolidate early-career roles into one block

**Remove** these three entries entirely:
- `Lam Research (Oregon, USA)` — QA / Testing Technician
- `Nilgasht Travel Agency (Tehran, Iran)` — Digital Marketing Manager / CRM Project Manager
- `Hamrah Ltd, (London, UK)` — Jr. Digital Marketer / SEO Specialist / Copywriter

**Replace** with one consolidated entry (also fixes the duplicate-date-range error between Lam Research and Nilgasht):

```json
{
  "company": "Early Career — QA, Digital Marketing & SEO",
  "_dynamic_company": false,
  "title": "QA Technician, Digital Marketing Manager & SEO Specialist",
  "_dynamic_title": false,
  "dateRange": "04/2013 – 09/2016",
  "_dynamic_dateRange": false,
  "description": {
    "_dynamic": true,
    "value": "Built foundational cross-functional experience spanning quality assurance, digital marketing operations, and technical SEO across three roles before moving into e-commerce leadership.\n\nAt Lam Research (Oregon, USA), executed hardware/software QA test plans for semiconductor manufacturing equipment, reducing defect escape risk and supporting on-time customer launches.\n\nAt Nilgasht Travel Agency (Tehran, Iran), increased online bookings 40% and customer engagement 25% by leading integrated SEO, SEM, social, and email campaigns and implementing CRM automation.\n\nAt Hamrah Ltd (London, UK), delivered an average ~60% organic ranking improvement for B2B and B2C clients through technical SEO audits, keyword strategy, and paid/organic campaign management."
  }
}
```

Place as the **last** entry in `professionalExperience`, after Setare E-Commerce.

## 4. Remove `certifications` key entirely

Delete the whole `certifications` object from the JSON. All three entries are dated 2017 and add no value at Director/VP seniority — a resume with no certifications section is completely normal at this level.

## 5. Merge `coreCompetencies` + `technicalProficiency` into one `skills` key

These two sections currently overlap (e.g., "AEO & LLM visibility" appears in both) and split what should be a single scan. **Delete both `coreCompetencies` and `technicalProficiency` keys** and **replace with one `skills` key**:

```json
"skills": {
  "_dynamic": true,
  "footnote": {
    "_dynamic": true,
    "value": "AI-assisted development & code review (Cursor / LLM workflows)."
  },
  "categories": [
    {
      "category": "Growth & GTM Leadership",
      "items": [
        "Executive ownership: P&L discipline, stakeholder alignment, cross-functional leadership",
        "Full-stack SEO & Answer Engine Optimization (AEO)",
        "Data-driven GTM, PLG & DTC growth strategy",
        "ABM, demand generation & lifecycle marketing",
        "Partnerships, affiliates & creator ecosystem management",
        "Attribution, incrementality testing & A/B testing",
        "Messaging, positioning & content architecture",
        "Product & platform delivery: marketplaces, technical roadmaps, cloud scale"
      ]
    },
    {
      "category": "AI & Agentic Automation",
      "items": [
        "Agentic workflows & multi-step AI orchestration (Python, n8n, LLMs)",
        "Content ingestibility & LLM visibility: structured data, entity clarity, crawl-friendly markup",
        "LLM apps (Vertex AI, AWS Bedrock, NVIDIA NeMo)",
        "Vector search (Pinecone, Qdrant)"
      ]
    },
    {
      "category": "Technical & Web Engineering",
      "items": [
        "Python, SQL, PHP, MySQL",
        "WordPress (custom plugins, hooks/filters, admin)",
        "REST APIs & webhooks",
        "HTML / CSS / JavaScript",
        "AWS (S3, SES, Lightsail, CloudFront)",
        "Core Web Vitals & crawl efficiency (CDN, caching)",
        "Git (branching, PRs, deploy workflow)"
      ]
    },
    {
      "category": "Analytics & Experimentation",
      "items": [
        "GA4, Google Tag Manager, Search Console",
        "Google BigQuery, Amazon Redshift",
        "Looker & Tableau (interactive dashboards)",
        "Incrementality testing & A/B testing",
        "Attribution modeling (multi-touch)",
        "Cohort analysis & demand forecasting"
      ]
    },
    {
      "category": "GTM Tools & Platforms",
      "items": [
        "Google Ads, Facebook Ads, Local Services Ads (LSAs)",
        "LinkedIn Campaign Manager & Sales Navigator",
        "Salesforce & Pardot (B2B automation)",
        "SEMrush (advanced SEO/AEO execution)",
        "n8n, Airtable, Asana, Zapier, HubSpot"
      ]
    }
  ]
}
```

## 6. Reorder top-level JSON keys

Best-practice ordering for a Director/VP-level resume: lead with the narrative proof (experience), then reinforce with the skills/keyword section — not the other way around, since at this seniority a reviewer wants to see scope and impact before a keyword list. ATS parsers don't care about order (they index the whole document), so this only affects the human read.

Final key order:

```
titleBar
header
summary
professionalExperience
skills
education
```

(`certifications` is removed per #4.)

---

### Net effect
- One unified `skills` section, no repeated concepts, 5 clean categories instead of 2 overlapping ones.
- No certifications section.
- Header has clickable links (LinkedIn, Tripways.com, cv.allseen.com).
- `professionalExperience` goes from 6 entries to 4: Trip Ways (now carrying GTTD partnership + UGC ROAS proof points), Red Ventures, Setare E-Commerce, Early Career (consolidated).
- Section order: Summary → Experience → Skills → Education.
