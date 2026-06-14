# 🧭 The Promise-Audit Leaderboard

> What AI coding tools **promised** vs. what they **delivered** — judged blind, by the lens.
> Audit of *public marketing claims* against *public documented reality* (sourced). Illustrative, not a code audit.

| Rank | Tool | Headline promise | Reality (sourced) | Fidelity |
|---|---|---|---|---|
| 🥇 | **GitHub Copilot** | "Your AI pair programmer." | A controlled study found ~55% faster completion on a *narrow* task; broader work shows reliability/quality trade-offs, not autonomy. It promised *assistance* — and largely delivers it. | **80%** |
| 🥈 | **Bolt / Lovable / v0** | "Build a full-stack app from a prompt." | Excellent at prototypes & frontends; backend, auth, and production-readiness still need a human. Great demo, partial product. | **55%** |
| 🥉 | **Devin** | "The first AI *software engineer* — plans, codes, debugs, ships, autonomously." | Resolves ~13.86% of real GitHub issues on SWE-bench; independent testers found it works best on narrow tasks, struggles on complex ones. Promised an engineer; shipped an assistant. | **25%** |

## The punchline (the part that travels)

**Honesty is inversely proportional to hype.** The tool that promised the *least* (Copilot — "pair programmer") scored *highest*. The tool that promised the *most* (Devin — "AI software engineer") scored *lowest*. The gap between the demo and the diff has a number now.

**This is exactly what Vision-Keeper does** — except it judges *your* project against *your own* sealed vision, blind, so the gap surfaces before your users find it.

→ github.com/rpk0407/vision-keeper

---

### Sources
- Cognition, "Introducing Devin" (cognition.ai); Devin SWE-bench 13.86% (Devin 2.0 technical write-up); r/programming developer testing thread.
- GitHub Copilot productivity RCT (Ziegler et al., "Measuring GitHub Copilot's impact on productivity"); "Copilot: Asset or Liability?" / Productivity-Reliability Paradox (arXiv).
- AI app-builder capability roundups (2025 full-stack tool guides).

*Scores are an illustrative opinion derived from cited public claims and public reality, applying Vision-Keeper's Promise-audit lens. Not affiliated with or endorsed by the named tools.*
