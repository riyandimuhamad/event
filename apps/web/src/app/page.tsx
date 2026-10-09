import { redirect } from 'next/navigation';
import { prisma } from '@eventops/db';

export default async function HomePage() {
  const defaultEvent = await prisma.event.findFirst({
    include: { organization: true },
  });

  if (defaultEvent && defaultEvent.organization) {
    redirect(`/${defaultEvent.organization.slug}/events/${defaultEvent.id}/overview`);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-border">
        <h1 className="text-xl font-bold mb-2">EventOps</h1>
        <p className="text-text-muted text-sm">Menyiapkan workspace awal...</p>
      </div>
    </div>
  );
}
