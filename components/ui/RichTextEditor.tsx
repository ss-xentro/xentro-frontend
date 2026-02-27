'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef } from 'react';

/* ─── Types ─── */
interface RichTextEditorProps {
	value: string;
	onChange: (html: string) => void;
	placeholder?: string;
	label?: string;
	error?: string;
	disabled?: boolean;
	/** Minimal toolbar — hides alignment, highlight */
	minimal?: boolean;
	className?: string;
}

/* ─── Toolbar button ─── */
function ToolbarBtn({
	active,
	onClick,
	title,
	disabled,
	children,
}: {
	active?: boolean;
	onClick: () => void;
	title: string;
	disabled?: boolean;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={cn(
				'p-1.5 rounded-md transition-colors duration-150',
				active
					? 'bg-(--primary) text-white'
					: 'text-(--secondary) hover:text-(--primary) hover:bg-(--surface-hover)',
				disabled && 'opacity-30 cursor-not-allowed'
			)}
		>
			{children}
		</button>
	);
}

function Divider() {
	return <div className="w-px h-5 bg-(--border) mx-0.5" />;
}

/* ─── Toolbar ─── */
function Toolbar({ editor, minimal }: { editor: Editor; minimal?: boolean }) {
	const setLink = useCallback(() => {
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);
		if (url === null) return;
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}, [editor]);

	return (
		<div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-(--border) bg-(--surface-hover)/50">
			{/* Text style */}
			<ToolbarBtn
				active={editor.isActive('bold')}
				onClick={() => editor.chain().focus().toggleBold().run()}
				title="Bold"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
					<path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
				</svg>
			</ToolbarBtn>
			<ToolbarBtn
				active={editor.isActive('italic')}
				onClick={() => editor.chain().focus().toggleItalic().run()}
				title="Italic"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
				</svg>
			</ToolbarBtn>
			<ToolbarBtn
				active={editor.isActive('underline')}
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				title="Underline"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
				</svg>
			</ToolbarBtn>
			<ToolbarBtn
				active={editor.isActive('strike')}
				onClick={() => editor.chain().focus().toggleStrike().run()}
				title="Strikethrough"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<line x1="4" y1="12" x2="20" y2="12" />
					<path d="M17.5 7.5C17 5.5 15 4 12 4c-3 0-5 2-5 4 0 1.5.8 2.5 2 3" />
					<path d="M8.5 16.5C9 18.5 11 20 14 20c3 0 5-2 5-4 0-1.5-.8-2.5-2-3" />
				</svg>
			</ToolbarBtn>

			{!minimal && (
				<>
					<ToolbarBtn
						active={editor.isActive('highlight')}
						onClick={() => editor.chain().focus().toggleHighlight().run()}
						title="Highlight"
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
							<path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
						</svg>
					</ToolbarBtn>
				</>
			)}

			<Divider />

			{/* Headings */}
			<ToolbarBtn
				active={editor.isActive('heading', { level: 2 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				title="Heading 2"
			>
				<span className="text-xs font-bold leading-none">H2</span>
			</ToolbarBtn>
			<ToolbarBtn
				active={editor.isActive('heading', { level: 3 })}
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				title="Heading 3"
			>
				<span className="text-xs font-bold leading-none">H3</span>
			</ToolbarBtn>

			<Divider />

			{/* Lists */}
			<ToolbarBtn
				active={editor.isActive('bulletList')}
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				title="Bullet list"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
					<circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
				</svg>
			</ToolbarBtn>
			<ToolbarBtn
				active={editor.isActive('orderedList')}
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				title="Numbered list"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
					<text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text>
					<text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">2</text>
					<text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">3</text>
				</svg>
			</ToolbarBtn>

			<Divider />

			{/* Block */}
			<ToolbarBtn
				active={editor.isActive('blockquote')}
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				title="Quote"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
					<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
				</svg>
			</ToolbarBtn>
			<ToolbarBtn
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				title="Divider"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<line x1="3" y1="12" x2="21" y2="12" />
				</svg>
			</ToolbarBtn>

			{/* Link */}
			<ToolbarBtn
				active={editor.isActive('link')}
				onClick={setLink}
				title="Link"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
				</svg>
			</ToolbarBtn>

			{!minimal && (
				<>
					<Divider />
					{/* Alignment */}
					<ToolbarBtn
						active={editor.isActive({ textAlign: 'left' })}
						onClick={() => editor.chain().focus().setTextAlign('left').run()}
						title="Align left"
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
							<line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
						</svg>
					</ToolbarBtn>
					<ToolbarBtn
						active={editor.isActive({ textAlign: 'center' })}
						onClick={() => editor.chain().focus().setTextAlign('center').run()}
						title="Align center"
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
							<line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
						</svg>
					</ToolbarBtn>
				</>
			)}

			<Divider />

			{/* Undo / Redo */}
			<ToolbarBtn
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
				title="Undo"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
				</svg>
			</ToolbarBtn>
			<ToolbarBtn
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
				title="Redo"
			>
				<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
					<polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
				</svg>
			</ToolbarBtn>
		</div>
	);
}

/* ─── Main component ─── */
export function RichTextEditor({
	value,
	onChange,
	placeholder = 'Start writing...',
	label,
	error,
	disabled = false,
	minimal = false,
	className,
}: RichTextEditorProps) {
	const isInternalChange = useRef(false);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: { levels: [2, 3] },
			}),
			Underline,
			Highlight.configure({ multicolor: false }),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: { class: 'text-accent underline' },
			}),
			Placeholder.configure({ placeholder }),
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
		],
		content: value || '',
		editable: !disabled,
		onUpdate: ({ editor }) => {
			isInternalChange.current = true;
			const html = editor.getHTML();
			// Tiptap returns <p></p> for empty content
			onChange(html === '<p></p>' ? '' : html);
		},
		editorProps: {
			attributes: {
				class: 'rich-text-editor-content outline-none min-h-[120px] px-4 py-3 text-sm text-(--primary) leading-relaxed',
			},
		},
	});

	// Sync external value changes (e.g. on data load)
	useEffect(() => {
		if (!editor) return;
		if (isInternalChange.current) {
			isInternalChange.current = false;
			return;
		}
		const currentHtml = editor.getHTML();
		const normalizedCurrent = currentHtml === '<p></p>' ? '' : currentHtml;
		if (value !== normalizedCurrent) {
			editor.commands.setContent(value || '', { emitUpdate: false });
		}
	}, [value, editor]);

	// Sync disabled
	useEffect(() => {
		if (editor) editor.setEditable(!disabled);
	}, [disabled, editor]);

	if (!editor) return null;

	return (
		<div className={cn('w-full', className)}>
			{label && (
				<label className="block text-sm font-medium text-(--primary) mb-2">{label}</label>
			)}
			<div
				className={cn(
					'border rounded-lg overflow-hidden transition-all duration-200',
					'bg-(--surface) border-(--border)',
					!disabled && 'hover:border-(--secondary-light)',
					editor.isFocused && 'border-accent ring-2 ring-(--accent-light)',
					error && 'border-error focus-within:border-error focus-within:ring-(--error-light)',
					disabled && 'opacity-50 cursor-not-allowed'
				)}
			>
				{!disabled && <Toolbar editor={editor} minimal={minimal} />}
				<EditorContent editor={editor} />
			</div>
			{error && <p className="text-sm text-error mt-2">{error}</p>}
		</div>
	);
}

export default RichTextEditor;
