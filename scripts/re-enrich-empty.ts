/**
 * Disabled: empty facts must be re-fetched from an authoritative source.
 */

async function run() {
  throw new Error(
    "Disabled: re-enrichment requires explicit Food Safety Korea C003 fields.",
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
