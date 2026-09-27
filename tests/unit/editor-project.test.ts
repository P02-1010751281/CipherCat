// @vitest-environment jsdom
import { createApp, h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const routeState = vi.hoisted(() => ({ params: {} as Record<string, string> }));
const route = vi.hoisted(
  () => ({ value: null as { params: Record<string, string> } | null }),
);
const routeHooks = vi.hoisted(() => ({
  beforeLeave: vi.fn(),
  beforeUpdate: vi.fn(),
}));
const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  afterEach: vi.fn(() => () => {}),
  onError: vi.fn(() => () => {}),
}));
vi.mock('vue-router', async () => {
  const { reactive } = await import('vue');
  route.value = reactive(routeState);
  return {
    useRoute: () => route.value,
    useRouter: () => routerMock,
    onBeforeRouteLeave: routeHooks.beforeLeave,
    onBeforeRouteUpdate: routeHooks.beforeUpdate,
  };
});

const saveProject = vi.hoisted(() => vi.fn());
const getProject = vi.hoisted(() => vi.fn());
vi.mock('@/composables/useProjectDB', () => ({
  getProject,
  saveProject,
}));

import { useEditorProject } from '@/composables/useEditorProject';

const mountedApps: ReturnType<typeof createApp>[] = [];

function mountApp(app: ReturnType<typeof createApp>) {
  mountedApps.push(app);
  app.mount(document.createElement('div'));
}

describe('useEditorProject saving', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    saveProject.mockReset();
    saveProject.mockResolvedValue(1);
    getProject.mockReset();
    routeHooks.beforeLeave.mockReset();
    routeHooks.beforeUpdate.mockReset();
    routerMock.push.mockReset();
    routerMock.replace.mockReset();
    routerMock.afterEach.mockReset();
    routerMock.afterEach.mockImplementation(() => () => {});
    routerMock.onError.mockReset();
    routerMock.onError.mockImplementation(() => () => {});
    route.value!.params = {};
  });

  afterEach(() => {
    for (const app of mountedApps.splice(0)) app.unmount();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('preserves createdAt and saves edits made during an in-flight save', async () => {
    let workspace = '<xml>before</xml>';
    let resolveFirstSave!: (id: number) => void;
    saveProject.mockImplementationOnce(
      () => new Promise<number>((resolve) => { resolveFirstSave = resolve; }),
    );

    const project = useEditorProject({
      getWorkspaceXml: () => workspace,
      language: ref('python'),
      loadWorkspaceXml: () => true,
      onWorkspaceChange: () => () => {},
      clearWorkspace: () => {},
    });
    project.projectId.value = 1;
    project.autoSaveEnabled.value = true;

    const firstSave = project.doSave();
    workspace = '<xml>after</xml>';
    project.handleWorkspaceChange();
    resolveFirstSave(1);
    expect(await firstSave).toBe(false);
    await vi.advanceTimersByTimeAsync(1500);

    expect(saveProject).toHaveBeenCalledTimes(2);
    expect(saveProject.mock.calls[1][0].workspace).toBe('<xml>after</xml>');
    expect(saveProject.mock.calls[1][0].createdAt).toBe(
      saveProject.mock.calls[0][0].createdAt,
    );
  });

  it('saves a new project instead of overwriting a route project that failed to load', async () => {
    route.value!.params = { id: '7' };
    getProject.mockRejectedValueOnce(new Error('database unavailable'));

    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml></xml>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);

    expect(project.saveStatus.value).toBe('error');
    expect(project.projectId.value).toBeNull();
    expect(await project.doSave()).toBe(true);
    expect(saveProject.mock.calls[0][0].id).toBeUndefined();
    expect(project.projectId.value).toBe(1);

  });

  it('saves a new project instead of overwriting a workspace that failed to import', async () => {
    route.value!.params = { id: '7' };
    getProject.mockResolvedValueOnce({
      id: 7,
      name: 'project',
      workspace: '<xml>broken</xml>',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml></xml>',
          language: ref('python'),
          loadWorkspaceXml: () => false,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);

    expect(project.saveStatus.value).toBe('error');
    expect(project.projectId.value).toBeNull();
    expect(await project.doSave()).toBe(true);
    expect(saveProject.mock.calls[0][0].id).toBeUndefined();
    expect(project.projectId.value).toBe(1);

  });

  it('loads the new project when a reused editor route changes id', async () => {
    route.value!.params = { id: '7' };
    const firstRecord = {
      id: 7,
      name: 'first',
      workspace: '<xml>first</xml>',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    let resolveFirstLoad!: (record: typeof firstRecord) => void;
    getProject
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolveFirstLoad = resolve; }),
      )
      .mockResolvedValueOnce({
        id: 8,
        name: 'second',
        workspace: '<xml>second</xml>',
        format: 'xml',
        language: 'python',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });

    let workspace = '';
    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => workspace,
          language: ref('python'),
          loadWorkspaceXml: (xml) => {
            workspace = xml;
            return true;
          },
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    expect(getProject).toHaveBeenNthCalledWith(1, 7);

    route.value!.params.id = '8';
    await nextTick();
    await Promise.resolve();

    expect(project.projectId.value).toBe(8);
    expect(workspace).toBe('<xml>second</xml>');
    resolveFirstLoad(firstRecord);
    await Promise.resolve();
    expect(project.projectId.value).toBe(8);
    expect(workspace).toBe('<xml>second</xml>');
    await project.doSave();
    expect(saveProject.mock.calls.at(-1)?.[0]).toMatchObject({
      id: 8,
      workspace: '<xml>second</xml>',
    });
  });

  it('locks editing after navigation approval until the target project loads', async () => {
    route.value!.params = { id: '7' };
    getProject
      .mockResolvedValueOnce({
        id: 7,
        name: 'first',
        workspace: '<xml>first</xml>',
        format: 'xml',
        language: 'python',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })
      .mockResolvedValueOnce({
        id: 8,
        name: 'second',
        workspace: '<xml>second</xml>',
        format: 'xml',
        language: 'python',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml>first</xml>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    const guard = routeHooks.beforeUpdate.mock.calls.at(-1)?.[0];

    expect(await guard?.(
      { params: { id: '8' }, fullPath: '/editor/8' },
      { params: { id: '7' }, fullPath: '/editor/7' },
    )).toBe(true);
    expect(project.navigationPending.value).toBe(true);
    route.value!.params.id = '8';
    await nextTick();
    await Promise.resolve();
    await Promise.resolve();

    expect(project.projectId.value).toBe(8);
    expect(project.navigationPending.value).toBe(false);
  });

  it('does not overwrite edits made while the initial project read is pending', async () => {
    route.value!.params = { id: '7' };
    let resolveLoad!: (record: {
      id: number;
      name: string;
      workspace: string;
      createdAt: string;
    }) => void;
    getProject.mockImplementationOnce(
      () => new Promise((resolve) => { resolveLoad = resolve; }),
    );

    let workspace = '<xml>before</xml>';
    let onChange!: () => void;
    let project!: ReturnType<typeof useEditorProject>;
    const loadWorkspaceXml = vi.fn((xml: string) => {
      workspace = xml;
      return true;
    });
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => workspace,
          language: ref('python'),
          loadWorkspaceXml,
          onWorkspaceChange: (handler) => {
            onChange = handler;
            return () => {};
          },
          clearWorkspace: () => { workspace = ''; },
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);

    workspace = '<xml>user edit</xml>';
    onChange();
    project.projectName.value = 'Renamed while loading';
    resolveLoad({
      id: 7,
      name: 'saved',
      workspace: '<xml>saved</xml>',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await Promise.resolve();
    await nextTick();

    expect(workspace).toBe('<xml>user edit</xml>');
    expect(loadWorkspaceXml).not.toHaveBeenCalled();
    expect(project.projectId.value).toBe(7);
    expect(project.saveStatus.value).toBe('unsaved');
    expect(await project.doSave()).toBe(true);
    expect(saveProject).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 7,
        name: 'Renamed while loading',
        workspace: '<xml>user edit</xml>',
      }),
    );
  });

  it('saves dirty edits before allowing a project route change', async () => {
    route.value!.params = { id: '7' };
    getProject.mockResolvedValueOnce({
      id: 7,
      name: 'project',
      workspace: '<xml>saved</xml>',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    let workspace = '';
    let onChange!: () => void;
    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => workspace,
          language: ref('python'),
          loadWorkspaceXml: (xml) => { workspace = xml; return true; },
          onWorkspaceChange: (handler) => { onChange = handler; return () => {}; },
          clearWorkspace: () => { workspace = ''; },
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    workspace = '<xml>edited</xml>';
    onChange();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const guard = routeHooks.beforeUpdate.mock.calls.at(-1)?.[0];
    expect(await guard?.(
      { params: { id: '8' }, fullPath: '/editor/8' },
      { params: { id: '7' }, fullPath: '/editor/7' },
    )).toBe(true);
    expect(project.navigationPending.value).toBe(true);
    expect(saveProject).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, workspace: '<xml>edited</xml>' }),
    );
  });

  it('prompts before closing the tab when project data is still unsaved', async () => {
    route.value!.params = { id: '7' };
    getProject.mockResolvedValueOnce({
      id: 7,
      name: 'project',
      workspace: '<xml>saved</xml>',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml>edited</xml>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    project.handleWorkspaceChange();
    const event = new Event('beforeunload', { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('does not clear dirty edits when creating a new workspace is cancelled', async () => {
    route.value!.params = { id: '7' };
    getProject.mockResolvedValueOnce({
      id: 7,
      name: 'project',
      workspace: '<xml>saved</xml>',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    let workspace = '';
    let onChange!: () => void;
    let project!: ReturnType<typeof useEditorProject>;
    const clearWorkspace = vi.fn(() => { workspace = ''; });
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => workspace,
          language: ref('python'),
          loadWorkspaceXml: (xml) => { workspace = xml; return true; },
          onWorkspaceChange: (handler) => { onChange = handler; return () => {}; },
          clearWorkspace,
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    workspace = '<xml>edited</xml>';
    onChange();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await project.handleNewWorkspace();

    expect(workspace).toBe('<xml>edited</xml>');
    expect(clearWorkspace).not.toHaveBeenCalled();
    expect(saveProject).not.toHaveBeenCalled();
  });

  it('keeps editing locked until the new workspace has been saved and loaded', async () => {
    let resolveCreate!: (id: number) => void;
    saveProject.mockImplementationOnce(
      () => new Promise<number>((resolve) => { resolveCreate = resolve; }),
    );
    getProject.mockResolvedValue({
      id: 12,
      name: 'Untitled',
      workspace: '',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-12T00:00:00.000Z',
      updatedAt: '2026-01-12T00:00:00.000Z',
    });
    routerMock.push.mockImplementationOnce(async (path: string) => {
      const guard = routeHooks.beforeUpdate.mock.calls.at(-1)?.[0];
      const id = path.split('/').at(-1)!;
      expect(await guard?.(
        { params: { id }, fullPath: path },
        { params: { id: '7' }, fullPath: '/editor/7' },
      )).toBe(true);
      route.value!.params.id = path.split('/').at(-1)!;
      await nextTick();
    });

    let project!: ReturnType<typeof useEditorProject>;
    const clearWorkspace = vi.fn();
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml/>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace,
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    const creating = project.handleNewWorkspace();
    await Promise.resolve();

    expect(project.navigationPending.value).toBe(true);
    expect(clearWorkspace).not.toHaveBeenCalled();
    resolveCreate(12);
    await creating;
    await nextTick();
    await Promise.resolve();
    await Promise.resolve();

    expect(clearWorkspace).toHaveBeenCalledOnce();
    expect(project.projectId.value).toBe(12);
    expect(project.navigationPending.value).toBe(false);
  });

  it('blocks a competing navigation while a new workspace is being created', async () => {
    let resolveCreate!: (id: number) => void;
    saveProject.mockImplementationOnce(
      () => new Promise<number>((resolve) => { resolveCreate = resolve; }),
    );
    getProject.mockResolvedValue({
      id: 12,
      name: 'Untitled',
      workspace: '',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-12T00:00:00.000Z',
      updatedAt: '2026-01-12T00:00:00.000Z',
    });
    route.value!.params = { id: '7' };
    routerMock.push.mockImplementationOnce(async (path: string) => {
      const guard = routeHooks.beforeUpdate.mock.calls.at(-1)?.[0];
      const id = path.split('/').at(-1)!;
      expect(await guard?.(
        { params: { id }, fullPath: path },
        { params: { id: '7' }, fullPath: '/editor/7' },
      )).toBe(true);
      route.value!.params.id = id;
      await nextTick();
    });

    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml/>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    const creating = project.handleNewWorkspace();
    await Promise.resolve();
    await Promise.resolve();

    expect(project.navigationPending.value).toBe(true);
    await project.handleNewWorkspace();
    expect(saveProject).toHaveBeenCalledTimes(1);
    const guard = routeHooks.beforeUpdate.mock.calls.at(-1)?.[0];
    expect(await guard?.(
      { params: { id: '8' }, fullPath: '/editor/8' },
      { params: { id: '7' }, fullPath: '/editor/7' },
    )).toBe(false);
    const afterEachCalls = routerMock.afterEach.mock.calls as unknown as Array<
      [(to: { fullPath: string }, from: { fullPath: string }, failure?: unknown) => void]
    >;
    const afterEach = afterEachCalls.at(-1)?.[0];
    afterEach?.(
      { fullPath: '/editor/8' },
      { fullPath: '/editor/7' },
      { type: 4 },
    );
    expect(project.navigationPending.value).toBe(true);

    resolveCreate(12);
    await creating;
    await nextTick();
    await Promise.resolve();
    expect(routerMock.push).toHaveBeenCalledWith('/editor/12');
    expect(project.projectId.value).toBe(12);
    expect(project.navigationPending.value).toBe(false);
  });

  it('releases the navigation lock when an approved target fails to load', async () => {
    route.value!.params = { id: '7' };
    getProject
      .mockResolvedValueOnce({
        id: 7,
        name: 'first',
        workspace: '<xml>first</xml>',
        format: 'xml',
        language: 'python',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })
      .mockRejectedValueOnce(new Error('target read failed'));

    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml>first</xml>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    const guard = routeHooks.beforeUpdate.mock.calls.at(-1)?.[0];

    expect(await guard?.(
      { params: { id: '8' }, fullPath: '/editor/8' },
      { params: { id: '7' }, fullPath: '/editor/7' },
    )).toBe(true);
    expect(project.navigationPending.value).toBe(true);
    route.value!.params.id = '8';
    await nextTick();
    await Promise.resolve();
    await Promise.resolve();

    expect(project.navigationPending.value).toBe(false);
    expect(project.saveStatus.value).toBe('error');
  });

  it('keeps the navigation lock through a duplicate target while that project loads', async () => {
    route.value!.params = { id: '7' };
    let resolveTarget!: (record: {
      id: number;
      name: string;
      workspace: string;
      format: 'xml';
      language: string;
      createdAt: string;
      updatedAt: string;
    }) => void;
    getProject
      .mockResolvedValueOnce({
        id: 7,
        name: 'first',
        workspace: '<xml>first</xml>',
        format: 'xml',
        language: 'python',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolveTarget = resolve; }),
      );

    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml>first</xml>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    const guard = routeHooks.beforeUpdate.mock.calls.at(-1)?.[0];

    expect(await guard?.(
      { params: { id: '8' }, fullPath: '/editor/8' },
      { params: { id: '7' }, fullPath: '/editor/7' },
    )).toBe(true);
    route.value!.params.id = '8';
    await nextTick();

    const afterEachCalls = routerMock.afterEach.mock.calls as unknown as Array<
      [(to: { fullPath: string }, from: { fullPath: string }, failure?: unknown) => void]
    >;
    afterEachCalls.at(-1)?.[0](
      { fullPath: '/editor/8' },
      { fullPath: '/editor/8' },
      { type: 16 },
    );
    expect(project.navigationPending.value).toBe(true);

    resolveTarget({
      id: 8,
      name: 'target',
      workspace: '<xml>target</xml>',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(project.projectId.value).toBe(8);
    expect(project.navigationPending.value).toBe(false);
  });

  it('releases the navigation lock when an approved route component fails to import', async () => {
    const project = useEditorProject({
      getWorkspaceXml: () => '<xml/>',
      language: ref('python'),
      loadWorkspaceXml: () => true,
      onWorkspaceChange: () => () => {},
      clearWorkspace: () => {},
    });

    const guard = routeHooks.beforeLeave.mock.calls.at(-1)?.[0];
    expect(await guard?.({ fullPath: '/docs' })).toBe(true);
    expect(project.navigationPending.value).toBe(true);

    const onErrorCalls = routerMock.onError.mock.calls as unknown as Array<
      [(error: Error, to: { fullPath: string }, from: { fullPath: string }) => void]
    >;
    const onError = onErrorCalls.at(-1)?.[0];
    onError?.(
      new Error('Failed to fetch dynamically imported module'),
      { fullPath: '/docs' },
      { fullPath: '/editor/7' },
    );

    expect(project.navigationPending.value).toBe(false);
  });

  it('clears old workspace and save target for empty or invalid project routes', async () => {
    route.value!.params = { id: '7' };
    getProject
      .mockResolvedValueOnce({
        id: 7,
        name: 'first',
        workspace: '<xml>first</xml>',
        format: 'xml',
        language: 'python',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      })
      .mockResolvedValueOnce({
        id: 8,
        name: 'empty',
        workspace: '',
        format: 'xml',
        language: 'python',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });

    let workspace = '';
    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => workspace,
          language: ref('python'),
          loadWorkspaceXml: (xml) => {
            workspace = xml;
            return true;
          },
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => { workspace = ''; },
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    expect(workspace).toBe('<xml>first</xml>');

    route.value!.params.id = '8';
    await nextTick();
    await Promise.resolve();
    expect(project.projectId.value).toBe(8);
    expect(workspace).toBe('');

    const guard = routeHooks.beforeUpdate.mock.calls.at(-1)?.[0];
    expect(await guard?.(
      { params: { id: 'invalid' }, fullPath: '/editor/invalid' },
      { params: { id: '8' }, fullPath: '/editor/8' },
    )).toBe(true);
    expect(project.navigationPending.value).toBe(true);
    route.value!.params.id = 'invalid';
    await nextTick();
    expect(project.projectId.value).toBeNull();
    expect(project.navigationPending.value).toBe(false);
    expect(await project.doSave()).toBe(true);
    expect(saveProject.mock.calls[0][0].id).toBeUndefined();
  });

  it('does not let a previous project save overwrite the next project metadata', async () => {
    route.value!.params = { id: '7' };
    const firstRecord = {
      id: 7,
      name: 'first',
      workspace: '<xml>first</xml>',
      format: 'xml',
      language: 'python',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    let resolveSave!: (id: number) => void;
    saveProject.mockImplementationOnce(
      () => new Promise<number>((resolve) => { resolveSave = resolve; }),
    );
    getProject
      .mockResolvedValueOnce(firstRecord)
      .mockResolvedValueOnce({
        id: 8,
        name: 'second',
        workspace: '<xml>second</xml>',
        format: 'xml',
        language: 'python',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });

    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml>current</xml>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    await Promise.resolve();
    expect(project.projectId.value).toBe(7);
    const oldSave = project.doSave();

    route.value!.params.id = '8';
    await nextTick();
    await Promise.resolve();
    await Promise.resolve();
    expect(getProject).toHaveBeenNthCalledWith(2, 8);
    expect(project.projectId.value).toBe(8);
    resolveSave(1);
    await oldSave;
    await project.doSave();

    expect(saveProject.mock.calls[1][0]).toMatchObject({
      id: 8,
      createdAt: '2026-01-02T00:00:00.000Z',
    });
  });

  it('saves edits as a new project after the route project failed to load', async () => {
    route.value!.params = { id: '7' };
    getProject.mockRejectedValueOnce(new Error('database unavailable'));
    saveProject.mockResolvedValueOnce(42);

    const workspace = '<xml>user work</xml>';
    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => workspace,
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    project.handleWorkspaceChange();

    expect(await project.doSave()).toBe(true);
    expect(project.projectId.value).toBe(42);
    expect(saveProject.mock.calls[0][0]).toMatchObject({
      workspace: '<xml>user work</xml>',
      language: 'python',
    });
    expect(saveProject.mock.calls[0][0].id).toBeUndefined();
    expect(routerMock.replace).toHaveBeenCalledWith('/editor/42');
  });

  it('does not start a nested route change when saving from a leave guard', async () => {
    route.value!.params = { id: '7' };
    getProject.mockRejectedValueOnce(new Error('database unavailable'));
    saveProject.mockResolvedValueOnce(42);
    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml>recoverable</xml>',
          language: ref('python'),
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);
    project.handleWorkspaceChange();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const guard = routeHooks.beforeLeave.mock.calls.at(-1)?.[0];
    expect(await guard?.({ fullPath: '/projects' }, { fullPath: '/editor/7' })).toBe(true);
    expect(project.navigationPending.value).toBe(true);
    expect(saveProject.mock.calls[0][0].id).toBeUndefined();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('restores a project language and persists a language-only edit', async () => {
    route.value!.params = { id: '7' };
    getProject.mockResolvedValueOnce({
      id: 7,
      name: 'project',
      workspace: '<xml>saved</xml>',
      format: 'xml',
      language: 'javascript',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    const language = ref('python');
    let project!: ReturnType<typeof useEditorProject>;
    const app = createApp({
      setup() {
        project = useEditorProject({
          getWorkspaceXml: () => '<xml>saved</xml>',
          language,
          loadWorkspaceXml: () => true,
          onWorkspaceChange: () => () => {},
          clearWorkspace: () => {},
        });
        return () => h('div');
      },
    });
    mountApp(app);
    await vi.advanceTimersByTimeAsync(100);

    expect(language.value).toBe('javascript');
    language.value = 'python';
    expect(project.saveStatus.value).toBe('unsaved');
    expect(await project.doSave()).toBe(true);
    expect(saveProject).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, language: 'python' }),
    );
  });
});
