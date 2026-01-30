import { create } from 'zustand';

export type Project = {
    id: string;
    institutionId: string;
    name: string;
    status: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    _optimistic?: boolean; // Flag for optimistic updates
};

type ProjectStore = {
    projects: Project[];
    loading: boolean;
    error: string | null;

    // Actions
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    removeProject: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Async actions with optimistic updates
    fetchProjects: (token: string) => Promise<void>;
    createProject: (token: string, data: Omit<Project, 'id' | 'institutionId' | 'createdAt' | 'updatedAt'>) => Promise<Project | null>;
    deleteProject: (token: string, id: string) => Promise<boolean>;
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
    projects: [],
    loading: false,
    error: null,

    // Simple setters
    setProjects: (projects) => set({ projects }),
    addProject: (project) => set((state) => ({
        projects: [project, ...state.projects]
    })),
    updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
        ),
    })),
    removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
    })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Fetch projects from API
    fetchProjects: async (token) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/projects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            set({ projects: data.data || [], loading: false });
        } catch (err) {
            set({ error: (err as Error).message, loading: false });
        }
    },

    // Create with optimistic update
    createProject: async (token, data) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticProject: Project = {
            id: tempId,
            institutionId: '',
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _optimistic: true,
        };

        // Optimistic: add immediately
        get().addProject(optimisticProject);

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to create project');
            }

            const result = await res.json();
            const realProject = result.data;

            // Replace optimistic with real
            get().updateProject(tempId, { ...realProject, _optimistic: false });
            return realProject;
        } catch (err) {
            // Rollback on error
            get().removeProject(tempId);
            set({ error: (err as Error).message });
            return null;
        }
    },

    // Delete with optimistic update
    deleteProject: async (token, id) => {
        const projectToDelete = get().projects.find((p) => p.id === id);
        if (!projectToDelete) return false;

        // Optimistic: remove immediately
        get().removeProject(id);

        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Failed to delete project');
            }

            return true;
        } catch (err) {
            // Rollback on error
            get().addProject(projectToDelete);
            set({ error: (err as Error).message });
            return false;
        }
    },
}));
