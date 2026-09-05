'use client';

import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';
import Image from 'next/image';
import {useSearchParams} from 'next/navigation';
import {resumeEvidence} from './resume-evidence';

type MatchProof = {
    signals: string[];
    text: string;
};

type ProjectMedia = {
    src: string;
    frames?: string[];
    naturalRatio?: boolean;
    width?: number;
    height?: number;
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

type ResumePdfSettings = {
    company: string;
    signals: string[];
    projectIds: string[];
    scope: ProjectScope;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    includeImages: boolean;
};

const resumePortfolioUrl =
    'https://song-jaesang-portfolio.thdwotkd123.chatgpt.site';

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
    media?: ProjectMedia[];
    note?: string;
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
        id: 'database-erp-schema',
        category: 'Database',
        product: 'PostgreSQL · ERP',
        label: '81-table domain model',
        title: '81개 테이블을 업무 경계와 데이터 흐름에 맞춰 설계했습니다.',
        summary:
            '테넌트·사용자·레슨·비용·정산·집계 영역을 분리하고, 쓰기 트랜잭션의 범위와 주요 조회 경로, 데이터 증가량을 기준으로 PK·FK와 보조 인덱스를 설계했습니다.',
        evidence: '81 tables · 79 PKs · 74 FKs · 26 explicit indexes',
        language: 'PostgreSQL / ERP Schema',
        file: 'fit_cloud_erp_schema.sql',
        status: 'Personal project · source-verified',
        code: [],
        media: [
            {
                src: '/code-proof/erp-schema-overview.png',
                width: 1380,
                height: 761,
                alt: '81개 테이블로 구성한 개인 ERP 프로젝트의 전체 데이터베이스 ERD',
                caption:
                    '전체 설계 · 81개 테이블의 업무 영역과 참조 관계를 한 화면에서 검토한 ERD',
            },
            {
                src: '/code-proof/erp-schema-detail.png',
                width: 1422,
                height: 784,
                alt: '테넌트 사용자 레슨 비용 집계 영역을 확대한 ERP 데이터베이스 ERD',
                caption:
                    '관계 확대 · 테넌트·사용자·레슨·비용·집계 테이블의 키와 참조 구조',
            },
        ],
        note: '개인 ERP 프로젝트의 실제 PostgreSQL 스키마입니다. 전체 구조와 핵심 업무 영역의 확대 화면을 함께 제시했습니다.',
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
        id: 'query-sales-goal-detail',
        category: 'Query',
        product: 'ERP · PostgreSQL',
        label: 'Weekly sales goal detail',
        title: '실적이 없는 주차도 목표 화면에서 빠지지 않게 만들었습니다.',
        summary:
            '월의 주차와 유효한 상위 매출 유형을 먼저 조합한 뒤 목표와 실제 매출을 LEFT JOIN했습니다. 데이터가 아직 없는 주차도 화면의 기준 행은 유지됩니다.',
        language: 'SQL / PostgreSQL',
        file: 'FetchSalesGoalDtl.sql',
        status: '직접 작성 · 개인 프로젝트',
        evidence: '주차 × 매출유형 기준 행 · 목표/실적 결합 · 유형 유효기간 반영',
        code: String.raw`/*FetchSalesGoalDtl*/
select :tenantId: as tenant_id
     , stb.week_no
     , stb.upper_sales_type_id
     , stb.upper_sales_type_nm
     , :goalYm: as goal_ym
     , :teacherId: as teacher_id
     , fsg.goal_amount
     , fs.amount
from (select fstb.standard_tenant_id
           , week_no
           , upper_sales_type_id
           , upper_sales_type_nm
           , sort_ordr
           , upper_sales_type_bgn_at
           , upper_sales_type_end_at
      from erp.fit_sales_type_base fstb
      cross join erp.get_weeks_in_month(:goalYm:) gwim
      where fstb.deleted_at is null
        and standard_tenant_id = erp.get_standard_tenant_id(:tenantId:)
        and gwim.last_day_of_week between coalesce(fstb.upper_sales_type_bgn_at, '2000-01-01')
                                      and coalesce(upper_sales_type_end_at, '2999-12-31')) stb
left join erp.fit_sales_goal fsg
       on fsg.upper_sales_type_id = stb.upper_sales_type_id
      and stb.standard_tenant_id = erp.get_standard_tenant_id(fsg.tenant_id)
      and fsg.goal_ym = :goalYm:
      and fsg.week_no = stb.week_no
      and fsg.teacher_id = :teacherId:
      and fsg.deleted_at is null
left join (select CEIL((EXTRACT(DAY FROM fs.sales_at) +
                        EXTRACT(DOW FROM DATE_TRUNC('MONTH', fs.sales_at))::INT - 1) / 7.0) as week_no
                , fs.tenant_id
                , sum(fs.amount) as amount
                , fstbd.upper_sales_type_id
           from erp.fit_sales fs
           join erp.fit_sales_type_base_dtl fstbd
             on fs.tenant_id = fstbd.standard_tenant_id
            and fs.sales_type_id = fstbd.sales_type_id
          where 0 = 0
            and fs.teacher_id = :teacherId:
            and sales_at between TO_DATE(:goalYm:, 'YYYYMM')
              and (DATE_TRUNC('month', to_date(:goalYm:, 'YYYYMM')) + INTERVAL '1 month')
            and fs.deleted_at is null
          group by CEIL((EXTRACT(DAY FROM fs.sales_at) +
                         EXTRACT(DOW FROM DATE_TRUNC('MONTH', fs.sales_at))::INT - 1) / 7.0)
                 , fs.tenant_id
                 , fstbd.upper_sales_type_id
                 , fs.sales_at) fs
       on stb.standard_tenant_id = fs.tenant_id
      and stb.week_no = fs.week_no
      and stb.upper_sales_type_id = fs.upper_sales_type_id
order by stb.sort_ordr, week_no`.split('\n'),
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
        lead: '성능이 좋았던 weight를 찾고도 어떤 데이터와 설정으로 만들었는지 몰라 다시 학습하는 일이 반복됐습니다. 학습 코드를 하나 더 만드는 대신, 실행 자체가 기록으로 남는 플랫폼을 만들었습니다.',
        startingPoint:
            '데이터셋·코드·metric·artifact가 서로 다른 장소에 흩어져 있어 필요한 파일을 다시 찾기 어려웠습니다. 모델마다 학습 방식도 달라 하나의 규칙으로 관리하기 어려웠습니다.',
        build:
            '한 번의 학습을 데이터셋 내용 버전, Git revision, 입력값, metric·로그·GPU 사용량, 최종 artifact로 정의했습니다. Flutter 화면과 Go 백엔드, 학습 서버 Agent를 연결해 실행부터 결과 보관까지 같은 기록으로 추적되게 했습니다. Agent는 GPU·CPU·RAM·디스크 상태를 Prometheus 형식으로 노출하고, Grafana Alloy가 5초마다 수집해 Mimir에 저장한 뒤 Go 백엔드가 gRPC로 화면에 전달하도록 구성했습니다.',
        outcome:
            '흩어진 데이터를 한곳에 모아, 여러 컴퓨터를 오가지 않고 학습과 실험 결과를 관리할 수 있게 됐습니다.',
        stack: ['Flutter', 'Go', 'Prometheus', 'Grafana Alloy', 'Mimir', 'RabbitMQ', 'Redis', 'Object Storage', 'MLOps'],
        tags: [
            'ai',
            'platform',
            'mlops',
            'flutter',
            'go',
            'rabbitmq',
            'object-storage',
            'prometheus',
            'grafana alloy',
            'mimir',
        ],
        matchProofs: [
            {
                signals: ['mlops', 'ai', 'platform'],
                text: 'Git revision, dataset version와 model input을 하나의 training run에 고정해 실험을 다시 추적할 수 있게 했습니다.',
            },
            {
                signals: ['prometheus', 'grafana alloy', 'mimir', 'monitoring'],
                text: 'Agent의 Prometheus endpoint에서 GPU·CPU·RAM·디스크 지표를 노출하고, Alloy → Mimir → gRPC 경로로 5초 단위 최신 자원 상태를 학습 상세 화면에 연결했습니다.',
            },
            {
                signals: ['flutter'],
                text: 'Flutter 화면에서 실행별 metric, 로그, GPU 사용량과 결과 파일을 함께 확인합니다.',
            },
            {
                signals: ['go', 'rabbitmq', 'backend'],
                text: 'Go 백엔드가 RabbitMQ로 원격 Agent에 학습을 지시하고 학습 코드의 변경 없이 artifact 및 학습 로그를 전송하려 노력 했습니다.',
            },
            {
                signals: ['object-storage', 'object storage'],
                text: '데이터셋을 중앙 관리함으로써 수집 절차의 복잡함을 줄이려 노력 했습니다.',
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
        media: [
            {
                src: '/project-media/venus-training-map.png',
                alt: 'AIMOS Venus에서 데이터셋부터 학습 실행 기록까지 연결한 학습 맵 화면',
                caption:
                    '데이터셋, Git 저장소, 학습 설정과 실행 기록의 관계를 한 화면에서 추적하는 학습 맵.',
            },
            {
                src: '/project-media/venus-training-result.png',
                alt: 'AIMOS Venus 학습 실행의 손실률과 정확도 지표를 비교하는 결과 화면',
                caption:
                    '실행별 loss, accuracy, learning rate와 재시작 구간을 함께 확인하는 학습 결과 화면.',
            },
        ],
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
        lead: 'DataGrip 콘솔이 사라진 뒤 예전에 실행한 DDL을 찾느라 시간을 쓴 적이 많았습니다. 제가 설계하고 배포한 DB 변경을 제 기억이 아니라 기록에 맡기려고 만든 도구입니다.',
        startingPoint:
            'DDL이 많아질수록 테이블 구조와 변경 이력을 파악하기 어려웠습니다. 컬럼 규칙을 일일이 찾아 적용하는 것도 번거로웠습니다.',
        build:
            '용어사전, ERD, live schema 비교, DDL, 변경 이력을 버저닝으로 관리할 수 있도록 하였습니다. 한눈에 변경 사항을 확인 할 수 있고 여러 데이터베이스에 대해 동일 기준을 적용할 수 있도록 하였습니다.',
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
        lead: '파일 하나를 찾는 방식이 provider마다 달랐습니다. 제가 원한 것은 또 하나의 관리 서버가 아니라, 여러 스토리지를 같은 방식으로 직접 다루는 데스크톱 도구였습니다.',
        startingPoint:
            '운영체제마다 모두 동일하게 쓸 수 있는 S3프로그램이 없었습니다. 또 현존하는 S3 프로그램은 기능이 제한 되어 편의성이 떨어졌습니다.',
        build:
            'Flutter 앱에서 Signature V4와 presigned URL을 직접 만들고 공통 탐색·검색·미리보기·수정 기능을 제공하여 편의성을 높였습니다. ',
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
        lead: '복사한 JSON을 정리하려고 편집기를 열고, 어제 쓴 값을 찾으려고 다시 복사하는 일이 반복됐습니다. 클립보드를 보관함이 아니라 짧게 작업하는 공간으로 만들고 싶었습니다.',
        startingPoint:
            '기본 클립보드는 기록을 보여주는 데서 끝났습니다. 검색한 내용을 고치고, 묶어 두고, 원래 앱으로 다시 붙여넣는 흐름은 매번 다른 도구를 거쳐야 했습니다.',
        build:
            '검색·pin·그룹·편집과 JSON 변환과 같은 개발자 편의 기능을 넣고, 민감한 기록은 AES-GCM으로 암호화했습니다.',
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
        lead: '“여기서만 느려요”라는 말을 받으면 개발자와 현장 담당자가 서로 다른 화면을 보고 있었습니다. 명령어를 모르는 사람도 같은 측정값을 보며 이야기할 수 있는 도구를 만들었습니다.',
        startingPoint:
            '한 번의 ping이나 traceroute 결과만 던져주는 것으로는 원인을 좁히기 어려웠습니다. DNS·사내망·외부 구간 중 어디를 다음에 확인해야 하는지까지 설명할 필요가 있었습니다.',
        build:
            '주소 하나로 DNS, ping, route, HTTP를 순서대로 측정하고 결과를 한 경로로 연결했습니다. 지연이 갑자기 늘어난 hop과 단순히 응답을 막은 장비를 구분하고, 원시 명령 결과 대신 다음에 확인할 행동과 이전 측정값을 함께 보여줬습니다.',
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
        id: 'nexteel',
        period: 'Apr—May 2026',
        timelineYear: '2026',
        status: 'In operation',
        category: 'Marketplace Platform',
        title: 'AI 고철 거래 플랫폼 Nexteel',
        company: 'AIMOS',
        role: 'Senior Fullstack / AI Engineer',
        perspective: '사진 한 장에서 견적과 거래까지',
        archiveNote:
            'AI 판정을 별도 기능으로 두지 않고 판매자의 매물 등록, 매입자의 견적, 수락 이후 채팅까지 실제 거래 흐름 안에 넣었습니다.',
        summary:
            '고철 사진 촬영과 AI 감정부터 매물 등록, 견적 비교, 수락과 채팅까지 하나의 거래 서비스로 만들었습니다.',
        lead: '사진을 분석하는 데서 끝나면 거래는 다시 전화와 메신저로 돌아갑니다. 판매자와 매입자가 같은 매물을 보고 견적을 주고받은 뒤 대화까지 이어갈 수 있는 고철 거래 플랫폼을 만들었습니다.',
        startingPoint:
            '판매자에게는 고철의 종류와 중량을 판단해 매물로 만드는 과정이 필요했고, 매입자에게는 지역과 품목별 매물 탐색, 견적 제안과 거래 협의가 필요했습니다.',
        build:
            'Flutter Web에서 사진 촬영과 AI 감정, 매물 등록과 탐색, 받은·보낸 견적, 수락·거절, 실시간 채팅 화면을 구현했습니다. 원본 이미지는 presigned URL로 Object Storage에 직접 올리고, Go·gRPC-Web 백엔드가 감정·매물·견적·채팅의 상태 전이를 관리하도록 구성했습니다. 견적이 수락되면 채팅방으로 이어지고 주요 상태 변화는 FCM으로 전달됩니다.',
        outcome:
            '사진 촬영 → AI 감정 → 매물 등록 → 견적 수락 → 채팅으로 이어지는 고철 거래 흐름 구현',
        stack: ['Flutter Web', 'Go', 'gRPC-Web', 'PostgreSQL', 'Object Storage', 'FastAPI', 'Redis', 'FCM', 'PASETO'],
        tags: ['marketplace', 'commerce', 'ai', 'backend', 'go', 'fastapi', 'grpc', 'flutter', 'chat', 'fcm'],
        matchProofs: [
            {
                signals: ['flutter', 'flutter web'],
                text: '판매자의 촬영·감정·매물 등록과 매입자의 매물 탐색·견적·채팅을 하나의 반응형 Flutter Web 서비스로 구현했습니다.',
            },
            {
                signals: ['go', 'grpc', 'grpc-web', 'backend', 'platform'],
                text: 'Go와 gRPC-Web으로 감정 요청, 매물 공개, 견적 제안·수락·거절과 채팅 상태를 연결했습니다.',
            },
            {
                signals: ['fastapi', 'ai'],
                text: 'AI 감정은 촬영한 고철의 품목과 중량 판단을 보조하고, 그 결과를 매물 등록 화면의 초깃값으로 연결했습니다.',
            },
            {
                signals: ['object storage'],
                text: '원본 이미지는 presigned URL로 Object Storage에 직접 업로드해 큰 파일이 API 서버를 경유하지 않게 했습니다.',
            },
            {
                signals: ['redis', 'paseto', 'fcm'],
                text: 'PASETO·Redis로 세션을 관리하고 견적과 채팅 등 거래 상태 변화는 FCM 알림으로 전달했습니다.',
            },
        ],
        flow: [
            'Photo / AI appraisal',
            'Publish listing',
            'Buyer quote',
            'Accept / reject',
            'Chat / notification',
        ],
        colors: ['#6ad7ff', '#8e7dff', '#ffd47a'],
        media: [
            {
                src: '/project-media/nexteel-analysis-detail.png',
                width: 382,
                height: 819,
                alt: 'Nexteel에서 고철 사진의 AI 분석 결과와 검출 카테고리 비율을 보여주는 화면',
                caption:
                    '촬영한 고철에서 103개 객체와 6개 품목을 검출하고 카테고리별 비율을 보여주는 AI 감정 상세 화면.',
            },
            {
                src: '/project-media/nexteel-listing-detail.png',
                width: 376,
                height: 816,
                alt: 'Nexteel 고철 매물의 기본 정보와 AI 판정 등급, 문의 기능을 보여주는 화면',
                caption:
                    '판매자가 등록한 고철의 지역·분류·AI 판정 등급을 확인하고 채팅이나 견적으로 이어지는 매물 상세 화면.',
            },
        ],
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
        lead: '추론 요청이 없는 시간에도 GPU 비용은 계속 나갔습니다. 제품의 호출 방식은 건드리지 않고, GPU가 실제로 필요한 시간만 남기는 전환을 맡았습니다.',
        startingPoint:
            '모델과 제품 API가 한 서버에 가까이 붙어 있어 GPU를 끄는 일과 실행 환경을 바꾸는 일이 곧 제품 수정으로 이어졌습니다.',
        build:
            '먼저 제품 API와 모델 실행의 경계를 분리했습니다. 이미지는 presigned URL로 전달하고 기존 FastAPI 규격은 유지한 채 실행만 SageMaker로 옮겼습니다. 비용 절감뿐 아니라 전환 중 제품 영향 범위를 작게 만드는 것을 기준으로 삼았습니다.',
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
        lead: '외부 라벨링 도구를 쓰고도 원본을 내려받아 작업자별로 나누고 완료본을 다시 모으는 일은 사람이 했습니다. 라벨을 그리는 화면보다 그 앞뒤의 흐름이 더 큰 문제였습니다.',
        startingPoint:
            '로컬 다운로드를 막으려고 약 1억 원의 보안 솔루션과 연간 약 2천만 원의 라벨링 도구를 사용했지만, 배분·검수·반려·재작업·승인은 서로 끊겨 있었습니다.',
        build:
            '먼저 작업 생명주기를 상태로 정의하고 그 위에 라벨링 UI를 올렸습니다. Object Storage 원본을 바로 배분하고 SAM 결과를 수정 가능한 polygon으로 바꿨습니다. Flutter와 Go로 배정부터 승인, COCO·YOLO·Pascal VOC export까지 단독 구현했습니다.',
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
                src: '/project-media/stitch-project-workspace-blurred.png',
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
        lead: '차량 한 대의 검수를 시작하려면 검수원, 사무실, 그라플 기사가 무전으로 순서를 맞춰야 했습니다. 차량의 진입과 이탈을 시스템이 알아보고 검수 상태를 바꾸게 했습니다.',
        startingPoint:
            '차가 들어올 때마다 사람이 카메라를 움직여 중심을 맞추고 검수 시작과 종료를 눌러야 했습니다. AI로 촬영하더라도 앞뒤 과정에는 계속 사람의 손이 필요했습니다.',
        build:
            '번호판으로 차량을 확인하고 PTZ 카메라로 차량을 추적해 촬영 위치를 맞춘 뒤 검수를 시작하도록 했습니다. 번호판 모델 학습을 위해 현장 데이터 약 4만 장과 합성 데이터 5천 장을 정제했습니다. 바운딩 박스의 흔들림은 모델만으로 안정되지 않아 원거리 탐지→중앙 이동→줌인→재탐지 규칙과 완만한 보정을 넣었습니다.',
        outcome:
            '검증 데이터 번호판 전체 문자열 일치율 98% · 8개 하차지 자동화 후 전사 확대 성공',
        stack: ['LPRNet', 'Focal Loss', 'Vehicle Tracking', 'Synthetic Data'],
        tags: ['ai', 'backend', 'computer-vision', 'tracking', 'lpr'],
        matchProofs: [
            {
                signals: ['ai', 'computer-vision', 'tracking', 'vehicle tracking'],
                text: '한 컴퓨터에서 여러개의 하차지를 동시에 할 수 있도록 비동기 시스템과 모델의 경량화를 중요시 하였습니다.',
            },
            {
                signals: ['lpr', 'lprnet'],
                text: '현장 실데이터 4만 장과 합성 데이터 5천 장으로 LPRNet을 커스텀 개선해 검증 데이터의 전체 문자열 일치율 98%를 확인했습니다.',
            },
            {
                signals: ['focal loss', 'synthetic data'],
                text: '희소한 문자와 촬영 조건을 보완하기 위해 합성 데이터와 Focal Loss를 함께 사용했습니다.',
            },
            {
                signals: ['backend'],
                text: '트래픽의 최적화를 위해 bulk insert 및 데이터 최적화 전송에 중점을 두었습니다.',
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
                src: '/project-media/vehicle-tracking-sequence-01.jpg',
                frames: [
                    '/project-media/vehicle-tracking-sequence-01.jpg',
                    '/project-media/vehicle-tracking-sequence-02.jpg',
                    '/project-media/vehicle-tracking-sequence-03.jpg',
                    '/project-media/vehicle-tracking-sequence-04.jpg',
                    '/project-media/vehicle-tracking-sequence-05.jpg',
                ],
                alt: 'PTZ 카메라가 철스크랩 운반 차량을 화면 중앙으로 추적하는 연속 장면',
                caption:
                    '원거리 차량을 발견한 뒤 중심을 다시 잡고 줌인하는 PTZ 추적 과정.',
            },
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
        role: 'Technical Lead / Fullstack · 3-person team',
        perspective: '56대 구조를 다시 뜯어고친 이유',
        archiveNote:
            '서버 대수를 줄인 일이 아니라 데이터 이동과 저장, 동기 처리 경계를 다시 그려 비용 구조 자체를 바꾼 재구축입니다.',
        summary:
            'React 기반 검수 운영 웹과 현장 작업자용 화면을 개발하고, 백엔드·AI 처리·인프라를 통합 운영 구조로 다시 설계했습니다.',
        lead: '인수받은 시스템은 작동했지만 세 명이 운영하기에는 너무 컸습니다. 서버 56대 앞에서 새 기능보다 먼저 “우리가 감당할 수 있는 구조인가”를 다시 물었습니다.',
        startingPoint:
            '현장마다 DB와 서비스가 갈라졌고, health 신호도 3초마다 MQ를 거쳐 DB row로 쌓였습니다. 파일·로그·모니터링까지 애플리케이션 서버를 통과하면서 장애 지점과 운영 비용이 함께 늘었습니다. 하차지마다 GPU를 한 대씩 배정해 유휴 자원을 다른 하차지에서 활용하기도 어려웠습니다.',
        build:
            'React·TypeScript로 검수 운영 웹(FOFE)과 현장 작업자용 모바일·태블릿 웹(FOMO)을 개발했습니다. 검수 결과와 이미지를 확인하고 작업을 제어하는 화면에 STOMP로 실시간 상태를 반영했습니다. 백엔드, AI 추론, 후처리의 역할을 나누고 CPU·GPU 집약 작업을 분리했습니다. GPU 추론 요청은 큐로 모아 가용 자원에 분배했습니다. 파일 전송은 presigned URL로 애플리케이션 서버를 거치지 않게 하고, 프론트엔드는 CloudFront로 옮겼습니다. DB에 쌓던 로그는 Grafana 기반 관측 체계로 옮기고 중복 DB·API와 프록시 서버를 정리했습니다. 장기 보관 데이터에는 Archive Storage를 사용했습니다.',
        outcome:
            '월 검수 478대 → 7,555대 · 월 서비스 금액 약 200만 원 → 1억 5천만 원 · 월 인프라 비용 5,758만 원 → 1,052만 원',
        stack: [
            'React',
            'TypeScript',
            'Redux Toolkit',
            'RTK Query',
            'Ant Design',
            'STOMP',
            'WebSocket',
            'FastAPI',
            'RabbitMQ',
            'Redis',
            'CloudFront',
            'Grafana',
            'Object Storage',
            'Archive Storage',
            'Airflow'
        ],
        tags: [
            'cost',
            'frontend',
            'react',
            'typescript',
            'backend',
            'platform',
            'infra',
            'rabbitmq',
            'queue',
            'redis',
            'grafana',
            'aws',
            'ncp',
            'Airflow'
        ],
        matchProofs: [
            {
                signals: ['react', 'typescript', 'frontend', 'ant-design'],
                text: 'React·TypeScript와 Ant Design으로 FOFE의 검수 운영 웹과 FOMO의 모바일·태블릿 웹을 개발했습니다. 운영자는 검수 결과와 이미지·레이어를 확인하고, 현장 작업자는 태블릿에서 검수를 제어하도록 구성했습니다.',
            },
            {
                signals: ['stomp', 'websocket', 'redux-toolkit', 'rtk-query'],
                text: 'STOMP로 수신한 검수 진행 상태와 위험물 알림을 Redux 상태에 반영했습니다. 상세 조회와 중지·재시작 요청은 RTK Query로 연결해 실시간 알림과 사용자 조작이 같은 화면 상태에 반영되도록 했습니다.',
            },
            {
                signals: ['fastapi', 'backend', 'platform'],
                text: '현장마다 따로 있던 처리 Docker와 감시 서버를 통합 API로 모았습니다.',
            },
            {
                signals: ['rabbitmq', 'queue', 'gpu'],
                text: '하차지마다 GPU를 고정 배정하지 않고 추론 요청을 큐에 모았습니다. 작업이 끝난 GPU가 곧바로 다음 요청을 가져가게 해 유휴 시간을 줄이고 가용 GPU의 처리량을 최대한 활용했습니다.',
            },
            {
                signals: ['redis'],
                text: '검수 진행 상태와 반복 조회 데이터는 Redis에 두어 DB와 동기 처리 부담을 줄였습니다.',
            },
            {
                signals: ['grafana'],
                text: 'DB에 쌓던 상태·로그를 Grafana 중심의 관측 흐름으로 옮겼습니다.',
            },
            {
                signals: ['Airflow'],
                text: '각 배치처리를 Airflow로 모았습니다. 추후 실패 Retry 및 dag의 연동 관리도 추가 하였습니다.',
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
                text: '월 검수량이 약 16배 늘어나는 동안 56대 구조를 10대로 통합하고 월 인프라 비용을 약 81.7% 낮췄습니다.',
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
        media: [
            {
                src: '/project-media/infrastructure-cost-2024-12.png',
                naturalRatio: true,
                width: 828,
                height: 112,
                alt: '2024년 12월 인프라 사용 요금 합계 57,576,560원이 표시된 청구 화면',
                caption:
                    '재구축 전인 2024년 12월 월 인프라 사용 요금: 57,576,560원.',
            },
            {
                src: '/project-media/infrastructure-cost-2026-06.png',
                naturalRatio: true,
                width: 842,
                height: 165,
                alt: '2026년 6월 인프라 사용 요금 합계 10,524,650원이 표시된 청구 화면',
                caption:
                    '줄일 수 있는 모든 걸 다 줄인 2026년 6월 월 인프라 사용 요금: 10,524,650원.',
            },
        ],
    },
    {
        id: 'scrap-ai-poc',
        period: 'Feb—Apr 2024',
        timelineYear: '2024',
        status: 'Completed',
        category: 'Product POC',
        title: '철강 스크랩 AI 검수 POC',
        company: '지앤비아이텍',
        role: 'Project Lead · 3-person team',
        perspective: '현장 영상으로 사업 가능성을 확인한 POC',
        archiveNote:
            '데모 화면이 아니라 현장 영상과 실제 모델을 묶은 실행 가능한 제품으로 사업 가능성을 증명했습니다.',
        summary:
            'RTSP 수신부터 프레임 캡처, AI 추론과 결과 표시까지 Windows 앱으로 구현했습니다.',
        lead: '보여지기 전까지는 사업부에서 사업성을 판단할 수 없다는 의견이 나왔습니다. 각 AI 철스크랩을 쓰고 있는 회사의 영상을 참조해 실시간 영상스트리밍을 통해 검수 초기 모델을 개발 했습니다.',
        startingPoint:
            '제품 구조도 운영 방식도 정해지지 않은 단계였습니다. 현장 영상 수신, 프레임 추출, 모델 호출, 저장, 화면 표시가 실제 카메라에서 한 번에 이어지는지를 먼저 증명해야 했습니다.',
        build:
            'Flutter Windows 앱으로 RTSP 수신부터 추론 결과 표시까지 수직으로 연결했습니다. 현장에서 직접 RTSP 카메라를 통해 실시간 검수가 이루어지는 과정을 확인 했습니다.',
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
        title: 'Uipath RPA 통합 관리 플랫폼',
        company: '지앤비아이텍',
        role: 'Project Lead · 4-person team',
        perspective: '겹치는 RPA 작업의 다음 실행 시간 계산',
        archiveNote:
            '자원을 공유하는 자동화 작업의 충돌을 시간표로 번역해, 보이지 않던 기다림을 운영 가능한 정보로 바꿨습니다.',
        summary:
            'UiPath 실행 이력과 로봇 이벤트를 수집해 작업의 예상 시작·종료 시간을 보여줬습니다.',
        lead: '일관 되지 않은 작업 시간들에 대해 유효한 작업 가능 에이전트와 예상 시간을 보여줘야 했습니다.',
        startingPoint:
            '실행해야 할 Job이 많았지만 어떤 로봇이 언제 끝날지 모르기 때문에 작업 분배를 결정하기 어려웠고 언제 끝날지도 알 수 없었습니다.',
        build:
            'UiPath 실행 이력과 robot event를 webhook으로 받고, 빈 robot을 먼저 배정한 뒤 충돌한 작업은 우선순위와 종료 예상 시간을 따라 연쇄 재배치했습니다. 결과는 Vue 풀 캘린더로 보여줬고, 4인 팀에서는 일정과 역할을 조율했습니다.',
        outcome: '예상 시작·종료 시간을 캘린더에서 확인하도록 구현',
        stack: ['UiPath', 'Webhook', 'Java', 'JPA', 'Vue3'],
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
                signals: ['vue3'],
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
        lead: '모델 데모가 아니라 실제 시험 앱 안에서 AI가 동작해야 했습니다. 감지는 하되, AI 프로세스가 실패했다고 시험까지 멈추지는 않게 만들었습니다.',
        startingPoint:
            '응시 화면을 유지한 채 카메라를 검사하고 감지 이벤트와 채팅을 감독자에게 보내야 했습니다. 로컬 모델, Electron 화면, 실시간 서버가 서로 실패해도 시험 상태는 이어져야 했습니다.',
        build:
            '약 10만 장으로 사람·휴대폰 YOLOv5 모델을 학습하고 Vue 2·Electron 앱에서 로컬 AI 프로세스의 시작·종료·오류를 분리해 관리했습니다. Redis와 WebSocket은 감지 이벤트, 응시 상태, 채팅만 실시간으로 전달하게 했습니다.',
        outcome: '사람·휴대폰 검출 모델 mAP 95% 달성, LG 전사 AI 시험 응시 시스템 구축',
        stack: ['YOLOv5', 'Vue 2', 'Electron', 'Redis', 'WebSocket'],
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
                signals: ['vue', 'vue 2'],
                text: 'Vue 2로 응시 상태, 감지 이벤트와 감독자 소통을 하나의 인터페이스에 구성했습니다.',
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
        lead: '복지로 차세대 구축에서 사용자가 처음 만나는 메인 화면부터 통합검색, 공공데이터 연계와 공통 기능까지 맡았습니다.',
        startingPoint:
            '여러 업무팀이 동시에 화면을 만드는 대형 프로젝트라 공통 응답과 외부 연계 규칙이 없으면 같은 문제가 반복됐습니다. 검색도 원천 DB 조회와 사용자 요청을 직접 묶지 않는 구조가 필요했습니다.',
        build:
            '원천 데이터를 주기적으로 검색 인덱스로 만들고 대국민 검색 API를 개발했습니다. 공공데이터 연계, 관리자·공통 화면도 함께 맡았고 반복 코드를 줄이는 생성 도구를 만들어 팀에서 사용했습니다.',
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
        lead: '결제 성공 뒤 사람이 다시 회계에 옮기던 흐름을 자동으로 연결했습니다. 동시에 들어온 요청이 같은 예약을 두 번 확정하지 않는 것도 같은 상태 문제로 봤습니다.',
        startingPoint:
            '휴양 업무 특성상 결제 대금을 먼저 받을 경우 회계 처리를 미루는 것이 불가능 했습니다. 예약 전 취소를 할 경우 회계처리의 복잡성이 늘었습니다.',
        build:
            'EasyPay의 담당자와 직접 회의를 조율 한 후 전기공사공제조합만 특별한 케이스로 처리 해줄 수 있도록 협조 요청을 하였습니다.',
        outcome: '결제·회계의 업무 미수금 처리가 가능해져 업무 효율성이 증가 하였습니다.',
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

const periodMonths: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
};

const projectRecencyKey = (project: Project) => {
    const period = project.period.toLowerCase();
    const years = [...period.matchAll(/\d{4}/g)].map(([year]) => Number(year));
    const months = [
        ...period.matchAll(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/g),
    ].map(([month]) => periodMonths[month]);
    const startYear = years[0] ?? 0;
    const endYear = years.at(-1) ?? startYear;
    const startMonth = months[0] ?? 12;
    const endMonth = months.at(-1) ?? startMonth;

    return period.includes('current')
        ? [1, startYear, startMonth]
        : [0, endYear, endMonth, startYear, startMonth];
};

const compareProjectsByRecency = (left: Project, right: Project) => {
    const leftKey = projectRecencyKey(left);
    const rightKey = projectRecencyKey(right);
    const length = Math.max(leftKey.length, rightKey.length);

    for (let index = 0; index < length; index += 1) {
        const difference = (rightKey[index] ?? 0) - (leftKey[index] ?? 0);
        if (difference !== 0) return difference;
    }

    return 0;
};

const signalAliases: Record<string, string[]> = {
    카드결제: ['payments', 'accounting', 'data-integrity'],
    결제: ['payments', 'accounting'],
    핀테크: ['payments', 'backend', 'data-integrity'],
    정산: ['payments', 'accounting', 'data-integrity'],
    플랫폼: ['platform', 'backend'],
    '플랫폼 백엔드': ['platform', 'backend'],
    백엔드: ['backend'],
    프론트: ['frontend'],
    프론트엔드: ['frontend'],
    리액트: ['react'],
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
    토스: {primary: '#3182f6', secondary: '#6b8dff', accent: '#d9e8ff'},
    toss: {primary: '#3182f6', secondary: '#6b8dff', accent: '#d9e8ff'},
    애플: {primary: '#0071e3', secondary: '#a7c7e7', accent: '#f2f2f4'},
    apple: {primary: '#0071e3', secondary: '#a7c7e7', accent: '#f2f2f4'},
    네이버: {primary: '#03c75a', secondary: '#72df92', accent: '#d9f8e2'},
    naver: {primary: '#03c75a', secondary: '#72df92', accent: '#d9f8e2'},
    카카오: {primary: '#fee500', secondary: '#ffd666', accent: '#fff1a8'},
    kakao: {primary: '#fee500', secondary: '#ffd666', accent: '#fff1a8'},
    당근: {primary: '#ff6f0f', secondary: '#ff9a5c', accent: '#ffe2d2'},
    daangn: {primary: '#ff6f0f', secondary: '#ff9a5c', accent: '#ffe2d2'},
    배달의민족: {primary: '#2ac1bc', secondary: '#79ded9', accent: '#daf7f5'},
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

const normalizeTagKey = (value: string) => {
    const normalized = value.trim().toLowerCase().replaceAll(' ', '-');
    return normalized === 'cpp' ? 'c++' : normalized;
};

const companyRelationshipLabel = (company: string) => {
    const name = company.trim();
    const lastKoreanCharacter = Array.from(name).reverse().find((character) =>
        /[가-힣]/.test(character),
    );
    if (!lastKoreanCharacter) return `${name}와의`;
    const hasFinalConsonant =
        (lastKoreanCharacter.charCodeAt(0) - 0xac00) % 28 !== 0;
    return `${name}${hasFinalConsonant ? '과의' : '와의'}`;
};

const stackLabels = Object.fromEntries(
    projects.flatMap((project) =>
        project.stack.map((stack) => [normalizeTagKey(stack), stack]),
    ),
);

const tagLabel = (tag: string) => {
    const normalized = normalizeTagKey(tag);
    return (
        tagLabels[normalized] ??
        stackLabels[normalized] ??
        normalized
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
};

const projectSearchValues = (project: Project) => [
    ...project.tags.map(normalizeTagKey),
    ...project.stack.map(normalizeTagKey),
];

const projectMatchesTarget = (project: Project, target: string) => {
    const normalizedTarget = normalizeTagKey(target);
    return projectSearchValues(project).some(
        (value) =>
            value === normalizedTarget || value.startsWith(`${normalizedTarget}-`),
    );
};

const projectMatchProofs = (project: Project, targets: Set<string>) => {
    const proofs = project.matchProofs.filter((proof) =>
        proof.signals.some((signal) => targets.has(normalizeTagKey(signal))),
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
    const projectIds = [
        ...params.getAll('project'),
        ...params.getAll('projects'),
    ]
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean);

    return {
        company,
        signals: [...new Set(signals)],
        projectIds: [...new Set(projectIds)],
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
            const normalized = normalizeTagKey(signal);
            return [normalized, ...(signalAliases[normalized] ?? [])];
        }),
    ]);

const buildPortfolioUrl = (baseUrl: string, settings: ResumePdfSettings) => {
    const url = new URL(baseUrl);
    ['signal', 'signals', 'some_signal', 'tags', 'tech'].forEach((key) =>
        url.searchParams.delete(key),
    );
    if (settings.company.trim()) {
        url.searchParams.set('company', settings.company.trim());
    }
    url.searchParams.set('view', 'all');
    url.searchParams.set('primary', settings.primaryColor);
    url.searchParams.set('secondary', settings.secondaryColor);
    url.searchParams.set('accent', settings.accentColor);
    return url.toString();
};

export default function Home() {
    const searchParams = useSearchParams();
    const urlState = readUrlState(new URLSearchParams(searchParams.toString()));
    const {company, signals} = urlState;
    const [activeFilters, setActiveFilters] = useState(signals);
    const [projectScope, setProjectScope] = useState<ProjectScope>(
        urlState.scope,
    );
    const [tagQuery, setTagQuery] = useState('');
    const [tagPickerOpen, setTagPickerOpen] = useState(false);
    const tagInputRef = useRef<HTMLInputElement>(null);
    const tagOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const targets = expandedSignals(activeFilters, company);
    const hasFocus = targets.size > 0;
    const [viewOverride, setViewOverride] = useState<boolean | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        null,
    );
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const chronologyJumpRef = useRef<{
        projectId: string;
        timeoutId: number;
    } | null>(null);
    const hiddenResumeDoubleClickCount = useRef(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
    const [lightboxMediaIndex, setLightboxMediaIndex] = useState<number | null>(
        null,
    );
    const [selectedCodeProofId, setSelectedCodeProofId] = useState(
        codeProofs[0].id,
    );
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false);
    const [portfolioBaseUrl, setPortfolioBaseUrl] = useState('');
    const [pdfSettings, setPdfSettings] = useState<ResumePdfSettings>({
        company,
        signals: [],
        projectIds: [...projects]
            .sort(compareProjectsByRecency)
            .slice(0, 4)
            .map((project) => project.id),
        scope: projectScope,
        primaryColor: urlState.primaryColor,
        secondaryColor: urlState.secondaryColor,
        accentColor: urlState.accentColor,
        includeImages: true,
    });
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'projects' | 'profile'>(
        'projects',
    );
    const [showBackToTop, setShowBackToTop] = useState(false);
    const overlayOpen =
        drawerOpen ||
        codeDrawerOpen ||
        lightboxMediaIndex !== null ||
        pdfSettingsOpen;
    const showAll =
        viewOverride ??
        (urlState.showAll || urlState.projectIds.length > 0 || !hasFocus);
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
    const scopeRanked = ranked.filter((project) => {
        if (projectScope === 'personal') return project.company === 'Independent';
        if (projectScope === 'work') return project.company !== 'Independent';
        return true;
    });
    const linkedProjectIds = new Set(urlState.projectIds);
    const linkedRanked = scopeRanked.filter((project) =>
        linkedProjectIds.has(project.id),
    );
    const scopedRanked =
        linkedProjectIds.size > 0 && linkedRanked.length > 0
            ? linkedRanked
            : scopeRanked;
    const scopedAvailableTags = [
        ...new Set(
            scopedRanked.flatMap((project) => [
                ...project.tags.map(normalizeTagKey),
                ...project.stack.map(normalizeTagKey),
            ]),
        ),
    ];
    const allAvailableTags = [
        ...new Set(
            projects.flatMap((project) => [
                ...project.tags.map(normalizeTagKey),
                ...project.stack.map(normalizeTagKey),
            ]),
        ),
    ].sort((a, b) => tagLabel(a).localeCompare(tagLabel(b)));
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
            groups.push({year: project.timelineYear, projects: [project]});
        }
        return groups;
    }, []);
    const selectedProject =
        rankedProjects.find((project) => project.id === selectedProjectId) ??
        rankedProjects[0];
    const selectedProjectMedia = selectedProject.media ?? [];
    const selectedProjectMediaCount = selectedProjectMedia.length;
    const lightboxMedia =
        lightboxMediaIndex === null
            ? null
            : selectedProjectMedia[lightboxMediaIndex] ?? null;
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
                groups.push({year: project.timelineYear, projects: [project]});
            }
            return groups;
        }, []);
    const normalizedTagQuery = tagQuery.trim().toLowerCase();
    const filteredTags = normalizedTagQuery
        ? scopedAvailableTags
            .filter((tag) =>
                `${tag} ${tagLabel(tag)}`.toLowerCase().includes(normalizedTagQuery),
            )
            .sort((a, b) => tagLabel(a).localeCompare(tagLabel(b)))
        : [];
    const pickerTags = normalizedTagQuery
        ? filteredTags
        : [...scopedAvailableTags]
            .sort((a, b) => {
                const countA = scopedRanked.filter((project) =>
                    projectMatchesTarget(project, a),
                ).length;
                const countB = scopedRanked.filter((project) =>
                    projectMatchesTarget(project, b),
                ).length;
                return countB - countA || tagLabel(a).localeCompare(tagLabel(b));
            });

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
        window.addEventListener('scroll', updateActiveSection, {passive: true});
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
            {rootMargin: '-128px 0px -58% 0px', threshold: [0, 0.2, 0.6]},
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
        if (!drawerOpen && !codeDrawerOpen && !lightboxMedia && !pdfSettingsOpen) {
            return;
        }
        const handleOverlayKey = (event: KeyboardEvent) => {
            if (lightboxMedia && event.key === 'ArrowLeft') {
                event.preventDefault();
                setLightboxMediaIndex((current) =>
                    current === null
                        ? null
                        : (current - 1 + selectedProjectMediaCount) %
                          selectedProjectMediaCount,
                );
                return;
            }
            if (lightboxMedia && event.key === 'ArrowRight') {
                event.preventDefault();
                setLightboxMediaIndex((current) =>
                    current === null
                        ? null
                        : (current + 1) % selectedProjectMediaCount,
                );
                return;
            }
            if (event.key !== 'Escape') return;
            if (lightboxMedia) {
                setLightboxMediaIndex(null);
                return;
            }
            if (pdfSettingsOpen) {
                setPdfSettingsOpen(false);
                return;
            }
            setDrawerOpen(false);
            setCodeDrawerOpen(false);
        };

        window.addEventListener('keydown', handleOverlayKey);
        return () => window.removeEventListener('keydown', handleOverlayKey);
    }, [
        drawerOpen,
        codeDrawerOpen,
        lightboxMedia,
        pdfSettingsOpen,
        selectedProjectMediaCount,
    ]);

    useEffect(() => {
        if (!overlayOpen) return;

        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;
        const currentPaddingRight =
            Number.parseFloat(window.getComputedStyle(document.body).paddingRight) ||
            0;

        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        }
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
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
        setLightboxMediaIndex(null);
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
        setLightboxMediaIndex(null);
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

    const chooseTag = (tag: string) => {
        toggleTag(tag);
        window.requestAnimationFrame(() => tagInputRef.current?.focus());
    };

    const focusTagOption = (index: number) => {
        if (pickerTags.length === 0) return;
        const nextIndex = (index + pickerTags.length) % pickerTags.length;
        tagOptionRefs.current[nextIndex]?.focus();
    };

    const openProject = (projectId: string) => {
        setSelectedProjectId(projectId);
        setActiveProjectId(projectId);
        setLightboxMediaIndex(null);
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
        chronologyJumpRef.current = {projectId, timeoutId};
        setActiveProjectId(projectId);

        window.addEventListener('scrollend', finishJump, {once: true});
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

    const openResumeSettings = () => {
        setPortfolioBaseUrl(resumePortfolioUrl);
        const defaultProjects = projects
            .filter((project) => {
                if (projectScope === 'personal') return project.company === 'Independent';
                if (projectScope === 'work') return project.company !== 'Independent';
                return true;
            })
            .sort(compareProjectsByRecency);
        setPdfSettings({
            company,
            signals: [],
            projectIds: defaultProjects.slice(0, 4).map((project) => project.id),
            scope: projectScope,
            primaryColor: urlState.primaryColor,
            secondaryColor: urlState.secondaryColor,
            accentColor: urlState.accentColor,
            includeImages: true,
        });
        setPdfError(null);
        setPdfSettingsOpen(true);
    };

    const revealResumeFromCapability = () => {
        hiddenResumeDoubleClickCount.current += 1;
        if (hiddenResumeDoubleClickCount.current < 2) return;
        hiddenResumeDoubleClickCount.current = 0;
        openResumeSettings();
    };

    const downloadResume = async (settings: ResumePdfSettings) => {
        if (isDownloadingPdf) return;
        setIsDownloadingPdf(true);
        setPdfError(null);

        try {
            const pdfRanked = projects
                .filter((project) => {
                    if (settings.scope === 'personal') {
                        return project.company === 'Independent';
                    }
                    if (settings.scope === 'work') {
                        return project.company !== 'Independent';
                    }
                    return true;
                })
                .sort(compareProjectsByRecency);
            const selectedPdfProjectIds = new Set(settings.projectIds);
            const pdfProjects = pdfRanked.filter((project) =>
                selectedPdfProjectIds.has(project.id),
            );
            if (pdfProjects.length === 0) {
                throw new Error('PDF에 포함할 프로젝트를 한 개 이상 선택해 주세요.');
            }
            const portfolioUrl = buildPortfolioUrl(
                portfolioBaseUrl || resumePortfolioUrl,
                settings,
            );
            const {downloadResumePdf} = await import('./resume-pdf');
            await downloadResumePdf({
                company: settings.company,
                signals: settings.signals,
                signalLabels: settings.signals.map(tagLabel),
                projects: pdfProjects,
                primaryColor: settings.primaryColor,
                portfolioUrl,
                assetOrigin: window.location.origin,
                includeImages: settings.includeImages,
            });
            setPdfSettingsOpen(false);
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
                <div className="header-atmosphere__paint"/>
                <div className="header-atmosphere__blur">
                    <i/>
                    <i/>
                    <i/>
                    <i/>
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
                    <a href="#contact">Contact</a>
                </nav>

                <div className="masthead-actions">
                    <span>Seoul · KR</span>
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
                        <p>{`간결하게 덜어내며 코드를 우아하게 표현하는 방법을 추구합니다.${
                            company.trim()
                                ? ` ${companyRelationshipLabel(company)} 일에서도 같은 마음으로 함께 코드를 담아내고 싶습니다.`
                                : ''
                        }`}</p>
                        <button type="button" onClick={() => setCodeDrawerOpen(true)}>
                            대표 코드 갤러리 · {codeProofs.length}선 ↗
                        </button>
                    </div>
                </div>
            </section>

            <section id="projects" className="work-index page-shell">
                <header className="work-index__header">
                    <div>
                        <span>01 / Selected systems</span>
                        <h2>저의 여정을 보여드리겠습니다.</h2>
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
                        <span>
                            Find by capabilit
                            <button
                                type="button"
                                className="stack-filter__secret"
                                tabIndex={-1}
                                onDoubleClick={revealResumeFromCapability}
                            >
                                y
                            </button>
                        </span>
                        <p>
                            찾으시는 기술을 검색하면 연관 된 내용까지 나오게 됩니다.
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
                                    ref={tagInputRef}
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
                                        if (event.key === 'Escape') {
                                            setTagPickerOpen(false);
                                            return;
                                        }
                                        if (event.nativeEvent.isComposing) return;
                                        if (event.key === 'ArrowDown' && pickerTags.length > 0) {
                                            event.preventDefault();
                                            setTagPickerOpen(true);
                                            window.requestAnimationFrame(() => focusTagOption(0));
                                            return;
                                        }
                                        if (event.key !== 'Enter' || !normalizedTagQuery) return;

                                        if (filteredTags.length === 1) {
                                            event.preventDefault();
                                            chooseTag(filteredTags[0]);
                                            return;
                                        }
                                        if (filteredTags.length > 1) {
                                            event.preventDefault();
                                            setTagPickerOpen(true);
                                            window.requestAnimationFrame(() => focusTagOption(0));
                                        }
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
                          : '이 범위에서 사용한 모든 기술'}
                    </span>
                                        <small>{pickerTags.length}개</small>
                                    </header>
                                    {pickerTags.length > 0 ? (
                                        pickerTags.map((tag, index) => (
                                            <button
                                                key={tag}
                                                ref={(element) => {
                                                    tagOptionRefs.current[index] = element;
                                                }}
                                                type="button"
                                                role="option"
                                                aria-selected={activeFilters.includes(tag)}
                                                className={
                                                    activeFilters.includes(tag) ? 'is-active' : undefined
                                                }
                                                onClick={() => chooseTag(tag)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'ArrowDown') {
                                                        event.preventDefault();
                                                        focusTagOption(index + 1);
                                                    } else if (event.key === 'ArrowUp') {
                                                        event.preventDefault();
                                                        focusTagOption(index - 1);
                                                    } else if (event.key === 'Escape') {
                                                        event.preventDefault();
                                                        setTagPickerOpen(false);
                                                        tagInputRef.current?.focus();
                                                    }
                                                }}
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
                                        <i aria-hidden="true"/>
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

            <PdfSettingsDialog
                open={pdfSettingsOpen}
                settings={pdfSettings}
                availableTags={allAvailableTags}
                baseUrl={portfolioBaseUrl}
                isDownloading={isDownloadingPdf}
                onChange={setPdfSettings}
                onDownload={() => downloadResume(pdfSettings)}
                onClose={() => setPdfSettingsOpen(false)}
            />

            <ProjectDrawer
                key={selectedProject.id}
                project={selectedProject}
                index={selectedProjectIndex}
                open={drawerOpen}
                onMediaOpen={setLightboxMediaIndex}
                onClose={() => {
                    setLightboxMediaIndex(null);
                    setDrawerOpen(false);
                }}
            />

            <MediaLightbox
                media={lightboxMedia}
                index={lightboxMediaIndex ?? 0}
                count={selectedProjectMediaCount}
                onPrevious={() =>
                    setLightboxMediaIndex((current) =>
                        current === null
                            ? null
                            : (current - 1 + selectedProjectMediaCount) %
                              selectedProjectMediaCount,
                    )
                }
                onNext={() =>
                    setLightboxMediaIndex((current) =>
                        current === null
                            ? null
                            : (current + 1) % selectedProjectMediaCount,
                    )
                }
                onClose={() => setLightboxMediaIndex(null)}
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
                        <figure className="profile-portrait">
                            <Image
                                src="/profile-photo.jpg"
                                alt="송재상 프로필 사진"
                                width={150}
                                height={200}
                                sizes="180px"
                            />
                            <figcaption>Song Jaesang · Seoul</figcaption>
                        </figure>
                        <div className="profile-positioning">
                            <span>Engineering point of view</span>
                            <h2>
                                덜어낼수록
                                <br/>
                                아름다워집니다.
                            </h2>
                        </div>
                        <div className="profile-summary">
                            <p>
                                한 줄의 코드도 의도 없이 쓰지 않습니다. 짧고 간결한 코드는 하나의 예술이라고 생각합니다.
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
                        className="profile-decisions"
                        aria-labelledby="decisions-title"
                    >
                        <header>
                            <span>03 / Decisions</span>
                            <h3 id="decisions-title">
                                막힌 흐름을 원활하게
                            </h3>
                            <p>
                                문제의 핵심을 파악해 결과를 만들어 냅니다.
                            </p>
                        </header>
                        <div>
                            <article>
                                <span>01 · 현장</span>
                                <div>
                                    <h4>무전과 버튼으로 시작하던 검수</h4>
                                    <p>
                                        번호판 인식과 PTZ 추적을 검수 상태 전이에 연결하고, 위치를
                                        다시 잡으려고 나갔다 돌아온 차량은 이전 검수 상태를 복구했습니다.
                                        그라플을 고철로 오인하는 경우에는 바운딩 박스를 화면에 표시해
                                        작업자가 인식 결과를 확인할 수 있도록 했습니다.
                                    </p>
                                </div>
                                <strong>8개 하차지 자동화 후 전사 확대</strong>
                            </article>
                            <article>
                                <span>02 · 구조</span>
                                <div>
                                    <h4>56대로 불어난 운영 구조</h4>
                                    <p>
                                        백엔드·AI·후처리·CPU 작업의 책임을 다시 나누고, 파일 전송은
                                        Presigned URL과 CloudFront로 서버에서 떼어냈습니다. DB에 쌓던
                                        상태와 로그는 Grafana 기반 관측 구조로 옮기고 장기 데이터는
                                        Archive Storage로 보냈습니다.
                                    </p>
                                </div>
                                <strong>월 인프라 비용 81.7% 절감</strong>
                            </article>
                            <article>
                                <span>03 · 운영</span>
                                <div>
                                    <h4>실행은 남지만 학습 이유는 사라지던 환경</h4>
                                    <p>
                                        학습의 metric·log·artifact를 하나의 실행 이력으로 연결하고,
                                        Prometheus·Alloy·Mimir로 여러 학습 PC의 상태를 모았습니다.
                                        데이터셋 버전, 코드, 입력값을 함께 기록해 어떤 조건에서 나온
                                        학습 결과인지 다시 확인할 수 있도록 했습니다.
                                    </p>
                                </div>
                                <strong>학습 조건부터 결과까지 같은 이력으로 추적</strong>
                            </article>
                        </div>
                    </section>

                    <section
                        className="profile-evidence"
                        aria-labelledby="evidence-title"
                    >
                        <header>
                            <span>04 / Evidence</span>
                            <h3 id="evidence-title">코드 밖에서도</h3>
                        </header>
                        <div>
                            {resumeEvidence.map((item) => (
                                <article key={item.title}>
                                    <time>{item.date}</time>
                                    <div className="profile-evidence__heading">
                                        <strong>{item.title}</strong>
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noreferrer">
                                                논문 보기 ↗
                                            </a>
                                        )}
                                    </div>
                                    <p>{item.detail}</p>
                                </article>
                            ))}
                            <article>
                                <time>2026</time>
                                <strong>직접 만든 데스크톱 제품 배포</strong>
                                <p>Copylight와 Bucket Studio · Microsoft Store 공개</p>
                            </article>
                        </div>
                    </section>

                    <footer id="contact" className="profile-contact">
                        <div>
                            <span>Start a conversation</span>
                            <strong>함께 만들 이야기가 있다면.</strong>
                        </div>
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=thdwotkd123@gmail.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            이메일 보내기 ↗
                        </a>
                        <a href="tel:+821024082131">+82 10-2408-2131</a>
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
                         matchProofs,
                         onOpen,
                     }: {
    project: Project;
    index: number;
    selected: boolean;
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
                        <span className="project-card__match-list">
                            {matchProofs.map((proof) => (
                                <span className="project-card__match-item" key={proof.text}>
                                    <b>{proofStackLabel(project, proof)}</b>
                                    <span>{proof.text}</span>
                                </span>
                            ))}
                        </span>
          </span>
                )}

                {matchProofs.length === 0 && (
                    <span className="project-card__note">{project.summary}</span>
                )}

                <span className="project-card__stack">
          {project.stack.map((stack) => (
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

function useMediaSequence(media: ProjectMedia, paused = false) {
    const frames = media.frames?.length ? media.frames : [media.src];
    const frameCount = frames.length;
    const [frameIndex, setFrameIndex] = useState(0);

    useEffect(() => {
        if (
            frameCount <= 1 ||
            paused ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        const timer = window.setInterval(() => {
            setFrameIndex((current) => (current + 1) % frameCount);
        }, 1100);

        return () => window.clearInterval(timer);
    }, [frameCount, paused]);

    return {
        frameCount,
        frameIndex,
        frameSrc: frames[frameIndex % frameCount] ?? media.src,
    };
}

function ProjectMediaFigure({
                                media,
                                mediaIndex,
                                onMediaOpen,
                            }: {
    media: ProjectMedia;
    mediaIndex: number;
    onMediaOpen: (mediaIndex: number) => void;
}) {
    const [paused, setPaused] = useState(false);
    const {frameCount, frameIndex, frameSrc} = useMediaSequence(media, paused);
    const isSequence = frameCount > 1;

    return (
        <figure>
            <button
                type="button"
                className="project-drawer__media-frame"
                aria-label={`${isSequence ? '연속 장면' : '이미지'} 확대: ${media.caption}`}
                aria-haspopup="dialog"
                onPointerEnter={() => setPaused(true)}
                onPointerLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                onClick={() => onMediaOpen(mediaIndex)}
            >
                <Image
                    key={frameSrc}
                    className={`${isSequence ? 'project-media__sequence-frame' : ''}${media.naturalRatio ? ' project-media__natural-ratio' : ''}`.trim() || undefined}
                    src={frameSrc}
                    alt={media.alt}
                    width={media.width ?? 1920}
                    height={media.height ?? 1080}
                    sizes="(max-width: 760px) 100vw, 760px"
                />
                {isSequence ? (
                    <div className="project-drawer__sequence-status" aria-hidden="true">
                        <i/> 자동 재생
                        <strong>
                            {String(frameIndex + 1).padStart(2, '0')} /{' '}
                            {String(frameCount).padStart(2, '0')}
                        </strong>
                    </div>
                ) : null}
                <span aria-hidden="true">확대 ↗</span>
            </button>
            <figcaption>
                <span>{String(mediaIndex + 1).padStart(2, '0')}</span>
                <p>{media.caption}</p>
            </figcaption>
        </figure>
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
    onMediaOpen: (mediaIndex: number) => void;
    onClose: () => void;
}) {
    const media = project.media ?? [];
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const panelRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (open && panelRef.current) panelRef.current.scrollTop = 0;
    }, [open, project.id]);

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
                ref={panelRef}
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

                    {media.length ? (
                        <section
                            className="project-drawer__media"
                            aria-label={`${project.title} 작동 화면`}
                        >
                            <header className="project-drawer__media-header">
                                <h3>작동 화면</h3>
                                {media.length > 1 ? (
                                    <nav aria-label="상세 이미지 탐색">
                                        <span>
                                            {String(activeMediaIndex + 1).padStart(2, '0')} /{' '}
                                            {String(media.length).padStart(2, '0')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveMediaIndex(
                                                    (current) =>
                                                        (current - 1 + media.length) % media.length,
                                                )
                                            }
                                            aria-label="이전 이미지"
                                        >
                                            ←
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveMediaIndex(
                                                    (current) => (current + 1) % media.length,
                                                )
                                            }
                                            aria-label="다음 이미지"
                                        >
                                            →
                                        </button>
                                    </nav>
                                ) : null}
                            </header>
                            <div className="project-drawer__media-grid">
                                <ProjectMediaFigure
                                    key={media[activeMediaIndex].src}
                                    media={media[activeMediaIndex]}
                                    mediaIndex={activeMediaIndex}
                                    onMediaOpen={onMediaOpen}
                                />
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
                        <section>
                            <h3>결과</h3>
                            <p className="project-drawer__story-result">{project.outcome}</p>
                        </section>
                    </div>

                    <section className="project-drawer__stack">
                        <h3>Stack별 구현에서 신경 쓴 것</h3>
                        <ul>
                            {project.matchProofs.map((proof) => (
                                <li key={proof.text}>
                                    <strong>{proofStackLabel(project, proof)}</strong>
                                    <span>{proof.text}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </dialog>
        </div>
    );
}

function MediaLightbox({
                           media,
                           index,
                           count,
                           onPrevious,
                           onNext,
                           onClose,
                       }: {
    media: ProjectMedia | null;
    index: number;
    count: number;
    onPrevious: () => void;
    onNext: () => void;
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
                    <span id="media-lightbox-title">
                        작동 화면 확대
                        {count > 1
                            ? ` · ${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`
                            : ''}
                    </span>
                    <button type="button" onClick={onClose} autoFocus>
                        닫기 <span aria-hidden="true">×</span>
                    </button>
                </header>
                {media ? (
                    <>
                        <MediaLightboxVisual key={media.src} media={media}/>
                        {count > 1 ? (
                            <nav className="media-lightbox__navigation" aria-label="확대 이미지 탐색">
                                <button type="button" onClick={onPrevious} aria-label="이전 이미지">
                                    <span aria-hidden="true">←</span>
                                </button>
                                <button type="button" onClick={onNext} aria-label="다음 이미지">
                                    <span aria-hidden="true">→</span>
                                </button>
                            </nav>
                        ) : null}
                        <p className="media-lightbox__caption">{media.caption}</p>
                    </>
                ) : null}
            </dialog>
        </div>
    );
}

function MediaLightboxVisual({media}: { media: ProjectMedia }) {
    const {frameCount, frameIndex, frameSrc} = useMediaSequence(media);

    return (
        <div className="media-lightbox__canvas">
            <Image
                key={frameSrc}
                className={frameCount > 1 ? 'project-media__sequence-frame' : undefined}
                src={frameSrc}
                alt={media.alt}
                fill
                sizes="100vw"
                style={{objectFit: 'contain'}}
            />
            {frameCount > 1 ? (
                <div className="media-lightbox__sequence-status" aria-hidden="true">
                    자동 재생 · {String(frameIndex + 1).padStart(2, '0')} /{' '}
                    {String(frameCount).padStart(2, '0')}
                </div>
            ) : null}
        </div>
    );
}

function PdfSettingsDialog({
                               open,
                               settings,
                               availableTags,
                               baseUrl,
                               isDownloading,
                               onChange,
                               onDownload,
                               onClose,
                           }: {
    open: boolean;
    settings: ResumePdfSettings;
    availableTags: string[];
    baseUrl: string;
    isDownloading: boolean;
    onChange: (settings: ResumePdfSettings) => void;
    onDownload: () => void;
    onClose: () => void;
}) {
    const [techQuery, setTechQuery] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [presetText, setPresetText] = useState('');
    const [presetStatus, setPresetStatus] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const normalizedQuery = techQuery.trim().toLowerCase();
    const visibleTags = availableTags.filter((tag) =>
        `${tag} ${tagLabel(tag)}`.toLowerCase().includes(normalizedQuery),
    );
    const selectableProjects = projects
        .filter((project) => {
            if (settings.scope === 'work') return project.company !== 'Independent';
            if (settings.scope === 'personal') return project.company === 'Independent';
            return true;
        })
        .sort(compareProjectsByRecency);
    const portfolioUrl = baseUrl ? buildPortfolioUrl(baseUrl, settings) : '';

    const toggleSignal = (tag: string) => {
        onChange({
            ...settings,
            signals: settings.signals.includes(tag)
                ? settings.signals.filter((signal) => signal !== tag)
                : [...settings.signals, tag],
        });
    };

    const selectScope = (scope: ProjectScope) => {
        const projectsInScope = projects
            .filter((project) => {
                if (scope === 'work') return project.company !== 'Independent';
                if (scope === 'personal') return project.company === 'Independent';
                return true;
            })
            .sort(compareProjectsByRecency);
        const allowedIds = new Set(projectsInScope.map((project) => project.id));
        const retainedIds = settings.projectIds.filter((id) => allowedIds.has(id));
        onChange({
            ...settings,
            scope,
            projectIds:
                retainedIds.length > 0
                    ? retainedIds
                    : projectsInScope.slice(0, 4).map((project) => project.id),
        });
    };

    const toggleProject = (projectId: string) => {
        onChange({
            ...settings,
            projectIds: settings.projectIds.includes(projectId)
                ? settings.projectIds.filter((id) => id !== projectId)
                : [...settings.projectIds, projectId],
        });
    };

    const copyPortfolioUrl = async () => {
        if (!portfolioUrl) return;
        await navigator.clipboard.writeText(portfolioUrl);
        setLinkCopied(true);
        window.setTimeout(() => setLinkCopied(false), 1600);
    };

    const applyAiPreset = () => {
        try {
            const firstBrace = presetText.indexOf('{');
            const lastBrace = presetText.lastIndexOf('}');
            if (firstBrace < 0 || lastBrace <= firstBrace) {
                throw new Error('JSON 형식의 설정을 찾지 못했습니다.');
            }

            const parsed: unknown = JSON.parse(
                presetText.slice(firstBrace, lastBrace + 1),
            );
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('설정은 JSON 객체여야 합니다.');
            }

            const preset = parsed as Record<string, unknown>;
            const colors =
                preset.colors &&
                typeof preset.colors === 'object' &&
                !Array.isArray(preset.colors)
                    ? (preset.colors as Record<string, unknown>)
                    : {};
            const firstString = (...values: unknown[]) =>
                values.find((value): value is string => typeof value === 'string');
            const stringList = (value: unknown) => {
                if (Array.isArray(value)) {
                    return value.filter((item): item is string => typeof item === 'string');
                }
                return typeof value === 'string'
                    ? value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean)
                    : [];
            };

            const companyName = (
                firstString(preset.company, preset.companyName, preset['회사명']) ??
                settings.company
            ).trim();
            const requestedTechnologies = stringList(
                preset.technologies ??
                    preset.tech ??
                    preset.skills ??
                    preset.signals ??
                    preset['기술'],
            );
            const signals = [
                ...new Set(
                    requestedTechnologies
                        .map((technology) => {
                            const normalized = normalizeTagKey(technology);
                            return availableTags.find(
                                (tag) =>
                                    normalizeTagKey(tag) === normalized ||
                                    normalizeTagKey(tagLabel(tag)) === normalized,
                            );
                        })
                        .filter((tag): tag is string => Boolean(tag)),
                ),
            ];

            const requestedScope = (
                firstString(preset.scope, preset['범위']) ?? settings.scope
            ).toLowerCase();
            const scope: ProjectScope =
                requestedScope === 'work' || requestedScope === '업무'
                    ? 'work'
                    : requestedScope === 'personal' || requestedScope === '개인'
                      ? 'personal'
                      : requestedScope === 'all' || requestedScope === '전체'
                        ? 'all'
                        : settings.scope;
            const projectsInScope = projects.filter((project) => {
                if (scope === 'work') return project.company !== 'Independent';
                if (scope === 'personal') return project.company === 'Independent';
                return true;
            });
            const requestedProjects = stringList(
                preset.projects ?? preset.projectIds ?? preset['프로젝트'],
            );
            const explicitProjectIds = [
                ...new Set(
                    requestedProjects
                        .map((requestedProject) => {
                            const lookup = requestedProject.toLowerCase().replaceAll(' ', '');
                            return projectsInScope.find((project) => {
                                const title = project.title.toLowerCase().replaceAll(' ', '');
                                return (
                                    project.id.toLowerCase() === lookup ||
                                    title === lookup ||
                                    title.includes(lookup) ||
                                    lookup.includes(title)
                                );
                            })?.id;
                        })
                        .filter((id): id is string => Boolean(id)),
                ),
            ];
            const recommendationTargets = expandedSignals(signals, companyName);
            const recommendedProjectIds = projectsInScope
                .map((project, index) => ({
                    id: project.id,
                    index,
                    score: [...recommendationTargets].reduce(
                        (total, target) =>
                            total + (projectMatchesTarget(project, target) ? 1 : 0),
                        0,
                    ),
                }))
                .sort((a, b) => b.score - a.score || a.index - b.index)
                .slice(0, 4)
                .map((project) => project.id);
            const theme = companyThemes[companyName.toLowerCase()];
            const primaryColor =
                normalizeHexColor(
                    firstString(
                        colors.primary,
                        preset.primaryColor,
                        preset.primary,
                    ) ?? null,
                ) ??
                theme?.primary ??
                settings.primaryColor;
            const secondaryColor =
                normalizeHexColor(
                    firstString(
                        colors.secondary,
                        preset.secondaryColor,
                        preset.secondary,
                    ) ?? null,
                ) ??
                theme?.secondary ??
                settings.secondaryColor;
            const accentColor =
                normalizeHexColor(
                    firstString(colors.accent, preset.accentColor, preset.accent) ??
                        null,
                ) ??
                theme?.accent ??
                settings.accentColor;

            onChange({
                company: companyName,
                signals,
                projectIds:
                    explicitProjectIds.length > 0
                        ? explicitProjectIds
                        : recommendedProjectIds,
                scope,
                primaryColor,
                secondaryColor,
                accentColor,
                includeImages:
                    typeof preset.includeImages === 'boolean'
                        ? preset.includeImages
                        : settings.includeImages,
            });
            setPresetStatus({
                type: 'success',
                text: `${companyName || '회사 미지정'} · 기술 ${signals.length}개 · 프로젝트 ${explicitProjectIds.length || recommendedProjectIds.length}개를 적용했습니다.`,
            });
        } catch (error) {
            setPresetStatus({
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : 'AI 설정을 적용하지 못했습니다.',
            });
        }
    };

    return (
        <div
            className={`pdf-settings${open ? ' is-open' : ''}`}
            aria-hidden={!open}
        >
            <button
                type="button"
                className="pdf-settings__backdrop"
                aria-label="PDF 설정 닫기"
                tabIndex={open ? 0 : -1}
                onClick={onClose}
            />
            <dialog
                className="pdf-settings__panel"
                open={open}
                aria-modal="true"
                aria-labelledby="pdf-settings-title"
            >
                <header className="pdf-settings__header">
                    <div>
                        <span>Custom export</span>
                        <h2 id="pdf-settings-title">이력서 PDF 맞춤 설정</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={isDownloading}>
                        닫기 <span aria-hidden="true">×</span>
                    </button>
                </header>

                <form
                    className="pdf-settings__form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onDownload();
                    }}
                >
                    <section className="pdf-settings__section pdf-settings__preset">
                        <label className="pdf-settings__label" htmlFor="pdf-ai-preset">
                            <span>AI 설정 한 번에 적용</span>
                            <small>
                                채용공고를 분석한 AI가 만든 JSON을 붙여넣으면 회사명, 기술,
                                프로젝트와 색상을 한꺼번에 채웁니다.
                            </small>
                        </label>
                        <div className="pdf-settings__preset-controls">
                            <textarea
                                id="pdf-ai-preset"
                                value={presetText}
                                placeholder={'{"company":"토스","technologies":["Java","Redis"],"scope":"work","colors":{"primary":"#0064ff","secondary":"#3182f6","accent":"#e8f3ff"}}'}
                                onChange={(event) => {
                                    setPresetText(event.target.value);
                                    setPresetStatus(null);
                                }}
                            />
                            <button
                                type="button"
                                disabled={!presetText.trim()}
                                onClick={applyAiPreset}
                            >
                                설정 적용
                            </button>
                            {presetStatus ? (
                                <p className={`is-${presetStatus.type}`} role="status">
                                    {presetStatus.text}
                                </p>
                            ) : null}
                        </div>
                    </section>

                    <section className="pdf-settings__section">
                        <label className="pdf-settings__label" htmlFor="pdf-company">
                            <span>지원 회사명</span>
                            <small>회사명이 제목과 파일명, 맞춤 링크에 반영됩니다.</small>
                        </label>
                        <input
                            id="pdf-company"
                            className="pdf-settings__text-input"
                            value={settings.company}
                            placeholder="예: 토스, 네이버"
                            autoComplete="organization"
                            onChange={(event) =>
                                onChange({...settings, company: event.target.value})
                            }
                        />
                    </section>

                    <section className="pdf-settings__section">
                        <div className="pdf-settings__label">
                            <span>프로젝트 범위</span>
                            <small>업무와 개인 프로젝트를 구분해 구성할 수 있습니다.</small>
                        </div>
                        <fieldset className="pdf-settings__scope" aria-label="PDF 프로젝트 범위">
                            {([
                                ['all', '전체'],
                                ['work', '업무'],
                                ['personal', '개인'],
                            ] as const).map(([scope, label]) => (
                                <button
                                    key={scope}
                                    type="button"
                                    className={settings.scope === scope ? 'is-active' : undefined}
                                    aria-pressed={settings.scope === scope}
                                    onClick={() => selectScope(scope)}
                                >
                                    {label}
                                </button>
                            ))}
                        </fieldset>
                    </section>

                    <section className="pdf-settings__section pdf-settings__technology">
                        <label className="pdf-settings__label" htmlFor="pdf-technology-search">
                            <span>강조할 기술</span>
                            <small>
                                PDF에 그 기술을 사용한 이유와 구현 근거를 추가합니다.
                            </small>
                        </label>
                        {settings.signals.length > 0 ? (
                            <div className="pdf-settings__selected" aria-label="선택한 기술">
                                {settings.signals.map((signal) => (
                                    <button
                                        key={signal}
                                        type="button"
                                        onClick={() => toggleSignal(signal)}
                                    >
                                        {tagLabel(signal)} <span aria-hidden="true">×</span>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        <input
                            id="pdf-technology-search"
                            className="pdf-settings__text-input"
                            value={techQuery}
                            placeholder="기술 검색"
                            autoComplete="off"
                            onChange={(event) => setTechQuery(event.target.value)}
                        />
                        <div className="pdf-settings__technology-list">
                            {visibleTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={settings.signals.includes(tag) ? 'is-active' : undefined}
                                    aria-pressed={settings.signals.includes(tag)}
                                    onClick={() => toggleSignal(tag)}
                                >
                                    <span>{tagLabel(tag)}</span>
                                    <small>
                                        {projects.filter((project) => projectMatchesTarget(project, tag)).length}
                                    </small>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="pdf-settings__section pdf-settings__projects">
                        <div className="pdf-settings__label">
                            <span>PDF에 넣을 프로젝트</span>
                            <small>
                                프로젝트마다 사용 기술이 표시되며 최신순으로 정렬됩니다.
                            </small>
                        </div>
                        <div className="pdf-settings__project-picker">
                            <header>
                                <strong>{settings.projectIds.length}개 선택</strong>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChange({
                                                ...settings,
                                                projectIds: selectableProjects.map((project) => project.id),
                                            })
                                        }
                                    >
                                        모두 선택
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onChange({...settings, projectIds: []})}
                                    >
                                        선택 해제
                                    </button>
                                </div>
                            </header>
                            <div className="pdf-settings__project-list">
                                {selectableProjects.map((project) => {
                                    const selected = settings.projectIds.includes(project.id);
                                    return (
                                        <label
                                            key={project.id}
                                            className={selected ? 'is-selected' : undefined}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => toggleProject(project.id)}
                                            />
                                            <span>
                                                <small>
                                                    {project.period} · {project.company}
                                                </small>
                                                <strong>{project.title}</strong>
                                                <span>
                                                    {project.stack.map((technology) => (
                                                        <em key={technology}>{technology}</em>
                                                    ))}
                                                </span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="pdf-settings__section">
                        <div className="pdf-settings__label">
                            <span>링크 화면 색상</span>
                            <small>PDF의 강조색과 링크로 열리는 홈페이지 테마를 함께 바꿉니다.</small>
                        </div>
                        <div className="pdf-settings__colors">
                            {([
                                ['primaryColor', '주조색'],
                                ['secondaryColor', '보조색'],
                                ['accentColor', '배경 포인트'],
                            ] as const).map(([key, label]) => (
                                <label key={key}>
                                    <input
                                        type="color"
                                        value={settings[key]}
                                        aria-label={label}
                                        onChange={(event) =>
                                            onChange({...settings, [key]: event.target.value})
                                        }
                                    />
                                    <span>{label}</span>
                                    <small>{settings[key].toUpperCase()}</small>
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="pdf-settings__section pdf-settings__option-row">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.includeImages}
                                onChange={(event) =>
                                    onChange({...settings, includeImages: event.target.checked})
                                }
                            />
                            <span>
                                프로젝트 대표 이미지 포함
                                <small>이미지가 있는 프로젝트마다 대표 장면을 최대 두 장 넣습니다.</small>
                            </span>
                        </label>
                    </section>

                    <section className="pdf-settings__link">
                        <div>
                            <span>PDF에 들어갈 홈페이지 링크</span>
                            {portfolioUrl ? (
                                <a href={portfolioUrl} target="_blank" rel="noreferrer">
                                    {portfolioUrl}
                                </a>
                            ) : (
                                <small>주소 준비 중…</small>
                            )}
                        </div>
                        <button
                            type="button"
                            disabled={!portfolioUrl}
                            onClick={copyPortfolioUrl}
                        >
                            {linkCopied ? '복사됨' : '링크 복사'}
                        </button>
                    </section>

                    <footer className="pdf-settings__actions">
                        <p>선택한 프로젝트를 최신순으로 정렬해 PDF를 만듭니다.</p>
                        <button
                            type="submit"
                            disabled={
                                isDownloading || !portfolioUrl || settings.projectIds.length === 0
                            }
                        >
                            {isDownloading ? 'PDF 만드는 중…' : '이 설정으로 다운로드 ↓'}
                        </button>
                    </footer>
                </form>
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
    const stageRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (open && stageRef.current) stageRef.current.scrollTop = 0;
    }, [open]);

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
                aria-label={`대표 코드 갤러리 · ${selected.category}`}
            >
                <header className="code-drawer__header">
                    <div>
                        <span>Code gallery / {String(proofs.length).padStart(2, '0')}</span>
                        <span>실제 구현 · 민감 정보만 비식별</span>
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

                    <section ref={stageRef} className="code-drawer__stage">
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
                        <p>{selected.summary}</p>

                        {selected.media ? (
                            <div className="code-visuals">
                                {selected.media.map((media) => (
                                    <figure key={media.src}>
                                        <a
                                            href={media.src}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`${media.alt} 원본 보기`}
                                        >
                                            <Image
                                                src={media.src}
                                                width={media.width}
                                                height={media.height}
                                                sizes="(max-width: 760px) 100vw, 900px"
                                                alt={media.alt}
                                            />
                                        </a>
                                        <figcaption>{media.caption}</figcaption>
                                    </figure>
                                ))}
                            </div>
                        ) : (
                            <div className="code-window">
                                <header>
                                    <div aria-hidden="true">
                                        <i/>
                                        <i/>
                                        <i/>
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
                        )}

                        <footer className="code-drawer__evidence">
                            <span>What this shows</span>
                            <strong>{selected.evidence}</strong>
                            <p>
                                {selected.note ??
                                    '실제 저장소에서 선별한 코드입니다. 회사·고객·도메인 식별자와 민감한 리터럴만 치환했으며 제어 흐름과 알고리즘은 원본을 유지했습니다.'}
                            </p>
                        </footer>
                    </section>
                </div>
            </dialog>
        </div>
    );
}
