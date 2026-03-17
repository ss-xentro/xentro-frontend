import { Card } from '@/components/ui';
import { Project, STATUS_LABELS } from '../institution-tabs-config';

export default function ProjectsTab({ projects }: { projects: Project[] }) {
	if (projects.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
					<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-white mb-2">No projects listed yet</h3>
				<p className="text-gray-400 max-w-md mx-auto">
					This institution hasn&apos;t added any projects to showcase yet.
				</p>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-xl font-bold text-white mb-4">Projects</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{projects.map((project) => {
					const statusInfo = STATUS_LABELS[project.status] || STATUS_LABELS.planning;
					return (
						<Card key={project.id} className="p-6 bg-white/5 border border-white/10" hoverable>
							<div className="flex items-start justify-between mb-3">
								<h3 className="font-bold text-white text-lg">{project.name}</h3>
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
									{statusInfo.label}
								</span>
							</div>
							{project.description && (
								<p className="text-gray-400 text-sm line-clamp-2 mb-3">
									{project.description}
								</p>
							)}
							<div className="flex items-center gap-4 text-xs text-gray-400">
								{project.startDate && (
									<span className="flex items-center gap-1">
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										Started: {new Date(project.startDate).toLocaleDateString()}
									</span>
								)}
								{project.endDate && (
									<span className="flex items-center gap-1">
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Due: {new Date(project.endDate).toLocaleDateString()}
									</span>
								)}
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
