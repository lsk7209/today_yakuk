import { spawn } from "child_process";

type Source = "pharmacies" | "hff" | "medicines";

type SyncJob = {
  source: Source;
  label: string;
  requiredEnv: string[];
  requiredAnyEnv?: string[];
  args: string[];
};

type Options = {
  dryRun: boolean;
  sources: Set<Source>;
  hffMode: string;
  medicinesMode: string;
};

const ALL_SOURCES: Source[] = ["pharmacies", "hff", "medicines"];

function parseOptions(argv: string[]): Options {
  const options: Options = {
    dryRun: false,
    sources: new Set(ALL_SOURCES),
    hffMode: "all",
    medicinesMode: "all",
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--only=")) {
      options.sources = parseSources(arg.slice("--only=".length));
    } else if (arg.startsWith("--skip=")) {
      for (const source of parseSources(arg.slice("--skip=".length))) {
        options.sources.delete(source);
      }
    } else if (arg.startsWith("--hff-mode=")) {
      options.hffMode = arg.slice("--hff-mode=".length) || "all";
    } else if (arg.startsWith("--medicines-mode=")) {
      options.medicinesMode = arg.slice("--medicines-mode=".length) || "all";
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (options.sources.size === 0) {
    throw new Error("No public-data source selected.");
  }

  return options;
}

function parseSources(value: string): Set<Source> {
  const sources = new Set<Source>();
  for (const rawSource of value.split(",")) {
    const source = rawSource.trim() as Source;
    if (!ALL_SOURCES.includes(source)) {
      throw new Error(`Unknown source: ${rawSource}`);
    }
    sources.add(source);
  }
  return sources;
}

function createJobs(options: Options): SyncJob[] {
  const jobs: SyncJob[] = [];

  if (options.sources.has("pharmacies")) {
    jobs.push({
      source: "pharmacies",
      label: "Emergency pharmacy public data",
      requiredEnv: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "PUBLIC_DATA_API_KEY"],
      args: ["run", "sync"],
    });
  }

  if (options.sources.has("hff")) {
    jobs.push({
      source: "hff",
      label: "Health functional food public data",
      requiredEnv: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "FOOD_SAFETY_API_KEY"],
      args: ["run", "fetch:hff", "--", options.hffMode],
    });
  }

  if (options.sources.has("medicines")) {
    jobs.push({
      source: "medicines",
      label: "Medicine public data",
      requiredEnv: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"],
      requiredAnyEnv: ["MEDICINE_API_KEY", "PUBLIC_DATA_API_KEY"],
      args: ["run", "fetch:meds", "--", options.medicinesMode],
    });
  }

  return jobs;
}

function validateEnv(jobs: SyncJob[]) {
  const missing = new Set<string>();
  for (const job of jobs) {
    for (const key of job.requiredEnv) {
      if (!process.env[key]) missing.add(key);
    }
    if (job.requiredAnyEnv && !job.requiredAnyEnv.some((key) => process.env[key])) {
      missing.add(job.requiredAnyEnv.join(" or "));
    }
  }

  if (missing.size > 0) {
    throw new Error(`Missing required environment variables: ${Array.from(missing).join(", ")}`);
  }
}

function runJob(job: SyncJob): Promise<void> {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const startedAt = Date.now();

  console.info(`\n[public-data-sync] Starting ${job.source}: ${job.label}`);
  console.info(`[public-data-sync] Command: npm ${job.args.join(" ")}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, job.args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      if (code === 0) {
        console.info(`[public-data-sync] Completed ${job.source} in ${seconds}s`);
        resolve();
      } else {
        reject(new Error(`${job.source} sync failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const jobs = createJobs(options);

  console.info(`[public-data-sync] Selected sources: ${jobs.map((job) => job.source).join(", ")}`);

  if (options.dryRun) {
    for (const job of jobs) {
      const envList = [
        ...job.requiredEnv,
        ...(job.requiredAnyEnv ? [`one of: ${job.requiredAnyEnv.join(" or ")}`] : []),
      ];
      console.info(
        `[public-data-sync] dry-run ${job.source}: npm ${job.args.join(" ")}; env=${envList.join(",")}`,
      );
    }
    return;
  }

  validateEnv(jobs);

  for (const job of jobs) {
    await runJob(job);
  }

  console.info("\n[public-data-sync] All selected public-data sync jobs completed.");
}

main().catch((error) => {
  console.error("[public-data-sync] Failed:", error);
  process.exit(1);
});
