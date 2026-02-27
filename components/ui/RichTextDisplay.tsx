'use client';

import { cn } from '@/lib/utils';

interface RichTextDisplayProps {
	/** HTML string from the WYSIWYG editor */
	html: string | null | undefined;
	/** Extra class names for the wrapper */
	className?: string;
	/** Compact rendering (smaller text, tighter spacing) */
	compact?: boolean;
}

/**
 * Safely renders sanitised HTML content from the Tiptap WYSIWYG editor.
 * Applies consistent styling via the `.rich-text-display` CSS class.
 */
export function RichTextDisplay({ html, className, compact }: RichTextDisplayProps) {
	if (!html?.trim()) return null;

	return (
		<div
			className={cn(
				'rich-text-display',
				compact && 'rich-text-display--compact',
				className
			)}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

export default RichTextDisplay;
