import { useDql } from "@dynatrace-sdk/react-hooks";
import type { TechItem } from "../components/TechGroup";

export type TierGroupData = { label: string; items: TechItem[] };

export type TierResult = {
  groups: TierGroupData[];
  summary: string;
  isLoading: boolean;
  error: Error | null | undefined;
  refetch: () => void;
};

// ─── utilities ──────────────────────────────────────────────────────

function toNum(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") {
    const n = Number(v);
    return isNaN(n) ? null : n;
  }
  return null;
}

function rowsOf(
  data: { records: Record<string, unknown>[] | null } | undefined
): Record<string, unknown>[] {
  return data?.records ?? [];
}

function groupRows(
  rows: Record<string, unknown>[],
  groupField = "group",
  techField = "tech",
  cntField = "cnt"
): TierGroupData[] {
  const map = new Map<string, TechItem[]>();
  for (const r of rows) {
    const g = String(r[groupField] ?? "");
    const t = String(r[techField] ?? "");
    const c = toNum(r[cntField]) ?? 0;
    if (!g || !t) continue;
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push({ label: t, count: c });
  }
  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    items: items.sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
  }));
}

function sumItems(items: TechItem[]): number {
  return items.reduce((s, i) => s + (i.count ?? 0), 0);
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

// ─── shared: dt.entity.process_group softwareTechnologies ───────────
// Group directly by the expanded element. Whatever DQL type it is (string,
// record), `summarize by:{softwareTechnologies}` produces one row per unique
// value. We then parse the string form client-side.

const PROCESS_TECH_QUERY = `fetch dt.entity.process_group
| expand softwareTechnologies
| filter isNotNull(softwareTechnologies)
| summarize {cnt = count()}, by: {softwareTechnologies}
| sort cnt desc
| limit 5000`;

type TechStats = { count: number; editions: number };

// Extract a normalized tech type from whatever string representation DQL
// gives us (might be "JAVA", "type:JAVA,edition:OPENJDK,version:17",
// "{type=JAVA, edition=...}", etc.)
function extractTechType(raw: string): { type: string; edition: string } | null {
  if (!raw) return null;
  const s = raw.trim();
  // Form 1: "type:JAVA,edition:OPENJDK,version:17"
  const kv = s.match(/type[:=]\s*['"]?([A-Za-z0-9_]+)/);
  if (kv) {
    const ed = s.match(/edition[:=]\s*['"]?([A-Za-z0-9_.\-]+)/);
    return { type: kv[1].toUpperCase(), edition: ed?.[1] ?? "" };
  }
  // Form 2: plain "JAVA"
  if (/^[A-Za-z][A-Za-z0-9_]*$/.test(s)) {
    return { type: s.toUpperCase(), edition: "" };
  }
  return null;
}

function useServiceTech() {
  const { data, error, isLoading, forceRefetch } = useDql({
    query: PROCESS_TECH_QUERY,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 10000,
  });
  const counts = new Map<string, TechStats>();
  const editionSets = new Map<string, Set<string>>();
  for (const r of rowsOf(data)) {
    const raw = String(r.softwareTechnologies ?? "");
    const parsed = extractTechType(raw);
    if (!parsed) continue;
    const c = toNum(r.cnt) ?? 0;
    const prev = counts.get(parsed.type);
    counts.set(parsed.type, {
      count: (prev?.count ?? 0) + c,
      editions: prev?.editions ?? 0,
    });
    if (parsed.edition) {
      if (!editionSets.has(parsed.type))
        editionSets.set(parsed.type, new Set());
      editionSets.get(parsed.type)!.add(parsed.edition);
    }
  }
  for (const [type, set] of editionSets) {
    const prev = counts.get(type);
    if (prev) counts.set(type, { ...prev, editions: set.size });
  }
  return { counts, isLoading, error, forceRefetch };
}

function prettyTechName(raw: string): string {
  if (!raw) return raw;
  return raw
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) =>
      w.toUpperCase() === w
        ? w.charAt(0) + w.slice(1).toLowerCase()
        : w
    )
    .join(" ");
}

function buildOtherBucket(
  counts: Map<string, TechStats>,
  buckets: Array<{ techs: Array<{ aliases: string[] }> }>,
  limit = 30
): TechItem[] {
  const consumed = new Set<string>();
  for (const b of buckets) {
    for (const t of b.techs) {
      for (const a of t.aliases) consumed.add(a.toUpperCase());
    }
  }
  const items: TechItem[] = [];
  for (const [type, stats] of counts.entries()) {
    if (consumed.has(type.toUpperCase())) continue;
    items.push({ label: prettyTechName(type), count: stats.count });
  }
  return items.sort((a, b) => (b.count ?? 0) - (a.count ?? 0)).slice(0, limit);
}

function pickTech(
  counts: Map<string, TechStats>,
  label: string,
  aliases: string[],
  editionLabel?: string
): TechItem | null {
  let total = 0;
  let editions = 0;
  let found = false;
  for (const a of aliases) {
    const v = counts.get(a.toUpperCase());
    if (v) {
      total += v.count;
      editions = Math.max(editions, v.editions);
      found = true;
    }
  }
  if (!found) return null;
  const finalLabel =
    editionLabel && editions > 1 ? `${label} (${editions} ${editionLabel})` : label;
  return { label: finalLabel, count: total };
}

// ─── shared: cloud groups (custom_device_group) ─────────────────────
// Simple direct fetch on custom_device_group. `cnt` = number of group
// entities per unique service name (e.g. per region / per account).

const CLOUD_QUERY = `fetch dt.entity.custom_device_group
| fieldsAdd name = entity.name
| filter isNotNull(name)
| summarize {cnt = count()}, by: {name}
| sort cnt desc
| limit 2000`;

type CloudProvider = "AWS" | "Azure" | "GCP" | "Other";
type CloudRow = { name: string; count: number; provider: CloudProvider };

function classifyProvider(name: string): CloudProvider {
  if (name.startsWith("Amazon ") || name.startsWith("AWS ")) return "AWS";
  if (name.startsWith("Azure ") || name.startsWith("Microsoft Azure "))
    return "Azure";
  if (name.startsWith("Google Cloud ") || name.startsWith("GCP "))
    return "GCP";
  return "Other";
}

function useCloudGroups() {
  const { data, error, isLoading, forceRefetch } = useDql({
    query: CLOUD_QUERY,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 5000,
  });
  const rows: CloudRow[] = [];
  for (const r of rowsOf(data)) {
    const name = String(r.name ?? "").trim();
    const count = toNum(r.cnt) ?? 0;
    if (name) rows.push({ name, count, provider: classifyProvider(name) });
  }
  return { rows, isLoading, error, forceRefetch };
}

// ─── Tier 1: End-user experience ────────────────────────────────────

export function useTier1(): TierResult {
  const q = `fetch dt.entity.application | summarize {cnt = count()} | fieldsAdd \`group\` = "Real User Monitoring", tech = "Web apps"
| append [fetch dt.entity.mobile_application | summarize {cnt = count()} | fieldsAdd \`group\` = "Real User Monitoring", tech = "Mobile apps"]
| append [fetch dt.entity.http_check | summarize {cnt = count()} | fieldsAdd \`group\` = "Synthetic", tech = "HTTP monitors"]
| append [fetch dt.entity.synthetic_test | summarize {cnt = count()} | fieldsAdd \`group\` = "Synthetic", tech = "Browser monitors"]`;
  const { data, error, isLoading, refetch } = useDql({
    query: q,
    defaultScanLimitGbytes: -1,
  });
  const groups = groupRows(rowsOf(data));
  const find = (g: string, t: string) =>
    groups.find((x) => x.label === g)?.items.find((i) => i.label === t)?.count ?? 0;
  const web = find("Real User Monitoring", "Web apps");
  const mobile = find("Real User Monitoring", "Mobile apps");
  const syn =
    find("Synthetic", "HTTP monitors") + find("Synthetic", "Browser monitors");
  const summary = `${fmt(web)} web · ${fmt(mobile)} mobile · ${fmt(syn)} synthetic`;
  return { groups, summary, isLoading, error, refetch };
}

// ─── Tier 2: Cloud services ─────────────────────────────────────────

const CLOUD_BUCKETS: Array<{ label: string; match: RegExp[] }> = [
  {
    label: "Compute",
    match: [
      /\blambda\b/i,
      /\bec2\b/i,
      /\becs\b/i,
      /\beks\b/i,
      /autoscaling|auto scaling/i,
      /spot fleet/i,
      /codebuild/i,
      /fargate/i,
      /lightsail/i,
      /batch/i,
      /\bbeanstalk\b/i,
    ],
  },
  {
    label: "Databases",
    match: [
      /\brds\b|aurora/i,
      /dynamodb|\bdax\b/i,
      /documentdb/i,
      /neptune/i,
      /redshift/i,
      /elasticache/i,
      /memorydb/i,
      /timestream/i,
      /keyspaces/i,
      /cosmos/i,
      /sql database|sql managed/i,
    ],
  },
  {
    label: "Storage",
    match: [
      /\bs3\b|simple storage/i,
      /\bebs\b/i,
      /\befs\b/i,
      /\bfsx\b/i,
      /storage gateway/i,
      /azure.*storage|blob storage|azure blob/i,
      /disk storage/i,
    ],
  },
  {
    label: "Messaging & streaming",
    match: [
      /\bsqs\b/i,
      /\bsns\b/i,
      /amazon mq/i,
      /eventbridge/i,
      /\bmsk\b|kafka/i,
      /kinesis/i,
      /service bus/i,
      /event hub/i,
      /event grid/i,
      /\bmq\b/i,
    ],
  },
  {
    label: "Networking & edge",
    match: [
      /route.?53/i,
      /\bvpc\b/i,
      /\balb\b|\belb\b|\bnlb\b|load balancer/i,
      /direct connect/i,
      /transit gateway/i,
      /\bvpn\b/i,
      /cloudfront/i,
      /api gateway/i,
      /front door/i,
      /nat gateway/i,
      /application gateway/i,
    ],
  },
  {
    label: "Integration & workflow",
    match: [
      /step functions/i,
      /appsync/i,
      /\bglue\b/i,
      /\bdms\b/i,
      /mwaa|airflow/i,
      /app service/i,
      /logic app/i,
      /service fabric/i,
    ],
  },
  {
    label: "Analytics, ML, other",
    match: [
      /athena/i,
      /opensearch|elasticsearch service/i,
      /\bemr\b/i,
      /sagemaker/i,
      /rekognition/i,
      /textract/i,
      /polly/i,
      /translate/i,
      /cognito/i,
      /\bconnect\b/i,
      /\bses\b/i,
      /\biot\b/i,
      /\bacm\b/i,
      /comprehend/i,
      /bedrock/i,
      /synapse/i,
      /databricks/i,
      /ml studio/i,
    ],
  },
  {
    label: "Observability & governance",
    match: [
      /cloudwatch/i,
      /aws api usage|api usage/i,
      /billing|cost/i,
      /trusted advisor/i,
      /systems manager|\bssm\b/i,
      /\bconfig\b/i,
      /guardduty/i,
      /securityhub|security hub/i,
      /azure monitor|log analytics/i,
    ],
  },
];

function prettyCloudName(name: string): string {
  // Strip AWS/Amazon prefix for shorter AWS chips; keep Azure/GCP verbatim
  // so provider remains visible when chips from different providers mix.
  if (name.startsWith("AWS ")) return name.slice(4);
  if (name.startsWith("Amazon ")) return name.slice(7);
  return name;
}

const PROVIDER_DOT: Record<CloudProvider, string | undefined> = {
  AWS: "#EF8812",
  Azure: "#05B6EB",
  GCP: "#E34034",
  Other: undefined,
};

// Matches the *original* (pre-pretty) name so "Amazon Rekognition" still counts
// as AI even after we strip the "Amazon " prefix for display.
const AI_PATTERN =
  /sagemaker|bedrock|rekognition|\bpolly\b|textract|comprehend|translate|transcribe|\blex\b|kendra|forecast|personalize|openai|anthropic|\bclaude\b|gemini|vertex.*ai|cognitive.?services|applied.?ai|ai.?platform|ai.?search|machine.?learning|ml.?studio|ml.?service|\bllm\b|hugging.?face|cohere|mistral|tensorflow|pytorch|\bmxnet\b|databricks/i;

function classifyCloud(rows: CloudRow[]): TierGroupData[] {
  const bucketed: Record<string, TechItem[]> = {};
  for (const b of CLOUD_BUCKETS) bucketed[b.label] = [];
  for (const r of rows) {
    if (r.provider === "Other") continue;
    for (const b of CLOUD_BUCKETS) {
      if (b.match.some((re) => re.test(r.name))) {
        bucketed[b.label].push({
          label: prettyCloudName(r.name),
          count: r.count,
          dotColor: PROVIDER_DOT[r.provider],
          isAI: AI_PATTERN.test(r.name),
        });
        break;
      }
    }
  }
  return CLOUD_BUCKETS.map((b) => ({
    label: b.label,
    items: bucketed[b.label]
      .sort((a, b2) => (b2.count ?? 0) - (a.count ?? 0))
      .slice(0, 40),
  }));
}

function markAI(items: TechItem[]): TechItem[] {
  return items.map((it) =>
    AI_PATTERN.test(it.label) ? { ...it, isAI: true } : it
  );
}

function annotateAI(groups: TierGroupData[]): TierGroupData[] {
  return groups.map((g) => ({ ...g, items: markAI(g.items) }));
}

function countProviders(rows: CloudRow[]): {
  aws: number;
  azure: number;
  gcp: number;
} {
  const set = { aws: new Set<string>(), azure: new Set<string>(), gcp: new Set<string>() };
  for (const r of rows) {
    if (r.provider === "AWS") set.aws.add(r.name);
    else if (r.provider === "Azure") set.azure.add(r.name);
    else if (r.provider === "GCP") set.gcp.add(r.name);
  }
  return { aws: set.aws.size, azure: set.azure.size, gcp: set.gcp.size };
}

export function useTier2(): TierResult {
  const cloud = useCloudGroups();
  const groups = classifyCloud(cloud.rows);
  const { aws, azure, gcp } = countProviders(cloud.rows);
  const parts: string[] = [`${fmt(aws)} AWS`];
  if (azure > 0) parts.push(`${fmt(azure)} Azure`);
  if (gcp > 0) parts.push(`${fmt(gcp)} GCP`);
  const summary = `${parts.join(" · ")} services`;
  return {
    groups,
    summary,
    isLoading: cloud.isLoading,
    error: cloud.error as Error | null,
    refetch: () => void cloud.forceRefetch(),
  };
}

// ─── Tier 3: Container platform ─────────────────────────────────────

export function useTier3(): TierResult {
  const kube = useDql({
    query: `fetch dt.entity.kubernetes_cluster | summarize {cnt = count()} | fieldsAdd tech = "Clusters"
| append [fetch dt.entity.kubernetes_node | summarize {cnt = count()} | fieldsAdd tech = "Nodes"]
| append [fetch dt.entity.cloud_application_namespace | summarize {cnt = count()} | fieldsAdd tech = "Namespaces"]
| append [fetch dt.entity.cloud_application | summarize {cnt = count()} | fieldsAdd tech = "Workloads"]
| append [fetch dt.entity.cloud_application_instance | summarize {cnt = count()} | fieldsAdd tech = "Pods"]`,
    defaultScanLimitGbytes: -1,
  });
  const svc = useServiceTech();
  const cloud = useCloudGroups();

  const kubeMap = new Map<string, number>();
  for (const r of rowsOf(kube.data)) {
    kubeMap.set(String(r.tech ?? ""), toNum(r.cnt) ?? 0);
  }

  const orchestration: TechItem[] = [];
  if ((kubeMap.get("Clusters") ?? 0) > 0)
    orchestration.push({ label: "Kubernetes", count: kubeMap.get("Clusters")! });
  // EKS/AKS/GKE via cloud custom device groups
  for (const r of cloud.rows) {
    if (/\beks\b|elastic kubernetes/i.test(r.name))
      orchestration.push({ label: "Amazon EKS", count: r.count });
    else if (/\baks\b|kubernetes service/i.test(r.name) && /azure/i.test(r.name))
      orchestration.push({ label: "Azure AKS", count: r.count });
    else if (/\bgke\b|google kubernetes/i.test(r.name))
      orchestration.push({ label: "Google GKE", count: r.count });
  }

  const mesh: TechItem[] = [];
  const meshTechs: TierTechDef[] = [
    { label: "Istio", aliases: ["ISTIO"] },
    { label: "Envoy", aliases: ["ENVOY", "ENVOY_PROXY"] },
    { label: "CoreDNS", aliases: ["COREDNS", "CORE_DNS"] },
    { label: "Linkerd", aliases: ["LINKERD"] },
  ];
  for (const t of meshTechs) {
    const p = pickTech(svc.counts, t.label, t.aliases);
    if (p) mesh.push(p);
  }

  const runtimeTechs: TierTechDef[] = [
    { label: "containerd", aliases: ["CONTAINERD"] },
    { label: "CRI-O", aliases: ["CRI_O", "CRIO"] },
    { label: "Docker", aliases: ["DOCKER", "DOCKER_ENGINE"] },
    { label: "Podman", aliases: ["PODMAN"] },
    { label: "runc", aliases: ["RUNC"] },
  ];
  const runtimeMap = new Map<string, TechItem>();
  for (const t of runtimeTechs) {
    const p = pickTech(svc.counts, t.label, t.aliases);
    if (p) runtimeMap.set(p.label, p);
  }
  // Also allow cloud.rows fallback for runtimes that aren't in softwareTechnologies
  for (const r of cloud.rows) {
    if (/\bcontainerd\b/i.test(r.name) && !runtimeMap.has("containerd"))
      runtimeMap.set("containerd", { label: "containerd", count: r.count });
    else if (/cri-?o/i.test(r.name) && !runtimeMap.has("CRI-O"))
      runtimeMap.set("CRI-O", { label: "CRI-O", count: r.count });
    else if (/\bdocker\b/i.test(r.name) && !runtimeMap.has("Docker"))
      runtimeMap.set("Docker", { label: "Docker", count: r.count });
    else if (/\bpodman\b/i.test(r.name) && !runtimeMap.has("Podman"))
      runtimeMap.set("Podman", { label: "Podman", count: r.count });
  }
  const runtimes = Array.from(runtimeMap.values()).sort(
    (a, b) => (b.count ?? 0) - (a.count ?? 0)
  );

  const groups: TierGroupData[] = [
    { label: "Orchestration", items: orchestration },
    { label: "Container runtimes", items: runtimes },
    { label: "Service mesh & DNS", items: mesh },
  ];

  const summary = `${fmt(kubeMap.get("Clusters") ?? 0)} clusters · ${fmt(kubeMap.get("Nodes") ?? 0)} nodes · ${fmt(kubeMap.get("Pods") ?? 0)} pods · ${fmt(kubeMap.get("Workloads") ?? 0)} workloads`;

  return {
    groups,
    summary,
    isLoading: kube.isLoading || svc.isLoading || cloud.isLoading,
    error:
      (kube.error as Error | null) ??
      (svc.error as Error | null) ??
      (cloud.error as Error | null),
    refetch: () => {
      void kube.forceRefetch();
      void svc.forceRefetch();
      void cloud.forceRefetch();
    },
  };
}

// ─── Tier 4: Application services ───────────────────────────────────

type TierTechDef = {
  label: string;
  aliases: string[];
  editionLabel?: string;
};

const TIER4_BUCKETS: Array<{ label: string; techs: TierTechDef[] }> = [
  {
    label: "JVM languages",
    techs: [
      { label: "Java", aliases: ["JAVA", "IBM_JAVA", "OPENJDK"], editionLabel: "JDKs" },
      { label: "Kotlin", aliases: ["KOTLIN"] },
      { label: "Scala", aliases: ["SCALA"] },
      { label: "Groovy", aliases: ["GROOVY"] },
    ],
  },
  {
    label: "Microsoft stack",
    techs: [
      { label: ".NET Framework", aliases: ["DOTNET", "DOT_NET", "NET", "DOTNET_FRAMEWORK"] },
      {
        label: ".NET Core",
        aliases: [
          "DOTNET_CORE",
          "DOT_NET_CORE",
          "NETCORE",
          "NET_CORE",
          "DOTNET_CORE_3",
          "DOTNET_6",
          "DOTNET_8",
          "DOTNET_9",
          "DOTNET_10",
          "NET_6",
          "NET_8",
        ],
        editionLabel: "versions",
      },
      { label: "ASP.NET", aliases: ["ASP_NET", "ASPNET", "ASP_DOTNET_CORE", "ASP_NET_CORE"] },
      { label: "WCF", aliases: ["WCF"] },
      { label: "OWIN Katana", aliases: ["OWIN", "KATANA", "OWIN_KATANA"] },
      { label: "ADO.NET", aliases: ["ADO_NET", "ADONET"] },
    ],
  },
  {
    label: "Other languages",
    techs: [
      { label: "Go", aliases: ["GO", "GOLANG"] },
      { label: "Python", aliases: ["PYTHON"] },
      { label: "Node.js", aliases: ["NODE_JS", "NODEJS", "IO_JS"] },
      { label: "Ruby", aliases: ["RUBY"] },
      { label: "Erlang", aliases: ["ERLANG"] },
      { label: "C/C++", aliases: ["CPP", "C_CPP", "C_PLUS_PLUS", "NATIVE"] },
      { label: "PHP", aliases: ["PHP"] },
      { label: "Perl", aliases: ["PERL"] },
      { label: "Rust", aliases: ["RUST"] },
    ],
  },
  {
    label: "Application servers",
    techs: [
      { label: "Tomcat", aliases: ["APACHE_TOMCAT", "TOMCAT"] },
      { label: "Jetty", aliases: ["JETTY"] },
      { label: "WebLogic", aliases: ["WEBLOGIC", "ORACLE_WEBLOGIC"] },
      { label: "WebSphere trad", aliases: ["WEBSPHERE", "WEBSPHERE_AS", "WEBSPHERE_APPLICATION_SERVER", "IBM_WEBSPHERE_APPLICATION_SERVER"] },
      { label: "WebSphere Liberty", aliases: ["WEBSPHERE_LIBERTY", "LIBERTY", "IBM_WEBSPHERE_LIBERTY"] },
      { label: "IIS", aliases: ["IIS", "IIS_APP_POOL", "INTERNET_INFORMATION_SERVICES"] },
      { label: "JBoss / WildFly", aliases: ["JBOSS", "WILDFLY"] },
      { label: "Glassfish", aliases: ["GLASSFISH"] },
    ],
  },
  {
    label: "Web servers",
    techs: [
      { label: "Apache HTTP", aliases: ["APACHE_HTTPD", "APACHE_HTTP_SERVER", "APACHE"] },
      { label: "NGINX", aliases: ["NGINX"] },
      { label: "OpenResty", aliases: ["OPENRESTY", "OPEN_RESTY"] },
      { label: "Lighttpd", aliases: ["LIGHTTPD"] },
    ],
  },
  {
    label: "Frameworks",
    techs: [
      { label: "Spring / Boot", aliases: ["SPRING", "SPRING_BOOT", "SPRING_FRAMEWORK"] },
      { label: "Reactor", aliases: ["REACTOR", "PROJECT_REACTOR"] },
      { label: "WebFlux", aliases: ["WEBFLUX", "SPRING_WEBFLUX"] },
      { label: "gRPC", aliases: ["GRPC"] },
      { label: "Jersey", aliases: ["JERSEY", "JAX_RS"] },
      { label: "NHibernate", aliases: ["NHIBERNATE"] },
      { label: "Entity Framework", aliases: ["ENTITY_FRAMEWORK", "ENTITYFRAMEWORK"] },
      { label: "Hibernate", aliases: ["HIBERNATE"] },
      { label: "Django", aliases: ["DJANGO"] },
      { label: "Flask", aliases: ["FLASK"] },
    ],
  },
  {
    label: "Telemetry SDKs",
    techs: [
      { label: "OpenTelemetry Java", aliases: ["OPENTELEMETRY_JAVA", "OPEN_TELEMETRY_JAVA"] },
      { label: "OpenTelemetry .NET", aliases: ["OPENTELEMETRY_DOTNET", "OPEN_TELEMETRY_DOTNET", "OPENTELEMETRY_NET"] },
      { label: "OpenTelemetry", aliases: ["OPENTELEMETRY", "OPEN_TELEMETRY", "OTEL"] },
      { label: "App Insights", aliases: ["APPLICATION_INSIGHTS", "APP_INSIGHTS", "APPINSIGHTS"] },
      { label: "OneAgent SDK", aliases: ["ONEAGENT_SDK", "ONE_AGENT_SDK"] },
    ],
  },
  {
    label: "Logging libraries",
    techs: [
      { label: "Log4j", aliases: ["LOG4J", "LOG4J2", "APACHE_LOG4J"] },
      { label: "Logback", aliases: ["LOGBACK"] },
      { label: "Logstash Encoder", aliases: ["LOGSTASH", "LOGSTASH_ENCODER"] },
      { label: "NLog", aliases: ["NLOG"] },
      { label: "Serilog", aliases: ["SERILOG"] },
    ],
  },
];

export function useTier4(): TierResult {
  const svc = useServiceTech();
  const groups: TierGroupData[] = annotateAI([
    ...TIER4_BUCKETS.map((b) => ({
      label: b.label,
      items: b.techs
        .map((t) => pickTech(svc.counts, t.label, t.aliases, t.editionLabel))
        .filter((x): x is TechItem => x !== null)
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
    })),
    {
      label: "Other technologies",
      items: buildOtherBucket(svc.counts, [...TIER4_BUCKETS, ...TIER5_BUCKETS], 40),
    },
  ]);
  const totalTechs = groups.reduce((s, g) => s + g.items.length, 0);
  const langs =
    (groups.find((g) => g.label === "JVM languages")?.items.length ?? 0) +
    (groups.find((g) => g.label === "Other languages")?.items.length ?? 0) +
    (groups.find((g) => g.label === "Microsoft stack")?.items.length ?? 0);
  const servers = groups.find((g) => g.label === "Application servers")?.items.length ?? 0;
  const summary = `${fmt(totalTechs)} technologies · ${fmt(langs)} languages · ${fmt(servers)} app server families`;
  return {
    groups,
    summary,
    isLoading: svc.isLoading,
    error: svc.error as Error | null,
    refetch: () => void svc.forceRefetch(),
  };
}

// ─── Tier 5: Data & integration ─────────────────────────────────────

const TIER5_BUCKETS: Array<{ label: string; techs: TierTechDef[] }> = [
  {
    label: "Messaging & MQ",
    techs: [
      { label: "IBM MQ Series", aliases: ["IBM_MQ", "IBM_MQSERIES", "MQ_SERIES", "WEBSPHERE_MQ"] },
      { label: "TIBCO EMS", aliases: ["TIBCO_EMS", "TIBCO"] },
      { label: "Apache Kafka", aliases: ["KAFKA", "APACHE_KAFKA"] },
      { label: "Solace", aliases: ["SOLACE"] },
      { label: "RabbitMQ", aliases: ["RABBITMQ", "RABBIT_MQ"] },
      { label: "ActiveMQ / Artemis", aliases: ["ACTIVEMQ", "ARTEMIS", "ACTIVEMQ_ARTEMIS", "APACHE_ACTIVEMQ"] },
      { label: "MSMQ", aliases: ["MSMQ", "MICROSOFT_MESSAGE_QUEUE"] },
      { label: "WebSphere JMS", aliases: ["WEBSPHERE_JMS", "IBM_WEBSPHERE_JMS"] },
      { label: "WebLogic JMS", aliases: ["WEBLOGIC_JMS", "ORACLE_WEBLOGIC_JMS"] },
    ],
  },
  {
    label: "Integration platforms",
    techs: [
      { label: "TIBCO BusinessWorks", aliases: ["TIBCO_BUSINESSWORKS", "BUSINESSWORKS", "TIBCO_BW"] },
      { label: "IBM Integration Bus", aliases: ["IBM_INTEGRATION_BUS", "INTEGRATION_BUS", "IBM_IIB"] },
      { label: "Apache Camel", aliases: ["APACHE_CAMEL", "CAMEL"] },
      { label: "Confluent Kafka .NET", aliases: ["CONFLUENT_KAFKA", "CONFLUENT_KAFKA_DOTNET", "CONFLUENT_KAFKA_NET"] },
      { label: "MuleSoft", aliases: ["MULESOFT", "MULE"] },
    ],
  },
  {
    label: "Relational databases",
    techs: [
      { label: "Oracle", aliases: ["ORACLE_DB", "ORACLE", "ORACLE_DATABASE"] },
      { label: "MS SQL Server", aliases: ["MSSQL", "MS_SQL_SERVER", "SQL_SERVER", "MICROSOFT_SQL_SERVER"] },
      { label: "MySQL", aliases: ["MYSQL"] },
      { label: "PostgreSQL", aliases: ["POSTGRESQL", "POSTGRES"] },
      { label: "IBM DB2", aliases: ["DB2", "IBM_DB2"] },
      { label: "HSQLDB", aliases: ["HSQLDB", "HYPERSQL"] },
      { label: "H2", aliases: ["H2", "H2_DATABASE"] },
      { label: "Derby", aliases: ["DERBY", "APACHE_DERBY"] },
      { label: "SQLite", aliases: ["SQLITE"] },
      { label: "MariaDB", aliases: ["MARIADB"] },
    ],
  },
  {
    label: "NoSQL & specialized",
    techs: [
      { label: "MongoDB", aliases: ["MONGODB", "MONGO"] },
      { label: "Couchbase", aliases: ["COUCHBASE", "COUCHDB"] },
      { label: "Redis", aliases: ["REDIS"] },
      { label: "Memcached", aliases: ["MEMCACHED"] },
      { label: "Elasticsearch", aliases: ["ELASTICSEARCH", "ELASTIC_SEARCH"] },
      { label: "Cassandra", aliases: ["CASSANDRA", "APACHE_CASSANDRA"] },
    ],
  },
];

export function useTier5(): TierResult {
  const svc = useServiceTech();
  const groups: TierGroupData[] = annotateAI([
    ...TIER5_BUCKETS.map((b) => ({
      label: b.label,
      items: b.techs
        .map((t) => pickTech(svc.counts, t.label, t.aliases, t.editionLabel))
        .filter((x): x is TechItem => x !== null)
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
    })),
    {
      label: "Other technologies",
      items: buildOtherBucket(svc.counts, [...TIER4_BUCKETS, ...TIER5_BUCKETS], 40),
    },
  ]);
  const messaging = groups.find((g) => g.label === "Messaging & MQ")?.items.length ?? 0;
  const dbs =
    (groups.find((g) => g.label === "Relational databases")?.items.length ?? 0) +
    (groups.find((g) => g.label === "NoSQL & specialized")?.items.length ?? 0);
  const integ = groups.find((g) => g.label === "Integration platforms")?.items.length ?? 0;
  const summary = `${fmt(messaging)} messaging · ${fmt(dbs)} database systems · ${fmt(integ)} integration platforms`;
  return {
    groups,
    summary,
    isLoading: svc.isLoading,
    error: svc.error as Error | null,
    refetch: () => void svc.forceRefetch(),
  };
}

// ─── Tier 6: Infrastructure & endpoints ─────────────────────────────

type OsBucket = { label: string; match: RegExp[] };
const OS_BUCKETS: OsBucket[] = [
  { label: "Windows", match: [/windows/i, /^win_/i] },
  { label: "Amazon Linux", match: [/amazon.linux|amzn|amazon-linux/i] },
  { label: "Ubuntu", match: [/ubuntu/i] },
  { label: "Oracle Linux", match: [/oracle/i] },
  { label: "RHEL", match: [/red.hat|rhel/i] },
  { label: "CentOS", match: [/centos/i] },
  { label: "Debian", match: [/debian/i] },
  { label: "SUSE / SLES", match: [/suse|sles/i] },
  { label: "Alpine", match: [/alpine/i] },
  { label: "Chainguard", match: [/chainguard/i] },
];

export function useTier6(): TierResult {
  const hosts = useDql({
    query: `fetch dt.entity.host
| fieldsAdd osType, osVersion
| summarize {cnt = count()}, by: {osType, osVersion}
| sort cnt desc
| limit 1000`,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 5000,
  });
  const cloud = useCloudGroups();

  const netDevices = useDql({
    query: `fetch dt.entity.custom_device | fieldsAdd name = entity.name | filter matchesPhrase(name, "F5") or matchesPhrase(name, "BIG-IP") | summarize {cnt = count()} | fieldsAdd vendor = "F5 / BIG-IP"
| append [fetch dt.entity.custom_device | fieldsAdd name = entity.name | filter matchesPhrase(name, "Cisco") | summarize {cnt = count()} | fieldsAdd vendor = "Cisco"]
| append [fetch dt.entity.custom_device | fieldsAdd name = entity.name | filter matchesPhrase(name, "Palo Alto") | summarize {cnt = count()} | fieldsAdd vendor = "Palo Alto"]
| append [fetch dt.entity.custom_device | fieldsAdd name = entity.name | filter matchesPhrase(name, "Check Point") | summarize {cnt = count()} | fieldsAdd vendor = "Check Point"]
| append [fetch dt.entity.custom_device | fieldsAdd name = entity.name | filter matchesPhrase(name, "Juniper") | summarize {cnt = count()} | fieldsAdd vendor = "Juniper"]
| append [fetch dt.entity.custom_device | fieldsAdd name = entity.name | filter matchesPhrase(name, "Fortinet") or matchesPhrase(name, "FortiGate") | summarize {cnt = count()} | fieldsAdd vendor = "Fortinet"]
| append [fetch dt.entity.custom_device | fieldsAdd name = entity.name | filter matchesPhrase(name, "Arista") | summarize {cnt = count()} | fieldsAdd vendor = "Arista"]
| append [fetch dt.entity.custom_device | fieldsAdd name = entity.name | filter matchesPhrase(name, "SNMP") | summarize {cnt = count()} | fieldsAdd vendor = "SNMP devices"]`,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 5000,
  });

  const totalHosts = rowsOf(hosts.data).reduce(
    (s, r) => s + (toNum(r.cnt) ?? 0),
    0
  );

  const osMap = new Map<string, number>();
  for (const r of rowsOf(hosts.data)) {
    const type = String(r.osType ?? "");
    const version = String(r.osVersion ?? "");
    const cnt = toNum(r.cnt) ?? 0;
    const combo = `${type} ${version}`.trim();
    for (const b of OS_BUCKETS) {
      if (b.match.some((re) => re.test(combo) || re.test(type))) {
        osMap.set(b.label, (osMap.get(b.label) ?? 0) + cnt);
        break;
      }
    }
  }
  const osItems: TechItem[] = Array.from(osMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  let networkTotal = 0;
  const netItems: TechItem[] = [];
  for (const r of rowsOf(netDevices.data)) {
    const v = String(r.vendor ?? "");
    const c = toNum(r.cnt) ?? 0;
    if (v && c > 0) {
      netItems.push({ label: v, count: c });
      networkTotal += c;
    }
  }
  netItems.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  // Endpoint & VDI, Remote middleware — from custom_device_group names
  // and process_group softwareTechnologies.
  const svc = useServiceTech();
  const endpointItems: TechItem[] = [];
  const middlewareItems: TechItem[] = [];
  if (totalHosts > 0) {
    endpointItems.push({ label: "OneAgent", count: totalHosts });
  }
  const endpointMap = new Map<string, number>();
  const middlewareMap = new Map<string, number>();
  const bumpEndpoint = (k: string, v: number) =>
    endpointMap.set(k, (endpointMap.get(k) ?? 0) + v);
  const bumpMiddleware = (k: string, v: number) =>
    middlewareMap.set(k, (middlewareMap.get(k) ?? 0) + v);

  for (const r of cloud.rows) {
    if (r.provider !== "Other") continue;
    const n = r.name;
    if (/citrix/i.test(n)) bumpEndpoint("Citrix", r.count);
    else if (/endpoint.?security|crowdstrike|sentinel.?one|defender|carbon.?black|\bepp\b|antivirus/i.test(n))
      bumpEndpoint("Endpoint security", r.count);
    else if (/splunk/i.test(n)) bumpMiddleware("Splunk", r.count);
    else if (/vmware|vcenter|\besxi\b|vsphere/i.test(n))
      bumpMiddleware("VMware", r.count);
    else if (/new.?relic|app.?dynamics|datadog|elastic.?apm|solarwinds|dynatrace/i.test(n))
      bumpMiddleware("3rd-party APM endpoints", r.count);
  }
  // Also scan process_group softwareTechnologies for middleware signals
  for (const [type, stats] of svc.counts.entries()) {
    if (/citrix/i.test(type)) bumpEndpoint("Citrix", stats.count);
    else if (/splunk/i.test(type)) bumpMiddleware("Splunk", stats.count);
    else if (/vmware|vcenter|\besxi\b/i.test(type))
      bumpMiddleware("VMware", stats.count);
  }
  for (const [label, count] of endpointMap) endpointItems.push({ label, count });
  for (const [label, count] of middlewareMap) middlewareItems.push({ label, count });
  endpointItems.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  middlewareItems.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  const groups: TierGroupData[] = [
    { label: "Operating systems", items: osItems },
    { label: "Network devices", items: netItems },
    { label: "Endpoint & VDI", items: endpointItems },
    { label: "Remote middleware", items: middlewareItems },
  ];

  const summary = `${fmt(totalHosts)} hosts · ${fmt(networkTotal)} network devices`;
  return {
    groups,
    summary,
    isLoading:
      hosts.isLoading ||
      netDevices.isLoading ||
      cloud.isLoading ||
      svc.isLoading,
    error:
      (hosts.error as Error | null) ??
      (netDevices.error as Error | null) ??
      (cloud.error as Error | null) ??
      (svc.error as Error | null),
    refetch: () => {
      void hosts.forceRefetch();
      void netDevices.forceRefetch();
      void cloud.forceRefetch();
      void svc.forceRefetch();
    },
  };
}

// ─── Tier 7: Mainframe ──────────────────────────────────────────────

export function useTier7(): TierResult {
  const svc = useServiceTech();

  const spans = useDql({
    query: `fetch spans, from:now()-24h
| filter \`db.system\` == "dl/i" or \`db.system\` == "dl/i dc" or \`db.system\` == "db2"
| summarize {cnt = count()}, by: {\`db.system\`}`,
    defaultScanLimitGbytes: -1,
    maxResultRecords: 100,
  });

  const txMgrs: TechItem[] = [];
  const middleware: TechItem[] = [];
  for (const [techType, stats] of svc.counts.entries()) {
    if (stats.count === 0) continue;
    if (techType.includes("IMS") || techType.includes("CICS")) {
      txMgrs.push({ label: humanTech(techType), count: stats.count });
    } else if (techType.includes("WEBSPHERE")) {
      middleware.push({ label: humanTech(techType), count: stats.count });
    }
  }
  // IBM Java detection
  const ibmJava = pickTech(svc.counts, "IBM Java", ["IBM_JAVA"], "versions");
  if (ibmJava) middleware.push(ibmJava);
  // IBM Integration Bus sometimes appears here as well
  const iib = pickTech(svc.counts, "IBM Integration Bus", [
    "IBM_INTEGRATION_BUS",
    "INTEGRATION_BUS",
    "IBM_IIB",
  ]);
  if (iib) middleware.push(iib);

  txMgrs.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  middleware.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  const dbs: TechItem[] = [];
  for (const r of rowsOf(spans.data)) {
    const sys = String(r["db.system"] ?? "");
    const c = toNum(r.cnt) ?? 0;
    if (!sys) continue;
    const label =
      sys === "dl/i" ? "IMS DL/I" : sys === "dl/i dc" ? "DL/I DC" : sys === "db2" ? "IBM DB2" : sys;
    dbs.push({ label, count: c });
  }

  const groups: TierGroupData[] = [
    { label: "Transaction managers", items: txMgrs },
    { label: "Databases (live traffic)", items: dbs },
    { label: "Runtimes & middleware", items: middleware },
  ];

  const hasData = txMgrs.length + middleware.length + dbs.length > 0;
  const summary = hasData
    ? `${fmt(txMgrs.length)} tx mgr types · ${fmt(dbs.length)} DB systems · ${fmt(sumItems(dbs))} spans/24h`
    : "No mainframe signals detected";

  return {
    groups,
    summary,
    isLoading: svc.isLoading || spans.isLoading,
    error: (svc.error as Error | null) ?? (spans.error as Error | null),
    refetch: () => {
      void svc.forceRefetch();
      void spans.forceRefetch();
    },
  };
}

function humanTech(raw: string): string {
  const map: Record<string, string> = {
    IBM_IMS_CONTROL_REGION: "IMS Control Region",
    IBM_IMS_MESSAGE_PROCESSING_REGION: "IMS MPR",
    IBM_IMS_SOAP_GATEWAY: "IMS SOAP Gateway",
    IBM_CICS_REGION: "CICS Region",
    IBM_CICS_ALIAS_REGION: "CICS Alias Region",
    IBM_WEBSPHERE_APPLICATION_SERVER: "WebSphere AS",
    IBM_WEBSPHERE_LIBERTY: "WebSphere Liberty",
  };
  return map[raw] ?? raw.replace(/_/g, " ").toLowerCase();
}

// ─── Summary strip ──────────────────────────────────────────────────

export type SummaryStat = { label: string; value: string };

export function useSummaryStrip(): {
  stats: SummaryStat[];
  isLoading: boolean;
  error: Error | null;
} {
  const entities = useDql({
    query: `fetch dt.entity.host | summarize {v = count()} | fieldsAdd k = "hosts"
| append [fetch dt.entity.service | summarize {v = count()} | fieldsAdd k = "services"]
| append [fetch dt.entity.cloud_application_instance | summarize {v = count()} | fieldsAdd k = "containers"]
| append [fetch dt.entity.custom_device | summarize {v = count()} | fieldsAdd k = "remote_devices"]
| append [fetch dt.entity.custom_device_group | fieldsAdd name = entity.name | summarize {v = countDistinct(name)} | fieldsAdd k = "cloud_integrations"]`,
    defaultScanLimitGbytes: -1,
  });

  const svc = useServiceTech();

  const spans = useDql({
    query: `fetch spans, from:now()-30m
| filter isNotNull(\`db.system\`) or isNotNull(\`messaging.system\`)
| summarize {cnt = count()}`,
    defaultScanLimitGbytes: -1,
  });

  const entMap = new Map<string, number>();
  for (const r of rowsOf(entities.data)) {
    entMap.set(String(r.k ?? ""), toNum(r.v) ?? 0);
  }

  const uniqueTech = svc.counts.size;
  const cloudIntegrations = entMap.get("cloud_integrations") ?? 0;
  const totalTech = uniqueTech + cloudIntegrations;

  const spansCount = toNum(rowsOf(spans.data)[0]?.cnt) ?? 0;

  const stats: SummaryStat[] = [
    { label: "Total unique technologies", value: fmtBig(totalTech) },
    { label: "OneAgent-detected types", value: fmt(uniqueTech) },
    { label: "Cloud & remote integrations", value: fmt(cloudIntegrations) },
    { label: "Hosts", value: fmt(entMap.get("hosts") ?? 0) },
    { label: "Services", value: fmt(entMap.get("services") ?? 0) },
    { label: "Containers", value: fmt(entMap.get("containers") ?? 0) },
    { label: "Remote devices", value: fmt(entMap.get("remote_devices") ?? 0) },
    { label: "Spans/30m (msg+db)", value: fmtBig(spansCount) },
  ];

  return {
    stats,
    isLoading: entities.isLoading || svc.isLoading || spans.isLoading,
    error:
      (entities.error as Error | null) ??
      (svc.error as Error | null) ??
      (spans.error as Error | null),
  };
}

function fmtBig(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}
