<template>
  <div class="docs-view">
    <!-- Top navigation bar -->
    <header class="docs-header">
      <button class="header-btn" @click="goBack">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {{ ui("back") }}
      </button>
      <h1 class="docs-title">{{ ui("docsTitle") }}</h1>
      <div class="header-spacer" />
      <button class="header-btn lang-btn" @click="toggleLocale">
        {{ blocklyLocale.getCurrentLocale() === 'zh-hans' ? 'EN' : '中文' }}
      </button>
    </header>

    <div class="docs-body">
      <!-- Sidebar navigation -->
      <aside class="docs-sidebar">
        <div class="sidebar-search">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="ui('docsSearch')"
            class="search-input"
          />
        </div>
        <nav class="sidebar-nav">
          <div
            v-for="cat in filteredCategories"
            :key="cat.id"
            class="nav-category"
          >
            <button class="nav-category-title" @click="toggleCategory(cat.id)">
              <span
                class="collapse-icon"
                :class="{ collapsed: !expandedCategories.has(cat.id) }"
                >▾</span
              >
              {{ getCategoryLabel(cat.id, currentLocale) }}
              <span class="doc-count">{{ cat.files.length }}</span>
            </button>
            <div v-show="expandedCategories.has(cat.id)" class="nav-items">
              <button
                v-for="file in cat.files"
                :key="file.path"
                class="nav-item"
                :class="{ active: activeDoc === file.path }"
                @click="selectDoc(file.path)"
              >
                {{ file.title }}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <!-- Content area -->
      <main class="docs-content">
        <!-- Loading state -->
        <div v-if="loading" class="content-loading">
          <div class="loading-spinner" />
          <p>{{ ui("docsLoading") }}</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="content-error">
          <p>{{ error }}</p>
        </div>

        <!-- Doc content -->
        <template v-else-if="renderedHtml">
          <p v-if="isSourceLocaleFallback" class="locale-fallback">
            {{ ui("docsSourceFallback") }}
          </p>
          <div class="content-markdown" v-html="renderedHtml" />
        </template>

        <!-- Welcome screen -->
        <div v-else class="content-welcome">
          <svg
            class="welcome-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h2>{{ ui("docsWelcome") }}</h2>
          <p>{{ ui("docsWelcomeDesc") }}</p>
          <div class="welcome-links">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="welcome-link"
              @click="selectDoc(cat.files[0]?.path || '')"
            >
              {{ getCategoryLabel(cat.id, currentLocale) }}
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ui, uiLocaleRef, useBlocklyLocale } from '@/composables/locale';
import {
  renderMarkdown,
  getCategoryLabel,
  getDocTitle,
  getBlockDocCategories,
  getGuideCategory,
  getPlatformCategory,
  getStandardDocCategory,
  parseOrder,
  type DocFile,
  type DocCategory,
} from '@/utils/markdown';

const router = useRouter();
const blocklyLocale = useBlocklyLocale();
function toggleLocale() {
  blocklyLocale.setLocale(
    blocklyLocale.getCurrentLocale() === 'zh-hans' ? 'en' : 'zh-hans',
  );
}
const currentLocale = computed(() =>
  uiLocaleRef.value === 'zh-hans' ? 'zh' : 'en',
);

// Lazy loader: returns a function that loads the markdown content
const docLoaders = import.meta.glob('/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, () => Promise<string>>;

const legacyGuideLocalePairs: Record<string, string> = {
  '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md':
    '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md',
  '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md':
    '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md',
  '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-pure-basic.md':
    '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-纯基础块.md',
  '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-纯基础块.md':
    '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-pure-basic.md',
};

function localizedCounterpart(path: string): string {
  if (path in legacyGuideLocalePairs) return legacyGuideLocalePairs[path];
  return path.endsWith('.en.md')
    ? `${path.slice(0, -'.en.md'.length)}.md`
    : `${path.slice(0, -'.md'.length)}.en.md`;
}

function isEnglishPath(path: string): boolean {
  return (
    path.endsWith('.en.md') ||
    path ===
      '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md' ||
    path ===
      '/docs/standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-pure-basic.md'
  );
}

function shouldIncludeLocalePath(path: string, locale: string): boolean {
  const isEnglish = isEnglishPath(path);
  const counterpart = localizedCounterpart(path);
  const hasCounterpart = counterpart in docLoaders;
  // Prefer a translation when present; retain the only available language as
  // an explicit fallback so a missing translation never hides a document.
  return locale === 'en' ? isEnglish || !hasCounterpart : !isEnglish || !hasCounterpart;
}

const isSourceLocaleFallback = computed(() => {
  const path = activeDoc.value;
  if (!path) return false;
  const isEnglish = isEnglishPath(path);
  const expectsEnglish = currentLocale.value === 'en';
  return isEnglish !== expectsEnglish && !(localizedCounterpart(path) in docLoaders);
});

// Parse modules into categories (from file paths only, no content loading)
function buildCategories(): DocCategory[] {
  const catMap = new Map<string, DocFile[]>();
  const locale = currentLocale.value;

  for (const path of Object.keys(docLoaders)) {
    // path looks like: /docs/guides/ARCHITECTURE.md | /docs/standards/fips202-SHA3/01-Theta.md
    const parts = path.replace(/^\/docs\//, '').split('/');
    if (parts.length < 1) continue;

    const top = parts[0];

    // Root/index/research docs are valid entries too. Keep locale filtering
    // consistent with the other top-level documentation groups.
    if (parts.length === 1 || (top === 'research' && parts.length >= 2)) {
      const filename = parts[parts.length - 1];
      if (!shouldIncludeLocalePath(path, locale)) continue;

      const category = parts.length === 1
        ? getPlatformCategory(filename)
        : 'research';
      const file: DocFile = {
        path,
        category,
        filename: parts.slice(1).join('/') || filename,
        title: getDocTitle(filename, locale),
        order: parseOrder(filename),
      };
      if (!catMap.has(category)) catMap.set(category, []);
      catMap.get(category)!.push(file);
      continue;
    }

    if (top === 'standards' && parts.length === 2) {
      const filename = parts[1];
      if (!shouldIncludeLocalePath(path, locale)) continue;

      const file: DocFile = {
        path,
        category: 'standards-index',
        filename,
        title: getDocTitle(filename, locale),
        order: parseOrder(filename),
      };
      if (!catMap.has('standards-index')) catMap.set('standards-index', []);
      catMap.get('standards-index')!.push(file);
      continue;
    }

    // guides/：核心文档平铺（guides/<file>），按 locale 过滤中英版本
    if (top === 'guides' && parts.length === 2) {
      const filename = parts[1];
      if (!shouldIncludeLocalePath(path, locale)) continue;

      const file: DocFile = {
        path,
        category: getGuideCategory(filename),
        filename,
        title: getDocTitle(filename, locale),
        order: parseOrder(filename),
      };
      if (!catMap.has(file.category)) catMap.set(file.category, []);
      catMap.get(file.category)!.push(file);
      continue;
    }

    // demos/：搭建教程（demos/<file>），按 locale 过滤
    if (top === 'demos' && parts.length === 2) {
      const filename = parts[1];
      if (!shouldIncludeLocalePath(path, locale)) continue;

      const file: DocFile = {
        path,
        category: 'user-demos',
        filename,
        title: getDocTitle(filename, locale),
        order: parseOrder(filename),
      };
      if (!catMap.has(file.category)) catMap.set(file.category, []);
      catMap.get(file.category)!.push(file);
      continue;
    }

    // blocks/：按算法家族拆开导航，同时保留总览和共享原语入口
    if (top === 'blocks' && parts.length === 2) {
      const filename = parts[1];
      if (!shouldIncludeLocalePath(path, locale)) continue;

      const file = {
        path,
        filename,
        title: getDocTitle(filename, locale),
        order: parseOrder(filename),
      };
      for (const category of getBlockDocCategories(filename)) {
        if (!catMap.has(category)) catMap.set(category, []);
        catMap.get(category)!.push({ ...file, category });
      }
      continue;
    }

    // standards/：算法规范允许包含 guides/、papers/ 等子目录；category
    // 仍取标准目录名，filename 使用相对路径以避免同名文件冲突。
    if (top === 'standards' && parts.length >= 3) {
      const category = getStandardDocCategory(parts[1]);
      const filename = parts.slice(2).join('/');
      const basename = parts[parts.length - 1];
      if (!shouldIncludeLocalePath(path, currentLocale.value)) continue;
      const file: DocFile = {
        path,
        category,
        filename,
        title: getDocTitle(basename, locale),
        order: parseOrder(basename),
      };
      if (!catMap.has(category)) catMap.set(category, []);
      catMap.get(category)!.push(file);
    }
  }

  // Sort files within each category by order
  for (const [, files] of catMap) {
    files.sort((a, b) => a.order - b.order);
  }

  // Define display order: user docs first, then development/audit/reference docs, then standards.
  const pinned = [
    'user-guides',
    'user-demos',
    'user-reference',
    'user-reference-foundations',
    'development-guides',
    'audit-reports',
    'platform',
    'research',
    'standards-index',
    'rfc-references',
  ];
  const rest = [...catMap.keys()]
    .filter((id) => !pinned.includes(id))
    .sort((a, b) => a.localeCompare(b));
  const categoryOrder = [...pinned, ...rest];

  return categoryOrder
    .filter((id) => catMap.has(id))
    .map((id) => ({
      id,
      label: getCategoryLabel(id, currentLocale.value),
      files: catMap.get(id)!,
    }));
}

const categories = ref<DocCategory[]>([]);
const activeDoc = ref<string>('');
const renderedHtml = ref<string>('');
const loading = ref(false);
const error = ref<string>('');
const searchQuery = ref('');
const expandedCategories = ref<Set<string>>(new Set());
let docRequestId = 0;

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;

  const q = searchQuery.value.toLowerCase();
  return categories.value
    .map((cat) => ({
      ...cat,
      files: getCategoryLabel(cat.id, currentLocale.value).toLowerCase().includes(q)
        ? cat.files
        : cat.files.filter((f) => f.title.toLowerCase().includes(q)),
    }))
    .filter((cat) => cat.files.length > 0);
});

function toggleCategory(id: string) {
  if (expandedCategories.value.has(id)) {
    expandedCategories.value.delete(id);
  } else {
    expandedCategories.value.add(id);
  }
  // Trigger reactivity
  expandedCategories.value = new Set(expandedCategories.value);
}

async function selectDoc(path: string, sourceLine?: number, headingId?: string) {
  const requestId = ++docRequestId;
  activeDoc.value = path;
  loading.value = true;
  error.value = '';

  try {
    const loader = docLoaders[path];
    if (!loader) {
      if (requestId === docRequestId) error.value = ui('docsNotFound');
      return;
    }
    const content = await loader();
    if (requestId === docRequestId) renderedHtml.value = renderMarkdown(content, sourceLine);
  } catch (err) {
    if (requestId === docRequestId) error.value = `${ui('docsRenderFailed')}: ${err}`;
  } finally {
    if (requestId === docRequestId) {
      loading.value = false;
      // loading=false 后内容区才渲染，mermaid 需在 DOM 就绪后执行
      await renderMermaid();
      if (requestId === docRequestId && sourceLine) {
        document.getElementById(`source-line-${sourceLine}`)?.scrollIntoView({ block: 'start' });
      } else if (requestId === docRequestId && headingId) {
        document.getElementById(headingId)?.scrollIntoView({ block: 'start' });
      }
    }
  }
}

// 渲染文档中的 mermaid 图（动态加载，避免增大首屏包体）
async function renderMermaid() {
  // 等待 renderedHtml 写入 DOM（loading=false 后才渲染内容区）
  await nextTick();
  const nodes = Array.from(
    document.querySelectorAll('.docs-content pre.mermaid'),
  ) as HTMLElement[];
  if (nodes.length === 0) return;
  try {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false });
    await mermaid.run({ nodes });
  } catch (err) {
    console.warn('Mermaid render failed:', err);
  }
}

function goBack() {
  router.push('/');
}

// 语言切换统一走全局入口（右上角 locale 选择器）——uiLocaleRef 变化触发下方 watch 重建类目

function rebuildCategories() {
  categories.value = buildCategories();
  // Expand all categories by default
  for (const cat of categories.value) {
    expandedCategories.value.add(cat.id);
  }
}

// Keep relative Markdown and PDF links inside their docs/ source paths. Markdown
// files load in the docs view; PDFs are served as static files by Vite/nginx.
async function setupDocLinks() {
  await nextTick();
  const container = document.querySelector('.docs-content');
  if (!container) return;
  container.addEventListener('click', (ev: Event) => {
    const target = ev.target as HTMLElement;
    const a = target.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    let url: URL;
    try {
      url = new URL(href, `${window.location.origin}${activeDoc.value}`);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;

    let targetPath = url.pathname;
    try {
      targetPath = decodeURIComponent(targetPath);
    } catch {
      // Keep malformed percent sequences unchanged; they will not match a doc.
    }

    if (targetPath.endsWith('.pdf')) {
      ev.preventDefault();
      window.location.assign(`${targetPath}${url.search}${url.hash}`);
      return;
    }
    if (!targetPath.endsWith('.md')) return;

    ev.preventDefault();
    if (targetPath in docLoaders) {
      const sourceLine = /^#L(\d+)/.exec(url.hash)?.[1];
      let headingId = sourceLine ? '' : url.hash.slice(1);
      try {
        headingId = decodeURIComponent(headingId);
      } catch {
        // Keep malformed heading fragments unchanged; they will not match.
      }
      if (targetPath === activeDoc.value && headingId) {
        document.getElementById(headingId)?.scrollIntoView({ block: 'start' });
      } else {
        void selectDoc(targetPath, sourceLine ? Number(sourceLine) : undefined, headingId || undefined);
      }
    } else {
      console.warn('Doc link not found:', targetPath);
    }
  });
}

onMounted(rebuildCategories);
// 语言切换：优先使用对应译文；标准页暂无英文译本时保留 source 语言页面作为可见 fallback。
watch(currentLocale, async () => {
  rebuildCategories();
  const rel = activeDoc.value.replace(/^\/docs\//, '');
  if (!rel) return;
  const counterpart = localizedCounterpart(activeDoc.value);
  if (counterpart in docLoaders) {
    await selectDoc(counterpart);
  }
});
// 文档链接拦截（v-html 渲染后绑定，容器级事件委托）
void setupDocLinks();
</script>

<style scoped>
.docs-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

/* Header */
.docs-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.header-btn svg {
  width: 14px;
  height: 14px;
}

.header-btn:hover {
  background: var(--color-bg-hover, #f0f0f0);
  border-color: var(--color-border-hover, #ccc);
}

.docs-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.header-spacer {
  flex: 1;
}

/* Body layout */
.docs-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.docs-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-search {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  background: var(--color-bg);
  color: var(--color-text);
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.nav-category {
  margin-bottom: 4px;
}

.nav-category-title {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}

.nav-category-title:hover {
  background: var(--color-bg-hover, #f5f5f5);
}

.collapse-icon {
  font-size: 10px;
  transition: transform 0.15s;
  width: 12px;
  text-align: center;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.doc-count {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.nav-items {
  overflow: hidden;
}

.nav-item {
  display: block;
  width: 100%;
  padding: 6px 16px 6px 34px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.12s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item:hover {
  background: var(--color-bg-hover, #f5f5f5);
  color: var(--color-text);
}

.nav-item.active {
  color: var(--color-primary);
  background: rgba(25, 118, 210, 0.08);
  font-weight: 500;
}

/* Content area */
.docs-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 48px;
  min-width: 0;
}

/* Loading */
.content-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.content-error {
  padding: 24px;
  color: var(--color-danger);
  background: rgba(211, 47, 47, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(211, 47, 47, 0.2);
}

.locale-fallback {
  margin: 0 0 16px;
  padding: 8px 12px;
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
}

/* Welcome */
.content-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
  color: var(--color-text-secondary);
  text-align: center;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  opacity: 0.3;
}

.content-welcome h2 {
  font-size: 20px;
  color: var(--color-text);
  margin: 0;
}

.content-welcome p {
  font-size: 14px;
  margin: 0;
  max-width: 400px;
}

.welcome-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  max-width: 100%;
}

.welcome-link {
  padding: 8px 20px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-card);
  color: var(--color-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.12s;
}

.welcome-link:hover {
  border-color: var(--color-primary);
  background: rgba(25, 118, 210, 0.05);
}

/* Markdown content styling */
.content-markdown {
  max-width: 860px;
  line-height: 1.7;
  font-size: 15px;
}

.content-markdown :deep(h1) {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.content-markdown :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 28px 0 12px 0;
}

.content-markdown :deep(h3) {
  font-size: 17px;
  font-weight: 600;
  margin: 20px 0 8px 0;
}

.content-markdown :deep(p) {
  margin: 0 0 12px 0;
}

.content-markdown :deep(strong) {
  font-weight: 600;
}

.content-markdown :deep(code) {
  font-family: var(--font-family-mono);
  font-size: 13px;
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 3px;
}

.content-markdown :deep(pre) {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #282c34;
}

.content-markdown :deep(pre.doc-code) {
  position: relative;
  padding-top: 30px;
}

.content-markdown :deep(pre.doc-code::before) {
  content: attr(data-language);
  position: absolute;
  inset: 0 0 auto;
  height: 30px;
  padding: 7px 14px 0;
  box-sizing: border-box;
  color: #abb2bf;
  background: rgba(0, 0, 0, 0.18);
  font-family: var(--font-family);
  font-size: 11px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.content-markdown :deep(pre code) {
  display: block;
  padding: 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  background: none;
  color: #abb2bf;
}

.content-markdown :deep(table) {
  border-collapse: collapse;
  margin: 16px 0;
  width: 100%;
  font-size: 14px;
}

.content-markdown :deep(th) {
  background: var(--color-bg-hover, #f0f0f0);
  font-weight: 600;
  text-align: center;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
}

.content-markdown :deep(td) {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  text-align: center;
}

.content-markdown :deep(tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}

.content-markdown :deep(ul),
.content-markdown :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.content-markdown :deep(li) {
  margin: 4px 0;
}

.content-markdown :deep(blockquote) {
  margin: 16px 0;
  padding: 8px 16px;
  border-left: 4px solid var(--color-primary);
  background: rgba(25, 118, 210, 0.05);
  border-radius: 0 4px 4px 0;
}

.content-markdown :deep(hr) {
  margin: 24px 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

.content-markdown :deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}

.content-markdown :deep(a:hover) {
  text-decoration: underline;
}

.content-markdown :deep(img) {
  display: block;
  max-width: 100%;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: #fff;
  box-shadow: 0 3px 12px rgba(32, 36, 43, 0.08);
  margin: 16px 0 8px;
}

.content-markdown :deep(p > em:only-child) {
  display: block;
  color: var(--color-text-secondary, #697586);
  font-size: 0.9em;
  margin-bottom: 16px;
}
</style>
