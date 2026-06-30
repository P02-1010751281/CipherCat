<template>
  <div class="project-list">
    <header class="list-header">
      <h1 class="list-title">{{ ui("projectList") }}</h1>
      <div class="header-actions">
        <button class="toolbar-btn" @click="goDocs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span>{{ ui("docs") }}</span>
        </button>
        <select
          v-model="selectedLocale"
          class="locale-select"
          @change="changeLocale"
        >
          <option
            v-for="(info, locale) in BLOCKLY_LOCALES"
            :key="locale"
            :value="locale"
          >
            {{ info.label }}
          </option>
        </select>
        <button class="toolbar-btn primary" @click="createProject">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{{ ui("newProject") }}</span>
        </button>
      </div>
    </header>

    <div v-if="projects.length === 0" class="empty-state">
      <svg
        class="empty-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <p>{{ ui("noProjects") }}</p>
    </div>

    <div v-else class="project-grid">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        @click="openProject(project.id!)"
      >
        <div class="card-header">
          <h3 class="card-title">
            {{ project.name || ui("unnamed") || "Untitled" }}
          </h3>
          <button
            class="card-delete-btn"
            :title="ui('deleteProject')"
            @click.stop="confirmDelete(project.id!, project.name)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
          </button>
        </div>
        <div class="card-meta">
          <span class="meta-item">{{ project.language || "JavaScript" }}</span>
          <span class="meta-item">{{ formatDate(project.updatedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  getAllProjects,
  saveProject,
  deleteProject,
  type ProjectRecord,
} from '@/composables/useProjectDB';
import {
  ui,
  useBlocklyLocale,
  BLOCKLY_LOCALES,
  type BlocklyLocale,
} from '@/composables/locale';

const router = useRouter();
const projects = ref<ProjectRecord[]>([]);

const blocklyLocale = useBlocklyLocale();
const selectedLocale = ref<BlocklyLocale>(blocklyLocale.getCurrentLocale());

function changeLocale() {
  blocklyLocale.setLocale(selectedLocale.value);
}

async function loadProjects() {
  try {
    const all = await getAllProjects();
    projects.value = all.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

async function createProject() {
  const now = new Date().toISOString();
  const newProject: ProjectRecord = {
    name: ui('unnamed') || 'Untitled',
    workspace: '',
    format: 'xml',
    language: 'python',
    createdAt: now,
    updatedAt: now,
  };
  const id = await saveProject(newProject);
  router.push(`/editor/${id}`);
}

function openProject(id: number) {
  router.push(`/editor/${id}`);
}

async function confirmDelete(id: number, name: string) {
  const confirmed = window.confirm(`${ui('deleteConfirm')}\n\n"${name}"`);
  if (!confirmed) return;
  try {
    await deleteProject(id);
    projects.value = projects.value.filter((p) => p.id !== id);
  } catch (err) {
    console.error('Failed to delete project:', err);
  }
}

function goDocs() {
  router.push('/docs');
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

onMounted(loadProjects);
</script>

<style scoped>
.project-list {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: 100vh;
  background: var(--color-bg-main);
  color: var(--color-text);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.list-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.locale-select {
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0 22px 0 8px;
  font-size: 12px;
  background: var(--color-bg-card)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='%23909399' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")
    no-repeat right 6px center;
  color: var(--color-text);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.toolbar-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.toolbar-btn:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.toolbar-btn.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.toolbar-btn.primary:hover {
  opacity: 0.9;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--color-text-secondary);
  gap: 16px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 15px;
  margin: 0;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.15s;
}

.project-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  word-break: break-word;
}

.card-delete-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.12s;
}

.project-card:hover .card-delete-btn {
  opacity: 1;
}

.card-delete-btn:hover {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.card-delete-btn svg {
  width: 14px;
  height: 14px;
}

.card-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.meta-item {
  display: inline-flex;
}
</style>
