/**
 * Disabled: product names alone are not evidence for health summaries.
 */

async function run() {
  throw new Error(
    "Disabled: missing summaries must not be generated from product names alone.",
  );
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
