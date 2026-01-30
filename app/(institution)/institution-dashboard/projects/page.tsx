'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';
import { useProjectStore } from '@/stores/useProjectStore';
import { useInstitutionRealtime } from '@/hooks/useRealtime';

const statusLabels: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
};

export default function ProjectsPage() {
  const router = useRouter();
  const {
    projects,
    loading,
    error,
    setLoading,
    fetchProjects,
    addProject,
    updateProject,
    removeProject,
    deleteProject
  } = useProjectStore();

  // Get token and institution ID from localStorage
  const getToken = () => localStorage.getItem('institution_token');
  const getInstitutionId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      // Decode JWT to get institution ID for real-time channel
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.institutionId || null;
    } catch {
      return null;
    }
  };

  // Real-time event handlers
  const handleProjectCreated = useCallback((project: any) => {
    // Only add if not already in store (avoid duplicates from optimistic updates)
    const exists = projects.some(p => p.id === project.id);
    if (!exists) {
      addProject(project);
    }
  }, [projects, addProject]);

  const handleProjectUpdated = useCallback((project: any) => {
    updateProject(project.id, project);
  }, [updateProject]);

  const handleProjectDeleted = useCallback((data: { id: string }) => {
    removeProject(data.id);
  }, [removeProject]);

  // Subscribe to real-time updates
  useInstitutionRealtime(getInstitutionId(), {
    onProjectCreated: handleProjectCreated,
    onProjectUpdated: handleProjectUpdated,
    onProjectDeleted: handleProjectDeleted,
  });

  // Initial fetch
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/institution-login');
      return;
    }
    fetchProjects(token);
  }, [fetchProjects, router]);

  // Handle delete with optimistic update
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const token = getToken();
    if (!token) return;

    const success = await deleteProject(token, id);
    if (!success) {
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <DashboardSidebar>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {[1, 2].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardSidebar>
    );
  }

  return (
    <DashboardSidebar>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-(--primary)">Projects</h1>
            <p className="text-(--secondary) mt-1">Manage your institution's research projects and collaborations</p>
          </div>
          <Button onClick={() => router.push('/institution-dashboard/add-project')}>
            <span className="mr-2">➕</span>
            Add Project
          </Button>
        </div>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600">{error}</p>
          </Card>
        )}

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-(--primary) mb-2">No projects yet</h3>
            <p className="text-(--secondary) mb-4">
              Add research projects, collaborations, or institutional initiatives
            </p>
            <Button onClick={() => router.push('/institution-dashboard/add-project')}>
              Add Your First Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const statusInfo = statusLabels[project.status] || statusLabels.planning;
              const isOptimistic = project._optimistic;

              return (
                <Card
                  key={project.id}
                  className={`p-6 transition-opacity ${isOptimistic ? 'opacity-70' : 'opacity-100'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-(--primary)">{project.name}</h3>
                        {isOptimistic && (
                          <span className="text-xs text-(--secondary) animate-pulse">Saving...</span>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-(--secondary) mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-(--secondary) mb-4">
                    {project.startDate && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Started: {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-(--border) pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/institution-dashboard/projects/${project.id}/edit`)}
                      disabled={isOptimistic}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(project.id)}
                      disabled={isOptimistic}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}
