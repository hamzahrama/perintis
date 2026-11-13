import { randomBytes, randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const root = fileURLToPath(new URL("..", import.meta.url));
const credentialsPath = path.join(
  root,
  "supabase",
  ".temp",
  "perintis-demo-account.json",
);
const demoName = "Demo Lokal PERINTIS";

function getLocalSupabaseConfig() {
  const result = spawnSync(
    "npx",
    ["--yes", "supabase@3.1.0", "status", "-o", "env"],
    { cwd: root, encoding: "utf8" },
  );

  if (result.error || result.status !== 0) {
    throw new Error(
      "Supabase lokal belum berjalan. Jalankan `npx supabase start` terlebih dahulu.",
    );
  }

  const values = Object.fromEntries(
    result.stdout
      .split(/\r?\n/)
      .filter((line) => line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^"|"$/g, ""),
        ];
      }),
  );

  const url = values.API_URL;
  const serviceRoleKey = values.SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase CLI tidak memberikan kredensial lokal yang diperlukan.");
  }

  const hostname = new URL(url).hostname;
  if (!["127.0.0.1", "localhost", "::1"].includes(hostname)) {
    throw new Error("Fixture demo hanya boleh dijalankan pada Supabase lokal.");
  }

  return { url, serviceRoleKey };
}

async function getDemoCredentials() {
  await mkdir(path.dirname(credentialsPath), { recursive: true, mode: 0o700 });

  try {
    const stored = JSON.parse(await readFile(credentialsPath, "utf8"));
    if (
      typeof stored.email !== "string" ||
      typeof stored.password !== "string" ||
      !stored.email.endsWith("@example.invalid")
    ) {
      throw new Error("Format kredensial akun demo lokal tidak valid.");
    }

    return stored;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("File kredensial akun demo lokal tidak dapat dibaca.");
    }
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  const credentials = {
    email: `demo-${randomUUID()}@example.invalid`,
    password: randomBytes(32).toString("base64url"),
  };
  await writeFile(credentialsPath, `${JSON.stringify(credentials, null, 2)}\n`, {
    mode: 0o600,
    flag: "wx",
  });
  await chmod(credentialsPath, 0o600);
  return credentials;
}

async function findDemoUser(supabase, email) {
  const matchingUsers = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) {
      throw new Error(`Tidak dapat memeriksa akun demo lokal: ${error.message}`);
    }

    matchingUsers.push(...data.users.filter((user) => user.email === email));
    if (data.users.length < 1000) {
      break;
    }
    page += 1;
  }

  if (matchingUsers.length > 1) {
    throw new Error("Ada lebih dari satu akun demo dengan email yang sama.");
  }

  return matchingUsers[0];
}

async function ensureDemoUser(supabase, credentials) {
  const existingUser = await findDemoUser(supabase, credentials.email);
  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: credentials.email,
    password: credentials.password,
    email_confirm: true,
    user_metadata: { full_name: demoName },
  });

  if (error) {
    throw new Error(`Tidak dapat membuat akun demo lokal: ${error.message}`);
  }
  if (!data.user) {
    throw new Error("Supabase tidak mengembalikan user untuk akun demo lokal.");
  }

  return data.user;
}

async function insertFixtureRows(supabase, rows) {
  for (const { table, data } of rows) {
    const { error } = await supabase
      .from(table)
      .upsert(data, { onConflict: "id", ignoreDuplicates: true });

    if (error) {
      throw new Error(`Gagal menambahkan fixture ${table}: ${error.message}`);
    }
  }
}

async function main() {
  const { url, serviceRoleKey } = getLocalSupabaseConfig();
  const credentials = await getDemoCredentials();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const user = await ensureDemoUser(supabase, credentials);
  const userId = user.id;
  const now = new Date();
  const scheduledAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const targetDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const goalId = "10000000-0000-4000-8000-000000000001";
  const whyId = "10000000-0000-4000-8000-000000000002";
  const roadmapId = "10000000-0000-4000-8000-000000000003";
  const stepId = "10000000-0000-4000-8000-000000000004";
  const activityId = "10000000-0000-4000-8000-000000000005";

  await insertFixtureRows(supabase, [
    {
      table: "goals",
      data: {
        id: goalId,
        user_id: userId,
        title: "DEMO — Menyelesaikan portofolio belajar",
        description: "Contoh data lokal PERINTIS; bukan data production.",
        category: "Belajar",
        target_date: targetDate,
      },
    },
    {
      table: "goal_whys",
      data: {
        id: whyId,
        goal_id: goalId,
        user_id: userId,
        statement: "DEMO — Saya ingin melihat perkembangan dari usaha kecil yang konsisten.",
      },
    },
    {
      table: "roadmaps",
      data: {
        id: roadmapId,
        goal_id: goalId,
        user_id: userId,
        title: "DEMO — Langkah portofolio",
      },
    },
    {
      table: "roadmap_steps",
      data: {
        id: stepId,
        roadmap_id: roadmapId,
        user_id: userId,
        title: "DEMO — Pilih satu karya untuk dikembangkan",
        description: "Langkah contoh untuk data lokal.",
        position: 0,
        status: "not_started",
      },
    },
    {
      table: "activities",
      data: {
        id: activityId,
        user_id: userId,
        roadmap_step_id: stepId,
        title: "DEMO — Kumpulkan ide portofolio",
        description: "Contoh aktivitas lokal yang dapat dijadwalkan.",
        scheduled_at: scheduledAt.toISOString(),
      },
    },
  ]);

  console.log("Fixture demo lokal siap; kredensial tersimpan di supabase/.temp.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Fixture demo lokal gagal.");
  process.exitCode = 1;
});
