/**
 * End-to-end API tests.
 *
 *   pnpm dev            (terminal 1)
 *   pnpm test:api       (terminal 2)
 *
 * Hits a running server with real Neon and real Groq — no mocks. This is the
 * suite to run before the demo: it exercises every endpoint, every failure
 * path, and the two behaviours the whole project rests on (cross-application
 * detection and retroactive re-flagging).
 *
 * Every application it creates uses CNICs in the 99999-* range so its data is
 * trivially distinguishable from the seed set.
 */

const BASE = process.env.API_URL ?? 'http://localhost:3000';

let passed = 0;
let failed = 0;
const failures: string[] = [];

const c = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
};

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ${c.green('✓')} ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ${c.red('✗')} ${label}${detail ? c.dim(`  — ${detail}`) : ''}`);
  }
}

function group(title: string) {
  console.log(`\n${c.bold(title)}`);
}

/** Session cookie, captured at sign-in and replayed on officer requests. */
let cookie = '';

async function api(
  method: string,
  path: string,
  body?: unknown,
  opts: { anonymous?: boolean } = {},
): Promise<{ status: number; json: any }> {
  const headers: Record<string, string> = {
    // Better Auth's CSRF protection rejects any cookie-bearing request that
    // arrives without an Origin header (MISSING_OR_NULL_ORIGIN, 403). Browsers
    // always send one; a bare fetch client has to say so explicitly.
    origin: BASE,
  };
  if (body) headers['content-type'] = 'application/json';
  if (cookie && !opts.anonymous) headers.cookie = cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Only the auth endpoints issue a session. Capturing set-cookie from every
  // response would let an unrelated cookie clobber the session and turn the
  // rest of the suite into a cascade of 401s.
  if (path.startsWith('/api/auth/') && !opts.anonymous) {
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      cookie = setCookie
        .split(/,(?=[^;]+?=)/)
        .map((c) => c.split(';')[0]!.trim())
        .join('; ');
    }
  }
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { __unparseable: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

/* ─────────────────────── application fixtures ────────────────────── */

const uniq = Date.now().toString().slice(-7);

function applicant(overrides: Record<string, unknown> = {}) {
  return {
    cnic: `99999-${uniq}-1`,
    fullName: 'Test Applicant',
    dob: '1992-05-15',
    cnicExpiry: '2032-05-15',
    city: 'Lahore',
    area: 'Gulberg',
    residenceType: 'owned',
    yearsAtAddress: 5,
    employmentType: 'salaried',
    employerName: 'Test Corp',
    incomeSource: 'salary',
    declaredIncomePkr: 150_000,
    accountPurpose: 'personal_use',
    expectedVolumePkr: 90_000,
    expectedTxnCount: 20,
    counterparties: 'domestic',
    isPep: false,
    existingBankRelationship: true,
    meta: {
      deviceFingerprint: `fp-test-${uniq}`,
      agentPointId: 'TST-001',
      sessionCity: 'Lahore',
    },
    ...overrides,
  };
}

/* ──────────────────────────── the suite ──────────────────────────── */

async function main() {
  console.log(c.bold(`\nParakh API tests  ${c.dim(BASE)}`));

  /* ---- auth ---- */
  group('Authentication');
  {
    const anon = await api('GET', '/api/cases', undefined, { anonymous: true });
    check('officer endpoints reject anonymous callers', anon.status === 401, `got ${anon.status}`);
    check('rejection is JSON, not an HTML error page', anon.json.error === 'unauthenticated');

    const anonDash = await api('GET', '/api/dashboard', undefined, { anonymous: true });
    check('dashboard is protected', anonDash.status === 401, `got ${anonDash.status}`);

    const anonDecide = await api(
      'POST',
      '/api/decisions',
      { caseId: '00000000-0000-4000-8000-000000000000', action: 'approve', justification: 'Should never be recorded.' },
      { anonymous: true },
    );
    check('decisions are protected', anonDecide.status === 401, `got ${anonDecide.status}`);

    const wrongPassword = await api('POST', '/api/auth/sign-in/email', {
      email: 'sana.rehman@parakh.pk',
      password: 'wrong-password-entirely',
    });
    check('wrong password is rejected', wrongPassword.status >= 400, `got ${wrongPassword.status}`);

    const signUp = await api('POST', '/api/auth/sign-up/email', {
      name: 'Intruder',
      email: `intruder-${uniq}@example.com`,
      password: 'intruder-password',
    });
    check('self sign-up is disabled', signUp.status >= 400, `got ${signUp.status}`);

    const signIn = await api('POST', '/api/auth/sign-in/email', {
      email: 'sana.rehman@parakh.pk',
      password: 'parakh-demo-2026',
    });
    check('valid credentials sign in', signIn.status === 200, `got ${signIn.status}`);
    check('session cookie was issued', cookie.length > 0);

    const me = await api('GET', '/api/officers');
    check('session resolves to the right officer', me.json.officer?.email === 'sana.rehman@parakh.pk');
    check('officer roster is not exposed', me.json.items === undefined);
    console.log(c.dim(`    signed in as ${me.json.officer?.name} (${me.json.officer?.role})`));
  }

  /* ---- health ---- */
  group('Health');
  {
    const { status, json } = await api('GET', '/api/health');
    check('responds', status === 200 || status === 503, `got ${status}`);
    check('database reachable', json.checks?.database?.ok === true, json.checks?.database?.detail);
    check('groq reachable and model valid', json.checks?.groq?.ok === true, json.checks?.groq?.detail);
    if (json.checks?.database?.ok) {
      console.log(c.dim(`    database: ${json.checks.database.detail} (${json.checks.database.ms}ms)`));
    }
    if (json.checks?.groq?.ok) {
      console.log(c.dim(`    groq:     ${json.checks.groq.detail} (${json.checks.groq.ms}ms)`));
    }
  }

  /* ---- validation ---- */
  group('Validation — bad input must never 500');
  {
    const bad = await api('POST', '/api/applications', { cnic: 'nope' });
    check('rejects malformed body with 400', bad.status === 400, `got ${bad.status}`);
    check('returns a machine-readable error code', bad.json.error === 'validation_failed');
    check('names the offending fields', Array.isArray(bad.json.issues) && bad.json.issues.length > 0);

    const badCnic = await api('POST', '/api/applications', applicant({ cnic: '1234' }));
    const cnicIssue = badCnic.json.issues?.find((i: any) => i.field === 'cnic');
    check('explains the CNIC format', cnicIssue?.message?.includes('00000-0000000-0'), cnicIssue?.message);

    const notJson = await fetch(`${BASE}/api/applications`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json at all',
    });
    check('rejects non-JSON with 400', notJson.status === 400, `got ${notJson.status}`);

    const badId = await api('GET', '/api/cases/not-a-uuid');
    check('malformed case id gives 400 not 500', badId.status === 400, `got ${badId.status}`);

    const missing = await api('GET', '/api/cases/00000000-0000-4000-8000-000000000000');
    check('unknown case id gives 404', missing.status === 404, `got ${missing.status}`);
  }

  /* ---- clean applicant ---- */
  group('Clean applicant → low risk, auto-approved');
  let cleanRef = '';
  {
    // Applicants have no account yet — this endpoint must stay public.
    const { status, json } = await api('POST', '/api/applications', applicant(), { anonymous: true });
    check('accepted with 201 without any session', status === 201, `got ${status}: ${JSON.stringify(json).slice(0, 120)}`);
    check('returns a reference', typeof json.reference === 'string' && json.reference.startsWith('PK-'));
    check('approved outright', json.status === 'approved', json.status);
    check('leaks no risk level to the applicant', json.riskLevel === undefined);
    check('leaks no reasoning to the applicant', json.reasoning === undefined);
    check('leaks no signals to the applicant', json.signals === undefined);
    cleanRef = json.reference;
    console.log(c.dim(`    ${cleanRef}`));
  }

  /* ---- duplicate guard ---- */
  group('Duplicate submission');
  {
    const { status, json } = await api('POST', '/api/applications', applicant());
    check('second submission within a minute is rejected', status === 409, `got ${status}`);
    check('error names the earlier reference', json.message?.includes(cleanRef), json.message);
  }

  /* ---- risky applicant ---- */
  group('Contradictory applicant → high risk, EDD queue');
  let riskyCaseId = '';
  {
    const { status, json } = await api(
      'POST',
      '/api/applications',
      applicant({
        cnic: `99999-${uniq}-2`,
        fullName: 'Contradictory Applicant',
        dob: '2005-01-10',
        employmentType: 'salaried',
        incomeSource: 'business',
        declaredIncomePkr: 40_000,
        expectedVolumePkr: 450_000,
        counterparties: 'international',
        yearsAtAddress: 0.2,
        existingBankRelationship: false,
        accountPurpose: 'receive_business_payments',
        meta: { deviceFingerprint: `fp-risky-${uniq}`, agentPointId: 'TST-002', sessionCity: 'Lahore' },
      }),
    );
    check('accepted with 201', status === 201, `got ${status}`);
    check('held for review', json.status === 'under_review', json.status);

    const queue = await api('GET', '/api/cases?status=edd_queue');
    const found = queue.json.items?.find((i: any) => i.reference === json.reference);
    check('landed in the EDD queue', Boolean(found), 'not found in queue');
    check('scored high', found?.riskLevel === 'high', found?.riskLevel);
    riskyCaseId = found?.caseId ?? '';

    if (riskyCaseId) {
      const detail = await api('GET', `/api/cases/${riskyCaseId}`);
      const sigs = detail.json.signals ?? [];
      const names = sigs.map((s: any) => s.name);
      check('detected income–volume mismatch', names.includes('income_volume_mismatch'));
      check('detected source–employment conflict', names.includes('source_employment_conflict'));
      check('detected address instability', names.includes('address_instability'));
      check('every signal reads two or more fields', sigs.every((s: any) => s.fields.length >= 2));
      // The invariant is that evidence shows the concrete declared values, not
      // that it contains digits — a categorical contradiction like
      // `employment "salaried" · income source "business"` has no figures and
      // is still exactly the right evidence. What it must never be is a
      // restatement of the label.
      check(
        'every signal shows concrete values, not a restatement of its label',
        sigs.every(
          (s: any) =>
            (/\d/.test(s.evidence) || /"/.test(s.evidence)) &&
            s.evidence.toLowerCase() !== s.label.toLowerCase(),
        ),
        sigs.find((s: any) => !/\d|"/.test(s.evidence))?.evidence,
      );
      check('reasoning is substantial', (detail.json.risk?.reasoning?.length ?? 0) > 80);
      check(
        'reasoning contains no machine names',
        !/_[a-z]+_/.test(detail.json.risk?.reasoning ?? ''),
        detail.json.risk?.reasoning?.slice(0, 80),
      );
      console.log(c.dim(`    model: ${detail.json.risk?.model} · ${detail.json.risk?.latencyMs}ms`));
      console.log(c.dim(`    "${detail.json.risk?.reasoning?.slice(0, 150)}…"`));
    }
  }

  /* ---- the cluster ---- */
  group('Cross-application detection — the differentiator');
  const ringDevice = `fp-ring-${uniq}`;
  const ringAgent = `TST-RING-${uniq.slice(-3)}`;
  const ringRefs: string[] = [];
  let firstRingCaseId = '';
  {
    const member = (n: number) =>
      applicant({
        cnic: `99999-${uniq}-${n + 2}`,
        fullName: `Ring Member ${n}`,
        employmentType: 'self_employed',
        incomeSource: 'business',
        declaredIncomePkr: 60_000 + n * 1000,
        expectedVolumePkr: 130_000,
        accountPurpose: 'receive_business_payments',
        yearsAtAddress: 3,
        existingBankRelationship: true,
        meta: { deviceFingerprint: ringDevice, agentPointId: ringAgent, sessionCity: 'Lahore' },
      });

    // First member — nothing to compare against, must look clean.
    const first = await api('POST', '/api/applications', member(1));
    check('first ring member is accepted', first.status === 201, `got ${first.status}`);
    check('first ring member looks clean in isolation', first.json.status === 'approved', first.json.status);
    ringRefs.push(first.json.reference);

    const secondRes = await api('POST', '/api/applications', member(2));
    ringRefs.push(secondRes.json.reference);

    const thirdRes = await api('POST', '/api/applications', member(3));
    ringRefs.push(thirdRes.json.reference);
    check('third ring member is held for review', thirdRes.json.status === 'under_review', thirdRes.json.status);

    const all = await api('GET', '/api/cases');
    const byRef = (ref: string) => all.json.items?.find((i: any) => i.reference === ref);

    const third = byRef(ringRefs[2]!);
    check('third member scored high', third?.riskLevel === 'high', third?.riskLevel);
    check('third member carries a cluster reference', Boolean(third?.clusterRef), 'no clusterRef');

    if (third?.caseId) {
      const detail = await api('GET', `/api/cases/${third.caseId}`);
      const names = (detail.json.signals ?? []).map((s: any) => s.name);
      check('detected device reuse', names.includes('device_reuse'));
      check('detected agent-point clustering', names.includes('agent_point_clustering'));
      check('cluster is attached to the case', Boolean(detail.json.cluster), 'no cluster');
      console.log(c.dim(`    cluster: ${detail.json.cluster?.summary}`));
    }

    // Retroactive re-flagging — the first member should no longer be approved.
    const first2 = byRef(ringRefs[0]!);
    firstRingCaseId = first2?.caseId ?? '';
    check(
      'first member was retroactively re-flagged',
      first2?.status === 'edd_queue',
      `status is ${first2?.status}`,
    );
    check('first member re-scored to high', first2?.riskLevel === 'high', first2?.riskLevel);

    if (firstRingCaseId) {
      const detail = await api('GET', `/api/cases/${firstRingCaseId}`);
      check(
        'its reasoning explains the retroactive change',
        /later application|pattern/i.test(detail.json.risk?.reasoning ?? ''),
        detail.json.risk?.reasoning?.slice(0, 80),
      );
    }
  }

  /* ---- filters ---- */
  group('Queue filters');
  {
    const high = await api('GET', '/api/cases?risk=high');
    check('risk filter returns only high', high.json.items?.every((i: any) => i.riskLevel === 'high'));

    const edd = await api('GET', '/api/cases?status=edd_queue');
    check('status filter returns only the queue', edd.json.items?.every((i: any) => i.status === 'edd_queue'));

    const sorted = edd.json.items ?? [];
    const order = { high: 0, medium: 1, low: 2 } as any;
    const isSorted = sorted.every(
      (item: any, i: number) => i === 0 || order[sorted[i - 1].riskLevel] <= order[item.riskLevel],
    );
    check('queue is sorted by risk', isSorted);

    const cluster = await api('GET', `/api/cases?cluster=nonexistent`);
    check('unknown cluster filter returns empty, not an error', cluster.status === 200 && cluster.json.count === 0);
  }

  /* ---- decisions ---- */
  group('Officer decisions');
  {
    const short = await api('POST', '/api/decisions', {
      caseId: riskyCaseId,
      action: 'approve',
      justification: 'ok',
    });
    check('rejects a too-short justification', short.status === 400, `got ${short.status}`);

    const badCase = await api('POST', '/api/decisions', {
      caseId: '00000000-0000-4000-8000-000000000000',
      action: 'approve',
      justification: 'This justification is definitely long enough.',
    });
    check('rejects an unknown case with 404', badCase.status === 404, `got ${badCase.status}`);

    const before = await api('GET', '/api/dashboard');

    const decision = await api('POST', '/api/decisions', {
      caseId: riskyCaseId,
      action: 'approve',
      justification: 'Verified the employer directly by phone. Income source was misdeclared at onboarding; corrected on file.',
    });
    check('accepts a valid decision', decision.status === 200, `got ${decision.status}`);
    check('attributes it to the session officer', decision.json.decidedBy === 'Sana Rehman', decision.json.decidedBy);

    const repeat = await api('POST', '/api/decisions', {
      caseId: riskyCaseId,
      action: 'reject',
      justification: 'Trying to overwrite the previous decision on this case.',
    });
    check('refuses to re-decide a resolved case', repeat.status === 409, `got ${repeat.status}`);

    const detail = await api('GET', `/api/cases/${riskyCaseId}`);
    check('case status changed to approved', detail.json.status === 'approved', detail.json.status);
    check('audit trail has one entry', detail.json.history?.length === 1);

    const entry = detail.json.history?.[0];
    check('audit entry snapshots the risk level', entry?.riskSnapshot === 'high', entry?.riskSnapshot);
    check('audit entry snapshots the reasoning', (entry?.reasoningSnapshot?.length ?? 0) > 80);
    check('audit entry records the justification', entry?.justification?.includes('Verified the employer'));
    check('audit entry names the session officer', entry?.officer === 'Sana Rehman', entry?.officer);

    const after = await api('GET', '/api/dashboard');
    check(
      'dashboard resolved count moved',
      after.json.stats.resolvedToday > before.json.stats.resolvedToday,
      `${before.json.stats.resolvedToday} → ${after.json.stats.resolvedToday}`,
    );
  }

  /* ---- dashboard ---- */
  group('Dashboard');
  {
    const { status, json } = await api('GET', '/api/dashboard');
    check('responds 200', status === 200);
    check('reports application volume', typeof json.stats?.applicationsToday === 'number');
    check('reports EDD queue depth', typeof json.stats?.inEddQueue === 'number');
    check('reports a risk distribution', typeof json.distribution?.high === 'number');
    check('lists active clusters', Array.isArray(json.clusters));
    check('found our test cluster', json.clusters?.some((c: any) => c.summary.includes(ringAgent) || c.kind === 'device_reuse'));
    console.log(c.dim(`    ${JSON.stringify(json.stats)}`));
    console.log(c.dim(`    ${JSON.stringify(json.distribution)}`));
  }

  /* ---- summary ---- */
  const total = passed + failed;
  console.log(`\n${'─'.repeat(60)}`);
  if (failed === 0) {
    console.log(c.green(c.bold(`  ${passed}/${total} checks passed`)));
  } else {
    console.log(c.red(c.bold(`  ${failed} of ${total} checks FAILED`)));
    for (const f of failures) console.log(c.red(`    · ${f}`));
  }
  console.log(`${'─'.repeat(60)}\n`);

  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(c.red(`\nSuite crashed: ${err instanceof Error ? err.message : String(err)}`));
  console.error(c.dim('Is the dev server running?  pnpm dev'));
  process.exit(1);
});
