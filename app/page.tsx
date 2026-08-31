'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'next/navigation';

type MatchProof = {
  signals: string[];
  text: string;
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
};

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
    id: 'mobile-ai-inspection',
    period: 'Apr—May 2026',
    timelineYear: '2026',
    status: 'In operation',
    category: 'Applied AI',
    title: '철스크랩 모바일 AI 검수',
    company: 'AIMOS',
    role: 'Senior Fullstack / AI Engineer',
    perspective: 'Field input, complete feedback loop',
    archiveNote:
      '현장의 한 장을 업로드 기능으로 끝내지 않고, 인증·저장·추론·알림이 실패해도 다시 이어지는 하나의 제품 경계로 설계했습니다.',
    summary:
      '촬영부터 AI 판정, 결과 저장과 담당자 알림까지 하나의 모바일 흐름으로 연결했습니다.',
    lead: '현장에서 찍힌 한 장의 이미지가 모델의 판정과 담당자의 알림으로 이어지도록, 모바일부터 추론 서버까지 전체 흐름을 만들었습니다.',
    startingPoint:
      '현장 작업자는 별도의 설치 과정 없이 휴대폰으로 검수를 시작해야 했고, 대용량 이미지 전송과 AI 추론은 모바일 네트워크에서도 안정적으로 동작해야 했습니다.',
    build:
      'Flutter Web PWA와 Go gRPC 백엔드, FastAPI 추론 서버를 연결했습니다. Presigned URL 업로드, HMAC 웹훅, PASETO 인증, Redis 세션과 FCM 알림까지 직접 구성했습니다.',
    outcome: '촬영 → 업로드 → AI 판정 → 저장 → 알림을 End-to-End로 구축',
    stack: ['Flutter Web', 'Go', 'gRPC-Web', 'FastAPI', 'PASETO', 'Redis'],
    tags: ['ai', 'backend', 'platform', 'go', 'fastapi', 'grpc', 'flutter'],
    matchProofs: [
      {
        signals: ['flutter', 'flutter web'],
        text: 'Flutter Web PWA로 설치 부담 없이 촬영과 업로드가 이어지는 현장 입력 화면을 만들었습니다.',
      },
      {
        signals: ['go', 'grpc', 'grpc-web', 'backend', 'platform'],
        text: 'Go와 gRPC-Web이 모바일 요청, 저장소 업로드, 추론 호출 사이의 안정적인 백엔드 경계를 담당합니다.',
      },
      {
        signals: ['fastapi', 'ai'],
        text: 'FastAPI를 모델 추론 경계로 두어 제품 API와 AI 실행 환경을 독립적으로 운영했습니다.',
      },
      {
        signals: ['redis', 'paseto'],
        text: 'PASETO 인증과 Redis 세션으로 모바일 환경의 인증 상태와 재요청 흐름을 관리했습니다.',
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
    perspective: 'Compute only when the product needs it',
    archiveNote:
      '모델 성능보다 먼저 유휴 GPU가 만드는 고정비를 문제로 보고, 추론을 상시 서버에서 수요 기반 실행 단위로 바꿨습니다.',
    summary:
      'Naver Cloud의 추론 환경을 AWS SageMaker 기반의 탄력적인 운영 구조로 전환했습니다.',
    lead: 'GPU가 필요한 순간에만 추론 환경이 움직이도록 클라우드 구조를 다시 설계했습니다.',
    startingPoint:
      '항상 실행되는 GPU 인스턴스는 사용량과 무관하게 비용을 만들었고, 기존 추론 환경은 서비스별 확장과 배포를 반복하기 어려웠습니다.',
    build:
      '모델 배포와 호출 경계를 분리하고 SageMaker 기반 추론 구조로 옮겼습니다. 비사용 시간에는 GPU가 실행되지 않는 운영 방식을 적용했습니다.',
    outcome: '비사용 시간 GPU를 멈추는 Zero-scale 추론 구조 적용',
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
        text: 'FastAPI 호출 경계를 유지해 인프라가 바뀌어도 제품의 추론 계약은 흔들리지 않게 했습니다.',
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
    perspective: 'Own the complete data loop',
    archiveNote:
      '라벨 하나를 그리는 UI보다 원천 데이터가 검수·승인·학습본으로 바뀌는 전체 생명주기를 제품으로 만들었습니다.',
    summary:
      '라벨링, 검수, 승인과 데이터셋 생성을 하나로 묶어 외부 솔루션을 대체했습니다.',
    lead: '외부 도구에 흩어져 있던 데이터 작업을, 모델 학습까지 이어지는 하나의 사내 플랫폼으로 만들었습니다.',
    startingPoint:
      'AI 학습 데이터가 외부 라벨링 솔루션과 수작업 검수 과정에 나뉘어 있었습니다. 비용뿐 아니라 데이터 이동과 버전 관리도 반복됐습니다.',
    build:
      '라벨링, 검수, 승인, 데이터셋 내보내기를 한 제품에 담았습니다. SAM 오토 라벨링, 멀티 서버 임베딩 캐시, Keycloak 인증과 Object Storage를 연결했습니다.',
    outcome: '외부 라벨링 솔루션 비용 연간 약 2,000만 원 절감',
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
        text: 'Go 백엔드가 작업 배정, 검수 상태, 승인과 데이터셋 내보내기의 전체 상태 전이를 관리합니다.',
      },
      {
        signals: ['ai', 'sam', 'embedding cache'],
        text: 'SAM 자동 라벨링과 멀티 서버 임베딩 캐시로 반복 입력의 모델 실행 비용을 줄였습니다.',
      },
      {
        signals: ['keycloak'],
        text: 'Keycloak으로 팀과 역할에 따른 내부 데이터 접근 경계를 분리했습니다.',
      },
      {
        signals: ['object-storage', 'object storage'],
        text: '원천 이미지와 산출 데이터는 Object Storage에 두고 애플리케이션은 수명주기만 통제합니다.',
      },
      {
        signals: ['cost'],
        text: '외부 라벨링 제품이 맡던 전체 흐름을 내재화해 연간 약 2,000만 원의 비용을 줄였습니다.',
      },
    ],
    flow: ['Raw data', 'Auto labeling', 'Review', 'Approval', 'Dataset export'],
    colors: ['#ff8e9c', '#78d6ff', '#ffe99a'],
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
    perspective: 'A model that changes an operation',
    archiveNote:
      '정확도 하나가 아니라 차량의 연속성, 번호판 오류, 검수 상태 전이를 함께 다뤄 모델을 현장 자동화로 연결했습니다.',
    summary:
      '번호판 인식과 차량 추적을 연결해 차량의 입출에 따라 검수를 자동으로 제어했습니다.',
    lead: '카메라 프레임 속 차량을 계속 식별하고, 입차부터 출차까지 검수의 시작과 종료를 자동화했습니다.',
    startingPoint:
      '현장에서는 차량의 진입과 이탈을 사람이 확인해 검수 상태를 바꿔야 했고, 번호판의 각도와 조명 변화가 인식 정확도를 떨어뜨렸습니다.',
    build:
      '차량 추적과 LPRNet을 연결하고, 합성 데이터와 Focal Loss를 활용해 현장 조건에 맞게 문자 인식을 개선했습니다.',
    outcome: '번호판 문자 인식 정확도 95% 이상 달성',
    stack: ['LPRNet', 'Focal Loss', 'Vehicle Tracking', 'Synthetic Data'],
    tags: ['ai', 'backend', 'computer-vision', 'tracking', 'lpr'],
    matchProofs: [
      {
        signals: ['ai', 'computer-vision', 'tracking', 'vehicle tracking'],
        text: '프레임별 검출을 Track ID로 연결해 차량의 진입부터 이탈까지 하나의 상태로 유지했습니다.',
      },
      {
        signals: ['lpr', 'lprnet'],
        text: 'LPRNet을 현장 번호판 조건에 맞춰 학습하고 차량 추적 결과와 결합했습니다.',
      },
      {
        signals: ['focal loss', 'synthetic data'],
        text: '희소한 문자와 촬영 조건을 보완하기 위해 합성 데이터와 Focal Loss를 함께 사용했습니다.',
      },
      {
        signals: ['backend'],
        text: '추론 결과를 검수 시작·종료 상태로 변환해 운영 시스템이 바로 소비할 수 있게 했습니다.',
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
    perspective: 'Architecture as an economic decision',
    archiveNote:
      '서버 대수를 줄인 일이 아니라 데이터 이동과 저장, 동기 처리 경계를 다시 그려 비용 구조 자체를 바꾼 재구축입니다.',
    summary:
      '분산 DB와 동기 처리, 현장 Edge 서버를 통합 운영 구조로 다시 설계했습니다.',
    lead: '분산되어 있던 56대의 서버를 10여 대로 줄이고, 월 인프라 비용을 약 6,000만 원에서 500만 원으로 낮췄습니다.',
    startingPoint:
      '현장마다 분리된 DB와 동기식 처리, 다수의 Edge 서버가 장애 대응과 데이터 관리 비용을 키우고 있었습니다.',
    build:
      'Object Storage, Redis, CloudFront와 통합 DB를 중심으로 처리 경계를 재설계했습니다. 원본 데이터의 수명주기에 맞춰 Archive Storage도 적용했습니다.',
    outcome: '월 비용 약 6,000만 원 → 500만 원 · 서버 56대 → 10여 대',
    stack: [
      'FastAPI',
      'Redis',
      'CloudFront',
      'Object Storage',
      'Archive Storage',
    ],
    tags: ['cost', 'backend', 'platform', 'infra', 'redis', 'aws', 'ncp'],
    matchProofs: [
      {
        signals: ['fastapi', 'backend', 'platform'],
        text: '분산된 현장 처리를 FastAPI 기반 통합 API로 모아 운영과 배포 경계를 단순화했습니다.',
      },
      {
        signals: ['redis'],
        text: 'Redis를 실시간 상태와 반복 조회의 완충 계층으로 사용해 동기 처리 병목을 줄였습니다.',
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
        text: 'CloudFront와 계층형 Object Storage로 원본 데이터의 전송·보관 비용을 수명주기에 맞게 분리했습니다.',
      },
      {
        signals: ['cost'],
        text: '56대 분산 서버를 10여 대로 통합해 월 인프라 비용을 약 6,000만 원에서 500만 원으로 낮췄습니다.',
      },
    ],
    flow: [
      '56 edge servers',
      'Unified API',
      'Redis',
      'Object Storage',
      '10+ servers',
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
    perspective: 'A prototype that earns the real build',
    archiveNote:
      '데모 화면이 아니라 현장 영상과 실제 모델을 묶은 실행 가능한 제품으로 사업 가능성을 증명했습니다.',
    summary:
      'RTSP 수신부터 프레임 캡처, AI 추론과 결과 표시까지 Windows 앱으로 구현했습니다.',
    lead: '영상 입력부터 AI 결과 확인까지 실제 현장에서 검증할 수 있는 첫 제품을 빠르게 완성했습니다.',
    startingPoint:
      '사업 가능성을 판단하려면 현장 CCTV 영상과 AI 모델을 연결한 실행 가능한 검수 앱이 필요했습니다.',
    build:
      'Flutter Windows에서 RTSP 영상을 받고 프레임을 캡처해 AI 추론과 DB 저장, 결과 표시까지 이어지는 POC를 구축했습니다.',
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
    perspective: 'Make invisible queues legible',
    archiveNote:
      '자원을 공유하는 자동화 작업의 충돌을 시간표로 번역해, 보이지 않던 기다림을 운영 가능한 정보로 바꿨습니다.',
    summary:
      'UiPath 실행 이력과 로봇 이벤트를 수집해 작업의 예상 시작·종료 시간을 보여줬습니다.',
    lead: '보이지 않던 로봇 작업 대기열을 시간 정보로 바꿔 운영자가 다음 실행을 예측할 수 있게 했습니다.',
    startingPoint:
      '여러 RPA 작업이 같은 로봇 자원을 사용하면서, 운영자는 어떤 작업이 언제 시작하고 끝날지 알기 어려웠습니다.',
    build:
      'UiPath 실행 이력과 로봇 이벤트를 웹훅으로 수집하고, 작업별 예상 시간을 계산해 캘린더에 표시했습니다.',
    outcome: '예상 시작·종료 시간을 캘린더에서 확인하도록 구현',
    stack: ['UiPath', 'Webhook', 'Java', 'JPA', 'Vue'],
    tags: ['backend', 'platform', 'rpa', 'java', 'webhook', 'leadership'],
    matchProofs: [
      {
        signals: ['rpa', 'uipath', 'webhook'],
        text: 'UiPath 실행 이력과 로봇 이벤트를 웹훅으로 수집해 예측 가능한 이벤트 흐름으로 바꿨습니다.',
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
        text: '4인 팀의 리드로 예측 로직, 이벤트 수집과 운영 화면의 경계를 조율했습니다.',
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
    perspective: 'AI inside a complete desktop product',
    archiveNote:
      '모델을 따로 시연하지 않고 데스크톱 격리, 실시간 통신, 감독 흐름 안에 넣어 실제 시험 경험으로 완성했습니다.',
    summary:
      '사람·휴대폰 검출과 실시간 채팅을 포함한 시험 응시 클라이언트를 개발했습니다.',
    lead: '시험 화면 안에서 객체 검출, 실시간 소통과 운영 상태가 함께 움직이는 응시 환경을 구축했습니다.',
    startingPoint:
      '원격 시험에서 부정행위 징후를 감지하면서도 응시자와 감독자가 실시간으로 소통할 수 있는 데스크톱 환경이 필요했습니다.',
    build:
      '약 10만 장의 학습 데이터를 준비해 YOLOv5 모델을 학습하고, Vue 3와 Electron, Redis와 WebSocket으로 응시 클라이언트와 운영 기능을 만들었습니다.',
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
        text: 'Electron 프로세스 경계 안에 시험 화면과 AI 감지 기능을 담아 배포 가능한 응시 앱으로 만들었습니다.',
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
    perspective: 'Fast, shared infrastructure for public traffic',
    archiveNote:
      '기능별 화면보다 검색·외부 연계·공통 응답 규칙을 먼저 세워 많은 사용자가 쓰는 서비스의 기반을 만들었습니다.',
    summary: '통합검색, 공공데이터 연계 API와 공통·관리자 화면을 개발했습니다.',
    lead: '대국민 서비스의 검색과 외부 데이터 연계를 빠르고 일관된 공통 기반 위에 올렸습니다.',
    startingPoint:
      '차세대 전환 과정에서 통합검색, 공공데이터 연계와 여러 공통 화면을 같은 기준으로 구축해야 했습니다.',
    build:
      '검색과 공공데이터 API, 관리자 기능과 공통 화면을 개발하고 대국민 요청의 응답 시간을 관리했습니다.',
    outcome: '대국민 요청 응답 속도 40ms 이내 달성',
    stack: ['Integrated Search', 'Public Data API', 'Admin System', 'ERP'],
    tags: ['backend', 'platform', 'public-data', 'search', 'erp'],
    matchProofs: [
      {
        signals: ['search', 'integrated search'],
        text: '여러 서비스에 흩어진 정보를 통합검색 경계로 모으고 대국민 요청을 40ms 이내로 응답했습니다.',
      },
      {
        signals: ['public-data', 'public data api', 'backend'],
        text: '외부 공공데이터의 형식과 장애를 내부 공통 API가 흡수하도록 연계 계층을 만들었습니다.',
      },
      {
        signals: ['platform', 'admin system', 'erp'],
        text: '공통·관리자 화면과 ERP 연계를 같은 규칙 위에 올려 반복 개발을 줄였습니다.',
      },
    ],
    flow: [
      'Public request',
      'Common API',
      'Search',
      'External data',
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
    perspective: 'Correctness before convenience',
    archiveNote:
      '결제 성공을 화면 이벤트로 보지 않고 회계 반영과 중복 요청 제어까지 하나의 데이터 정합성 문제로 다뤘습니다.',
    summary:
      'BankPay와 EasyPay 결제 결과를 회계 처리까지 연결하고 중복 예약을 제어했습니다.',
    lead: '결제의 성공과 실패가 회계 데이터에 정확히 이어지도록, 동시 요청까지 고려한 백엔드를 만들었습니다.',
    startingPoint:
      '모바일과 PC 결제 결과를 회계 업무로 다시 옮기는 과정이 필요했고, 동시에 들어오는 요청은 중복 예약과 데이터 불일치를 만들 수 있었습니다.',
    build:
      'BankPay와 EasyPay를 적용하고 결제 결과를 회계 처리에 자동 연계했습니다. 동시 요청의 중복 예약을 막는 제어 로직도 구현했습니다.',
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
        text: 'Java 백엔드에서 결제사 응답 검증, 업무 상태 전이와 회계 연계 경계를 구현했습니다.',
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
  const [selectedCodeProofId, setSelectedCodeProofId] = useState(
    codeProofs[0].id,
  );
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'projects' | 'profile'>(
    'projects',
  );
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
  const matched = ranked.filter((project) => project.score > 0);
  const rankedProjects =
    showAll || targets.size === 0 || matched.length === 0 ? ranked : matched;

  const chronologyProjects = [...rankedProjects].sort(
    (a, b) => a.index - b.index,
  );
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
  const normalizedTagQuery = tagQuery.trim().toLowerCase();
  const filteredTags = normalizedTagQuery
    ? availableTags
        .filter((tag) =>
          `${tag} ${tagLabel(tag)}`.toLowerCase().includes(normalizedTagQuery),
        )
        .slice(0, 12)
    : [];
  const pickerTags = normalizedTagQuery
    ? filteredTags
    : availableTags.filter((tag) => !activeFilters.includes(tag)).slice(0, 10);

  useEffect(() => {
    document.title = company
      ? `송재상 — ${company} · Selected Projects`
      : '송재상 — Backend · Platform · AI Engineer';
  }, [company]);

  useEffect(() => {
    const updateActiveSection = () => {
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
    if (!drawerOpen && !codeDrawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setDrawerOpen(false);
      setCodeDrawerOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [drawerOpen, codeDrawerOpen]);

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
                >
                  {pickerTags.length > 0 ? (
                    pickerTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={
                          activeFilters.includes(tag) ? 'is-active' : undefined
                        }
                        onClick={() => toggleTag(tag)}
                      >
                        <span>{tagLabel(tag)}</span>
                        <small>
                          {
                            projects.filter((project) =>
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
              <div>
                {chronologyProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className={
                      project.id === currentProjectId ? 'is-current' : undefined
                    }
                    onClick={() => jumpToProject(project.id)}
                  >
                    <time>{project.timelineYear}</time>
                    <i aria-hidden="true" />
                    <span>{project.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="project-list">
            {rankedProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                selected={project.id === currentProjectId}
                focusLabel={focusLabel}
                matchProofs={
                  hasFocus ? projectMatchProofs(project, targets) : []
                }
                onOpen={openProject}
              />
            ))}
          </div>
        </div>
      </section>

      <ProjectDrawer
        project={selectedProject}
        index={selectedProjectIndex}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
          <span className="project-card__note">{project.archiveNote}</span>
        )}

        <span className="project-card__stack">
          {project.stack.slice(0, 4).map((stack) => (
            <i key={stack}>{stack}</i>
          ))}
        </span>

        <span className="project-card__footer">
          <span>
            <small>Proof in operation</small>
            <strong>{project.outcome}</strong>
          </span>
          <span className="project-card__action" aria-hidden="true">
            Open case ↗
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
  onClose,
}: {
  project: Project;
  index: number;
  open: boolean;
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
            <span>Experience / {String(index + 1).padStart(2, '0')}</span>
            <span>{project.period}</span>
          </div>
          <button type="button" onClick={onClose} tabIndex={open ? 0 : -1}>
            Close <span aria-hidden="true">×</span>
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
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{project.status}</dd>
            </div>
          </dl>

          <div className="project-drawer__story">
            <section>
              <span>01 / Starting point</span>
              <p>{project.startingPoint}</p>
            </section>
            <section>
              <span>02 / What I built</span>
              <p>{project.build}</p>
            </section>
          </div>

          <section className="project-drawer__stack">
            <span>03 / Stack decisions</span>
            <p>
              기술 이름만 나열하지 않고, 이 프로젝트에서 실제로 맡았던 역할을
              정리했습니다.
            </p>
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
            <span>04 / Outcome</span>
            <strong>{project.outcome}</strong>
          </section>
        </div>
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
