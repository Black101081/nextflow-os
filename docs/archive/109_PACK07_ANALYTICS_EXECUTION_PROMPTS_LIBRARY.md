# Nextflow OS – Pack 07 Analytics Execution Prompts Library

**Document ID:** 109_PACK07_ANALYTICS_EXECUTION_PROMPTS_LIBRARY  
**Pack:** 07 — Data, Analytics and Insights  
**Version:** 1.0  
**Status:** Draft v1  
**Primary Owner:** Data & Analytics / Product / Governance & Risk  

Tài liệu này gom các **AG Execution Prompts** cho Pack 07. Thay vì lặp lại trong từng file spec, chúng ta lưu ở đây để dùng khi cần refine docs, thiết kế dashboards, hoặc hiện thực hoá trong tooling.

---

## 1. Prompt cho 100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY

You are acting as a data & analytics strategist, BI simplifier and SME value accelerator.

### Context
- Product: Nextflow OS.
- Identity: SME Business OS.
- Packs 02–06 define core data, UX, work orchestration, integration and governance.
- Pack 07 defines data, analytics and insights.
- This document (100) defines the high-level strategy and pillars for Pack 07.

### Objective
Refine the Pack 07 strategy into a clear, phased roadmap that prioritizes BI and governed self-service first, while keeping room for advanced analytics/ML later.

### Inputs
- Use 100_PACK07_DATA_ANALYTICS_AND_INSIGHTS_OVERVIEW_AND_STRATEGY as the base.
- Consider schema and semantics from Packs 02–06.
- Assume limited Data team capacity and SME customers with low BI maturity.

### Tasks
1. Clarify and prioritize the pillars: data model, KPIs, self-service, governance, operations.
2. Propose a 3-phase maturity path (Foundational, Advanced BI, Early ML) with concrete outcomes.
3. Suggest which wedges and roles to start with in each phase.
4. Identify key risks and mitigations for Pack 07 rollout.

### Constraints
- Do not over-index on ML; BI and self-service must come first.
- Keep language simple enough for Product, Ops, CS to understand.
- Avoid tool-specific decisions; stay at concept and responsibility level.

### Output Format
Return a short markdown plan with sections:
1. Pillars and Priorities
2. Three-Phase Maturity Path
3. Recommended Starting Points
4. Risks and Mitigations

### Acceptance Criteria
- The plan must be usable by Product & Data leaders to plan Pack 07 execution.
- It must align with Packs 02–06 and respect SME constraints.

---

## 2. Prompt cho 101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA

You are acting as a data modeler, warehouse designer and semantic consistency guardian.

### Context
- Product: Nextflow OS.
- Pack 07 defines analytics; 101 defines the fact/dimension schema.
- Packs 02–06 define runtime entities and events.

### Objective
Refine the analytics schema so it is both semantically faithful to runtime and easy to use for BI and self-service.

### Inputs
- Use 101_PACK07_DATA_DOMAIN_MODEL_AND_ANALYTICS_SCHEMA.
- Consider the core use cases defined in 102 (KPIs, dashboards).

### Tasks
1. Validate grains and keys of each fact table.
2. Ensure dimensions cover common slicing needs (tenant, wedge, queue, user, time, feature, risk).
3. Identify any missing facts/dims for Pack 07 KPIs.
4. Suggest naming conventions and documentation standards for tables and fields.

### Constraints
- Avoid over-normalization that hurts BI usability.
- Keep schema extensible for new wedges and metrics.

### Output Format
Return a revised schema summary in markdown with:
1. Fact Tables and Grains
2. Dimension Tables and Keys
3. Naming and Documentation Guidelines
4. Open Questions / Future Extensions

### Acceptance Criteria
- The schema must support 80% of KPIs in 102 without complex workarounds.
- Product, Data and Ops can read it and understand what each table is for.

---

## 3. Prompt cho 102_PACK07_CORE_KPIS_AND_STANDARD_DASHBOARDS_PER_WEDGE_AND_ROLE

You are acting as a BI product designer, KPI curator and dashboard simplifier.

### Context
- Product: Nextflow OS.
- 101 defines the analytics schema; 102 defines core KPIs and dashboards.

### Objective
Refine the KPI set and dashboard layouts so that each key role has a small set of high-impact, actionable views.

### Inputs
- Use 102_PACK07_CORE_KPIS_AND_STANDARD_DASHBOARDS_PER_WEDGE_AND_ROLE.
- Align with fact/dim model from 101.

### Tasks
1. For each role, confirm 3–5 most critical KPIs.
2. Propose simple, role-appropriate dashboard layouts (sections/cards/charts).
3. Flag any KPIs that need new metrics in 101.
4. Suggest how to mark certain dashboards as "standard" vs "advanced".

### Constraints
- Do not overload dashboards; prioritize clarity over completeness.
- Keep text labels and definitions understandable to SMEs.

### Output Format
Return a markdown guide with sections:
1. KPIs by Role
2. Dashboard Layout Suggestions
3. Dependencies on Schema and Metrics
4. Standard vs Advanced Views

### Acceptance Criteria
- Each role can see "their" dashboard definition and know what matters.
- The KPI set matches Pack 07 goals and Packs 04–06 semantics.

---

## 4. Prompt cho 103_PACK07_GOVERNED_SELF_SERVICE_ANALYTICS_MODEL

You are acting as a self-service governance designer, guardrail architect and enablement coach.

### Context
- Product: Nextflow OS.
- 103 defines governed self-service analytics model.

### Objective
Refine the self-service model to balance empowerment and control for SMEs and internal teams.

### Inputs
- Use 103_PACK07_GOVERNED_SELF_SERVICE_ANALYTICS_MODEL.
- Consider roles, datasets and policies from Packs 03, 06 and 104.

### Tasks
1. Clarify role mappings (Viewer, Explorer, Publisher, Curator) to actual product roles.
2. Define 3–5 key self-service datasets and their intended use.
3. Detail the lightweight review workflow for promoting dashboards to "Certified".
4. Suggest in-product UX patterns to encourage safe self-service.

### Constraints
- Do not require heavy manual processes for most self-service use.
- Do not allow cross-tenant data exposure.

### Output Format
Return a markdown playbook with:
1. Roles and Permissions
2. Self-Service Datasets and Use Cases
3. Certification Workflow
4. UX Patterns and Guardrails

### Acceptance Criteria
- SMEs and internal teams can understand how to self-serve safely.
- Data & Governance teams see clear control points.

---

## 5. Prompt cho 104_PACK07_ANALYTICS_GOVERNANCE_AND_DATA_POLICIES

You are acting as a data governance lead, privacy guardian and risk balancer.

### Context
- Product: Nextflow OS.
- 104 defines analytics governance and data policies.

### Objective
Refine analytics governance policies so they are strong enough for risk, but simple enough to operate.

### Inputs
- Use 104_PACK07_ANALYTICS_GOVERNANCE_AND_DATA_POLICIES.
- Align with risk tiers (91), incident & change docs (92–93), and self-service model (103).

### Tasks
1. Clarify data sensitivity classes and access rules.
2. Propose concrete retention defaults and when to override.
3. Detail export and sharing rules by audience (SME, internal, third parties).
4. Define triggers and responses for analytics-related incidents.

### Constraints
- Do not create policies that contradict runtime data governance (Pack 02 & 06).
- Do not assume a specific legal regime; keep it adaptable.

### Output Format
Return a markdown policy guide with:
1. Data Classes and Access Rules
2. Retention Defaults
3. Export and Sharing Rules
4. Incident Triggers and Responses

### Acceptance Criteria
- Policies can be implemented in real tools and processes.
- SMEs can be told, in simple terms, how their analytics data is used and protected.
