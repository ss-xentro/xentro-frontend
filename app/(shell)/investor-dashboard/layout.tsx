import { redirect } from 'next/navigation';

export default function InvestorDashboardLayout({ children }: { children: React.ReactNode }) {
    redirect('/explore/institute');
}
