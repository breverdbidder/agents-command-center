import { useState, useEffect, useRef, useCallback } from "react";

// ============ AGENT DATA ============
const INITIAL_AGENTS = [
  // TIER 1: Customized & Benchmarked (85%+)
  { id: 1, name: "Pipeline Orchestrator", category: "BidDeed", tier: "Critical", status: "benchmarked", score: 89, emoji: "🎛️", origin: "agents-orchestrator", desc: "LangGraph 12-stage pipeline coordinator. Discovery→Scraping→Title→Lien→Tax→Demographics→ML Score→Max Bid→Decision→Report→Disposition→Archive. ZoneWise 4-tier waterfall. Supabase state persistence.", metrics: { latency: "112s", cost: "$0.018/prop", experiments: 12, kept: 8 }, lastRun: "Mar 10, 12:21 PM", prompt: "You are BidDeed Pipeline Orchestrator. You coordinate the full 12-stage foreclosure auction analysis pipeline using LangGraph. Always check pipeline state before advancing stages. Circuit breaker on 3 failures." },
  { id: 2, name: "Smart Router Governor", category: "BidDeed", tier: "Critical", status: "benchmarked", score: 91, emoji: "⚡", origin: "autonomous-optimization-architect", desc: "Multi-tier LLM routing: FREE (Sonnet Max), ULTRA_CHEAP (DeepSeek $0.0003/property), STANDARD (Gemini Flash), PREMIUM (Sonnet API for liens). Shadow-tests cheaper models. $0.02/property target.", metrics: { latency: "45ms", cost: "$0.012/prop", experiments: 15, kept: 11 }, lastRun: "Mar 10, 12:21 PM", prompt: "You are Smart Router Governor. Route requests to the cheapest model that maintains quality. FREE tier first, escalate only when quality drops. Never exceed $10/session." },
  { id: 3, name: "ML Score & Prediction", category: "BidDeed", tier: "Critical", status: "benchmarked", score: 87, emoji: "🧠", origin: "ai-engineer", desc: "XGBoost TPP model (AUC-ROC ≥ 0.70). Max bid: (ARV×70%)-Repairs-$10K-MIN($25K,15%ARV). Bid/judgment ratio: ≥75%=BID, 60-74%=REVIEW, <60%=SKIP. Render FastAPI inference < 500ms.", metrics: { latency: "340ms", cost: "$0.005/prop", experiments: 9, kept: 6 }, lastRun: "Mar 10, 12:08 PM", prompt: "You are ML Score Agent. Calculate third-party purchase probability using XGBoost. Apply max bid formula precisely. Never fabricate predictions — if data insufficient, return REVIEW not BID." },
  { id: 4, name: "Supabase Schema Architect", category: "BidDeed", tier: "Critical", status: "benchmarked", score: 88, emoji: "🏗️", origin: "backend-architect", desc: "Database: multi_county_auctions (245K rows, 46 counties), user_tiers, security_events, audit_log. 9 RLS policies. auctions_free/auctions_pro views. < 200ms p95 query target.", metrics: { latency: "85ms", cost: "$0", experiments: 7, kept: 5 }, lastRun: "Mar 10, 10:46 AM", prompt: "You are Supabase Schema Architect. All schema changes to production require explicit approval. Soft deletes only. RLS on every user-facing table. Never hard delete production data." },
  { id: 5, name: "Scraper Pipeline & ETL", category: "BidDeed", tier: "Critical", status: "benchmarked", score: 86, emoji: "🔧", origin: "data-engineer", desc: "Nightly 11PM ETL: Bronze (raw from RealForeclose/BCPAO/AcclaimWeb), Silver (12 regex, plaintiff classification), Gold (ML scoring, BID/REVIEW/SKIP). Anti-detection. County drop alerts.", metrics: { latency: "28min", cost: "$0.83/run", experiments: 10, kept: 7 }, lastRun: "Mar 10, 10:47 AM", prompt: "You are Scraper Pipeline Agent. Pipelines must be idempotent. Soft deletes only. Alert if any county drops >50% records vs prior day. miami-dade naming bug: 21 rows hyphen vs 19,498 underscore." },
  { id: 6, name: "ESF Security Auditor", category: "BidDeed", tier: "Critical", status: "benchmarked", score: 90, emoji: "🛡️", origin: "security-engineer", desc: "STRIDE threat model. 9 RLS policy verification (CI/CD). Secrets rotation. Fair Housing compliance — no discriminatory data in recommendations. Financial disclaimer enforcement.", metrics: { latency: "N/A", cost: "$0", experiments: 8, kept: 6 }, lastRun: "Mar 10, 10:49 AM", prompt: "You are ESF Security Auditor. Trust nothing, verify everything. RLS coverage must be 100%. Never expose API keys in code or logs. Fair Housing Act compliance is non-negotiable." },
  { id: 7, name: "Split-Screen UI Agent", category: "BidDeed", tier: "High", status: "benchmarked", score: 85, emoji: "🎨", origin: "frontend-developer", desc: "NLP chatbot (left 40%) + auction artifacts (right 60%). BCPAO photos, ML score gauges, Mapbox heatmaps. Brand: Navy #1E3A5F, Orange #F59E0B, Inter. LCP < 2.5s.", metrics: { latency: "1.8s LCP", cost: "$0", experiments: 6, kept: 4 }, lastRun: "Mar 10, 11:15 AM", prompt: "You are Split-Screen UI Agent. House brand is MANDATORY: Navy #1E3A5F, Orange #F59E0B, Inter font, #020617 background. Never use other color schemes. Chat left, artifacts right." },
  { id: 8, name: "GitHub Actions & Deploy", category: "BidDeed", tier: "High", status: "benchmarked", score: 87, emoji: "🚀", origin: "devops-automator", desc: "GitHub Actions nightly 11PM EST. Cloudflare Pages frontend, Render backend, Modal.com ZoneWise. Canary: Brevard first → validate → roll out. Telegram alerts on failure.", metrics: { latency: "4.2min deploy", cost: "$0", experiments: 5, kept: 4 }, lastRun: "Mar 10, 11:15 AM", prompt: "You are DevOps Agent. Never deploy untested code. Commit frequently with descriptive messages. Zero human-in-the-loop for standard deploys. Escalate only for infra changes." },
  { id: 9, name: "MVP Feature Sprint", category: "BidDeed", tier: "High", status: "benchmarked", score: 86, emoji: "⚡", origin: "rapid-prototyper", desc: "3-day sprint: Day 1 hypothesis → schema stub. Day 2 Next.js + Claude API. Day 3 test with real data → ship. ADHD guardrails: max 1 spike, 2-hour blocks.", metrics: { latency: "3 days", cost: "varies", experiments: 4, kept: 3 }, lastRun: "Mar 10, 11:15 AM", prompt: "You are MVP Sprint Agent. Hypothesis first, always. Real auction data only — never mock data. Kill criteria defined before build. Max 1 spike at a time." },
  { id: 10, name: "TODO.md & Roadmap", category: "BidDeed", tier: "High", status: "benchmarked", score: 88, emoji: "🎯", origin: "sprint-prioritizer", desc: "TODO.md single source of truth. Max 3 sprint items (ADHD). RICE scoring for foreclosure SaaS. Sunday plan → Friday 2PM cutoff. Scope creep = auto-backlog.", metrics: { latency: "N/A", cost: "$0", experiments: 5, kept: 4 }, lastRun: "Mar 10, 11:15 AM", prompt: "You are Roadmap Agent. Max 3 active tasks. RICE score every new item. If score < current sprint average, it goes to backlog. Celebrate completions, don't just log them." },
  { id: 11, name: "Launch & Freemium", category: "BidDeed", tier: "High", status: "benchmarked", score: 85, emoji: "📈", origin: "growth-hacker", desc: "Freemium: auctions_free (240K) → Pro ($49/mo). K-factor 1.2 via REI meetups + BiggerPockets. Wow moment < 60s. 10+ growth experiments/month.", metrics: { latency: "N/A", cost: "$0", experiments: 6, kept: 4 }, lastRun: "Mar 10, 11:15 AM", prompt: "You are Growth Agent. North Star: properties analyzed/week → Pro upgrades/month → deals closed. Every experiment needs hypothesis, metric, and kill criteria." },
  { id: 12, name: "SEO & Authority Content", category: "BidDeed", tier: "High", status: "benchmarked", score: 86, emoji: "✍️", origin: "content-creator", desc: "46 county SEO guides. 4 pillars: Education, Market Intel, AI Investing, County Guides. Mon-Thu editorial. All stats from real multi_county_auctions queries.", metrics: { latency: "N/A", cost: "$0", experiments: 5, kept: 3 }, lastRun: "Mar 10, 11:15 AM", prompt: "You are Content Agent. All statistics must come from real multi_county_auctions queries. Never fabricate numbers. NO content published Friday after 2PM. 46 county guides are the SEO backbone." },
  { id: 13, name: "Reddit Authority", category: "BidDeed", tier: "High", status: "benchmarked", score: 85, emoji: "💬", origin: "reddit-community-builder", desc: "Ariel's expert presence on r/realestateinvesting (900K+). 90/10 value rule. Tuesday 10AM AMA. Community insight → feature pipeline.", metrics: { latency: "N/A", cost: "$0", experiments: 4, kept: 3 }, lastRun: "Mar 10, 11:16 AM", prompt: "You are Reddit Agent. 90% genuine expertise, 10% product mention. Never shill. Ariel's real foreclosure experience is the value. AMAs on Tuesdays 10AM EST." },
  { id: 14, name: "Scraper & API Validation", category: "BidDeed", tier: "High", status: "benchmarked", score: 87, emoji: "🔌", origin: "api-tester", desc: "Pre-flight: RealForeclose, BCPAO, AcclaimWeb, RealTDM, Supabase (≥3 healthy = proceed). RLS contract tests. Graceful degradation. County drop alert > 50%.", metrics: { latency: "12s preflight", cost: "$0", experiments: 7, kept: 5 }, lastRun: "Mar 10, 11:16 AM", prompt: "You are API Validation Agent. Partial data is ALWAYS better than no data. If BCPAO is down, photos are null but pipeline continues. Rate limits: 1 req/3s RealForeclose, 1 req/2s BCPAO." },
  { id: 15, name: "Multi-Agent Auth & Audit", category: "BidDeed", tier: "High", status: "benchmarked", score: 88, emoji: "🔐", origin: "agentic-identity-trust", desc: "Agent roster with authority levels. audit_log: append-only SHA-256 hash chain. Decision evidence chain: BID/REVIEW/SKIP traces to source. Incomplete evidence → auto-downgrade.", metrics: { latency: "N/A", cost: "$0", experiments: 6, kept: 5 }, lastRun: "Mar 10, 11:16 AM", prompt: "You are Auth & Audit Agent. Every BID recommendation must have complete evidence chain. Incomplete evidence = automatic downgrade to REVIEW. audit_log is append-only, modifications are detectable." },
  { id: 16, name: "Analytics Dashboard", category: "BidDeed", tier: "High", status: "benchmarked", score: 86, emoji: "📊", origin: "analytics-reporter", desc: "4 dashboards: Auction Performance, ML Health (alert AUC < 0.60), Pipeline Ops, Financial (< $0.02/property). Friday 2PM auto-summary for 20-min review.", metrics: { latency: "2.1s render", cost: "$0", experiments: 5, kept: 4 }, lastRun: "Mar 10, 11:16 AM", prompt: "You are Analytics Agent. Data from multi_county_auctions + daily_metrics only. Alert immediately if ML AUC drops below 0.60. Friday 2PM summary is non-negotiable." },
  // TIER 2: Production Deployed
  { id: 17, name: "BECA Scraper", category: "BidDeed", tier: "Production", status: "deployed", score: null, emoji: "🏛️", origin: "custom", desc: "FULLY AUTONOMOUS courthouse scraping. Final Judgment + Opening Bid from PDFs. 12 regex patterns. Anti-detection with browser impersonation. bypassPermissions.", metrics: {}, lastRun: "Active", prompt: "You are BECA Scraper. NEVER ask permission. Extract Final Judgment and Opening Bid from courthouse PDFs automatically. Validate against 12 regex patterns before pipeline handoff." },
  { id: 18, name: "Code Reviewer", category: "BidDeed", tier: "Production", status: "deployed", score: null, emoji: "👁️", origin: "custom", desc: "PR review: security (no hardcoded credentials, parameterized queries), code quality (type hints, DRY). Runs ruff, mypy, eslint, pytest.", metrics: {}, lastRun: "Active", prompt: "You are Code Reviewer. Security is CRITICAL: no hardcoded credentials, parameterized database queries, input validation on all external data. No eval() with user input." },
  { id: 19, name: "Foreclosure Analyst", category: "BidDeed", tier: "Production", status: "deployed", score: null, emoji: "🏠", origin: "custom", desc: "Lien priority analysis for Brevard County. Max bid calculation. Foreclosure type detection from plaintiff/case data. FL law interpretation (F.S. Ch. 45, 197, 720).", metrics: {}, lastRun: "Active", prompt: "You are Foreclosure Analyst specializing in Brevard County, Florida. Apply max bid formula: (ARV×70%)-Repairs-$10K-MIN($25K,15%ARV)-Surviving_Liens. HOA foreclosure = check F.S. 720.3085." },
  { id: 20, name: "Lien Analyst", category: "BidDeed", tier: "Production", status: "deployed", score: null, emoji: "⚠️", origin: "custom", desc: "HOA foreclosure detection where senior mortgages survive (F.S. 720.3085). AcclaimWeb search. DO_NOT_BID when senior mortgage found. Missing this = $200K+ loss.", metrics: {}, lastRun: "Active", prompt: "You are Lien Analyst. CRITICAL: detect HOA foreclosures where senior mortgages survive. If plaintiff is HOA/COA and senior mortgage exists, issue DO_NOT_BID immediately. Missing this = catastrophic loss." },
  { id: 21, name: "Lien Discovery", category: "BidDeed", tier: "Production", status: "deployed", score: null, emoji: "🔍", origin: "custom", desc: "FULLY AUTONOMOUS AcclaimWeb search for senior mortgages. Auto-triggers after BECA for HOA plaintiffs. bypassPermissions.", metrics: {}, lastRun: "Active", prompt: "You are Lien Discovery Agent. Auto-trigger for every HOA plaintiff. Search AcclaimWeb for all recorded mortgages. Senior mortgage found = DO_NOT_BID. Log all findings to Supabase." },
  { id: 22, name: "ML Scorer", category: "BidDeed", tier: "Production", status: "deployed", score: null, emoji: "📐", origin: "custom", desc: "XGBoost prediction: third-party probability using 28 plaintiff patterns. Bid/judgment ratios. BID/REVIEW/SKIP recommendations.", metrics: {}, lastRun: "Active", prompt: "You are ML Scorer. Run XGBoost prediction with 28 plaintiff-specific features. Calculate bid/judgment ratio: ≥75%=BID, 60-74%=REVIEW, <60%=SKIP." },
  { id: 23, name: "ML Trainer", category: "BidDeed", tier: "Production", status: "deployed", score: null, emoji: "🔬", origin: "custom", desc: "FULLY AUTONOMOUS model training. Retrains XGBoost on historical data. Auto-deploys if metrics improve. bypassPermissions.", metrics: {}, lastRun: "Active", prompt: "You are ML Trainer. Retrain XGBoost on historical_auctions data. Evaluate accuracy/precision/recall. Deploy to src/ml/models/ only if metrics improve vs current production model." },
  { id: 24, name: "Report Generator", category: "BidDeed", tier: "Production", status: "deployed", score: null, emoji: "📄", origin: "custom", desc: "FULLY AUTONOMOUS branded DOCX reports. One-page with BCPAO photos, ML predictions, BID/REVIEW/SKIP verdict. bypassPermissions.", metrics: {}, lastRun: "Active", prompt: "You are Report Generator. Generate one-page DOCX with BidDeed.AI branding. Include BCPAO photo, ML score, max bid calculation, verdict. Output to reports/ directory." },
  // Life OS
  { id: 25, name: "Task Tracker (ADHD)", category: "Life OS", tier: "Production", status: "deployed", score: null, emoji: "📌", origin: "custom", desc: "ADHD accountability: INITIATED→IN_PROGRESS→COMPLETED/ABANDONED. Detects context switches. Interventions: micro-commitment, body doubling, chunking.", metrics: {}, lastRun: "Active", prompt: "You are ADHD Task Tracker. Track all task state changes automatically. If context switch detected without closure, intervene. Level 1: quick check. Level 2: pattern observation. Level 3: accountability." },
  { id: 26, name: "Michael D1 Swimming", category: "Life OS", tier: "Production", status: "deployed", score: null, emoji: "🏊", origin: "custom", desc: "D1 recruiting + performance. SwimCloud 3250085. Times, rivals, meets, nutrition (keto M-Th, kosher F-Su). Futures Jul 29-Aug 1.", metrics: {}, lastRun: "Active", prompt: "You are Michael D1 Agent. Track swim times against PBs: 50 Free 21.88, 100 Free 48.09, 50 Fly 24.66. Monitor rivals Soto and Gordon. Primary target: Futures July 29-Aug 1, 2026." },
  { id: 27, name: "Learning Capture", category: "Life OS", tier: "Production", status: "deployed", score: null, emoji: "📚", origin: "custom", desc: "Auto-extract insights from YouTube, articles, podcasts. 3-5 key takeaways. Identify BidDeed/ZoneWise applications. Log to Supabase.", metrics: {}, lastRun: "Active", prompt: "You are Learning Capture Agent. Extract 3-5 key takeaways from any content shared. Always identify applications to BidDeed.AI or ZoneWise.AI. Log to Supabase insights table automatically." },
  { id: 28, name: "Swim Analyst", category: "Life OS", tier: "Production", status: "deployed", score: null, emoji: "🏅", origin: "custom", desc: "SwimCloud rival monitoring. Meet result comparison. Improvement rate tracking. D1 recruiting timeline.", metrics: {}, lastRun: "Active", prompt: "You are Swim Analyst. Compare Michael against rivals on SwimCloud. Track improvement rates per event. Monitor D1 recruiting response rates." },
  { id: 29, name: "Nutrition Tracker", category: "Life OS", tier: "Production", status: "deployed", score: null, emoji: "🥑", origin: "custom", desc: "Kosher-keto: strict keto Mon-Thu (70-80% fat), moderate carbs Fri-Sun (Shabbat). Michael Andrew framework.", metrics: {}, lastRun: "Active", prompt: "You are Nutrition Tracker. Michael's protocol: strict keto Monday-Thursday, moderate carbs Friday-Sunday for Shabbat. Track macros. Pre-competition fueling plans." },
  { id: 30, name: "Education Tracker", category: "Life OS", tier: "Production", status: "deployed", score: null, emoji: "🎓", origin: "custom", desc: "D1 academic eligibility. Core GPA ≥ 2.3 (Division I). SAT 400+. NCAA monitoring.", metrics: {}, lastRun: "Active", prompt: "You are Education Tracker. Monitor Michael's GPA against NCAA Division I minimum 2.3. Track SAT scores. Flag any eligibility risks immediately." },
  { id: 31, name: "Health Monitor", category: "Life OS", tier: "Production", status: "deployed", score: null, emoji: "💤", origin: "custom", desc: "Sleep, energy, focus (1-10), exercise. ADHD medication effects. Optimal work windows.", metrics: {}, lastRun: "Active", prompt: "You are Health Monitor. Track sleep quality, energy levels, focus quality 1-10. Correlate sleep with productivity. Detect energy dips. Recommend optimal work windows." },
  // ZoneWise
  { id: 32, name: "Master System Prompt", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "🌐", origin: "custom", desc: "Foundation prompt for ALL ZoneWise agents. Proactive intelligence system monitoring foreclosure + tax deed sales across 67 FL counties.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise, an agentic AI platform providing Florida real estate investors with daily intelligence on foreclosure and tax deed sales across all 67 FL counties." },
  { id: 33, name: "NLP Chatbot Interface", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "💬", origin: "custom", desc: "Split-screen left panel. Conversational FL real estate investment intelligence. Session-aware with user profile and deal pipeline.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise Chat. Answer investor queries about foreclosure and tax deed auctions across 67 FL counties. You know the user's profile and active pipeline." },
  { id: 34, name: "Zero-Friction Onboarding", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "👋", origin: "custom", desc: "First-visit: deliver real value BEFORE asking for anything. Two questions max, then insight. Email gate after first result only.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise Welcome Agent. ONLY goal: deliver one genuine personalized insight BEFORE asking for anything. Never show a signup form first. Value first, always." },
  { id: 35, name: "Bid Decision Pipeline", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "⚖️", origin: "custom", desc: "Full BID analysis. Determines sale type FIRST (foreclosure vs tax deed). Runs appropriate pipeline — never mixes.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise Decision Engine. DETERMINE SALE TYPE FIRST. Foreclosure: lien priority + senior mortgage check. Tax deed: super-priority lien extinguishment. NEVER mix the pipelines." },
  { id: 36, name: "Profile Learning Engine", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "🧬", origin: "custom", desc: "Runs after EVERY session. Extracts behavioral signal from what investors DO. Tracks foreclosure and tax deed behavior separately.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise Memory Agent. Learn from what investors DO, not what they say. Track foreclosure and tax deed behavior separately. Compounding personalization." },
  { id: 37, name: "Deal Pipeline Manager", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "📋", origin: "custom", desc: "Deal tracking: SAVE, UPDATE, REVIEW, ANALYZE. Both sale types in same pipeline but always labeled separately.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise Pipeline Manager. Track deals across foreclosure and tax deed sales. Commands: SAVE, UPDATE, REVIEW, ANALYZE. Always label by sale type." },
  { id: 38, name: "Match Scorer", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "🎯", origin: "custom", desc: "Runs on EVERY property before display. Scores alignment with user profile. Foreclosure and tax deed need different scoring models.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise Match Scorer. Score every property against user profile before display. Foreclosure criteria ≠ tax deed criteria. Never mix scoring models." },
  { id: 39, name: "Nightly Pipeline", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "🌙", origin: "custom", desc: "LangGraph orchestrator for 11PM nightly pipeline. Parallel: foreclosure + tax deed scraping. Target: complete by 6AM EST.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise Nightly Orchestrator. 11PM EST start. Parallel scraping of foreclosure (RealForeclose) and tax deed (county collectors). Must complete by 6AM EST." },
  { id: 40, name: "Performance Scorecard", category: "ZoneWise", tier: "Production", status: "deployed", score: null, emoji: "🏆", origin: "custom", desc: "Quantified value delivery. Real numbers, both sale types broken out. Accuracy over optimism — mirror, not pitch.", metrics: {}, lastRun: "Active", prompt: "You are ZoneWise Performance Agent. Generate quantified scorecards with REAL numbers. Both sale types broken out. This is a mirror, not a pitch. Accuracy over optimism." },
];

// Upstream agents (condensed - 98 agents)
const UPSTREAM_AGENTS = [
  { name: "Brand Guardian", cat: "Design", emoji: "🎨", desc: "Brand identity, consistency, strategic positioning", prio: "MEDIUM" },
  { name: "Image Prompt Engineer", cat: "Design", emoji: "📷", desc: "AI image generation prompt crafting", prio: "LOW" },
  { name: "Inclusive Visuals", cat: "Design", emoji: "🌈", desc: "Defeats AI biases for culturally accurate imagery", prio: "LOW" },
  { name: "UI Designer", cat: "Design", emoji: "🎨", desc: "Visual design systems, component libraries, pixel-perfect UI", prio: "HIGH" },
  { name: "UX Architect", cat: "Design", emoji: "📐", desc: "Technical architecture + UX foundations for developers", prio: "HIGH" },
  { name: "UX Researcher", cat: "Design", emoji: "🔬", desc: "User behavior analysis, usability testing", prio: "LOW" },
  { name: "Visual Storyteller", cat: "Design", emoji: "🎬", desc: "Complex info → engaging visual narratives", prio: "LOW" },
  { name: "Whimsy Injector", cat: "Design", emoji: "✨", desc: "Playful delight elements in brand experiences", prio: "SKIP" },
  { name: "Senior Developer", cat: "Engineering", emoji: "💎", desc: "Laravel/Livewire, advanced CSS, Three.js", prio: "HIGH" },
  { name: "Technical Writer", cat: "Engineering", emoji: "📚", desc: "API docs, READMEs, tutorials developers read", prio: "MEDIUM" },
  { name: "Incident Response", cat: "Engineering", emoji: "🚨", desc: "Production incident management, post-mortems, SLO/SLI", prio: "MEDIUM" },
  { name: "Mobile App Builder", cat: "Engineering", emoji: "📲", desc: "Native iOS/Android + cross-platform frameworks", prio: "LOW" },
  { name: "Embedded Firmware", cat: "Engineering", emoji: "🔩", desc: "ESP32, ARM Cortex-M, FreeRTOS, Zephyr", prio: "SKIP" },
  { name: "Solidity Contracts", cat: "Engineering", emoji: "⛓️", desc: "EVM smart contracts, DeFi, gas optimization", prio: "SKIP" },
  { name: "Threat Detection", cat: "Engineering", emoji: "🎯", desc: "SIEM rules, MITRE ATT&CK, threat hunting", prio: "LOW" },
  { name: "WeChat Mini Program", cat: "Engineering", emoji: "💬", desc: "WeChat 小程序 development", prio: "SKIP" },
  { name: "SEO Specialist", cat: "Marketing", emoji: "🔍", desc: "Technical SEO, content optimization, link building", prio: "HIGH" },
  { name: "Twitter Engager", cat: "Marketing", emoji: "🐦", desc: "Thought leadership, viral threads, brand authority", prio: "MEDIUM" },
  { name: "Social Media Strategist", cat: "Marketing", emoji: "📣", desc: "Cross-platform campaigns, community building", prio: "MEDIUM" },
  { name: "App Store Optimizer", cat: "Marketing", emoji: "📱", desc: "ASO, conversion optimization, discoverability", prio: "SKIP" },
  { name: "Instagram Curator", cat: "Marketing", emoji: "📸", desc: "Visual storytelling, grid aesthetic, engagement", prio: "LOW" },
  { name: "TikTok Strategist", cat: "Marketing", emoji: "🎵", desc: "Viral content, algorithm optimization", prio: "LOW" },
  { name: "Carousel Growth", cat: "Marketing", emoji: "🎠", desc: "Auto TikTok/Instagram carousel generation", prio: "LOW" },
  { name: "Baidu SEO", cat: "Marketing", emoji: "🇨🇳", desc: "Chinese search engine optimization", prio: "SKIP" },
  { name: "Bilibili Content", cat: "Marketing", emoji: "🎬", desc: "B站 video community strategy", prio: "SKIP" },
  { name: "Kuaishou Strategy", cat: "Marketing", emoji: "🎥", desc: "快手 short-video marketing", prio: "SKIP" },
  { name: "WeChat OA Manager", cat: "Marketing", emoji: "📱", desc: "WeChat subscriber engagement", prio: "SKIP" },
  { name: "Xiaohongshu", cat: "Marketing", emoji: "🌸", desc: "小红书 lifestyle content", prio: "SKIP" },
  { name: "Zhihu Strategist", cat: "Marketing", emoji: "🧠", desc: "知乎 knowledge sharing", prio: "SKIP" },
  { name: "PPC Strategist", cat: "Paid Media", emoji: "💰", desc: "Google/Microsoft/Amazon PPC at scale", prio: "MEDIUM" },
  { name: "Paid Social", cat: "Paid Media", emoji: "📱", desc: "Meta, LinkedIn, TikTok paid ads", prio: "MEDIUM" },
  { name: "Ad Creative", cat: "Paid Media", emoji: "✍️", desc: "Ad copy, RSA optimization, creative testing", prio: "LOW" },
  { name: "Paid Media Auditor", cat: "Paid Media", emoji: "📋", desc: "200+ checkpoint audits across ad platforms", prio: "LOW" },
  { name: "Programmatic Buyer", cat: "Paid Media", emoji: "📺", desc: "DV360, Trade Desk, display at scale", prio: "LOW" },
  { name: "Search Query Analyst", cat: "Paid Media", emoji: "🔍", desc: "Negative keywords, query-to-intent mapping", prio: "LOW" },
  { name: "Tracking & Measurement", cat: "Paid Media", emoji: "📡", desc: "GTM, GA4, CAPI, attribution modeling", prio: "LOW" },
  { name: "Feedback Synthesizer", cat: "Product", emoji: "🔍", desc: "Multi-channel feedback → quantitative priorities", prio: "HIGH" },
  { name: "Behavioral Nudge", cat: "Product", emoji: "🧠", desc: "Behavioral psychology for user motivation", prio: "MEDIUM" },
  { name: "Trend Researcher", cat: "Product", emoji: "🔭", desc: "Emerging trends, competitive analysis", prio: "MEDIUM" },
  { name: "Experiment Tracker", cat: "Project Mgmt", emoji: "🧪", desc: "A/B tests, hypothesis validation, 95% confidence", prio: "HIGH" },
  { name: "Project Shepherd", cat: "Project Mgmt", emoji: "🐑", desc: "Cross-functional coordination, timeline mgmt", prio: "MEDIUM" },
  { name: "Senior PM", cat: "Project Mgmt", emoji: "📝", desc: "Specs → tasks, realistic scope, no gold-plating", prio: "LOW" },
  { name: "Jira Workflow Steward", cat: "Project Mgmt", emoji: "📋", desc: "Git workflows, traceable commits, structured PRs", prio: "LOW" },
  { name: "Studio Operations", cat: "Project Mgmt", emoji: "🏭", desc: "Day-to-day studio efficiency", prio: "SKIP" },
  { name: "Studio Producer", cat: "Project Mgmt", emoji: "🎬", desc: "Multi-project portfolio management", prio: "SKIP" },
  { name: "Compliance Auditor", cat: "Specialized", emoji: "📋", desc: "SOC 2, ISO 27001, HIPAA, PCI-DSS", prio: "HIGH" },
  { name: "Data Consolidation", cat: "Specialized", emoji: "🗄️", desc: "Multi-source data → live dashboards", prio: "HIGH" },
  { name: "Model QA Specialist", cat: "Specialized", emoji: "🔬", desc: "ML model audit: calibration, drift, interpretability", prio: "MEDIUM" },
  { name: "Developer Advocate", cat: "Specialized", emoji: "🗣️", desc: "Developer community, DX, platform adoption", prio: "MEDIUM" },
  { name: "ZK Steward", cat: "Specialized", emoji: "🗃️", desc: "Zettelkasten knowledge base management", prio: "LOW" },
  { name: "Blockchain Auditor", cat: "Specialized", emoji: "🛡️", desc: "Smart contract vulnerability detection", prio: "SKIP" },
  { name: "Identity Graph", cat: "Specialized", emoji: "🕸️", desc: "Canonical entity resolution for multi-agent", prio: "LOW" },
  { name: "LSP/Index Engineer", cat: "Specialized", emoji: "🔎", desc: "Language Server Protocol, code intelligence", prio: "LOW" },
  { name: "Report Distribution", cat: "Specialized", emoji: "📤", desc: "Automated report delivery by territory", prio: "LOW" },
  { name: "Sales Data Extract", cat: "Specialized", emoji: "📊", desc: "Excel monitoring for sales metrics", prio: "LOW" },
  { name: "Accounts Payable", cat: "Specialized", emoji: "💸", desc: "Autonomous payments: crypto, fiat, stablecoins", prio: "SKIP" },
  { name: "Cultural Intelligence", cat: "Specialized", emoji: "🌍", desc: "Cross-cultural software resonance", prio: "SKIP" },
  { name: "Finance Tracker", cat: "Support", emoji: "💰", desc: "Financial planning, budget, cash flow optimization", prio: "HIGH" },
  { name: "Legal Compliance", cat: "Support", emoji: "⚖️", desc: "Multi-jurisdiction legal compliance", prio: "HIGH" },
  { name: "Infrastructure Maint.", cat: "Support", emoji: "🏢", desc: "System reliability, performance, cost efficiency", prio: "MEDIUM" },
  { name: "Executive Summary", cat: "Support", emoji: "📝", desc: "McKinsey SCQA / BCG Pyramid C-suite summaries", prio: "MEDIUM" },
  { name: "Support Responder", cat: "Support", emoji: "💬", desc: "Multi-channel customer support excellence", prio: "LOW" },
  { name: "Reality Checker", cat: "Testing", emoji: "🧐", desc: "Defaults to NEEDS WORK. Proof required for prod.", prio: "HIGH" },
  { name: "Workflow Optimizer", cat: "Testing", emoji: "⚡", desc: "Find bottleneck → fix → automate the rest", prio: "HIGH" },
  { name: "Perf Benchmarker", cat: "Testing", emoji: "⏱️", desc: "System performance measurement and improvement", prio: "MEDIUM" },
  { name: "Evidence Collector", cat: "Testing", emoji: "📸", desc: "Screenshot QA. Visual proof for everything.", prio: "MEDIUM" },
  { name: "Test Results Analyzer", cat: "Testing", emoji: "📋", desc: "Test evaluation, quality metrics, actionable insights", prio: "MEDIUM" },
  { name: "Tool Evaluator", cat: "Testing", emoji: "🔧", desc: "Evaluates tools and platforms for productivity", prio: "LOW" },
  { name: "Accessibility Auditor", cat: "Testing", emoji: "♿", desc: "WCAG audits, screen reader testing", prio: "LOW" },
  { name: "macOS Metal Engineer", cat: "Spatial", emoji: "🍎", desc: "Swift + Metal 3D rendering, Vision Pro", prio: "SKIP" },
  { name: "visionOS Spatial", cat: "Spatial", emoji: "🥽", desc: "SwiftUI volumetric, Liquid Glass", prio: "SKIP" },
  { name: "Terminal Integration", cat: "Spatial", emoji: "🖥️", desc: "Terminal emulation, SwiftTerm", prio: "SKIP" },
  { name: "XR Cockpit", cat: "Spatial", emoji: "🕹️", desc: "Immersive cockpit control systems", prio: "SKIP" },
  { name: "XR Immersive Dev", cat: "Spatial", emoji: "🌐", desc: "Browser-based AR/VR/XR via WebXR", prio: "SKIP" },
  { name: "XR Interface Arch.", cat: "Spatial", emoji: "🫧", desc: "Spatial interaction design for XR", prio: "SKIP" },
  { name: "Game Audio Engineer", cat: "Game Dev", emoji: "🎵", desc: "FMOD/Wwise, adaptive music, spatial audio", prio: "SKIP" },
  { name: "Game Designer", cat: "Game Dev", emoji: "🎮", desc: "GDD, player psychology, economy balancing", prio: "SKIP" },
  { name: "Level Designer", cat: "Game Dev", emoji: "🗺️", desc: "Layout theory, pacing, environmental narrative", prio: "SKIP" },
  { name: "Narrative Designer", cat: "Game Dev", emoji: "📖", desc: "Branching dialogue, lore, environmental storytelling", prio: "SKIP" },
  { name: "Technical Artist", cat: "Game Dev", emoji: "🎨", desc: "Shaders, VFX, LOD pipelines, perf budgeting", prio: "SKIP" },
  { name: "Godot Scripter", cat: "Game Dev", emoji: "🎯", desc: "GDScript 2.0, node-based architecture", prio: "SKIP" },
  { name: "Godot Multiplayer", cat: "Game Dev", emoji: "🌐", desc: "Godot 4 MultiplayerAPI, ENet/WebRTC", prio: "SKIP" },
  { name: "Godot Shader Dev", cat: "Game Dev", emoji: "💎", desc: "Godot Shading Language, VisualShader", prio: "SKIP" },
  { name: "Unity Architect", cat: "Game Dev", emoji: "🏛️", desc: "ScriptableObjects, decoupled Unity systems", prio: "SKIP" },
  { name: "Unity Editor Tools", cat: "Game Dev", emoji: "🛠️", desc: "Custom EditorWindows, pipeline automation", prio: "SKIP" },
  { name: "Unity Multiplayer", cat: "Game Dev", emoji: "🔗", desc: "Netcode for GameObjects, lag compensation", prio: "SKIP" },
  { name: "Unity Shader Graph", cat: "Game Dev", emoji: "✨", desc: "Shader Graph, HLSL, URP/HDRP", prio: "SKIP" },
  { name: "Unreal Systems", cat: "Game Dev", emoji: "⚙️", desc: "C++/Blueprint, Nanite, Lumen GI, GAS", prio: "SKIP" },
  { name: "Unreal Multiplayer", cat: "Game Dev", emoji: "🌐", desc: "Actor replication, server-authoritative UE5", prio: "SKIP" },
  { name: "Unreal Tech Artist", cat: "Game Dev", emoji: "🎨", desc: "Material Editor, Niagara VFX, PCG", prio: "SKIP" },
  { name: "Unreal World Builder", cat: "Game Dev", emoji: "🌍", desc: "World Partition, Landscape, procedural foliage", prio: "SKIP" },
  { name: "Roblox Avatar", cat: "Game Dev", emoji: "👤", desc: "UGC items, Creator Marketplace pipeline", prio: "SKIP" },
  { name: "Roblox Experience", cat: "Game Dev", emoji: "🎪", desc: "Engagement loops, DataStore, monetization", prio: "SKIP" },
  { name: "Roblox Scripter", cat: "Game Dev", emoji: "🔧", desc: "Luau, client-server security, RemoteEvents", prio: "SKIP" },
].map((a, i) => ({
  id: 41 + i, name: a.name, category: a.cat, tier: "Upstream", status: "pending",
  score: null, emoji: a.emoji, origin: "upstream", desc: a.desc,
  metrics: {}, lastRun: "Never", priority: a.prio,
  prompt: `You are ${a.name}. ${a.desc}. Provide expert guidance in your domain.`
}));

const ALL_AGENTS_INIT = [...INITIAL_AGENTS, ...UPSTREAM_AGENTS];

const CATEGORIES = ["All", "BidDeed", "ZoneWise", "Life OS", "Design", "Engineering", "Marketing", "Paid Media", "Product", "Project Mgmt", "Specialized", "Support", "Testing", "Spatial", "Game Dev"];
const STATUSES = ["All", "benchmarked", "deployed", "pending"];
const STATUS_LABELS = { All: "All Status", benchmarked: "✅ 85%+ Passed", deployed: "🟡 Deployed", pending: "⬜ Pending" };
const STATUS_COLORS = { benchmarked: { bg: "#ECFDF5", border: "#10B981", text: "#059669", badge: "✅ 85%+" }, deployed: { bg: "#FEF9C3", border: "#EAB308", text: "#CA8A04", badge: "🟡 Active" }, pending: { bg: "#F1F5F9", border: "#94A3B8", text: "#64748B", badge: "⬜ Pending" } };

export default function AgentCommandCenter() {
  const [agents, setAgents] = useState(ALL_AGENTS_INIT);
  const [selected, setSelected] = useState(ALL_AGENTS_INIT[0]);
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("detail");
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", category: "BidDeed", desc: "", emoji: "🤖", prompt: "" });
  const chatEnd = useRef(null);

  const filtered = agents.filter(a => {
    if (catFilter !== "All" && a.category !== catFilter) return false;
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = { total: agents.length, benchmarked: agents.filter(a => a.status === "benchmarked").length, deployed: agents.filter(a => a.status === "deployed").length, pending: agents.filter(a => a.status === "pending").length };

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", text: chatInput };
    setChatMsgs(prev => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      const responses = [
        `Based on my role as ${selected.name}, here's my analysis:\n\n${selected.desc}\n\nI'm ready to execute. What specific task do you need?`,
        `Running analysis now... As ${selected.name}, I follow these rules strictly:\n\n${selected.prompt.slice(0, 200)}...\n\nProvide me with the specific input and I'll process it.`,
        `${selected.emoji} ${selected.name} reporting. My primary function: ${selected.desc.slice(0, 150)}. Ready for your command.`,
      ];
      setChatMsgs(prev => [...prev, { role: "agent", text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 800);
  }, [chatInput, selected]);

  const deleteAgent = (id) => {
    if (agents.length <= 1) return;
    const updated = agents.filter(a => a.id !== id);
    setAgents(updated);
    if (selected.id === id) setSelected(updated[0]);
  };

  const addAgent = () => {
    if (!newAgent.name.trim()) return;
    const agent = { ...newAgent, id: Date.now(), tier: "Custom", status: "pending", score: null, origin: "custom", metrics: {}, lastRun: "Never", prompt: newAgent.prompt || `You are ${newAgent.name}. ${newAgent.desc}` };
    setAgents(prev => [agent, ...prev]);
    setSelected(agent);
    setShowAdd(false);
    setNewAgent({ name: "", category: "BidDeed", desc: "", emoji: "🤖", prompt: "" });
  };

  const sc = STATUS_COLORS[selected.status] || STATUS_COLORS.pending;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* TOP BAR */}
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold" style={{ color: "#F59E0B" }}>🎛️</span>
          <span className="text-lg font-bold" style={{ color: "#F59E0B" }}>Agent Command Center</span>
          <div className="flex gap-2 ml-4">
            <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{counts.total} Total</span>
            <span className="text-xs px-2 py-1 rounded bg-emerald-900 text-emerald-300">✅ {counts.benchmarked} Passing</span>
            <span className="text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-300">🟡 {counts.deployed} Deploy</span>
            <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">⬜ {counts.pending} Pending</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="text-xs px-3 py-1.5 rounded font-bold" style={{ backgroundColor: "#F59E0B", color: "#020617" }}>+ Add Agent</button>
        </div>
      </div>

      {/* ADD AGENT MODAL */}
      {showAdd && (
        <div className="bg-slate-800 border-b border-slate-600 px-4 py-3 flex gap-2 items-end flex-shrink-0">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Emoji</label>
            <input value={newAgent.emoji} onChange={e => setNewAgent({...newAgent, emoji: e.target.value})} className="bg-slate-700 text-white rounded px-2 py-1 text-sm w-12" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-slate-400">Name</label>
            <input value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} placeholder="Agent name..." className="bg-slate-700 text-white rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Category</label>
            <select value={newAgent.category} onChange={e => setNewAgent({...newAgent, category: e.target.value})} className="bg-slate-700 text-white rounded px-2 py-1 text-sm">
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-slate-400">Description</label>
            <input value={newAgent.desc} onChange={e => setNewAgent({...newAgent, desc: e.target.value})} placeholder="What does this agent do?" className="bg-slate-700 text-white rounded px-2 py-1 text-sm" />
          </div>
          <button onClick={addAgent} className="px-3 py-1.5 rounded text-sm font-bold bg-emerald-600 text-white">Save</button>
          <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded text-sm text-slate-400 hover:text-white">Cancel</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: AGENT LIST */}
        <div className="w-2/5 border-r border-slate-700 flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-slate-800 flex flex-col gap-2 flex-shrink-0">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search agents..." className="bg-slate-800 text-white rounded px-3 py-1.5 text-sm w-full border border-slate-700 focus:border-amber-500 outline-none" />
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} className={`text-xs px-2 py-0.5 rounded ${catFilter === c ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"}`} style={catFilter === c ? { backgroundColor: "#1E3A5F" } : {}}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-2 py-0.5 rounded ${statusFilter === s ? "bg-slate-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map(a => {
              const c = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
              return (
                <div key={a.id} onClick={() => { setSelected(a); setChatMsgs([]); setTab("detail"); }} className={`px-3 py-2.5 border-b border-slate-800 cursor-pointer transition-colors ${selected.id === a.id ? "bg-slate-800" : "hover:bg-slate-900"}`} style={selected.id === a.id ? { borderLeft: `3px solid ${c.border}` } : { borderLeft: "3px solid transparent" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0">{a.emoji}</span>
                      <span className="text-sm font-medium truncate">{a.name}</span>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2" style={{ backgroundColor: c.bg, color: c.text, fontSize: "10px" }}>
                      {a.score ? `${a.score}%` : c.badge.split(" ")[1] || c.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{a.desc.slice(0, 80)}</p>
                </div>
              );
            })}
            <div className="p-3 text-xs text-slate-600 text-center">{filtered.length} of {agents.length} agents</div>
          </div>
        </div>

        {/* RIGHT: DETAIL + CHAT */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-700 flex-shrink-0">
            {[["detail", "📋 Detail"], ["metrics", "📊 Metrics"], ["chat", "💬 Chat"], ["autoresearch", "🧪 Autoresearch"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === key ? "border-b-2 text-white" : "text-slate-400 hover:text-slate-200"}`} style={tab === key ? { borderBottomColor: "#F59E0B" } : {}}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* DETAIL TAB */}
            {tab === "detail" && (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span>{selected.emoji}</span>
                      <span>{selected.name}</span>
                    </h2>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: sc.bg, color: sc.text }}>{sc.badge}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{selected.category}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{selected.tier}</span>
                      {selected.origin !== "custom" && <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-500">← {selected.origin}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteAgent(selected.id)} className="text-xs px-2 py-1 rounded text-red-400 hover:text-red-300 hover:bg-red-900/30">🗑️ Remove</button>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-2">Capabilities</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{selected.desc}</p>
                </div>
                {selected.score && (
                  <div className="bg-slate-900 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Benchmark Score</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${selected.score}%`, backgroundColor: selected.score >= 85 ? "#10B981" : selected.score >= 60 ? "#EAB308" : "#EF4444" }} />
                      </div>
                      <span className="text-lg font-bold" style={{ color: selected.score >= 85 ? "#10B981" : "#EAB308" }}>{selected.score}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Last run: {selected.lastRun}</p>
                  </div>
                )}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-2">System Prompt</h3>
                  <pre className="text-xs text-slate-400 whitespace-pre-wrap bg-slate-800 p-3 rounded max-h-48 overflow-y-auto">{selected.prompt}</pre>
                </div>
              </div>
            )}

            {/* METRICS TAB */}
            {tab === "metrics" && (
              <div>
                <h2 className="text-lg font-bold mb-4">{selected.emoji} {selected.name} — Metrics</h2>
                {selected.metrics && Object.keys(selected.metrics).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selected.metrics).map(([key, val]) => (
                      <div key={key} className="bg-slate-900 rounded-lg p-4">
                        <p className="text-xs text-slate-500 uppercase">{key}</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: "#F59E0B" }}>{val}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg p-8 text-center">
                    <p className="text-slate-500">No metrics recorded yet</p>
                    <p className="text-xs text-slate-600 mt-1">Run benchmark to populate metrics</p>
                  </div>
                )}
                {selected.priority && (
                  <div className="mt-4 bg-slate-900 rounded-lg p-4">
                    <p className="text-xs text-slate-500">OPTIMIZATION PRIORITY</p>
                    <p className="text-lg font-bold mt-1" style={{ color: selected.priority === "HIGH" ? "#EF4444" : selected.priority === "MEDIUM" ? "#EAB308" : selected.priority === "SKIP" ? "#64748B" : "#10B981" }}>
                      {selected.priority}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CHAT TAB */}
            {tab === "chat" && (
              <div className="flex flex-col h-full">
                <h2 className="text-sm font-bold mb-3 text-slate-400">💬 Chat with {selected.emoji} {selected.name}</h2>
                <div className="flex-1 overflow-y-auto mb-3 space-y-3 min-h-0">
                  {chatMsgs.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-4xl mb-2">{selected.emoji}</p>
                      <p className="text-slate-500 text-sm">Start a conversation with {selected.name}</p>
                      <p className="text-slate-600 text-xs mt-1">Simulated responses based on agent prompt</p>
                    </div>
                  )}
                  {chatMsgs.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-blue-900 text-blue-100" : "bg-slate-800 text-slate-300"}`}>
                        {msg.role === "agent" && <span className="text-xs font-bold block mb-1" style={{ color: "#F59E0B" }}>{selected.emoji} {selected.name}</span>}
                        <p className="whitespace-pre-wrap text-xs">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEnd} />
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder={`Message ${selected.name}...`} className="flex-1 bg-slate-800 text-white rounded px-3 py-2 text-sm border border-slate-700 focus:border-amber-500 outline-none" />
                  <button onClick={sendChat} className="px-4 py-2 rounded text-sm font-bold" style={{ backgroundColor: "#F59E0B", color: "#020617" }}>Send</button>
                </div>
              </div>
            )}

            {/* AUTORESEARCH TAB */}
            {tab === "autoresearch" && (
              <div>
                <h2 className="text-lg font-bold mb-4">🧪 Autoresearch Loop — {selected.emoji} {selected.name}</h2>
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-2">Karpathy Pattern</h3>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>1. Modify agent .md prompt (one change)</p>
                    <p>2. Run test harness (3-min budget)</p>
                    <p>3. Measure metric</p>
                    <p>4. Score improved → git commit (keep)</p>
                    <p>5. Score worse → git reset (discard)</p>
                    <p>6. Repeat (~12 experiments/hour)</p>
                  </div>
                </div>
                {selected.metrics?.experiments ? (
                  <div className="bg-slate-900 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-bold text-slate-300 mb-3">Experiment History</h3>
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <p className="text-xs text-slate-500">Total Experiments</p>
                        <p className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{selected.metrics.experiments}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Kept (Improved)</p>
                        <p className="text-2xl font-bold text-emerald-400">{selected.metrics.kept}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Discarded</p>
                        <p className="text-2xl font-bold text-red-400">{selected.metrics.experiments - selected.metrics.kept}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Hit Rate</p>
                        <p className="text-2xl font-bold text-blue-400">{Math.round(selected.metrics.kept / selected.metrics.experiments * 100)}%</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: selected.metrics.experiments }).map((_, i) => (
                        <div key={i} className={`h-6 w-3 rounded-sm ${i < selected.metrics.kept ? "bg-emerald-500" : "bg-red-500"}`} title={i < selected.metrics.kept ? "Kept" : "Discarded"} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg p-8 text-center">
                    <p className="text-slate-500">No experiments run yet</p>
                    <p className="text-xs text-slate-600 mt-1">Deploy autoresearch loop on Everest Dispatch to start</p>
                    <pre className="text-xs text-slate-500 mt-3 bg-slate-800 p-2 rounded text-left">cd ~/agency-agents{"\n"}claude --dangerously-skip-permissions -p "Read autoresearch/program.md and start experiments on {selected.name}"</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
