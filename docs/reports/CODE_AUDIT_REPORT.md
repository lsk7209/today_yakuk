# 🕵️‍♂️ Code Audit Report: TodayPharmacy (오늘약국)

**Date**: 2026-01-09
**Reviewer**: Antigravity (AI-First CTO)

---

## 🚨 Critical Findings

### 1. Code Duplication in Distance Calculation
- **Issue**: `distanceKm` (Haversine formula) is implemented twice.
  - `src/lib/data/pharmacies.ts`: `export function distanceKm`
  - `src/components/pharmacy-list-infinite.tsx`: `function haversine`
- **Impact**: Maintenance overhead. A bug fix in one location might be missed in the other.
- **Recommendation**: Refactor `pharmacy-list-infinite.tsx` to import `distanceKm` from `@/lib/data/pharmacies`.

### 2. Logic Redundancy in Scripts vs. App
- **Issue**: Database access logic is duplicated between `src/lib` and `scripts/`.
  - `scripts/generate-pharmacy-content.ts` re-implements `getPharmacyByHpid` and `PROVINCE_MAP` instead of importing from `src/lib/data/pharmacies.ts`.
  - Scripts seem to rely on copying code rather than reusing the established codebase.
- **Impact**: Inconsistent behavior between the application and background scripts. High risk of diverging logic.
- **Recommendation**: Refactor scripts to import core logic from `src/lib`. Ensure `tsconfig.sync.json` properly supports path aliases for these imports.

### 3. Unused or Hidden Functions
- **Issue**: `getAllPharmacyHpids` is defined in `src/lib/data/pharmacies.ts` but appears unused in the active codebase or scripts (which strictly re-implement logic).
- **Recommendation**: Verify if this function is necessary. If used for sitemaps, ensure the sitemap script uses this single source of truth.

---

## ⚠️ Security & Architecture Notes

### 1. Middleware Authentication
- **Current**: Checks for `admin_auth` cookie value `"authenticated"`.
- **Risk**: Low for an MVP, but vulnerable to cookie spoofing if not signed/encrypted.
- **Recommendation**: Move to a signed JWT or session-based token verification when moving to production.

### 2. Project Structure
- Structure is generally clean (`app`, `components`, `lib`).
- **Scripts**: The `scripts` directory is becoming a "shadow codebase" with duplicated logic. It should be treated as a consumer of `src/lib`, not a separate implementation.

---

## 🚀 Action Plan

### Step 1: Immediate Cleanup (Hotfix)
- [ ] Remove `haversine` from `pharmacy-list-infinite.tsx` and use `distanceKm`.
- [ ] Verify `getAllPharmacyHpids` usage and clean up.

### Step 2: Refactoring
- [ ] Refactor `scripts/generate-pharmacy-content.ts` to import `Pharmacy` types and repository functions from `src/lib`.
- [ ] Centralize `PROVINCE_MAP` in a shared constant file.

### Step 3: Security
- [ ] Plan migration to safer auth in Middleware.

---

이 보고서를 바탕으로 즉각적인 수정(Step 1)을 진행하시겠습니까?
