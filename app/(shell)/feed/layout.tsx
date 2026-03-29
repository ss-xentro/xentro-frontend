import { redirect } from 'next/navigation';

export default function FeedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    redirect('/explore/institute');
}
