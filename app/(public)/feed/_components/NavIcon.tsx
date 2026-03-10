import { cn } from '@/lib/utils';
import { NAV_ICON_PATHS } from '../_lib/constants';

export default function NavIcon({ icon, active }: { icon: string; active?: boolean }) {
	return (
		<svg
			className={cn('w-6 h-6 transition-all duration-200', active ? 'text-white' : 'text-gray-400')}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			strokeWidth={active ? 2.5 : 2}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d={NAV_ICON_PATHS[icon]} />
		</svg>
	);
}
