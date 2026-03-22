'use client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SignupFormProps {
	name: string;
	email: string;
	onNameChange: (value: string) => void;
	onEmailChange: (value: string) => void;
	emailExists: { exists: boolean; message: string } | null;
	emailChecking: boolean;
	magicLinkSent: boolean;
	emailVerified: boolean;
	emailLoading: boolean;
	isAutoCreating: boolean;
	redirectSecondsLeft: number;
	onSendMagicLink: () => void;
	onCheckVerification: () => void;
}

export function SignupForm({
	name,
	email,
	onNameChange,
	onEmailChange,
	emailExists,
	emailChecking,
	magicLinkSent,
	emailVerified,
	emailLoading,
	isAutoCreating,
	redirectSecondsLeft,
	onSendMagicLink,
	onCheckVerification,
}: SignupFormProps) {
	return (
		<div className="p-6 md:p-8 space-y-6 animate-fadeIn">
			<div>
				<h2 className="text-xl font-semibold text-(--primary)">Start with your startup name and email</h2>
				<p className="text-sm text-(--secondary) mt-1">Verify your email first. The remaining onboarding steps will open after your first login.</p>
			</div>

			<Input
				label="Startup Name"
				placeholder="e.g. Acme Technologies"
				value={name}
				onChange={e => onNameChange(e.target.value)}
				autoFocus
				required
			/>

			<Input
				label="Company Email"
				type="email"
				placeholder="you@company.com"
				value={email}
				onChange={e => onEmailChange(e.target.value)}
				disabled={emailVerified}
				required
			/>

			{emailExists?.exists && (
				<div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
					<svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
					<div>
						<p className="text-sm font-medium text-amber-800">{emailExists.message}</p>
						<a href="/login" className="text-sm text-accent hover:underline font-medium mt-1 inline-block">
							Go to Login &rarr;
						</a>
					</div>
				</div>
			)}
			{emailChecking && (
				<p className="text-xs text-(--secondary) animate-pulse">Checking email...</p>
			)}

			<div className="text-center py-4">
				<div className={cn(
					'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
					emailVerified ? 'bg-green-100' : 'bg-accent/10'
				)}>
					{emailVerified ? (
						<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					) : (
						<svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					)}
				</div>

				{emailVerified ? (
					<div>
						<h3 className="text-lg font-semibold text-green-700 mb-1">Email verified!</h3>
						<p className="text-sm text-(--secondary)">
							{isAutoCreating
								? `Creating your account now. Redirecting to login in ${Math.max(redirectSecondsLeft, 0)}s...`
								: 'Creating your account automatically...'}
						</p>
					</div>
				) : magicLinkSent ? (
					<div>
						<h3 className="text-lg font-semibold text-(--primary) mb-1">Check your inbox</h3>
						<p className="text-sm text-(--secondary)">
							We sent a verification link to <strong>{email}</strong>.<br />
							Click the link in the email, then come back here.
						</p>
					</div>
				) : (
					<div>
						<h3 className="text-lg font-semibold text-(--primary) mb-1">Verify your email</h3>
						<p className="text-sm text-(--secondary)">
							We&apos;ll send a link to <strong>{email || 'your email'}</strong>
						</p>
					</div>
				)}
			</div>

			{emailVerified ? (
				<div className="flex items-center justify-center gap-2 text-green-600 font-medium py-2">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					{isAutoCreating ? 'Verified - Account setup in progress' : 'Verified'}
				</div>
			) : !magicLinkSent ? (
				<Button
					onClick={onSendMagicLink}
					disabled={emailLoading || !name.trim() || !email.trim() || !!emailExists?.exists || emailChecking}
					isLoading={emailLoading}
					className="w-full"
				>
					{emailLoading ? 'Sending...' : 'Send verification link'}
				</Button>
			) : (
				<div className="space-y-3">
					<Button
						onClick={onCheckVerification}
						disabled={emailLoading}
						isLoading={emailLoading}
						className="w-full"
					>
						{emailLoading ? 'Checking...' : "I've clicked the link"}
					</Button>
					<button
						type="button"
						onClick={onSendMagicLink}
						disabled={emailLoading}
						className="w-full text-sm text-accent hover:underline disabled:opacity-50"
					>
						Resend verification link
					</button>
				</div>
			)}
		</div>
	);
}
