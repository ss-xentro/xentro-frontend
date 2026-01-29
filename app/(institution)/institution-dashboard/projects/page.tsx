'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/institution/DashboardSidebar';
import { Card, Button } from '@/components/ui';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Implement API call to fetch projects
  }, []);

  return (
    <DashboardSidebar>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-(--primary)">Projects</h1>
            <p className="text-(--secondary) mt-1">Manage your institutional projects</p>
          </div>
          <Button onClick={() => router.push('/institution-dashboard/add-project')}>
            <span className="mr-2">➕</span>
            Add Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-(--surface-hover) mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-(--primary) mb-2">No projects yet</h3>
            <p className="text-(--secondary) mb-4">
              Add projects to showcase your institution's work
            </p>
            <Button onClick={() => router.push('/institution-dashboard/add-project')}>Add Your First Project</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="p-6">
                <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                <p className="text-sm text-(--secondary)">{project.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardSidebar>
  );
}
