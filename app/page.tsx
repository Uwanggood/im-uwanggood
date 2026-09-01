'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

type MatchProof = {
  signals: string[];
  text: string;
};

type ProjectMedia = {
  src: string;
  alt: string;
  caption: string;
};

export type Project = {
  id: string;
  period: string;
  timelineYear: string;
  status: 'In operation' | 'Completed';
  category: string;
  title: string;
  company: string;
  role: string;
  perspective: string;
  archiveNote: string;
  summary: string;
  lead: string;
  startingPoint: string;
  build: string;
  outcome: string;
  stack: string[];
  tags: string[];
  matchProofs: MatchProof[];
  flow: string[];
  colors: [string, string, string];
  media?: ProjectMedia[];
};

type ProjectScope = 'all' | 'work' | 'personal';

type CodeCategory = 'Frontend' | 'Backend' | 'Database' | 'Model' | 'Query';

type CodeProof = {
  id: string;
  category: CodeCategory;
  product: string;
  label: string;
  title: string;
  summary: string;
  evidence: string;
  language: string;
  file: string;
  status: string;
  code: string[];
};

const codeCategories: CodeCategory[] = [
  'Frontend',
  'Backend',
  'Database',
  'Model',
  'Query',
];

const syntaxKeywords = new Set([
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'def',
  'else',
  'export',
  'extends',
  'final',
  'for',
  'from',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'private',
  'public',
  'raise',
  'return',
  'static',
  'switch',
  'throw',
  'try',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

const syntaxLiterals = new Set([
  'false',
  'False',
  'None',
  'null',
  'true',
  'True',
  'undefined',
]);

const syntaxTokenPattern =
  /(\/\/.*$|#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b\d+(?:\.\d+)?\b|(?:=>|->|===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||[=+\-*/<>!:?])|\b[A-Za-z_$][\w$]*\b/g;

function highlightCodeLine(line: string): ReactNode[] | string {
  if (!line) return ' ';

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(syntaxTokenPattern)) {
    const index = match.index ?? 0;
    const value = match[0];

    if (index > cursor) nodes.push(line.slice(cursor, index));

    let className = 'syntax-variable';
    if (value.startsWith('//') || value.startsWith('#')) {
      className = 'syntax-comment';
    } else if (/^["'`]/.test(value)) {
      className = 'syntax-string';
    } else if (/^\d/.test(value)) {
      className = 'syntax-number';
    } else if (syntaxKeywords.has(value)) {
      className = 'syntax-keyword';
    } else if (syntaxLiterals.has(value)) {
      className = 'syntax-literal';
    } else if (/^[A-Z]/.test(value)) {
      className = 'syntax-type';
    } else if (/^[=+\-*/<>!:?&|]/.test(value)) {
      className = 'syntax-operator';
    } else if (line[index - 1] === '.') {
      className = 'syntax-property';
    } else if (/^\s*\(/.test(line.slice(index + value.length))) {
      className = 'syntax-function';
    }

    nodes.push(
      <span className={className} key={`${index}-${value}`}>
        {value}
      </span>,
    );
    cursor = index + value.length;
  }

  if (cursor < line.length) nodes.push(line.slice(cursor));
  return nodes;
}

const codeProofs: CodeProof[] = [
  {
    id: 'react-request-identity',
    category: 'Frontend',
    product: 'React · TypeScript',
    label: 'Request identity guard',
    title: '이전 요청의 응답이 새 화면을 덮어쓰지 못하게 막습니다.',
    summary:
      '실제 React 화면의 다운로드 URL 요청과 후속 fetch를 각각 취소하고, 요청 객체와 탐색 버전을 함께 검사합니다.',
    evidence: 'Dual abort · request identity · bounded cache',
    language: 'TypeScript / React',
    file: 'useLayerAssets.ts',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'const loadResource = async () => {',
      '  if (!canStartRequest()) return;',
      '',
      '  const requestVersion = navigationVersionRef.current;',
      '  requestRef.current?.abort();',
      '  fetchControllerRef.current?.abort();',
      '',
      '  const cached = resourceCache[cacheKey];',
      '  if (cached) {',
      '    setResource(cached);',
      '    return;',
      '  }',
      '',
      '  const request = downloadUrlTrigger(params);',
      '  requestRef.current = request;',
      '  try {',
      '    const response = await request.unwrap();',
      '    const controller = new AbortController();',
      '    fetchControllerRef.current = controller;',
      '    const jsonResponse = await fetch(response.downloadUrl, {',
      '      signal: controller.signal,',
      '    });',
      "    if (!jsonResponse.ok) throw new Error('Resource not found');",
      '    const payload = await jsonResponse.json();',
      '',
      '    if (requestRef.current !== request ||',
      '        requestVersion !== navigationVersionRef.current) return;',
      '',
      '    const resources = Array.isArray(payload)',
      '      ? payload',
      '      : Array.isArray(payload?.resources) ? payload.resources : [];',
      '    setResource(resources);',
      '    setResourceCache(previous => {',
      '      const current = { ...previous };',
      '      if (Object.keys(current).length > MAX_CACHE_SIZE) {',
      '        delete current[Object.keys(current)[0]];',
      '      }',
      '      return { ...current, [cacheKey]: resources };',
      '    });',
      '  } finally {',
      '    if (requestRef.current === request) requestRef.current = null;',
      '  }',
      '}',
    ],
  },
  {
    id: 'typescript-mask-dilation',
    category: 'Frontend',
    product: 'TypeScript · Canvas',
    label: 'O(N × 4) mask dilation',
    title: '반경 제곱 탐색을 네 번의 선형 스캔으로 바꿉니다.',
    summary:
      '실제 세그멘테이션 평가 코드에서 수평·수직 양방향 거리 스캔으로 Chebyshev dilation을 계산합니다.',
    evidence: 'Typed array · separable pass · O(N) complexity',
    language: 'TypeScript',
    file: 'segEval.ts',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'function dilateBinaryMask(mask: Uint8Array, w: number, h: number, r: number) {',
      '  if (r <= 0) return mask;',
      '  const cap = r + 1;',
      '  const horizontal = new Uint8Array(mask.length);',
      '',
      '  for (let y = 0; y < h; y++) {',
      '    const row = y * w;',
      '    let distance = cap;',
      '    for (let x = 0; x < w; x++) {',
      '      if (mask[row + x]) distance = 0;',
      '      else if (distance < cap) distance++;',
      '      if (distance <= r) horizontal[row + x] = 1;',
      '    }',
      '    distance = cap;',
      '    for (let x = w - 1; x >= 0; x--) {',
      '      if (mask[row + x]) distance = 0;',
      '      else if (distance < cap) distance++;',
      '      if (distance <= r) horizontal[row + x] = 1;',
      '    }',
      '  }',
      '',
      '  const output = new Uint8Array(mask.length);',
      '  for (let x = 0; x < w; x++) {',
      '    let distance = cap;',
      '    for (let y = 0; y < h; y++) {',
      '      const index = y * w + x;',
      '      if (horizontal[index]) distance = 0;',
      '      else if (distance < cap) distance++;',
      '      if (distance <= r) output[index] = 1;',
      '    }',
      '    distance = cap;',
      '    for (let y = h - 1; y >= 0; y--) {',
      '      const index = y * w + x;',
      '      if (horizontal[index]) distance = 0;',
      '      else if (distance < cap) distance++;',
      '      if (distance <= r) output[index] = 1;',
      '    }',
      '  }',
      '  return output;',
      '}',
    ],
  },
  {
    id: 'flutter-native-runtime',
    category: 'Frontend',
    product: 'Flutter · ONNX Runtime',
    label: 'Native tensor lifecycle',
    title: '로컬 모델의 텐서 수명을 캐시 소유권과 함께 관리합니다.',
    summary:
      '이미지 전처리는 isolate로 분리하고, native 출력이 캐시에 이관되지 못한 모든 경로에서 메모리를 해제합니다.',
    evidence: 'Isolate preprocessing · native ownership · failure-safe dispose',
    language: 'Dart 3 / Flutter',
    file: 'local_model_runtime.dart',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'Future<void> prepareEmbedding(String key, Uint8List bytes) async {',
      '  if (_cache.containsKey(key)) return;',
      '  await _clearEmbeddingsExcept(key);',
      '',
      '  final prepared = await Isolate.run(() => preprocessImage(bytes));',
      '  final input = await OrtValue.fromList(prepared.input, [1, 3, size, size]);',
      '  Map<String, OrtValue>? outputs;',
      '  var cacheStored = false;',
      '',
      '  try {',
      '    outputs = await encoder',
      '        .run({inputName: input}, options: OrtRunOptions())',
      '        .timeout(const Duration(minutes: 5));',
      '',
      '    final tensors = {',
      '      for (final entry in outputs.entries)',
      '        entry.key: (value: entry.value, shape: entry.value.shape),',
      '    };',
      '    final embedding = tensors[embeddingName];',
      "    if (embedding == null) throw StateError('Missing encoder output');",
      '',
      '    _cache[key] = (',
      '      embedding: embedding,',
      '      extras: {',
      '        for (final name in extraOutputNames)',
      '          if (tensors[name] != null) name: tensors[name]!,',
      '      },',
      '      scale: prepared.scale,',
      '      originalHeight: prepared.originalHeight,',
      '      originalWidth: prepared.originalWidth,',
      '      paddedHeight: prepared.paddedHeight,',
      '      paddedWidth: prepared.paddedWidth,',
      '    );',
      '    cacheStored = true;',
      '  } finally {',
      '    await input.dispose();',
      '    if (!cacheStored) await disposeValues(outputs?.values);',
      '  }',
      '}',
    ],
  },
  {
    id: 'java-collision-rescheduler',
    category: 'Backend',
    product: 'Java · Scheduler',
    label: 'Recursive collision repair',
    title: '겹친 작업의 우선순위를 따라 충돌 연쇄를 재배치합니다.',
    summary:
      '실제 스케줄러에서 높은 우선순위 작업은 유지하고 밀려난 작업을 다음 충돌까지 재귀적으로 이동시킵니다.',
    evidence: 'Priority ordering · cycle guard · recursive displacement',
    language: 'Java 17',
    file: 'JobSchedulerServiceImpl.java',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'void repairCollision(Map<String, Object> target,',
      '    Map<Integer, List<Map<String, Object>>> schedules) {',
      '  var start = (LocalDateTime) target.get("startTime");',
      '  var end = (LocalDateTime) target.get("endTime");',
      '  var resourceId = (Integer) target.get("resourceId");',
      '  var timeline = schedules.getOrDefault(resourceId, new ArrayList<>());',
      '  var duration = Duration.between(start, end).toMinutes();',
      '',
      '  for (var current : timeline) {',
      '    if (target == current) { target.put("included", true); continue; }',
      '    var currentStart = (LocalDateTime) current.get("startTime");',
      '    var currentEnd = (LocalDateTime) current.get("endTime");',
      '    if (isNotOverlap(start, end, currentStart, currentEnd)) continue;',
      '    if (createsCycle(target, current)) {',
      '      target.replace("startTime", target.get("previousStartTime"));',
      '      target.replace("endTime", target.get("previousEndTime"));',
      '      target.put("fault", true);',
      '      return;',
      '    }',
      '',
      '    if (hasHigherPriority(target, current)) {',
      '      var currentDuration = Duration.between(currentStart, currentEnd).toMinutes();',
      '      current.put("collisionParent", snapshot(target));',
      '      current.put("previousStartTime", start);',
      '      current.put("previousEndTime", end);',
      '      current.replace("startTime", end);',
      '      current.replace("endTime", end.plusMinutes(currentDuration));',
      '      repairCollision(current, schedules);',
      '    } else {',
      '      target.put("collisionParent", snapshot(current));',
      '      target.put("startTime", currentEnd);',
      '      target.put("endTime", currentEnd.plusMinutes(duration));',
      '      repairCollision(target, schedules);',
      '    }',
      '    break;',
      '  }',
      '',
      '  if (!target.containsKey("included") && !target.containsKey("fault")) {',
      '    target.put("included", true);',
      '    timeline.add(target);',
      '    schedules.put(resourceId, timeline);',
      '  }',
      '}',
    ],
  },
  {
    id: 'python-bounded-batch',
    category: 'Backend',
    product: 'Python · asyncio',
    label: 'Bounded partial success',
    title: '순서는 유지하면서 항목별 실패와 전체 취소를 구분합니다.',
    summary:
      '실제 배치 복사 API에서 semaphore로 I/O 동시성을 제한하고 Exception은 부분 실패로, BaseException은 취소로 전파합니다.',
    evidence: 'Semaphore · stable ordering · cancellation semantics',
    language: 'Python 3.12 / asyncio',
    file: 'batch_copy.py',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'async def copy_batch(prepared_items):',
      '    semaphore = asyncio.Semaphore(BATCH_COPY_CONCURRENCY)',
      '',
      '    async def copy_with_limit(prepared):',
      '        async with semaphore:',
      '            return await copy_prepared_item(prepared)',
      '',
      '    results = await asyncio.gather(',
      '        *(copy_with_limit(item) for _, item in prepared_items),',
      '        return_exceptions=True,',
      '    )',
      '    responses, copied = {}, []',
      '',
      '    for (index, prepared), result in zip(',
      '        prepared_items, results, strict=True',
      '    ):',
      '        if isinstance(result, Exception):',
      '            responses[index] = failed_item(prepared.param, result)',
      '        elif isinstance(result, BaseException):',
      '            raise result',
      '        else:',
      '            copied.append((index, result))',
      '            responses[index] = success_item(result)',
      '',
      '    return responses, copied',
    ],
  },
  {
    id: 'go-latest-value-hub',
    category: 'Backend',
    product: 'Go · Realtime',
    label: 'Latest-value watch hub',
    title: '느린 구독자 때문에 발행자가 멈추지 않게 합니다.',
    summary:
      'generic watch hub가 키별 구독 채널을 관리하고, 버퍼가 찼으면 오래된 값을 버린 뒤 최신 상태만 넣습니다.',
    evidence: 'Generic hub · non-blocking publish · latest-value backpressure',
    language: 'Go 1.24',
    file: 'watch_hub.go',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'type watchHub[K comparable, V any] struct {',
      '  mu          sync.Mutex',
      '  nextID      int64',
      '  subscribers map[K]map[int64]chan *V',
      '}',
      '',
      'func (h *watchHub[K, V]) subscribe(key K) (int64, <-chan *V) {',
      '  h.mu.Lock()',
      '  defer h.mu.Unlock()',
      '  h.nextID++',
      '  channel := make(chan *V, 1)',
      '  if h.subscribers[key] == nil {',
      '    h.subscribers[key] = make(map[int64]chan *V)',
      '  }',
      '  h.subscribers[key][h.nextID] = channel',
      '  return h.nextID, channel',
      '}',
      '',
      'func (h *watchHub[K, V]) publish(key K, value *V) {',
      '  h.mu.Lock()',
      '  defer h.mu.Unlock()',
      '  for _, channel := range h.subscribers[key] {',
      '    select {',
      '    case channel <- value:',
      '    default:',
      '      select { case <-channel: default: }',
      '      select { case channel <- value: default: }',
      '    }',
      '  }',
      '}',
    ],
  },
  {
    id: 'database-safe-apply',
    category: 'Database',
    product: 'Dart · PostgreSQL',
    label: 'Lock, recheck, commit',
    title: '잠금을 잡은 뒤 라이브 상태를 다시 확인하고 적용합니다.',
    summary:
      '실제 DB 마이그레이션 도구에서 advisory lock 이후 fingerprint를 재검사하고 COMMIT 전송 여부에 따라 실패와 결과 불명을 나눕니다.',
    evidence: 'Advisory lock · TOCTOU recheck · commit ambiguity',
    language: 'Dart 3 / PostgreSQL',
    file: 'postgres_migration_gateway.dart',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'Stream<MigrationEvent> apply(FrozenMigration migration) async* {',
      '  DatabaseExecutor? executor;',
      '  var commitSent = false;',
      '  try {',
      '    executor = await factory.open(profile);',
      '    final locked = await executor.query(',
      "      'SELECT pg_try_advisory_lock(hashtextextended($1, 0))',",
      '      [migration.lockName],',
      '    );',
      '    if (locked.first["locked"] != true) return;',
      '',
      '    final live = await inspection.introspect(profile);',
      '    if (live.fingerprint != migration.liveFingerprint) {',
      '      yield const MigrationFailed(sqlState: "40001");',
      '      return;',
      '    }',
      '',
      "    await executor.query('BEGIN');",
      '    for (final statement in split(migration.upSql)) {',
      '      await executor.query(statement);',
      '    }',
      '    await writeLedger(executor, migration);',
      '    commitSent = true;',
      "    await executor.query('COMMIT');",
      '    yield const MigrationCommitted();',
      '  } catch (error) {',
      "    if (executor != null && !commitSent) await executor.query('ROLLBACK');",
      '    yield commitSent',
      '        ? MigrationResultUnknown(error)',
      '        : MigrationFailed.from(error);',
      '  } finally {',
      "    await executor?.query('SELECT pg_advisory_unlock_all()');",
      '    await executor?.close();',
      '  }',
      '}',
    ],
  },
  {
    id: 'database-immutable-archive',
    category: 'Database',
    product: 'Dart · Filesystem',
    label: 'Immutable migration archive',
    title: '해시가 맞는 완전한 마이그레이션만 원자적으로 보관합니다.',
    summary:
      '임시 디렉터리에 SQL과 보안 메타데이터를 flush한 뒤 rename하고, 다시 읽을 때 manifest와 각 파일의 SHA-256을 검증합니다.',
    evidence: 'Atomic rename · checksums · immutable archive',
    language: 'Dart 3',
    file: 'migration_archive_repository.dart',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'Future<FrozenMigration> freeze(MigrationPlan plan, SqlBundle sql) async {',
      '  if (plan.hasConflicts || plan.operations.any((op) => !op.supported)) {',
      "    throw InvalidArchive('Only a verified plan can be frozen');",
      '  }',
      '  if (await Directory(destination).exists()) {',
      "    throw ArchiveExists('Migration is immutable');",
      '  }',
      '',
      '  final temporary = Directory(temporaryPath);',
      '  await temporary.create();',
      '  try {',
      '    final manifest = buildManifest(',
      '      upSha256: sha256(sql.upSql),',
      '      rollbackSha256: sql.rollbackSql == null',
      '          ? null',
      '          : sha256(sql.rollbackSql!),',
      '      targetFingerprint: plan.target.fingerprint,',
      '    );',
      '    await write(temporary, "up.sql", sql.upSql, flush: true);',
      '    await write(temporary, "manifest.yaml", encode(manifest), flush: true);',
      '    await temporary.rename(destination);',
      '    return load(destination);',
      '  } catch (_) {',
      '    if (await temporary.exists()) await temporary.delete(recursive: true);',
      '    rethrow;',
      '  }',
      '}',
      '',
      'if (sha256(await upFile.readAsString()) != manifest.upSha256) {',
      "  throw ChecksumMismatch('up.sql does not match manifest');",
      '}',
    ],
  },
  {
    id: 'model-multiscale-sequence-net',
    category: 'Model',
    product: 'PyTorch · CNN',
    label: 'Multi-scale sequence model',
    title: '서로 다른 단계의 특징을 같은 해상도로 정렬해 결합합니다.',
    summary:
      '실제 문자 인식 모델에서 비대칭 convolution, residual·SE block과 multi-scale context를 하나의 sequence logits로 만듭니다.',
    evidence: 'Residual SE block · multi-scale fusion · device-aware resize',
    language: 'Python / PyTorch',
    file: 'sequence_net.py',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'def align_feature_map(feature, target_size):',
      '    height, width = feature.shape[-2:]',
      '    target_height, target_width = target_size',
      '    if feature.device.type == "mps" and (',
      '        height % target_height != 0 or width % target_width != 0',
      '    ):',
      '        return F.interpolate(',
      '            feature, size=target_size, mode="bilinear", align_corners=False',
      '        ).contiguous()',
      '    return F.adaptive_avg_pool2d(feature, target_size)',
      '',
      'def forward(self, x):',
      '    f1 = self.stage1(x)',
      '    f2 = self.stage2(self.pool1(f1))',
      '    f3 = self.stage3(self.down2(f2))',
      '    f4 = self.stage4(self.down3(f3))',
      '    target_size = (f4.size(2), f4.size(3))',
      '',
      '    context = []',
      '    for feature, norm in zip([f1, f2, f3, f4], self.align_norms):',
      '        context.append(norm(align_feature_map(feature, target_size)))',
      '',
      '    fused = self.container(torch.cat(context, dim=1))',
      '    return torch.mean(fused, dim=2)',
    ],
  },
  {
    id: 'model-focal-ctc-loss',
    category: 'Model',
    product: 'PyTorch · CTC',
    label: 'Focal CTC loss',
    title: 'CTC의 어려운 시퀀스에 학습 신호를 더 집중시킵니다.',
    summary:
      '실제 OCR 학습 코드의 per-sample CTC loss에서 정답 시퀀스 확률을 복원해 focal weight를 적용합니다.',
    evidence: 'Per-sample CTC · zero infinity · hard-sequence weighting',
    language: 'Python / PyTorch',
    file: 'model_util.py',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'class FocalCTCLoss(nn.Module):',
      '    def __init__(self, blank: int, gamma=2.0, reduction="mean"):',
      '        super().__init__()',
      '        self.ctc = nn.CTCLoss(',
      '            blank=blank, reduction="none", zero_infinity=True',
      '        )',
      '        self.gamma = gamma',
      '        self.reduction = reduction',
      '',
      '    def forward(self, log_probs, targets, input_lengths, target_lengths):',
      '        loss = self.ctc(log_probs, targets, input_lengths, target_lengths)',
      '        sequence_probability = torch.exp(-loss)',
      '        focal_weight = (1 - sequence_probability) ** self.gamma',
      '        focal_loss = focal_weight * loss',
      '',
      '        match self.reduction:',
      '            case "mean":',
      '                return focal_loss.mean()',
      '            case "sum":',
      '                return focal_loss.sum()',
      '            case _:',
      '                raise ValueError(self.reduction)',
    ],
  },
  {
    id: 'model-distributed-training',
    category: 'Model',
    product: 'PyTorch · DDP',
    label: 'AMP training step',
    title: '분산 배치와 mixed precision에서도 같은 최적화 의미를 지킵니다.',
    summary:
      '실제 모델 학습 루프에서 global batch 보정, GradScaler, unscale 이후 gradient clipping과 동기화된 계측을 처리합니다.',
    evidence: 'DDP scaling · AMP · unscaled gradient clipping',
    language: 'Python / PyTorch',
    file: 'train_sequence_model.py',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'images = images.to(device, non_blocking=device.type == "cuda")',
      'labels = labels.to(device, non_blocking=device.type == "cuda")',
      'amp_context = torch.amp.autocast("cuda") if use_amp else nullcontext()',
      '',
      'with amp_context:',
      '    logits = model(images)',
      '    log_probs = logits.permute(2, 0, 1).log_softmax(2)',
      '    batch_loss = ctc_loss(log_probs, labels, input_lengths, target_lengths)',
      '',
      'loss = batch_loss',
      'if distributed:',
      '    loss *= images.size(0) * world_size / configured_batch_size',
      '',
      'optimizer.zero_grad(set_to_none=True)',
      'if scaler is not None:',
      '    scaler.scale(loss).backward()',
      '    scaler.unscale_(optimizer)',
      '    gradient_norm = clip_grad_norm_(model.parameters(), max_norm=5.0)',
      '    scaler.step(optimizer)',
      '    scaler.update()',
      'else:',
      '    loss.backward()',
      '    gradient_norm = clip_grad_norm_(model.parameters(), max_norm=5.0)',
      '    optimizer.step()',
    ],
  },
  {
    id: 'query-outbox-claim',
    category: 'Query',
    product: 'PostgreSQL · Go',
    label: 'Concurrent outbox claim',
    title: '여러 worker가 같은 이벤트를 집지 않고 병렬 처리합니다.',
    summary:
      '실제 Go worker가 FOR UPDATE SKIP LOCKED로 배치를 선점하고 실패 횟수에 따라 다음 시도 시간을 제한된 backoff로 갱신합니다.',
    evidence: 'SKIP LOCKED · atomic claim · capped retry backoff',
    language: 'SQL / PostgreSQL',
    file: 'claim_event_outbox.sql',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'WITH picked AS (',
      '  SELECT event_id',
      '  FROM event_outbox',
      '  WHERE published_at IS NULL',
      '    AND next_attempt_at <= now()',
      '  ORDER BY event_id',
      '  LIMIT $1',
      '  FOR UPDATE SKIP LOCKED',
      ')',
      'UPDATE event_outbox AS outbox',
      'SET',
      '  attempts = outbox.attempts + 1,',
      '  next_attempt_at = now() + make_interval(',
      '    secs => LEAST(',
      '      300,',
      '      GREATEST(5, (outbox.attempts + 1) * 5)',
      '    )',
      '  )',
      'FROM picked',
      'WHERE outbox.event_id = picked.event_id',
      'RETURNING outbox.event_id, outbox.event_type;',
    ],
  },
  {
    id: 'query-migration-ordering',
    category: 'Query',
    product: 'Dart · PostgreSQL',
    label: 'Dependency-aware SQL plan',
    title: '인덱스와 외래키의 의존 순서를 깨뜨리지 않고 SQL을 만듭니다.',
    summary:
      '실제 마이그레이션 생성기가 참조 순환을 먼저 끊고, 테이블과 unique index를 만든 뒤 FK를 지연 적용하며 rollback은 역순으로 구성합니다.',
    evidence: 'Cycle handling · deferred constraints · reversible ordering',
    language: 'Dart 3 / PostgreSQL',
    file: 'postgres_migration_sql_generator.dart',
    status: 'Source-derived · identifiers anonymized',
    code: [
      'final deferredIndexes = <String>[];',
      'final deferredForeignKeys = <String>[];',
      '',
      'up.addAll(inboundCycles.map((cycle) =>',
      '  dropConstraint(cycle.child, cycle.liveKey.name),',
      '));',
      'deferredForeignKeys.addAll(inboundCycles',
      '  .where((cycle) => cycle.targetKey != null)',
      '  .map((cycle) => addForeignKey(cycle.child, cycle.targetKey!)));',
      '',
      'for (final operation in plan.operations) {',
      '  if (belongsToCycle(operation, inboundCycles)) continue;',
      '',
      '  if (operation.kind == OperationKind.createTable) {',
      '    final table = operation.afterTable!;',
      '    up.addAll(createTable(table, includeReferences: false));',
      '    deferredIndexes.addAll(table.indexes.map(addIndex));',
      '    deferredForeignKeys.addAll(table.foreignKeys.map(addForeignKey));',
      '  } else {',
      '    up.addAll(render(operation, plan));',
      '  }',
      '}',
      '',
      'up',
      '  ..addAll(deferredIndexes)',
      '  ..addAll(deferredForeignKeys.toSet());',
      '',
      'if (plan.operations.every((operation) => operation.reversible)) {',
      '  for (final operation in plan.operations.reversed) {',
      '    rollback.addAll(renderRollback(operation, plan));',
      '  }',
      '}',
    ],
  },
];

const projects: Project[] = [
  {
    id: 'venus',
    period: '2026—Current',
    timelineYear: '2026',
    status: 'In operation',
    category: 'MLOps Platform',
    title: 'AIMOS Venus 학습 운영 플랫폼',
    company: 'AIMOS',
    role: 'Solo architecture / Frontend / Backend / Agent',
    perspective: '학습 기록을 다시 찾을 수 있게',
    archiveNote:
      '모델 구조를 보여주는 화면보다 데이터셋·코드·실행 환경·결과를 같은 이력으로 묶는 데 집중했습니다.',
    summary:
      '흩어진 데이터셋과 학습 실행, metric·log·artifact를 재현 가능한 하나의 실행 이력으로 연결했습니다.',
    lead: '번호판 OCR을 여러 번 학습하다 보니 weight 파일만 남고, 어떤 데이터와 설정으로 만든 결과인지 찾는 시간이 더 오래 걸렸습니다. 그래서 학습 실행 자체를 기록하는 도구를 만들었습니다.',
    startingPoint:
      '데이터셋은 로컬 폴더에, 코드는 Git에, metric과 로그는 학습 서버에 따로 남았습니다. 성능이 좋았던 weight를 찾아도 같은 조건으로 다시 실행하기 어려웠습니다.',
    build:
      'Flutter 화면, Go 백엔드, 학습 서버에서 명령을 받는 Agent를 모두 만들었습니다. Agent가 데이터셋을 스캔해 내용 기준 버전을 만들고, 실행할 때 Git revision과 입력값을 함께 고정합니다. 학습 중 metric·로그·GPU 사용량을 받고 끝나면 weight와 artifact를 같은 실행 기록에 보관합니다.',
    outcome:
      '번호판 OCR·번호판 Detection·방통차·그래플 모델의 학습 기록을 한곳에서 관리',
    stack: ['Flutter', 'Go', 'RabbitMQ', 'Object Storage', 'MLOps'],
    tags: [
      'ai',
      'platform',
      'mlops',
      'flutter',
      'go',
      'rabbitmq',
      'object-storage',
    ],
    matchProofs: [
      {
        signals: ['mlops', 'ai', 'platform'],
        text: 'Git revision, dataset version와 model input을 하나의 training run에 고정해 실험을 다시 추적할 수 있게 했습니다.',
      },
      {
        signals: ['flutter'],
        text: 'Flutter 화면에서 실행별 metric, 로그, GPU 사용량과 결과 파일을 함께 확인합니다.',
      },
      {
        signals: ['go', 'rabbitmq', 'backend'],
        text: 'Go 백엔드가 RabbitMQ로 원격 Agent에 학습을 지시하고 진행 상태와 결과를 받습니다.',
      },
      {
        signals: ['object-storage', 'object storage'],
        text: '데이터셋과 artifact를 내용 기반 version으로 Object Storage에 보존해 중복과 출처 불명을 줄였습니다.',
      },
    ],
    flow: [
      'Dataset scan',
      'Version upload',
      'Remote run',
      'Live metrics',
      'Artifact',
    ],
    colors: ['#9fe6d7', '#7b9cff', '#e6ff85'],
  },
  {
    id: 'esther',
    period: 'Aug 2026—Current',
    timelineYear: '2026',
    status: 'In operation',
    category: 'Independent Product',
    title: 'Esther 데이터베이스 설계 도구',
    company: 'Independent',
    role: 'Product design / Engineering',
    perspective: 'DB 변경을 기억에 맡기지 않기',
    archiveNote:
      'ERD를 그리는 데서 끝내지 않고 용어, 실제 DB 상태, 변경 계획과 배포 이력을 같은 프로젝트 기록으로 묶었습니다.',
    summary:
      '용어사전과 ERD, 실제 PostgreSQL 비교, 안전한 DDL 적용과 버전 이력을 연결한 local-first 데스크톱 앱입니다.',
    lead: '같은 뜻의 컬럼도 사람마다 이름과 타입이 달랐고, DataGrip console이 사라지면 전에 실행한 DDL을 다시 찾기 힘들었습니다. 제가 설계하고 배포한 내용을 잊지 않으려고 만든 도구입니다.',
    startingPoint:
      'DB 설계 규칙은 문서와 사람 기억에 흩어져 있었습니다. 개발 DB에서 바꾼 내용을 운영에 반영할 때도 당시 SQL과 변경 이유를 다시 찾아야 했습니다.',
    build:
      '먼저 용어사전에 표준 컬럼명과 타입을 등록하고, 그 규칙을 보면서 ERD를 그리게 했습니다. 저장한 설계는 실제 PostgreSQL schema와 비교해 DDL로 만들고, 적용 직전에는 advisory lock을 잡은 뒤 DB 상태가 다시 바뀌지 않았는지 확인합니다. 실행한 migration은 버전과 함께 남깁니다.',
    outcome:
      '용어사전, ERD, 실제 DB 비교, DDL 실행 기록을 한 프로젝트 안에서 확인 가능',
    stack: ['Flutter', 'Dart', 'PostgreSQL', 'Schema Diff', 'Migration'],
    tags: [
      'database',
      'postgresql',
      'flutter',
      'dart',
      'migration',
      'data-integrity',
    ],
    matchProofs: [
      {
        signals: ['database', 'postgresql'],
        text: '설계 snapshot과 실제 PostgreSQL catalog를 비교해 변경 계획을 생성합니다.',
      },
      {
        signals: ['migration', 'data-integrity'],
        text: 'advisory lock 획득 뒤 live schema를 다시 확인하고 변경된 경우 적용을 중단합니다.',
      },
      {
        signals: ['flutter', 'dart'],
        text: 'Flutter 데스크톱 앱에서 용어사전, ERD, SQL console과 migration 기록을 오가며 작업합니다.',
      },
    ],
    flow: [
      'Glossary',
      'ERD',
      'Live schema diff',
      'Safe apply',
      'Version archive',
    ],
    colors: ['#ffcf7b', '#ff8b9a', '#8e9cff'],
    media: [
      {
        src: '/project-media/esther-erd.png',
        alt: 'Esther에서 여러 스키마와 테이블 관계를 한 화면에 표시한 ERD',
        caption:
          '11개 스키마와 178개 테이블의 관계를 스키마 영역별로 탐색하는 ERD 화면.',
      },
      {
        src: '/project-media/esther-database-overview.png',
        alt: 'Esther의 PostgreSQL 데이터베이스 상태 요약 화면',
        caption:
          '용량·스키마·테이블·컬럼·인덱스와 용어사전 정합성을 함께 확인하는 데이터베이스 요약.',
      },
      {
        src: '/project-media/esther-glossary.png',
        alt: 'Esther에서 표준 용어와 영문명, 축약어를 관리하는 용어사전',
        caption:
          '1만 4천여 개 표준 용어의 한글명·영문명·축약어와 타입 후보를 관리하는 용어사전.',
      },
      {
        src: '/project-media/esther-change-history.png',
        alt: 'Esther에서 데이터베이스 변경 내역과 생성 SQL을 확인하는 화면',
        caption:
          '적용한 테이블·컬럼 변경과 실제 migration SQL을 버전별로 다시 확인하는 변경 기록.',
      },
    ],
  },
  {
    id: 'bucket-studio',
    period: 'Jun 2026—Current',
    timelineYear: '2026',
    status: 'In operation',
    category: 'Independent Product',
    title: 'Bucket Studio',
    company: 'Independent',
    role: 'Product design / Engineering / Distribution',
    perspective: '웹 콘솔을 오가지 않는 스토리지 도구',
    archiveNote:
      'provider별 웹 콘솔을 오가는 대신 여러 S3-compatible storage를 같은 데스크톱 작업 방식으로 다루게 했습니다.',
    summary:
      'AWS S3부터 NCP Archive까지 탐색·검색·미리보기·전송하는 cross-platform object storage browser입니다.',
    lead: 'S3 파일 하나를 찾을 때마다 provider별 웹 콘솔을 열고 경로를 따라가는 게 불편했습니다. macOS와 Linux에서도 쓸 수 있고 NCP Archive까지 지원하는 데스크톱 도구를 직접 만들었습니다.',
    startingPoint:
      'Windows에는 S3 Browser가 있었지만 전송 속도 제한이 있었고 macOS·Linux에서는 마땅한 도구를 찾기 어려웠습니다. 특히 NCP Archive Storage는 일반 S3 도구에서 탐색이 매끄럽지 않았습니다.',
    build:
      'Flutter 앱 안에서 AWS Signature V4 요청과 presigned URL을 직접 만들었습니다. bucket 바로가기, 경로·부분 검색, 이미지·영상·텍스트 미리보기, multipart upload와 폴더 다운로드를 넣었습니다. NCP Archive의 ListObjectsV1 차이는 provider별 처리로 흡수했고, 삭제 전 대상 목록과 텍스트 저장 전 ETag 충돌도 확인하게 했습니다.',
    outcome: 'S3-compatible 6종 provider 지원 · Microsoft Store 배포',
    stack: ['Flutter', 'AWS SigV4', 'S3', 'NCP Archive', 'Multipart Upload'],
    tags: [
      'flutter',
      'dart',
      'aws',
      'ncp',
      'object-storage',
      'platform',
      'desktop',
    ],
    matchProofs: [
      {
        signals: ['aws', 's3', 'object-storage', 'object storage'],
        text: '별도 중계 서버 없이 AWS Signature V4와 presigned URL을 client에서 직접 생성합니다.',
      },
      {
        signals: ['ncp', 'ncp archive'],
        text: 'NCP Archive는 ListObjectsV1과 folder marker 처리 차이를 따로 구현했습니다.',
      },
      {
        signals: ['flutter', 'dart', 'desktop'],
        text: 'Windows·macOS·Linux에서 bucket 탐색, 부분 검색과 preview를 같은 Flutter UI로 제공합니다.',
      },
      {
        signals: ['platform', 'multipart upload'],
        text: '대용량 파일은 multipart로 올리고 실패한 part만 재시도하거나 전체 업로드를 중단할 수 있습니다.',
      },
    ],
    flow: [
      'Provider',
      'Bucket search',
      'Preview',
      'Transfer queue',
      'Safe mutation',
    ],
    colors: ['#77d9c7', '#6aa8ff', '#dcff83'],
    media: [
      {
        src: '/project-media/bucket-studio-browser.png',
        alt: 'Bucket Studio에서 여러 오브젝트 스토리지와 버킷을 탐색하는 화면',
        caption:
          '여러 S3-compatible provider와 bucket을 한 화면에서 탐색하는 데스크톱 클라이언트.',
      },
      {
        src: '/project-media/bucket-studio-json-editor.png',
        alt: 'Bucket Studio에서 오브젝트 스토리지의 JSON 파일을 편집하는 화면',
        caption:
          '스토리지의 JSON 파일을 내려받지 않고 검증·정리·수정한 뒤 다시 저장하는 편집 화면.',
      },
    ],
  },
  {
    id: 'copylight',
    period: 'Jul 2026—Current',
    timelineYear: '2026',
    status: 'In operation',
    category: 'Independent Product',
    title: 'Copylight',
    company: 'Independent',
    role: 'Product design / Engineering / Distribution',
    perspective: '복사한 내용을 바로 고쳐 쓰기',
    archiveNote:
      '복사 기록을 쌓기만 하지 않고 수정·검색·pin·JSON 변환과 원래 앱으로의 paste까지 하나의 짧은 흐름으로 만들었습니다.',
    summary:
      '텍스트와 이미지를 검색·수정·정리하고 원래 작업 앱으로 다시 붙여넣는 local-first clipboard manager입니다.',
    lead: '복사한 JSON을 다시 편집기에 붙여 넣어 정리하고, 예전에 복사한 값을 찾아 또 복사하는 일이 반복됐습니다. 검색·수정·고정·변환을 클립보드 창에서 끝내려고 만들었습니다.',
    startingPoint:
      '기본 클립보드는 기록을 오래 보관하지 못하고, 필요한 항목을 검색하거나 내용을 고칠 수도 없었습니다. 개발 중 자주 쓰는 JSON과 명령어를 정리해 두는 기능도 필요했습니다.',
    build:
      '검색, pin, 그룹, 편집, JSON formatting을 Flutter로 만들고 Windows C++와 macOS Swift 코드로 전역 단축키·이미지 clipboard·이전 앱으로 돌아가 붙여넣기를 연결했습니다. 기록은 AES-GCM으로 암호화하고 큰 데이터는 분리 저장했습니다. 저장 실패 재시도, backup 복구와 종료 전 flush도 넣었습니다.',
    outcome: '56개 interaction·storage test · Microsoft Store 배포',
    stack: ['Flutter', 'C++', 'Swift', 'AES-GCM', 'Native Clipboard'],
    tags: [
      'flutter',
      'dart',
      'desktop',
      'security',
      'cpp',
      'swift',
      'local-first',
    ],
    matchProofs: [
      {
        signals: ['flutter', 'dart'],
        text: 'Flutter 창 안에서 기록 검색, pin, 그룹, 편집과 키보드 조작을 처리합니다.',
      },
      {
        signals: ['cpp', 'c++', 'swift', 'desktop'],
        text: 'Windows C++와 macOS Swift로 image clipboard, 이전 application 복귀와 직접 paste를 구현했습니다.',
      },
      {
        signals: ['security', 'aes-gcm', 'local-first'],
        text: '민감한 clipboard 기록을 AES-GCM으로 암호화하고 외부 서버 없이 로컬에 보존합니다.',
      },
    ],
    flow: ['Copy', 'Capture', 'Search / edit', 'Transform', 'Paste back'],
    colors: ['#8f9dff', '#ef8fff', '#78e0d0'],
    media: [
      {
        src: '/project-media/copylight-workspace.png',
        alt: '개발 도구 아래에 열린 Copylight 클립보드 패널 화면',
        caption:
          '작업 중인 앱을 벗어나지 않고 클립보드 기록을 검색하고 다시 사용하는 패널.',
      },
      {
        src: '/project-media/copylight-editor.png',
        alt: 'Copylight에서 클립보드 텍스트를 편집하는 전체 화면 편집기',
        caption:
          '복사한 텍스트를 별도 편집기로 옮기지 않고 바로 수정하고 저장하는 화면.',
      },
    ],
  },
  {
    id: 'path-doctor',
    period: '2026',
    timelineYear: '2026',
    status: 'Completed',
    category: 'Independent Product',
    title: 'Path Doctor',
    company: 'Independent',
    role: 'Product design / Engineering / Distribution',
    perspective: '“느리다”를 측정값으로 바꾸기',
    archiveNote:
      '명령어를 모르는 현장 담당자도 DNS·ping·route·HTTP 측정값을 개발자와 같은 화면에서 볼 수 있게 했습니다.',
    summary:
      '네트워크 경로와 지연 급증 구간을 시각화하고 다음 확인 행동을 설명하는 desktop 진단 도구입니다.',
    lead: '현장 담당자는 서비스가 느리다고 말하지만 traceroute 같은 명령을 쓰기는 어렵고, 개발자는 어느 구간이 문제인지 알 수 없었습니다. 같은 화면을 보며 얘기할 수 있도록 만든 진단 도구입니다.',
    startingPoint:
      '현장 PC에서만 느린 문제가 생겨도 DNS인지, 사내망인지, 외부 구간인지 확인할 자료가 없었습니다. 명령어 실행 결과를 캡처해 전달하는 방식도 일반 사용자가 하기 어려웠습니다.',
    build:
      '주소 하나를 입력하면 DNS, ping 지연·packet loss, traceroute, reverse DNS·RDAP와 HTTP 응답을 순서대로 측정합니다. hop을 경로로 보여주고 지연이 크게 뛴 구간과 응답을 막은 장비를 구분했습니다. download·upload 속도와 이전 측정 기록도 함께 볼 수 있게 했습니다.',
    outcome: 'Windows v1.0 공개 · GitHub Pages와 itch.io 배포',
    stack: ['Flutter', 'DNS', 'Traceroute', 'RDAP', 'HTTP Diagnostics'],
    tags: ['flutter', 'dart', 'network', 'diagnostics', 'http', 'desktop'],
    matchProofs: [
      {
        signals: ['network', 'diagnostics'],
        text: 'DNS, ping, traceroute와 HTTP 결과를 연결해 경로별 지연과 packet loss를 한 번에 확인합니다.',
      },
      {
        signals: ['http'],
        text: 'HTTP 상태와 응답 시간, 접속 실패를 구분해 일반 사용자가 다음 점검 행동을 이해하게 했습니다.',
      },
      {
        signals: ['flutter', 'dart', 'desktop'],
        text: '명령줄 진단 결과를 Flutter 기반 route graph와 history chart로 시각화했습니다.',
      },
    ],
    flow: ['Target', 'DNS / Ping', 'Route trace', 'Explain', 'History'],
    colors: ['#65d3ff', '#7f8cff', '#f4de75'],
    media: [
      {
        src: '/project-media/path-doctor-dashboard.png',
        alt: 'Path Doctor에서 DNS, 응답 시간, HTTP 상태와 경로를 진단한 대시보드',
        caption:
          '주소 하나로 DNS·ping·HTTP·route 결과와 다음 확인 항목을 함께 보여주는 진단 대시보드.',
      },
      {
        src: '/project-media/path-doctor-route-analysis.png',
        alt: 'Path Doctor가 네트워크 홉별 지연과 차단 구간을 표시한 경로 분석 화면',
        caption:
          '홉별 지연을 경로로 시각화하고 느려진 구간과 응답이 막힌 장비를 구분한 화면.',
      },
    ],
  },
  {
    id: 'mobile-ai-inspection',
    period: 'Apr—May 2026',
    timelineYear: '2026',
    status: 'In operation',
    category: 'Applied AI',
    title: '철스크랩 모바일 AI 검수',
    company: 'AIMOS',
    role: 'Senior Fullstack / AI Engineer',
    perspective: '휴대폰 촬영부터 AI 판정까지',
    archiveNote:
      '현장의 한 장을 업로드 기능으로 끝내지 않고, 인증·저장·추론·알림이 실패해도 다시 이어지는 하나의 제품 경계로 설계했습니다.',
    summary:
      '촬영부터 AI 판정, 결과 저장과 담당자 알림까지 하나의 모바일 흐름으로 연결했습니다.',
    lead: 'PC가 없는 작업 위치에서도 휴대폰으로 사진을 찍어 바로 AI 검수를 요청할 수 있어야 했습니다. 화면만 만든 게 아니라 업로드, 추론, 결과 저장과 알림까지 제가 연결했습니다.',
    startingPoint:
      '현장에서는 앱 설치가 어렵고 통신도 일정하지 않았습니다. 큰 이미지를 API 서버가 직접 받으면 업로드 실패와 서버 부하가 함께 생길 수 있었습니다.',
    build:
      'Flutter Web PWA에서 촬영하고 presigned URL로 Object Storage에 바로 올리게 했습니다. Go gRPC 백엔드가 검수 요청과 인증을 맡고 FastAPI 모델 서버가 이미지를 받아 결과를 돌려줍니다. 결과는 HMAC으로 검증한 뒤 저장하고 FCM으로 담당자에게 알립니다. PASETO와 Redis 세션까지 포함해 전체 흐름을 만들었습니다.',
    outcome:
      '설치 없이 촬영한 사진이 AI 판정과 담당자 알림까지 이어지는 모바일 검수 흐름 운영',
    stack: ['Flutter Web', 'Go', 'gRPC-Web', 'FastAPI', 'PASETO', 'Redis'],
    tags: ['ai', 'backend', 'platform', 'go', 'fastapi', 'grpc', 'flutter'],
    matchProofs: [
      {
        signals: ['flutter', 'flutter web'],
        text: 'Flutter Web PWA로 설치 부담 없이 촬영과 업로드가 이어지는 현장 입력 화면을 만들었습니다.',
      },
      {
        signals: ['go', 'grpc', 'grpc-web', 'backend', 'platform'],
        text: 'Go와 gRPC-Web이 모바일 요청을 받고 업로드 완료 뒤 모델 추론을 요청합니다.',
      },
      {
        signals: ['fastapi', 'ai'],
        text: '모델 실행은 FastAPI 서버로 분리해 제품 API를 배포할 때 모델 환경을 다시 묶지 않게 했습니다.',
      },
      {
        signals: ['redis', 'paseto'],
        text: 'PASETO 토큰과 Redis 세션으로 로그인 상태와 만료 처리를 구현했습니다.',
      },
    ],
    flow: [
      'Mobile capture',
      'Object Storage',
      'Go / gRPC',
      'FastAPI / AI',
      'DB / FCM',
    ],
    colors: ['#6ad7ff', '#8e7dff', '#ffd47a'],
  },
  {
    id: 'inference-infrastructure',
    period: 'Apr—May 2026',
    timelineYear: '2026',
    status: 'In operation',
    category: 'Cloud Platform',
    title: 'AI 추론 인프라 전환',
    company: 'AIMOS',
    role: 'Senior Fullstack / AI Engineer',
    perspective: '쓰지 않는 GPU 비용 없애기',
    archiveNote:
      '모델 성능보다 먼저 유휴 GPU가 만드는 고정비를 문제로 보고, 추론을 상시 서버에서 수요 기반 실행 단위로 바꿨습니다.',
    summary:
      'Naver Cloud의 추론 환경을 AWS SageMaker 기반의 탄력적인 운영 구조로 전환했습니다.',
    lead: '요청이 없어도 계속 켜져 있는 GPU 서버가 비용 대부분을 차지했습니다. 모델 호출 방식은 유지하면서, 필요할 때만 GPU를 쓰는 구조로 옮겼습니다.',
    startingPoint:
      'Naver Cloud의 GPU 서버는 추론 요청이 없는 시간에도 비용이 나갔습니다. 모델과 제품 API가 가까이 붙어 있어 서버를 줄이거나 실행 환경을 바꾸기도 어려웠습니다.',
    build:
      '제품 서버와 모델 실행을 분리하고, 입력 이미지는 presigned URL로 주고받게 바꿨습니다. 추론 작업을 AWS SageMaker에서 실행하도록 옮겨 요청이 없을 때는 GPU가 남아 있지 않게 했습니다. 기존 FastAPI 호출 규격은 유지해 제품 쪽 수정 범위를 줄였습니다.',
    outcome:
      '상시 GPU 서버를 없애고 실제 사용한 추론 시간에 대해서만 비용이 발생하도록 변경',
    stack: ['AWS SageMaker', 'Naver Cloud', 'FastAPI', 'Object Storage'],
    tags: ['ai', 'platform', 'infra', 'cost', 'aws', 'ncp', 'fastapi'],
    matchProofs: [
      {
        signals: ['aws', 'aws sagemaker', 'infra', 'platform', 'cost'],
        text: 'SageMaker 기반으로 추론 단위를 분리해 요청이 없는 시간의 GPU 비용을 제거했습니다.',
      },
      {
        signals: ['ncp', 'naver cloud'],
        text: '기존 Naver Cloud 추론 환경의 호출·배포 구조를 분석하고 AWS 실행 모델로 이전했습니다.',
      },
      {
        signals: ['fastapi', 'ai'],
        text: '기존 FastAPI 요청 형식을 유지해 제품 서버는 SageMaker 전환을 거의 알 필요가 없게 했습니다.',
      },
      {
        signals: ['object storage'],
        text: '큰 입력과 결과는 API 프로세스가 아닌 Object Storage를 통해 전달하도록 분리했습니다.',
      },
    ],
    flow: [
      'API request',
      'Job control',
      'SageMaker',
      'Model result',
      'Callback',
    ],
    colors: ['#8be8d0', '#58b7ff', '#d9ff7a'],
  },
  {
    id: 'stitch',
    period: 'Jan—May 2026',
    timelineYear: '2026',
    status: 'In operation',
    category: 'Internal Platform',
    title: '사내 AI 라벨링 플랫폼 Stitch',
    company: 'AIMOS',
    role: 'Solo build',
    perspective: '다운로드 없이 라벨링부터 검수까지',
    archiveNote:
      '라벨 하나를 그리는 UI보다 원천 데이터가 검수·승인·학습본으로 바뀌는 전체 생명주기를 제품으로 만들었습니다.',
    summary:
      '라벨링, 검수, 승인과 데이터셋 생성을 하나로 묶어 외부 솔루션을 대체했습니다.',
    lead: '원본을 내려받고 보안 솔루션에 올리고, 작업자별 폴더로 나눈 뒤 결과를 다시 모으는 과정이 너무 길었습니다. 이 과정을 클라우드 안에서 끝내려고 Stitch를 만들었습니다.',
    startingPoint:
      '기존 방식은 로컬 다운로드 때문에 보안 문제가 생겼고, 이를 막기 위해 1회성 약 1억 원의 보안 솔루션과 연간 약 2천만 원의 라벨링 도구를 사용하고 있었습니다. 데이터 배분과 완료본 취합은 여전히 사람이 했습니다.',
    build:
      'Flutter 화면과 Go 백엔드를 단독으로 설계·구현했습니다. Object Storage의 원본을 프로젝트와 작업자에게 바로 배분하고, SAM 결과를 수정 가능한 polygon으로 바꿨습니다. 작업·검수·반려·재작업·승인 상태와 COCO·YOLO·Pascal VOC export를 연결했습니다. 회원사별 모델 설정과 작업량·평균 작업시간·승인율 통계도 넣고 있습니다.',
    outcome:
      '약 30명이 연간 수만 장을 처리하는 팀용 POC 진행, 외부 라벨링 도구 대체 예정',
    stack: ['Go', 'SAM', 'Keycloak', 'Object Storage', 'Embedding Cache'],
    tags: [
      'ai',
      'platform',
      'backend',
      'cost',
      'go',
      'keycloak',
      'object-storage',
    ],
    matchProofs: [
      {
        signals: ['go', 'backend', 'platform'],
        text: 'Go 백엔드에서 작업 배정, 검수·반려·재작업·승인과 데이터셋 export 상태를 관리합니다.',
      },
      {
        signals: ['ai', 'sam', 'embedding cache'],
        text: 'SAM 자동 라벨링과 멀티 서버 임베딩 캐시로 반복 입력의 모델 실행 비용을 줄였습니다.',
      },
      {
        signals: ['keycloak'],
        text: 'Keycloak 권한에 따라 관리자, 작업자와 검수원이 볼 수 있는 작업을 나눴습니다.',
      },
      {
        signals: ['object-storage', 'object storage'],
        text: '원본과 라벨 결과는 Object Storage에 두고 다운로드 없이 작업자에게 배분합니다.',
      },
      {
        signals: ['cost'],
        text: '외부 라벨링 제품이 맡던 전체 흐름을 내재화해 연간 약 2,000만 원의 비용을 줄였습니다.',
      },
    ],
    flow: ['Raw data', 'Auto labeling', 'Review', 'Approval', 'Dataset export'],
    colors: ['#ff8e9c', '#78d6ff', '#ffe99a'],
    media: [
      {
        src: '/project-media/stitch-labeling-workspace.png',
        alt: 'Stitch에서 의류 이미지의 영역과 부위를 라벨링하는 작업 화면',
        caption:
          '원본 이미지 위에서 polygon을 수정하고 semantic part를 연결하는 라벨링 작업 화면.',
      },
      {
        src: '/project-media/stitch-project-workspace.png',
        alt: 'Stitch에서 작업자에게 배정된 철스크랩 이미지 작업을 탐색하는 화면',
        caption:
          '배정된 원천 데이터를 상태·태그와 함께 탐색하고 라벨링 작업으로 진입하는 작업자 홈.',
      },
    ],
  },
  {
    id: 'vehicle-tracking',
    period: 'Oct—Dec 2025',
    timelineYear: '2025',
    status: 'Completed',
    category: 'Computer Vision',
    title: '차량 추적 및 검수 자동화',
    company: 'AIMOS',
    role: 'Senior Fullstack / AI Engineer',
    perspective: '무전으로 시작하던 검수를 자동화',
    archiveNote:
      '정확도 하나가 아니라 차량의 연속성, 번호판 오류, 검수 상태 전이를 함께 다뤄 모델을 현장 자동화로 연결했습니다.',
    summary:
      '번호판 인식과 차량 추적을 연결해 차량의 입출에 따라 검수를 자동으로 제어했습니다.',
    lead: '예전에는 차량이 들어올 때마다 검수원이 중앙 사무실에 무전하고, 사무실이 다시 작업자에게 시작 지시를 내려야 했습니다. 번호판과 카메라 영상으로 이 반복을 없앴습니다.',
    startingPoint:
      '하루 종일 무전을 주고받으며 시작·종료를 눌러야 해서 차량을 놓치거나 처리가 늦는 일이 있었습니다. 번호판은 지역명, 6과 9, 기울기와 빛 번짐에서 자주 틀렸고 차량을 잠깐 놓치면 잘못 종료될 수도 있었습니다.',
    build:
      'YOLOX로 번호판 영역을 찾고 개조한 LPRNet으로 문자열을 읽는 2단계 모델을 학습했습니다. 공공데이터 성능이 나오지 않아 현장 카메라에서 실데이터 약 4만 장을 모아 직접 정제·라벨링했고 합성 데이터 5천 장을 더했습니다. 차량이 들어오면 번호판으로 검수를 시작하고, 검수 카메라의 연속 미검출로 이탈을 판단합니다. 같은 차량이 다시 보이면 이전 검수를 복구하게 했습니다.',
    outcome: '번호판 전체 문자열 일치율 Validation 98% · 8개 하차지 자동 운영',
    stack: ['LPRNet', 'Focal Loss', 'Vehicle Tracking', 'Synthetic Data'],
    tags: ['ai', 'backend', 'computer-vision', 'tracking', 'lpr'],
    matchProofs: [
      {
        signals: ['ai', 'computer-vision', 'tracking', 'vehicle tracking'],
        text: '프레임별 검출을 Track ID로 연결해 차량의 진입부터 이탈까지 하나의 상태로 유지했습니다.',
      },
      {
        signals: ['lpr', 'lprnet'],
        text: '현장 실데이터 4만 장과 합성 데이터 5천 장으로 LPRNet을 개선해 전체 문자열 일치율 Validation 98%를 확인했습니다.',
      },
      {
        signals: ['focal loss', 'synthetic data'],
        text: '희소한 문자와 촬영 조건을 보완하기 위해 합성 데이터와 Focal Loss를 함께 사용했습니다.',
      },
      {
        signals: ['backend'],
        text: '번호판이 확인되면 검수를 시작하고, 연속 미검출이면 종료하며 재진입 때는 이전 상태를 복구합니다.',
      },
    ],
    flow: [
      'RTSP stream',
      'Vehicle detect',
      'Track ID',
      'LPRNet',
      'Inspection state',
    ],
    colors: ['#ffb56b', '#ff718f', '#cda8ff'],
    media: [
      {
        src: '/project-media/vehicle-grapple-detection.png',
        alt: '고철 하차 현장에서 차량과 그라플을 함께 검출하고 추적하는 화면',
        caption:
          '차량과 그라플을 동시에 검출하고 PTZ 이동 방향과 거리를 표시한 현장 추적 화면.',
      },
      {
        src: '/project-media/vehicle-license-plate-detection.png',
        alt: '현장 카메라 영상에서 화물차 번호판을 검출하고 인식한 화면',
        caption:
          '차량 진입 영상에서 번호판 영역과 문자열을 검출해 자동 검수 시작에 연결한 화면.',
      },
    ],
  },
  {
    id: 'legacy-modernization',
    period: '2025—Current',
    timelineYear: '2025',
    status: 'In operation',
    category: 'Modernization',
    title: '철강 스크랩 AI 검수 시스템 재구축',
    company: 'AIMOS',
    role: 'Senior Fullstack / AI Engineer',
    perspective: '56대 구조를 다시 뜯어고친 이유',
    archiveNote:
      '서버 대수를 줄인 일이 아니라 데이터 이동과 저장, 동기 처리 경계를 다시 그려 비용 구조 자체를 바꾼 재구축입니다.',
    summary:
      '분산 DB와 동기 처리, 현장 Edge 서버를 통합 운영 구조로 다시 설계했습니다.',
    lead: 'POC 성공 뒤 50명 팀과 만든 시스템을 인수받았을 때 서버는 56대까지 늘어 있었고, 모델 결과를 현장별 Docker가 하나씩 동기로 처리하고 있었습니다. 2025년 7월부터 구조를 다시 뜯어고쳤습니다.',
    startingPoint:
      '모델 응답은 MQ를 거쳐 현장별 Docker가 하나씩 처리했고, 그 Docker를 감시하는 서버도 따로 있었습니다. DB와 서비스도 현장별로 갈라져 있어 장애 확인과 배포가 반복됐고, 56대 서버와 상시 GPU가 큰 고정비를 만들었습니다.',
    build:
      '모델 요청과 응답 처리를 aimos-aib로 통합하고 이미지는 presigned URL로 주고받게 바꿨습니다. 분리 DB와 API 서버를 합치고 CloudFront, Object Storage, Redis를 기준으로 데이터 경계를 다시 잡았습니다. 반복 배치 작업은 Airflow로 옮기고 오래 보관할 원본은 Archive Storage로 내렸습니다. 모니터링은 Grafana와 Slack으로 모으도록 정리했습니다. 설계·개발·배포·현장 대응과 리드를 맡았습니다.',
    outcome:
      '월 검수 478대 → 7,555대 · 비용 5,524만 원 → 1,052만 원 · 서버 56대 → 10대',
    stack: [
      'FastAPI',
      'Redis',
      'CloudFront',
      'Airflow',
      'Object Storage',
      'Archive Storage',
    ],
    tags: [
      'cost',
      'backend',
      'platform',
      'infra',
      'redis',
      'airflow',
      'aws',
      'ncp',
    ],
    matchProofs: [
      {
        signals: ['fastapi', 'backend', 'platform'],
        text: '현장마다 따로 있던 처리 Docker와 감시 서버를 통합 API로 모았습니다.',
      },
      {
        signals: ['redis'],
        text: '검수 진행 상태와 반복 조회 데이터는 Redis에 두어 DB와 동기 처리 부담을 줄였습니다.',
      },
      {
        signals: ['airflow'],
        text: '배치 처리와 반복 운영 작업의 실행 일정을 Airflow로 관리했습니다.',
      },
      {
        signals: [
          'aws',
          'ncp',
          'infra',
          'cloudfront',
          'object storage',
          'archive storage',
        ],
        text: '자주 보는 이미지는 CloudFront로 전달하고 오래된 원본은 Archive Storage로 옮겼습니다.',
      },
      {
        signals: ['cost'],
        text: '월 검수량이 약 15.8배 늘어나는 동안 56대 구조를 10대로 통합하고 클라우드 비용을 약 80.9% 낮췄습니다.',
      },
    ],
    flow: [
      '56 edge servers',
      'Unified API',
      'Redis',
      'Object Storage',
      '10 servers',
    ],
    colors: ['#91a7ff', '#69e0c1', '#fff08a'],
  },
  {
    id: 'scrap-ai-poc',
    period: 'Feb—Apr 2024',
    timelineYear: '2024',
    status: 'Completed',
    category: 'Product POC',
    title: '철강 스크랩 AI 검수 POC',
    company: '지앤비아이텍',
    role: 'Fullstack Engineer',
    perspective: '현장 영상으로 사업 가능성을 확인한 POC',
    archiveNote:
      '데모 화면이 아니라 현장 영상과 실제 모델을 묶은 실행 가능한 제품으로 사업 가능성을 증명했습니다.',
    summary:
      'RTSP 수신부터 프레임 캡처, AI 추론과 결과 표시까지 Windows 앱으로 구현했습니다.',
    lead: '아이디어 설명만으로는 사업 여부를 판단할 수 없어, 실제 CCTV 영상이 모델을 거쳐 검수 결과로 돌아오는 Windows 앱을 먼저 만들었습니다.',
    startingPoint:
      '정해진 제품 구조가 없는 상태에서 현장 영상 수신, 프레임 추출, 모델 호출, 결과 저장과 화면 표시까지 한 번에 검증해야 했습니다.',
    build:
      'Flutter Windows 앱에서 RTSP 영상을 받아 필요한 프레임을 캡처하고, AI 추론 요청과 DB 저장 뒤 결과를 다시 화면에 표시했습니다. 현장에 직접 가져가 실제 카메라와 모델로 동작을 확인했습니다.',
    outcome: 'POC 성공과 본사업 수주 기여 · 포상금 300만 원 수상',
    stack: ['Flutter Windows', 'RTSP', 'Frame Capture', 'AI Inference'],
    tags: ['ai', 'backend', 'flutter', 'rtsp', 'poc'],
    matchProofs: [
      {
        signals: ['flutter', 'flutter windows'],
        text: 'Flutter Windows에서 영상 수신, 프레임 캡처, 결과 확인을 하나의 현장 앱으로 묶었습니다.',
      },
      {
        signals: ['rtsp', 'frame capture'],
        text: 'RTSP 스트림을 안정적으로 수신하고 추론 가능한 시점의 프레임을 분리했습니다.',
      },
      {
        signals: ['ai', 'ai inference', 'backend'],
        text: '캡처 이미지가 AI 추론과 DB 저장을 거쳐 다시 화면에 돌아오는 전체 경로를 구현했습니다.',
      },
      {
        signals: ['poc'],
        text: '실제 환경에서 동작하는 POC로 본사업 수주 가능성을 검증했습니다.',
      },
    ],
    flow: ['RTSP', 'Frame capture', 'AI inference', 'Database', 'Desktop UI'],
    colors: ['#68d4ff', '#79f2b4', '#f8ff9a'],
  },
  {
    id: 'rpa-prediction',
    period: 'Dec 2023—Jan 2024',
    timelineYear: '2023',
    status: 'Completed',
    category: 'Operations',
    title: 'RPA 실행 시간 예측',
    company: '지앤비아이텍',
    role: 'Project Lead · 4-person team',
    perspective: '겹치는 RPA 작업의 다음 실행 시간 계산',
    archiveNote:
      '자원을 공유하는 자동화 작업의 충돌을 시간표로 번역해, 보이지 않던 기다림을 운영 가능한 정보로 바꿨습니다.',
    summary:
      'UiPath 실행 이력과 로봇 이벤트를 수집해 작업의 예상 시작·종료 시간을 보여줬습니다.',
    lead: '같은 로봇을 쓰는 RPA 작업이 겹치면 하나가 밀리는데, 운영자는 다음 작업이 언제 시작될지 알 수 없었습니다. 실행 이력을 받아 시간표를 다시 계산했습니다.',
    startingPoint:
      '정해진 시간에 실행되는 작업도 앞 작업이 끝나지 않으면 대기해야 했습니다. 한 작업의 지연이 뒤 작업 전체에 영향을 주지만 UiPath 화면만으로는 변경된 시작·종료 시간을 보기 어려웠습니다.',
    build:
      'UiPath 실행 이력과 로봇 이벤트를 웹훅으로 받았습니다. 먼저 비어 있는 robot을 배정하고, 자원이 겹치면 우선순위와 기존 예정 시간을 기준으로 뒤 작업의 시작·종료 시간을 연쇄 재계산했습니다. 계산 결과는 Vue 캘린더에 표시했습니다. 4인 팀 리드로 일정과 역할도 조율했습니다.',
    outcome: '예상 시작·종료 시간을 캘린더에서 확인하도록 구현',
    stack: ['UiPath', 'Webhook', 'Java', 'JPA', 'Vue'],
    tags: ['backend', 'platform', 'rpa', 'java', 'webhook', 'leadership'],
    matchProofs: [
      {
        signals: ['rpa', 'uipath', 'webhook'],
        text: 'UiPath 실행 이력과 robot 상태 변경을 웹훅으로 받아 계산에 사용했습니다.',
      },
      {
        signals: ['java', 'backend', 'jpa'],
        text: 'Java 백엔드에서 공유 자원의 작업 충돌과 우선순위를 계산해 예상 시간표를 만들었습니다.',
      },
      {
        signals: ['vue'],
        text: '계산된 시작·종료 시간을 Vue 캘린더에 배치해 운영자가 대기열을 한눈에 읽게 했습니다.',
      },
      {
        signals: ['leadership'],
        text: '4인 팀 리드로 예측 로직, 이벤트 수집과 캘린더 화면의 역할을 나누고 일정을 관리했습니다.',
      },
    ],
    flow: ['UiPath', 'Webhook', 'Event history', 'Prediction', 'Calendar'],
    colors: ['#f9a8d4', '#c4b5fd', '#93c5fd'],
  },
  {
    id: 'ai-exam',
    period: 'Jan 2022—Nov 2023',
    timelineYear: '2022',
    status: 'Completed',
    category: 'AI Product',
    title: 'AI 시험 응시 시스템',
    company: '지앤비아이텍',
    role: 'Fullstack Engineer',
    perspective: 'AI 감독 기능을 시험 앱 안에 넣기',
    archiveNote:
      '모델을 따로 시연하지 않고 데스크톱 격리, 실시간 통신, 감독 흐름 안에 넣어 실제 시험 경험으로 완성했습니다.',
    summary:
      '사람·휴대폰 검출과 실시간 채팅을 포함한 시험 응시 클라이언트를 개발했습니다.',
    lead: '모델 데모가 아니라 실제 시험을 치르는 Electron 앱 안에서 사람·휴대폰을 감지하고, 감독자와 실시간으로 상태를 주고받게 만들었습니다.',
    startingPoint:
      '응시 화면을 벗어나지 않은 상태에서 카메라 영상을 검사하고, 감지 이벤트와 채팅을 감독 화면으로 보내야 했습니다. AI 실행 실패가 시험 진행 자체를 막아서도 안 됐습니다.',
    build:
      '약 10만 장의 데이터로 사람·휴대폰 YOLOv5 모델을 학습했습니다. Vue 3와 Electron으로 응시 앱을 만들고 로컬 AI 프로세스의 시작·종료와 오류를 관리했습니다. Redis와 WebSocket으로 감지 이벤트, 응시 상태와 감독자 채팅을 실시간 전송했습니다.',
    outcome: '사람·휴대폰 검출 모델 mAP 95% 달성',
    stack: ['YOLOv5', 'Vue 3', 'Electron', 'Redis', 'WebSocket'],
    tags: ['ai', 'backend', 'platform', 'vue', 'electron', 'redis'],
    matchProofs: [
      {
        signals: ['ai', 'yolov5'],
        text: '약 10만 장의 데이터로 사람·휴대폰 검출 모델을 학습해 mAP 95%를 달성했습니다.',
      },
      {
        signals: ['electron'],
        text: 'Electron이 시험 화면과 로컬 AI 프로세스를 함께 실행하고 종료 시 정리하도록 만들었습니다.',
      },
      {
        signals: ['vue', 'vue 3'],
        text: 'Vue 3로 응시 상태, 감지 이벤트와 감독자 소통을 하나의 인터페이스에 구성했습니다.',
      },
      {
        signals: ['redis', 'websocket', 'backend', 'platform'],
        text: 'Redis와 WebSocket으로 응시자·감독자 사이의 실시간 상태와 채팅을 연결했습니다.',
      },
    ],
    flow: [
      'Exam client',
      'Frame sample',
      'YOLOv5',
      'Event stream',
      'Supervisor',
    ],
    colors: ['#fbbf77', '#fb8da0', '#a5b4fc'],
  },
  {
    id: 'welfare-platform',
    period: 'Jan—Dec 2021',
    timelineYear: '2021',
    status: 'Completed',
    category: 'Public Platform',
    title: '복지로 차세대 시스템',
    company: '아침소프트',
    role: 'Freelance Engineer',
    perspective: '대국민 통합검색과 공통 기능 개발',
    archiveNote:
      '기능별 화면보다 검색·외부 연계·공통 응답 규칙을 먼저 세워 많은 사용자가 쓰는 서비스의 기반을 만들었습니다.',
    summary: '통합검색, 공공데이터 연계 API와 공통·관리자 화면을 개발했습니다.',
    lead: '복지로 차세대 구축에서 메인 화면과 공통 기능, 통합검색과 공공데이터 연계를 개발했습니다. 반복 작업을 줄이는 도구도 따로 만들어 팀에서 사용했습니다.',
    startingPoint:
      '여러 업무 화면이 함께 개발되는 대형 프로젝트라 공통 응답 형식과 외부 연계 규칙이 필요했습니다. 통합검색은 원천 DB를 매번 직접 조회하지 않고 검색용 인덱스를 주기적으로 갱신하는 구조였습니다.',
    build:
      '원천 데이터를 주기적으로 조회해 전문검색 인덱스를 갱신하고 검색 API를 개발했습니다. 공공데이터 연계 API, 관리자·공통 화면과 메인 페이지도 맡았습니다. 제품명은 오래되어 확인할 소스가 없어 특정 검색엔진 이름 대신 실제 동작 구조만 적었습니다.',
    outcome: '대국민 요청 응답 속도 40ms 이내 달성',
    stack: [
      'Full-text Search',
      'Search Index',
      'Public Data API',
      'Admin System',
      'ERP',
    ],
    tags: [
      'backend',
      'platform',
      'public-data',
      'search',
      'full-text-search',
      'search-index',
      'erp',
    ],
    matchProofs: [
      {
        signals: [
          'search',
          'integrated search',
          'full-text-search',
          'search-index',
        ],
        text: '원천 데이터를 주기적으로 수집해 전문검색 인덱스를 갱신하고 대국민 검색 요청을 40ms 이내로 응답했습니다.',
      },
      {
        signals: ['public-data', 'public data api', 'backend'],
        text: '외부 공공데이터의 서로 다른 응답 형식과 오류를 공통 API에서 정리했습니다.',
      },
      {
        signals: ['platform', 'admin system', 'erp'],
        text: '공통·관리자 화면과 ERP 연계를 같은 규칙 위에 올려 반복 개발을 줄였습니다.',
      },
    ],
    flow: [
      'Scheduled query',
      'Search index',
      'Full-text search',
      'Common API',
      'Response',
    ],
    colors: ['#77d9c7', '#7ab8ff', '#dae87a'],
  },
  {
    id: 'payments-accounting',
    period: 'Jun 2018—Dec 2020',
    timelineYear: '2018',
    status: 'Completed',
    category: 'Payments',
    title: '결제·회계 자동 연계',
    company: 'DBVISION',
    role: 'Backend Engineer',
    perspective: '결제 결과를 회계까지 정확히 연결',
    archiveNote:
      '결제 성공을 화면 이벤트로 보지 않고 회계 반영과 중복 요청 제어까지 하나의 데이터 정합성 문제로 다뤘습니다.',
    summary:
      'BankPay와 EasyPay 결제 결과를 회계 처리까지 연결하고 중복 예약을 제어했습니다.',
    lead: 'BankPay와 EasyPay 결제 결과를 사람이 다시 회계에 옮기지 않도록 연결했습니다. 동시에 들어온 요청이 같은 예약을 두 번 처리하지 않게 하는 것도 함께 맡았습니다.',
    startingPoint:
      '결제 채널마다 응답 형식과 성공 조건이 달랐고, 결제 성공 뒤 회계 반영까지 상태가 끊겨 있었습니다. 같은 시점에 들어온 요청은 중복 예약과 금액 불일치를 만들 수 있었습니다.',
    build:
      '두 결제사의 응답을 각각 검증한 뒤 내부 결제 상태로 정리하고 회계 처리까지 자동으로 이어지게 했습니다. 예약과 결제 상태 전이를 Java 백엔드에서 관리하고 동시 요청은 중복 처리되지 않도록 제어했습니다.',
    outcome: '결제·회계 자동 연계 · 동시성 제어로 데이터 정합성 유지',
    stack: ['Java', 'BankPay', 'EasyPay', 'Accounting', 'Concurrency Control'],
    tags: [
      'payments',
      'backend',
      'accounting',
      'data-integrity',
      'concurrency',
      'java',
    ],
    matchProofs: [
      {
        signals: ['payments', 'bankpay', 'easypay'],
        text: 'BankPay와 EasyPay의 서로 다른 결제 결과를 하나의 검증·처리 흐름으로 통합했습니다.',
      },
      {
        signals: ['accounting'],
        text: '결제 완료를 회계 처리까지 자동 연계해 사람이 결과를 다시 옮기는 단계를 제거했습니다.',
      },
      {
        signals: ['data-integrity', 'concurrency', 'concurrency control'],
        text: '동시에 들어오는 예약과 결제 요청을 제어해 중복 처리와 회계 데이터 불일치를 막았습니다.',
      },
      {
        signals: ['java', 'backend'],
        text: 'Java 백엔드에서 결제사 응답을 검증하고 결제 상태가 회계 처리까지 이어지게 했습니다.',
      },
    ],
    flow: [
      'Checkout',
      'Payment gateway',
      'Result verify',
      'Accounting',
      'Reconciliation',
    ],
    colors: ['#73b8ff', '#9b8cff', '#ffb77a'],
  },
];

const signalAliases: Record<string, string[]> = {
  카드결제: ['payments', 'accounting', 'data-integrity'],
  결제: ['payments', 'accounting'],
  핀테크: ['payments', 'backend', 'data-integrity'],
  정산: ['payments', 'accounting', 'data-integrity'],
  플랫폼: ['platform', 'backend'],
  '플랫폼 백엔드': ['platform', 'backend'],
  백엔드: ['backend'],
  ai: ['ai'],
  'ai 서비스': ['ai', 'backend', 'platform'],
  '비용 최적화': ['cost', 'infra'],
  인프라: ['infra', 'platform'],
};

const companyAliases: Record<string, string[]> = {
  토스: ['payments', 'data-integrity'],
  toss: ['payments', 'data-integrity'],
};

const companyThemes: Record<
  string,
  { primary: string; secondary: string; accent: string }
> = {
  토스: { primary: '#3182f6', secondary: '#6b8dff', accent: '#d9e8ff' },
  toss: { primary: '#3182f6', secondary: '#6b8dff', accent: '#d9e8ff' },
  애플: { primary: '#0071e3', secondary: '#a7c7e7', accent: '#f2f2f4' },
  apple: { primary: '#0071e3', secondary: '#a7c7e7', accent: '#f2f2f4' },
  네이버: { primary: '#03c75a', secondary: '#72df92', accent: '#d9f8e2' },
  naver: { primary: '#03c75a', secondary: '#72df92', accent: '#d9f8e2' },
  카카오: { primary: '#fee500', secondary: '#ffd666', accent: '#fff1a8' },
  kakao: { primary: '#fee500', secondary: '#ffd666', accent: '#fff1a8' },
  당근: { primary: '#ff6f0f', secondary: '#ff9a5c', accent: '#ffe2d2' },
  daangn: { primary: '#ff6f0f', secondary: '#ff9a5c', accent: '#ffe2d2' },
  배달의민족: { primary: '#2ac1bc', secondary: '#79ded9', accent: '#daf7f5' },
};

const tagLabels: Record<string, string> = {
  ai: 'AI',
  aws: 'AWS',
  ncp: 'NCP',
  grpc: 'gRPC',
  lpr: 'LPR',
  poc: 'POC',
  rpa: 'RPA',
  rtsp: 'RTSP',
  backend: 'Backend',
  platform: 'Platform',
  fastapi: 'FastAPI',
  redis: 'Redis',
  java: 'Java',
  flutter: 'Flutter',
  vue: 'Vue',
  webhook: 'Webhook',
  payments: 'Payments',
  accounting: 'Accounting',
  search: 'Search',
};

const stackLabels = Object.fromEntries(
  projects.flatMap((project) =>
    project.stack.map((stack) => [stack.toLowerCase(), stack]),
  ),
);

const availableTags = [
  ...new Set(
    projects.flatMap((project) => [
      ...project.tags,
      ...project.stack.map((stack) => stack.toLowerCase()),
    ]),
  ),
].sort((a, b) => a.localeCompare(b));

const tagLabel = (tag: string) =>
  tagLabels[tag] ??
  stackLabels[tag] ??
  tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const projectSearchValues = (project: Project) => [
  ...project.tags,
  ...project.stack.map((stack) => stack.toLowerCase()),
];

const projectMatchesTarget = (project: Project, target: string) =>
  projectSearchValues(project).some(
    (value) => value === target || value.startsWith(`${target} `),
  );

const projectMatchProofs = (project: Project, targets: Set<string>) => {
  const proofs = project.matchProofs.filter((proof) =>
    proof.signals.some((signal) => targets.has(signal.toLowerCase())),
  );
  return [
    ...new Map(proofs.map((proof) => [proof.text, proof])).values(),
  ].slice(0, 2);
};

const proofStackLabel = (project: Project, proof: MatchProof) => {
  const normalize = (value: string) =>
    value.toLowerCase().replaceAll('-', ' ').trim();
  const signals = proof.signals.map(normalize);
  const matchedStacks = project.stack.filter((stack) => {
    const normalizedStack = normalize(stack);
    return signals.some(
      (signal) =>
        normalizedStack === signal ||
        normalizedStack.startsWith(`${signal} `) ||
        signal.startsWith(`${normalizedStack} `),
    );
  });

  return matchedStacks.length > 0
    ? matchedStacks.join(' · ')
    : proof.signals.slice(0, 2).map(tagLabel).join(' · ');
};

const normalizeHexColor = (value: string | null) => {
  if (!value) return null;
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex
      .split('')
      .map((character) => character.repeat(2))
      .join('')}`;
  }
  return /^[0-9a-f]{6}$/i.test(hex) ? `#${hex}` : null;
};

const readableTextColor = (hex: string) => {
  const channels = [1, 3, 5].map((end) =>
    Number.parseInt(hex.slice(end, end + 2), 16),
  );
  const luminance = channels.reduce(
    (total, channel, index) => total + channel * [0.299, 0.587, 0.114][index],
    0,
  );
  return luminance > 150 ? '#151515' : '#ffffff';
};

const readUrlState = (params: URLSearchParams) => {
  const company = params.get('company') ?? params.get('회사명') ?? '';
  const companyTheme = companyThemes[company.toLowerCase()];
  const scopeParam = params.get('scope');
  const scope: ProjectScope =
    scopeParam === 'work' || scopeParam === 'personal' ? scopeParam : 'all';
  const signals = [
    ...params.getAll('signal'),
    ...params.getAll('signals'),
    ...params.getAll('some_signal'),
    ...params.getAll('tags'),
    ...params.getAll('tech'),
  ]
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    company,
    signals: [...new Set(signals)],
    scope,
    showAll: params.get('view') === 'all',
    primaryColor:
      normalizeHexColor(
        params.get('primary') ?? params.get('brand') ?? params.get('color'),
      ) ??
      companyTheme?.primary ??
      '#5b5bd6',
    secondaryColor:
      normalizeHexColor(params.get('secondary') ?? params.get('gradient')) ??
      companyTheme?.secondary ??
      '#8e7dff',
    accentColor:
      normalizeHexColor(params.get('accent')) ??
      companyTheme?.accent ??
      '#bfe8ff',
  };
};

const expandedSignals = (signals: string[], company: string) =>
  new Set([
    ...(companyAliases[company.toLowerCase()] ?? []),
    ...signals.flatMap((signal) => {
      const normalized = signal.toLowerCase();
      return [normalized, ...(signalAliases[normalized] ?? [])];
    }),
  ]);

export default function Home() {
  const searchParams = useSearchParams();
  const urlState = readUrlState(new URLSearchParams(searchParams.toString()));
  const { company, signals } = urlState;
  const [activeFilters, setActiveFilters] = useState(signals);
  const [projectScope, setProjectScope] = useState<ProjectScope>(
    urlState.scope,
  );
  const [tagQuery, setTagQuery] = useState('');
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const targets = expandedSignals(activeFilters, company);
  const hasFocus = targets.size > 0;
  const focusLabel =
    activeFilters.length > 0
      ? activeFilters.map(tagLabel).join(' · ')
      : company || 'Target fit';
  const [viewOverride, setViewOverride] = useState<boolean | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const chronologyJumpRef = useRef<{
    projectId: string;
    timeoutId: number;
  } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<ProjectMedia | null>(null);
  const [selectedCodeProofId, setSelectedCodeProofId] = useState(
    codeProofs[0].id,
  );
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'projects' | 'profile'>(
    'projects',
  );
  const [showBackToTop, setShowBackToTop] = useState(false);
  const overlayOpen =
    drawerOpen || codeDrawerOpen || lightboxMedia !== null;
  const showAll = viewOverride ?? (urlState.showAll || !hasFocus);
  const themeStyle = {
    '--brand': urlState.primaryColor,
    '--brand-2': urlState.secondaryColor,
    '--brand-3': urlState.accentColor,
    '--brand-foreground': readableTextColor(urlState.primaryColor),
  } as CSSProperties;

  const ranked = projects
    .map((project, index) => ({
      ...project,
      index,
      score: [...targets].reduce(
        (total, target) =>
          total + (projectMatchesTarget(project, target) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const scopedRanked = ranked.filter((project) => {
    if (projectScope === 'personal') return project.company === 'Independent';
    if (projectScope === 'work') return project.company !== 'Independent';
    return true;
  });
  const matched = scopedRanked.filter((project) => project.score > 0);
  const rankedProjects =
    showAll || targets.size === 0 || matched.length === 0
      ? scopedRanked
      : matched;

  const chronologyProjects = [...rankedProjects].sort(
    (a, b) => a.index - b.index,
  );
  const chronologyGroups = chronologyProjects.reduce<
    Array<{
      year: string;
      projects: (typeof chronologyProjects)[number][];
    }>
  >((groups, project) => {
    const currentGroup = groups.at(-1);
    if (currentGroup?.year === project.timelineYear) {
      currentGroup.projects.push(project);
    } else {
      groups.push({ year: project.timelineYear, projects: [project] });
    }
    return groups;
  }, []);
  const selectedProject =
    rankedProjects.find((project) => project.id === selectedProjectId) ??
    rankedProjects[0];
  const selectedProjectIndex = selectedProject
    ? rankedProjects.findIndex((project) => project.id === selectedProject.id)
    : -1;
  const projectIdsKey = rankedProjects.map((project) => project.id).join('|');
  const currentProjectId = rankedProjects.some(
    (project) => project.id === activeProjectId,
  )
    ? activeProjectId
    : selectedProject.id;
  const currentTimelineYear =
    rankedProjects.find((project) => project.id === currentProjectId)
      ?.timelineYear ?? rankedProjects[0].timelineYear;
  const projectYearGroups = [...rankedProjects]
    .sort(
      (a, b) =>
        Number(b.timelineYear) - Number(a.timelineYear) ||
        b.score - a.score ||
        a.index - b.index,
    )
    .reduce<
      Array<{
        year: string;
        projects: (typeof rankedProjects)[number][];
      }>
    >((groups, project) => {
      const currentGroup = groups.at(-1);
      if (currentGroup?.year === project.timelineYear) {
        currentGroup.projects.push(project);
      } else {
        groups.push({ year: project.timelineYear, projects: [project] });
      }
      return groups;
    }, []);
  const normalizedTagQuery = tagQuery.trim().toLowerCase();
  const filteredTags = normalizedTagQuery
    ? availableTags
        .filter((tag) =>
          `${tag} ${tagLabel(tag)}`.toLowerCase().includes(normalizedTagQuery),
        )
        .slice(0, 8)
    : [];
  const pickerTags = normalizedTagQuery
    ? filteredTags
    : [...availableTags]
        .filter((tag) => !activeFilters.includes(tag))
        .sort((a, b) => {
          const countA = scopedRanked.filter((project) =>
            projectMatchesTarget(project, a),
          ).length;
          const countB = scopedRanked.filter((project) =>
            projectMatchesTarget(project, b),
          ).length;
          return countB - countA || tagLabel(a).localeCompare(tagLabel(b));
        })
        .slice(0, 7);

  const projectCounts = {
    all: projects.length,
    work: projects.filter((project) => project.company !== 'Independent')
      .length,
    personal: projects.filter((project) => project.company === 'Independent')
      .length,
  };

  useEffect(() => {
    document.title = company
      ? `송재상 — ${company} · Selected Projects`
      : '송재상 — Backend · Platform · AI Engineer';
  }, [company]);

  useEffect(() => {
    const updateActiveSection = () => {
      setShowBackToTop(
        window.scrollY > Math.max(640, window.innerHeight * 0.7),
      );
      const profile = document.getElementById('profile');
      if (!profile) return;
      setActiveSection(
        profile.getBoundingClientRect().top < window.innerHeight * 0.45
          ? 'profile'
          : 'projects',
      );
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, []);

  useEffect(() => {
    const projectIds = projectIdsKey.split('|').filter(Boolean);
    const visibleProjects = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleProjects.add(entry.target);
          else visibleProjects.delete(entry.target);
        });
        if (chronologyJumpRef.current) return;

        const visible = [...visibleProjects].sort(
          (a, b) =>
            Math.abs(a.getBoundingClientRect().top - 152) -
            Math.abs(b.getBoundingClientRect().top - 152),
        );
        const projectId = visible[0]?.getAttribute('data-project-id');
        if (projectId) setActiveProjectId(projectId);
      },
      { rootMargin: '-128px 0px -58% 0px', threshold: [0, 0.2, 0.6] },
    );

    projectIds.forEach((projectId) => {
      const element = document.getElementById(`project-${projectId}`);
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      if (chronologyJumpRef.current) {
        window.clearTimeout(chronologyJumpRef.current.timeoutId);
        chronologyJumpRef.current = null;
      }
    };
  }, [projectIdsKey]);

  useEffect(() => {
    if (!drawerOpen && !codeDrawerOpen && !lightboxMedia) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (lightboxMedia) {
        setLightboxMedia(null);
        return;
      }
      setDrawerOpen(false);
      setCodeDrawerOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen, codeDrawerOpen, lightboxMedia]);

  useEffect(() => {
    if (!overlayOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [overlayOpen]);

  const toggleView = () => {
    const nextShowAll = !showAll;
    const params = new URLSearchParams(window.location.search);
    if (nextShowAll) params.set('view', 'all');
    else params.delete('view');
    const query = params.toString();
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}`,
    );
    setViewOverride(nextShowAll);
  };

  const selectProjectScope = (scope: ProjectScope) => {
    const params = new URLSearchParams(window.location.search);
    if (scope === 'all') params.delete('scope');
    else params.set('scope', scope);
    const query = params.toString();
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}`,
    );
    setProjectScope(scope);
    setSelectedProjectId(null);
    setActiveProjectId(null);
    setLightboxMedia(null);
    setDrawerOpen(false);
  };

  const updateFilters = (nextFilters: string[]) => {
    const uniqueFilters = [
      ...new Set(nextFilters.map((tag) => tag.toLowerCase())),
    ];
    const params = new URLSearchParams(window.location.search);
    ['signal', 'signals', 'some_signal', 'tags', 'tech'].forEach((key) =>
      params.delete(key),
    );
    if (uniqueFilters.length > 0) params.set('tech', uniqueFilters.join(','));
    params.delete('view');
    const query = params.toString();
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}`,
    );
    setActiveFilters(uniqueFilters);
    setViewOverride(false);
    setLightboxMedia(null);
    setDrawerOpen(false);
  };

  const toggleTag = (tag: string) => {
    setTagQuery('');
    setTagPickerOpen(false);
    updateFilters(
      activeFilters.includes(tag)
        ? activeFilters.filter((activeTag) => activeTag !== tag)
        : [...activeFilters, tag],
    );
  };

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveProjectId(projectId);
    setLightboxMedia(null);
    setCodeDrawerOpen(false);
    setDrawerOpen(true);
  };

  const jumpToProject = (projectId: string) => {
    const projectElement = document.getElementById(`project-${projectId}`);
    if (!projectElement) return;

    if (chronologyJumpRef.current) {
      window.clearTimeout(chronologyJumpRef.current.timeoutId);
    }

    const finishJump = () => {
      if (chronologyJumpRef.current?.projectId !== projectId) return;
      window.clearTimeout(chronologyJumpRef.current.timeoutId);
      chronologyJumpRef.current = null;
      setActiveProjectId(projectId);
    };
    const timeoutId = window.setTimeout(finishJump, 1200);
    chronologyJumpRef.current = { projectId, timeoutId };
    setActiveProjectId(projectId);

    window.addEventListener('scrollend', finishJump, { once: true });
    window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      projectElement.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      if (reducedMotion) window.requestAnimationFrame(finishJump);
    });
  };

  const downloadResume = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setPdfError(null);

    try {
      const { downloadResumePdf } = await import('./resume-pdf');
      await downloadResumePdf({
        company,
        signals: [...targets],
        projects: rankedProjects,
        primaryColor: urlState.primaryColor,
      });
    } catch (error) {
      console.error('Resume PDF generation failed', error);
      setPdfError('PDF 생성에 실패했습니다. 새로고침 후 다시 시도해 주세요.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!selectedProject) return null;

  return (
    <main className="portfolio" style={themeStyle}>
      {pdfError && (
        <div className="pdf-error" role="alert">
          <span>{pdfError}</span>
          <button type="button" onClick={() => setPdfError(null)}>
            닫기
          </button>
        </div>
      )}
      <div className="header-atmosphere" aria-hidden="true">
        <div className="header-atmosphere__paint" />
        <div className="header-atmosphere__blur">
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <header className="masthead page-shell">
        <a className="wordmark" href="#top" aria-label="맨 위로 이동">
          <strong>송재상</strong>
          <span>Backend · Platform · AI</span>
        </a>

        <nav className="masthead-nav" aria-label="주요 메뉴">
          <a
            className={activeSection === 'projects' ? 'is-active' : undefined}
            href="#projects"
          >
            Projects
          </a>
          <a
            className={activeSection === 'profile' ? 'is-active' : undefined}
            href="#profile"
          >
            Profile
          </a>
          <a href="mailto:thdwotkd123@gmail.com">Contact</a>
        </nav>

        <div className="masthead-actions">
          <span>Seoul · KR</span>
          <button
            type="button"
            disabled={isDownloadingPdf}
            onClick={downloadResume}
          >
            {isDownloadingPdf ? 'Creating PDF…' : 'Resume PDF ↓'}
          </button>
        </div>
      </header>

      <section id="top" className="hero page-shell">
        <div className="hero-kicker">
          <span>Engineering archive / 2018—2026</span>
          <span>{String(rankedProjects.length).padStart(2, '0')} systems</span>
        </div>

        <div className="hero-composition">
          <h1>
            <span>Code,</span>
            <span>as art.</span>
          </h1>
          <div className="hero-copy">
            <p>
              한 줄의 코드도 의도 없이 쓰지 않습니다. 구조와 흐름, 실제 작동까지
              하나의 작품처럼 완성합니다.
            </p>
            <button type="button" onClick={() => setCodeDrawerOpen(true)}>
              대표 코드 갤러리 · {codeProofs.length}선 ↗
            </button>
          </div>
        </div>

        <div className="hero-footer">
          <strong>Song Jaesang</strong>
          <span>Backend · Platform · Applied AI</span>
          <span>8 years / Seoul</span>
        </div>
      </section>

      <section id="projects" className="work-index page-shell">
        <header className="work-index__header">
          <div>
            <span>01 / Selected systems</span>
            <h2>문제를 시스템으로 바꾼 기록.</h2>
            <p>
              기술 목록보다 어떤 복잡도를 걷어내고, 운영에 무엇을 남겼는지로
              프로젝트를 읽습니다.
            </p>
          </div>
          <div>
            {hasFocus && activeFilters.length > 0 && (
              <span className="focus-signal">
                {activeFilters.map(tagLabel).join(' · ')}
              </span>
            )}
            {hasFocus && (
              <button type="button" onClick={toggleView}>
                {showAll ? '관련 경험만 보기' : '전체 경력 보기'}
              </button>
            )}
          </div>
        </header>

        <section className="stack-filter" aria-label="스택과 태그 검색">
          <div className="stack-filter__intro">
            <span>Find by capability</span>
            <p>
              기술을 고르면 사용 여부가 아니라, 그 기술이 맡았던 역할까지
              보여줍니다.
            </p>
          </div>
          <div className="stack-filter__control">
            <label htmlFor="stack-search">
              Search technology or capability
            </label>
            <div
              className={`stack-filter__picker${tagPickerOpen ? ' is-open' : ''}`}
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                ) {
                  setTagPickerOpen(false);
                }
              }}
            >
              <div className="stack-filter__input">
                <input
                  id="stack-search"
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={tagPickerOpen}
                  aria-controls="stack-options"
                  value={tagQuery}
                  placeholder="기술을 검색하거나 선택하세요"
                  autoComplete="off"
                  onFocus={() => setTagPickerOpen(true)}
                  onChange={(event) => {
                    setTagQuery(event.target.value);
                    setTagPickerOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setTagPickerOpen(false);
                  }}
                />
                <span aria-hidden="true">
                  {normalizedTagQuery && filteredTags.length > 0
                    ? filteredTags.length
                    : '⌄'}
                </span>
              </div>
              {tagPickerOpen && (
                <div
                  id="stack-options"
                  className="stack-filter__results"
                  aria-label="검색된 기술"
                  role="listbox"
                >
                  <header>
                    <span>
                      {normalizedTagQuery
                        ? '검색 결과'
                        : '이 범위에서 자주 쓴 기술'}
                    </span>
                    <small>{pickerTags.length}개</small>
                  </header>
                  {pickerTags.length > 0 ? (
                    pickerTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        role="option"
                        aria-selected={activeFilters.includes(tag)}
                        className={
                          activeFilters.includes(tag) ? 'is-active' : undefined
                        }
                        onClick={() => toggleTag(tag)}
                      >
                        <span>{tagLabel(tag)}</span>
                        <small>
                          {
                            scopedRanked.filter((project) =>
                              projectMatchesTarget(project, tag),
                            ).length
                          }{' '}
                          projects
                        </small>
                      </button>
                    ))
                  ) : (
                    <p>일치하는 기술이 없습니다.</p>
                  )}
                </div>
              )}
            </div>
            {activeFilters.length > 0 && (
              <div className="stack-filter__selected" aria-label="선택된 태그">
                {activeFilters.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                  >
                    {tagLabel(tag)} <span aria-hidden="true">×</span>
                  </button>
                ))}
                <button type="button" onClick={() => updateFilters([])}>
                  Clear all
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="work-layout">
          <aside className="timeline" aria-label="프로젝트 연대기">
            <div className="timeline__sticky">
              <p>Chronology</p>
              <div className="timeline__groups">
                {chronologyGroups.map((group) => (
                  <section className="timeline-year" key={group.year}>
                    <button
                      type="button"
                      className={`timeline-year__header${
                        group.projects.some(
                          (project) => project.id === currentProjectId,
                        )
                          ? ' is-current'
                          : ''
                      }`}
                      onClick={() => jumpToProject(group.projects[0].id)}
                    >
                      <time>{group.year}</time>
                    </button>
                    <div className="timeline-year__projects">
                      {group.projects.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          className={
                            project.id === currentProjectId
                              ? 'is-current'
                              : undefined
                          }
                          onClick={() => jumpToProject(project.id)}
                        >
                          <span>{project.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </aside>

          <div className="project-column">
            <nav className="project-scope" aria-label="프로젝트 종류">
              <span>Project category</span>
              <div role="tablist" aria-label="프로젝트 범위 선택">
                {(
                  [
                    ['all', '전체'],
                    ['work', '업무 프로젝트'],
                    ['personal', '개인 프로젝트'],
                  ] as const
                ).map(([scope, label]) => (
                  <button
                    key={scope}
                    type="button"
                    role="tab"
                    aria-selected={projectScope === scope}
                    className={projectScope === scope ? 'is-active' : undefined}
                    onClick={() => selectProjectScope(scope)}
                  >
                    <span>{label}</span>
                    <small>
                      {String(projectCounts[scope]).padStart(2, '0')}
                    </small>
                  </button>
                ))}
              </div>
            </nav>

            <div className="project-list">
              {projectYearGroups.map((group) => (
                <section
                  key={group.year}
                  className={`project-year-group${
                    group.year === currentTimelineYear ? ' is-current' : ''
                  }`}
                  aria-label={`${group.year}년 프로젝트`}
                >
                  <header className="project-year-group__header">
                    <span>{group.year}</span>
                    <i aria-hidden="true" />
                  </header>
                  <div>
                    {group.projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        index={rankedProjects.findIndex(
                          (item) => item.id === project.id,
                        )}
                        selected={project.id === currentProjectId}
                        focusLabel={focusLabel}
                        matchProofs={
                          hasFocus ? projectMatchProofs(project, targets) : []
                        }
                        onOpen={openProject}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProjectDrawer
        project={selectedProject}
        index={selectedProjectIndex}
        open={drawerOpen}
        onMediaOpen={setLightboxMedia}
        onClose={() => {
          setLightboxMedia(null);
          setDrawerOpen(false);
        }}
      />

      <MediaLightbox
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />

      <CodeDrawer
        proofs={codeProofs}
        selectedId={selectedCodeProofId}
        open={codeDrawerOpen}
        onSelect={setSelectedCodeProofId}
        onClose={() => setCodeDrawerOpen(false)}
      />

      <section id="profile" className="profile-section">
        <div className="profile-shell page-shell">
          <header className="profile-header">
            <p>02 / Profile</p>
            <div>
              <span>Song Jaesang</span>
              <span>Backend · Platform · Applied AI</span>
              <span>Seoul · KR</span>
            </div>
          </header>

          <div className="profile-statement">
            <h2>
              복잡한 문제를
              <br />
              단순한 구조로.
            </h2>
            <div className="profile-summary">
              <p>
                8년 동안 백엔드와 플랫폼, AI 제품을 만들었습니다. 코드를
                작성하는 순간부터 배포 이후의 비용과 장애, 현장 운영까지 같은
                문제로 다룹니다.
              </p>
              <dl>
                <div>
                  <dt>What I ship</dt>
                  <dd>Backend · Platform · Applied AI</dd>
                </div>
                <div>
                  <dt>How I work</dt>
                  <dd>설계 → 구현 → 배포 → 운영</dd>
                </div>
                <div>
                  <dt>What I improve</dt>
                  <dd>복잡도 · 비용 · 성능</dd>
                </div>
              </dl>
            </div>
          </div>

          <section
            className="profile-evidence"
            aria-labelledby="evidence-title"
          >
            <header>
              <span>03 / Evidence</span>
              <h3 id="evidence-title">코드 밖에서도 확인된 결과.</h3>
            </header>
            <div>
              <article>
                <time>2026.06</time>
                <strong>한국정보기술학회 하계종합학술대회</strong>
                <p>철스크랩 분류 모델의 attention 개선 연구 · 제2저자</p>
              </article>
              <article>
                <time>2024.06</time>
                <strong>철강 스크랩 AI 검수 POC 성과 포상</strong>
                <p>POC 설계·개발과 본사업 전환 기여 · 사내 포상</p>
              </article>
              <article>
                <time>2021.10</time>
                <strong>복지로 차세대 ERP 우수개발자상</strong>
                <p>공통 기능·응답 성능·개발 자동화 기여 · 프로젝트 내부 수상</p>
              </article>
              <article>
                <time>2026</time>
                <strong>직접 만든 데스크톱 제품 배포</strong>
                <p>Copylight와 Bucket Studio · Microsoft Store 공개</p>
              </article>
            </div>
          </section>

          <footer className="profile-contact">
            <div>
              <span>Start a conversation</span>
              <strong>함께 만들 이야기가 있다면.</strong>
            </div>
            <a href="mailto:thdwotkd123@gmail.com">thdwotkd123@gmail.com ↗</a>
            <a href="tel:+821024082131">+82 10-2408-2131</a>
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={downloadResume}
            >
              {isDownloadingPdf ? 'Creating PDF…' : 'Resume PDF ↓'}
            </button>
          </footer>
        </div>
      </section>

      {showBackToTop && (
        <button
          type="button"
          className="back-to-top"
          aria-label="페이지 맨 위로 이동"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'auto'
                : 'smooth',
            })
          }
        >
          <span aria-hidden="true">↑</span>
          <small>Top</small>
        </button>
      )}
    </main>
  );
}

function ProjectCard({
  project,
  index,
  selected,
  focusLabel,
  matchProofs,
  onOpen,
}: {
  project: Project;
  index: number;
  selected: boolean;
  focusLabel: string;
  matchProofs: MatchProof[];
  onOpen: (projectId: string) => void;
}) {
  const projectStyle = {
    '--project-a': project.colors[0],
    '--project-b': project.colors[1],
    '--project-c': project.colors[2],
  } as CSSProperties;

  return (
    <button
      id={`project-${project.id}`}
      data-project-id={project.id}
      type="button"
      className={`project-card${selected ? ' is-selected' : ''}`}
      style={projectStyle}
      onClick={() => onOpen(project.id)}
      aria-label={`${project.title} 자세히 보기`}
    >
      <span className="project-card__visual">
        <span className="project-card__meta">
          <time>{project.period}</time>
          <em>
            {project.status === 'In operation' ? 'Live system' : 'Completed'}
          </em>
        </span>
        <span className="project-card__index">
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>

      <span className="project-card__body">
        <small className="project-card__eyebrow">
          {project.category} · {project.company}
        </small>
        <span className="project-card__perspective">{project.perspective}</span>
        <strong className="project-card__title">{project.title}</strong>

        {matchProofs.length > 0 && (
          <span className="project-card__match">
            <strong>왜 이 기술과 연결되는가 · {focusLabel}</strong>
            {matchProofs.map((proof) => (
              <span key={proof.text}>{proof.text}</span>
            ))}
          </span>
        )}

        {matchProofs.length === 0 && (
          <span className="project-card__note">{project.summary}</span>
        )}

        <span className="project-card__stack">
          {project.stack.slice(0, 4).map((stack) => (
            <i key={stack}>{stack}</i>
          ))}
        </span>

        <span className="project-card__footer">
          <span>
            <small>확인된 결과</small>
            <strong>{project.outcome}</strong>
          </span>
          <span className="project-card__action" aria-hidden="true">
            자세히 보기 ↗
          </span>
        </span>
      </span>
    </button>
  );
}

function ProjectDrawer({
  project,
  index,
  open,
  onMediaOpen,
  onClose,
}: {
  project: Project;
  index: number;
  open: boolean;
  onMediaOpen: (media: ProjectMedia) => void;
  onClose: () => void;
}) {
  return (
    <div
      className={`project-drawer${open ? ' is-open' : ''}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="project-drawer__backdrop"
        aria-label="프로젝트 상세 닫기"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <dialog
        className="project-drawer__panel"
        open={open}
        aria-labelledby="drawer-title"
      >
        <header className="project-drawer__header">
          <div>
            <span>프로젝트 / {String(index + 1).padStart(2, '0')}</span>
            <span>{project.period}</span>
          </div>
          <button type="button" onClick={onClose} tabIndex={open ? 0 : -1}>
            닫기 <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="project-drawer__body">
          <p className="project-drawer__eyebrow">
            {project.company} · {project.category}
          </p>
          <h2 id="drawer-title">{project.title}</h2>
          <p className="project-drawer__lead">{project.lead}</p>

          <dl className="project-drawer__facts">
            <div>
              <dt>담당</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{project.status === 'In operation' ? '운영 중' : '완료'}</dd>
            </div>
          </dl>

          {project.media?.length ? (
            <section
              className="project-drawer__media"
              aria-label={`${project.title} 작동 화면`}
            >
              <h3>작동 화면</h3>
              <div className="project-drawer__media-grid">
                {project.media.map((media, mediaIndex) => (
                  <figure key={media.src}>
                    <button
                      type="button"
                      className="project-drawer__media-frame"
                      aria-label={`이미지 확대: ${media.caption}`}
                      aria-haspopup="dialog"
                      onClick={() => onMediaOpen(media)}
                    >
                      <Image
                        src={media.src}
                        alt={media.alt}
                        width={1920}
                        height={1080}
                        sizes="(max-width: 760px) 100vw, 760px"
                      />
                      <span aria-hidden="true">확대 ↗</span>
                    </button>
                    <figcaption>
                      <span>{String(mediaIndex + 1).padStart(2, '0')}</span>
                      <p>{media.caption}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <div className="project-drawer__story">
            <section>
              <h3>문제가 뭐였나</h3>
              <p>{project.startingPoint}</p>
            </section>
            <section>
              <h3>내가 한 일</h3>
              <p>{project.build}</p>
            </section>
          </div>

          <section className="project-drawer__stack">
            <h3>구현에서 신경 쓴 것</h3>
            <ul>
              {project.matchProofs.map((proof) => (
                <li key={proof.text}>
                  <strong>{proofStackLabel(project, proof)}</strong>
                  <span>{proof.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="project-drawer__outcome">
            <h3>실제 결과</h3>
            <p>{project.outcome}</p>
          </section>
        </div>
      </dialog>
    </div>
  );
}

function MediaLightbox({
  media,
  onClose,
}: {
  media: ProjectMedia | null;
  onClose: () => void;
}) {
  return (
    <div
      className={`media-lightbox${media ? ' is-open' : ''}`}
      aria-hidden={!media}
    >
      <button
        type="button"
        className="media-lightbox__backdrop"
        aria-label="확대 이미지 닫기"
        tabIndex={media ? 0 : -1}
        onClick={onClose}
      />
      <dialog
        className="media-lightbox__panel"
        open={Boolean(media)}
        aria-modal="true"
        aria-labelledby="media-lightbox-title"
      >
        <header className="media-lightbox__header">
          <span id="media-lightbox-title">작동 화면 확대</span>
          <button type="button" onClick={onClose} autoFocus>
            닫기 <span aria-hidden="true">×</span>
          </button>
        </header>
        {media ? (
          <>
            <div className="media-lightbox__canvas">
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes="100vw"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p className="media-lightbox__caption">{media.caption}</p>
          </>
        ) : null}
      </dialog>
    </div>
  );
}

function CodeDrawer({
  proofs,
  selectedId,
  open,
  onSelect,
  onClose,
}: {
  proofs: CodeProof[];
  selectedId: string;
  open: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const selected = proofs.find((proof) => proof.id === selectedId) ?? proofs[0];
  const selectedIndex = proofs.findIndex((proof) => proof.id === selected.id);
  const categoryProofs = proofs.filter(
    (proof) => proof.category === selected.category,
  );

  return (
    <div className={`code-drawer${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button
        type="button"
        className="code-drawer__backdrop"
        aria-label="코드 프리뷰 닫기"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <dialog
        className="code-drawer__panel"
        open={open}
        aria-labelledby="code-drawer-title"
      >
        <header className="code-drawer__header">
          <div>
            <span>Code gallery / {String(proofs.length).padStart(2, '0')}</span>
            <span>실제 코드 · 식별자만 비식별</span>
          </div>
          <button type="button" onClick={onClose} tabIndex={open ? 0 : -1}>
            Close <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="code-drawer__body">
          <nav
            className="code-drawer__index"
            aria-label="대표 코드 카테고리 선택"
          >
            {codeCategories.map((category, index) => {
              const categoryItems = proofs.filter(
                (proof) => proof.category === category,
              );
              return (
                <button
                  key={category}
                  type="button"
                  className={
                    category === selected.category ? 'is-active' : undefined
                  }
                  tabIndex={open ? 0 : -1}
                  aria-pressed={category === selected.category}
                  onClick={() => onSelect(categoryItems[0].id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{category}</strong>
                  <small>
                    {String(categoryItems.length).padStart(2, '0')} studies
                  </small>
                </button>
              );
            })}
          </nav>

          <section className="code-drawer__stage">
            <div className="code-drawer__shelf">
              <div>
                <span>{selected.category}</span>
                <small>언어와 구현 주제를 골라 둘러보세요.</small>
              </div>
              <ul aria-label={`${selected.category} 대표 코드`}>
                {categoryProofs.map((proof) => (
                  <li key={proof.id}>
                    <button
                      type="button"
                      className={
                        proof.id === selected.id ? 'is-active' : undefined
                      }
                      tabIndex={open ? 0 : -1}
                      aria-pressed={proof.id === selected.id}
                      onClick={() => onSelect(proof.id)}
                    >
                      <strong>{proof.product}</strong>
                      <small>{proof.label}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="code-drawer__meta">
              <span>
                {String(selectedIndex + 1).padStart(2, '0')} ·{' '}
                {selected.language}
              </span>
              <span>{selected.status}</span>
            </div>
            <h2 id="code-drawer-title">{selected.title}</h2>
            <p>{selected.summary}</p>

            <div className="code-window">
              <header>
                <div aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <span>{selected.file}</span>
                <small>{selected.language.split(' / ')[0]}</small>
              </header>
              <pre
                aria-label={`${selected.category} ${selected.product} 비식별 코드`}
              >
                <code>
                  {selected.code.map((line, index) => (
                    <span key={`${selected.id}-${index}`}>
                      <i aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </i>
                      <b>{highlightCodeLine(line)}</b>
                    </span>
                  ))}
                </code>
              </pre>
            </div>

            <footer className="code-drawer__evidence">
              <span>What this shows</span>
              <strong>{selected.evidence}</strong>
              <p>
                실제 저장소에서 선별한 코드입니다. 회사·고객·도메인 식별자와
                민감한 리터럴만 치환했으며 제어 흐름과 알고리즘은 원본을
                유지했습니다.
              </p>
            </footer>
          </section>
        </div>
      </dialog>
    </div>
  );
}
