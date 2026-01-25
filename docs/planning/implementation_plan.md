# 🛠️ Implementation Plan: Codebase Cleanup & Refactoring

**Goal**: Eliminate code duplication, standardize logic between App and Scripts, and improve maintainability based on the Code Audit Report.

## User Review Required
> [!NOTE]
> This refactoring will modify how scripts (`scripts/`) access the database. We will rely on `src/lib` functions instead of duplicated code.

## Proposed Changes

### 1. Unified Distance Calculation
**Component**: `src/components` & `src/lib`
- **File**: `src/components/pharmacy-list-infinite.tsx`
  - [MODIFY] Remove local `haversine` function.
  - [MODIFY] Import `distanceKm` from `@/lib/data/pharmacies`.
  - [MODIFY] Update usage sites to match `distanceKm` signature.

### 2. Centralize Shared Constants & Logic
**Component**: `src/lib`
- **File**: `src/lib/data/pharmacies.ts`
  - [MODIFY] Export `PROVINCE_MAP` so it can be used in scripts.
  - [MODIFY] Ensure `getPharmacyByHpid` is robust for script usage.

### 3. Script Refactoring
**Component**: `scripts`
- **File**: `scripts/generate-pharmacy-content.ts`
  - [MODIFY] Remove local `getPharmacyByHpid` and `PROVINCE_MAP`.
  - [MODIFY] Import `getPharmacyByHpid` and `PROVINCE_MAP` from `@/lib/data/pharmacies`.
  - [MODIFY] Ensure imports work with `ts-node` (via `tsconfig-paths`).

## Verification Plan

### Automated Tests
1. **Build Check**: Run `npm run build` to ensure no import errors in Next.js app.
2. **Script Check**: Run `npm run generate:content -- --help` (or a dry-run equivalent if available) or simply check if the script compiles/starts without error. Since these are operational scripts, we will verify they can at least import the modules correctly.

### Manual Verification
1. **Distance**: Check the "Pharmacy List" content to ensure distances still display correctly (if visual verification were possible, otherwise relying on code correctness).
