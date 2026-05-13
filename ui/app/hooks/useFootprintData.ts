import { useDql } from "@dynatrace-sdk/react-hooks";

export type TechEntry = {
  name: string;
  count: number;
  category: "runtime" | "cloud";
};

// ─── Value extraction helpers ───────────────────────────────────────

function toNum(val: unknown): number | null {
  if (typeof val === "number") return val;
  if (typeof val === "bigint") return Number(val);
  if (typeof val === "string") {
    const n = Number(val);
    return isNaN(n) ? null : n;
  }
  return null;
}

function extractSingleValue(
  data: { records: Record<string, unknown>[] | null } | undefined
): number | null {
  if (!data?.records?.length) return null;
  const rec = data.records[0];
  for (const v of Object.values(rec)) {
    const n = toNum(v);
    if (n !== null) return n;
  }
  return null;
}

function extractRows(
  data: { records: Record<string, unknown>[] | null } | undefined
): Record<string, unknown>[] {
  return data?.records ?? [];
}

// ─── Combined entity counts (single query via append) ───────────────

const ENTITY_COUNT_QUERY = `fetch dt.entity.host | summarize {cnt = count()} | fieldsAdd type = "host"
| append [fetch dt.entity.process_group_instance | summarize {cnt = count()} | fieldsAdd type = "process"]
| append [fetch dt.entity.cloud_application_instance | summarize {cnt = count()} | fieldsAdd type = "pod"]
| append [fetch dt.entity.kubernetes_cluster | summarize {cnt = count()} | fieldsAdd type = "k8s_cluster"]
| append [fetch dt.entity.kubernetes_node | summarize {cnt = count()} | fieldsAdd type = "k8s_node"]
| append [fetch dt.entity.cloud_application | summarize {cnt = count()} | fieldsAdd type = "k8s_workload"]
| append [fetch dt.entity.cloud_application_namespace | summarize {cnt = count()} | fieldsAdd type = "k8s_namespace"]
| append [fetch dt.entity.service | summarize {cnt = count()} | fieldsAdd type = "service"]
| append [fetch dt.entity.application | summarize {cnt = count()} | fieldsAdd type = "web_app"]
| append [fetch dt.entity.mobile_application | summarize {cnt = count()} | fieldsAdd type = "mobile_app"]
| append [fetch dt.entity.relational_database_service | summarize {cnt = count()} | fieldsAdd type = "database"]
| append [fetch dt.entity.queue | summarize {cnt = count()} | fieldsAdd type = "queue"]
| append [fetch dt.entity.synthetic_test | summarize {cnt = count()} | fieldsAdd type = "synthetic_test"]
| append [fetch dt.entity.http_check | summarize {cnt = count()} | fieldsAdd type = "http_check"]
| append [fetch dt.entity.aws_credentials | summarize {cnt = count()} | fieldsAdd type = "aws_cred"]
| append [fetch dt.entity.azure_credentials | summarize {cnt = count()} | fieldsAdd type = "azure_cred"]
| append [fetch dt.entity.aws_lambda_function | summarize {cnt = count()} | fieldsAdd type = "lambda"]
| append [fetch dt.entity.custom_device | summarize {cnt = count()} | fieldsAdd type = "custom_device"]
| append [fetch dt.entity.custom_device_group | summarize {cnt = count()} | fieldsAdd type = "custom_device_group"]`;

function useEntityCounts() {
  const { data, error, isLoading } = useDql({
    query: ENTITY_COUNT_QUERY,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 5000,
  });

  const counts: Record<string, number | null> = {};
  if (data?.records) {
    for (const rec of data.records) {
      const t = String(rec.type ?? "");
      const c = toNum(rec.cnt);
      if (t) counts[t] = c;
    }
  }

  const get = (type: string) => ({
    value: counts[type] ?? null,
    isLoading,
    error,
  });

  return { get, counts, isLoading, error };
}

// ─── Enrichment queries (kept separate — each has unique logic) ─────

function useVmwareCount() {
  const { data, error, isLoading } = useDql({
    query: `fetch dt.entity.host
| fieldsAdd hypervisorType
| filter isNotNull(hypervisorType)
| filter hypervisorType == "VMWARE"
| summarize count()`,
    defaultScanLimitGbytes: -1,
  });
  return { value: extractSingleValue(data), error, isLoading };
}

function useTechBreakdown() {
  // Count actual custom_device instances per group name (not group entities)
  const { data, error, isLoading } = useDql({
    query: `fetch dt.entity.custom_device
| fieldsAdd belongs_to = belongs_to[dt.entity.custom_device_group]
| expand belongs_to
| lookup [
  fetch dt.entity.custom_device_group
  | fieldsAdd entity.name
  | fields id, entity.name
], sourceField:belongs_to, lookupField:id, prefix:"grp."
| summarize {cnt = count()}, by: {grp.entity.name}
| sort cnt desc
| limit 60`,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 5000,
  });
  return { rows: extractRows(data), error, isLoading };
}

function useServiceTechTypes() {
  const { data, error, isLoading } = useDql({
    query: `fetch dt.entity.service
| fieldsAdd technologyType
| filter isNotNull(technologyType)
| summarize {cnt = count()}, by: {technologyType}
| sort cnt desc
| limit 30`,
    defaultScanLimitGbytes: -1,
  });
  return { rows: extractRows(data), error, isLoading };
}

function useSmartscapeFanout() {
  const { data, error, isLoading } = useDql({
    query: `fetch dt.entity.service
| limit 1000
| fieldsAdd svc_calls = arraySize(calls[dt.entity.service])
| summarize {avg_fanout = avg(svc_calls), sample = count()}`,
    defaultScanLimitGbytes: -1,
  });
  const rec = data?.records?.[0];
  const avgFanout = toNum(rec?.avg_fanout) ?? 0;
  return { avgFanout, error, isLoading };
}

function useTraceVolume() {
  const { data, error, isLoading } = useDql({
    query: `fetch spans, from:now()-5m | summarize count()`,
    defaultScanLimitGbytes: -1,
  });
  const fiveMinCount = extractSingleValue(data);
  const daily = fiveMinCount !== null ? fiveMinCount * 288 : null;
  return { value: daily, error, isLoading };
}

// ─── Log Volume ─────────────────────────────────────────────────────

function useLogIngest() {
  // Use day-aligned timeframe to get yesterday's COMPLETE value (not today's partial)
  const { data, error, isLoading } = useDql({
    query: `timeseries daily = sum(dt.sfm.storage.ingest.received_bytes), from:now()-2d@d, to:now()@d, interval:1d
| fieldsAdd yesterday = arrayLast(daily)`,
    defaultScanLimitGbytes: -1,
  });
  const rec = data?.records?.[0];
  const bytes = toNum(rec?.yesterday);
  const tb = bytes !== null ? bytes / 1_099_511_627_776 : null;
  return { valueTB: tb, error, isLoading };
}

function useLogRetention() {
  const { data, error, isLoading } = useDql({
    query: `fetch dt.system.buckets
| filter dt.system.table == "logs"
| summarize sum(estimated_uncompressed_bytes)`,
    defaultScanLimitGbytes: -1,
  });
  const bytes = extractSingleValue(data);
  const pb = bytes !== null ? bytes / 1_125_899_906_842_624 : null;
  const tb = bytes !== null ? bytes / 1_099_511_627_776 : null;
  return { valuePB: pb, valueTB: tb, error, isLoading };
}

// ─── MTTR ───────────────────────────────────────────────────────────

function useMttr() {
  // 7d timeseries at 6h buckets; displayed value is mean-of-non-zero-bucket-means.
  const { data, error, isLoading } = useDql({
    query: `fetch dt.davis.problems, from:now()-7d
| filter event.kind == "DAVIS_PROBLEM" and dt.davis.is_duplicate == false
| filter event.status == "CLOSED"
| filter isNotNull(resolved_problem_duration)
| makeTimeseries {MTTR = avg(toDouble(resolved_problem_duration) / 60000000000.0), problem_count = count()}, interval:6h`,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 10000,
  });
  const rec = data?.records?.[0];

  const series: number[] = [];
  if (rec?.MTTR && Array.isArray(rec.MTTR)) {
    for (const v of rec.MTTR) series.push(toNum(v) ?? 0);
  }
  const nonZero = series.filter((v) => v > 0);
  const medianMttr =
    nonZero.length > 0
      ? nonZero.reduce((s, n) => s + n, 0) / nonZero.length
      : null;

  let problemCount = 0;
  if (rec?.problem_count && Array.isArray(rec.problem_count)) {
    for (const v of rec.problem_count) problemCount += toNum(v) ?? 0;
  }

  const qualifies =
    medianMttr !== null && medianMttr <= 120 && problemCount >= 10;
  return { medianMttr, problemCount, series, qualifies, error, isLoading };
}

function useMttrPreviousWeek() {
  // True mean across all qualifying problems in the 14d→7d window, for trend compare.
  const { data, error, isLoading } = useDql({
    query: `fetch dt.davis.problems, from:now()-14d, to:now()-7d
| filter event.kind == "DAVIS_PROBLEM" and dt.davis.is_duplicate == false
| filter event.status == "CLOSED"
| filter isNotNull(resolved_problem_duration)
| summarize {avg_mttr = avg(toDouble(resolved_problem_duration) / 60000000000.0), problem_count = count()}`,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 10000,
  });
  const rec = data?.records?.[0];
  const medianMttr = toNum(rec?.avg_mttr);
  const problemCount = toNum(rec?.problem_count) ?? 0;
  return { medianMttr, problemCount, error, isLoading };
}

// ─── Composite Hook ─────────────────────────────────────────────────

export type FootprintData = ReturnType<typeof useFootprintData>;

export function useFootprintData() {
  // Single combined query for all entity counts
  const entities = useEntityCounts();

  // Enrichment queries (8 total instead of 25+)
  const vmware = useVmwareCount();
  const techBreakdown = useTechBreakdown();
  const serviceTechTypes = useServiceTechTypes();
  const smartscapeFanout = useSmartscapeFanout();
  const traceVolume = useTraceVolume();
  const logIngest = useLogIngest();
  const logRetention = useLogRetention();
  const mttr = useMttr();
  const mttrSparkline = {
    series: mttr.series,
    isLoading: mttr.isLoading,
    error: mttr.error,
  };
  const mttrPrevWeek = useMttrPreviousWeek();

  // Entity count accessors
  const hosts = entities.get("host");
  const processes = entities.get("process");
  const pods = entities.get("pod");
  const k8sClusters = entities.get("k8s_cluster");
  const k8sNodes = entities.get("k8s_node");
  const k8sWorkloads = entities.get("k8s_workload");
  const k8sNamespaces = entities.get("k8s_namespace");
  const services = entities.get("service");
  const webApps = entities.get("web_app");
  const mobileApps = entities.get("mobile_app");
  const databases = entities.get("database");
  const queues = entities.get("queue");
  const syntheticTests = entities.get("synthetic_test");
  const httpChecks = entities.get("http_check");
  const awsAccounts = entities.get("aws_cred");
  const azureAccounts = entities.get("azure_cred");
  const lambdaFunctions = entities.get("lambda");
  const customDevices = entities.get("custom_device");
  const customDeviceGroups = entities.get("custom_device_group");

  // Derived calculations
  const syntheticMonitors =
    (syntheticTests.value ?? 0) + (httpChecks.value ?? 0) || null;
  const cloudAccounts =
    (awsAccounts.value ?? 0) + (azureAccounts.value ?? 0) || null;

  const smartscapeDeps =
    services.value !== null
      ? Math.round(
          services.value * smartscapeFanout.avgFanout +
            (processes.value ?? 0) +
            (pods.value ?? 0) +
            (customDevices.value ?? 0)
        )
      : null;

  // ── Merge technologies from custom_device_groups + service tech types ──

  // Cloud/extension technologies — actual custom_device counts per group name
  const cloudTechs: TechEntry[] = techBreakdown.rows
    .map((r) => ({
      name: String(r["grp.entity.name"] ?? ""),
      count: toNum(r.cnt) ?? 0,
      category: "cloud" as const,
    }))
    .filter((t) => t.name);

  // Runtime/on-prem technologies from service technologyType
  const TECH_TYPE_LABELS: Record<string, string> = {
    JAVA: "Java",
    DOTNET: ".NET",
    ASP_NET: "ASP.NET",
    NODE_JS: "Node.js",
    PHP: "PHP",
    PYTHON: "Python",
    GO: "Go",
    RUBY: "Ruby",
    SCALA: "Scala",
    KOTLIN: "Kotlin",
    WEBSPHERE: "WebSphere",
    WEBLOGIC: "WebLogic",
    JBOSS: "JBoss",
    TOMCAT: "Tomcat",
    IIS: "IIS",
    APACHE: "Apache",
    NGINX: "Nginx",
    SPRING: "Spring",
    COLDFUSION: "ColdFusion",
    Z_OS: "z/OS",
    CICS: "CICS",
    IMS: "IMS",
  };

  const runtimeTechs: TechEntry[] = serviceTechTypes.rows
    .map((r) => {
      const raw = String(r.technologyType ?? "");
      return {
        name: TECH_TYPE_LABELS[raw] ?? raw,
        count: toNum(r.cnt) ?? 0,
        category: "runtime" as const,
      };
    })
    .filter((t) => t.name && t.name !== "null" && t.name !== "UNKNOWN");

  // Merge: runtimes first (they're the "impressive" on-prem story), then cloud
  const allTechnologies: TechEntry[] = [...runtimeTechs, ...cloudTechs].slice(0, 60);

  const isLoading = entities.isLoading || traceVolume.isLoading;

  return {
    // Infrastructure
    hosts,
    processes,
    pods,
    vmware,
    cloudAccounts: { value: cloudAccounts, isLoading: entities.isLoading, error: entities.error },
    awsAccounts,
    azureAccounts,

    // Applications & Cloud
    services,
    lambdaFunctions,
    queues,
    databases,
    customDeviceGroups,
    customDevices,

    // Kubernetes & Frontend
    k8sClusters,
    k8sNodes,
    k8sWorkloads,
    k8sNamespaces,
    webApps,
    mobileApps,

    // Data Volume
    syntheticMonitors: { value: syntheticMonitors, isLoading: entities.isLoading, error: entities.error },
    traceVolume,
    logIngest,
    logRetention,
    smartscapeDeps: { value: smartscapeDeps, isLoading: entities.isLoading || smartscapeFanout.isLoading, error: entities.error },

    // MTTR
    mttr,
    mttrSparkline,
    mttrPrevWeek,

    // Technologies (merged: runtimes + cloud/extensions)
    allTechnologies,

    isLoading,
  };
}

// ─── Formatting helpers ─────────────────────────────────────────────

export function formatBigNumber(n: number): string {
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(1)}T+`;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B+`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}

export function formatTB(tb: number): string {
  if (tb >= 1) return `${tb.toFixed(1)} TB`;
  return `${(tb * 1024).toFixed(0)} GB`;
}

export function formatPBorTB(pb: number | null, tb: number | null): string {
  if (pb !== null && pb >= 1) return `${pb.toFixed(1)} PB`;
  if (tb !== null) return `${tb.toFixed(1)} TB`;
  return "—";
}
