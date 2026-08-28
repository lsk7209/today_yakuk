/**
 * Disabled: product names are not authoritative evidence of nutrition facts.
 *
 * Usage: npx tsx scripts/enrich-from-product-name.ts [batch_size]
 */

async function run() {
  throw new Error(
    "Disabled: product-name-only inference must not write nutrition facts or summaries.",
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
