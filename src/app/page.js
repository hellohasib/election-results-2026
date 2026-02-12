
import ElectionTable from '@/components/ElectionTable';
import { fetchElectionData } from '@/utils/googleSheets';

export const revalidate = 60; // Revalidate page every 60 seconds

export default async function Home() {
    const data = await fetchElectionData();

    // Basic stats for the header
    const totalConstituencies = data.length;
    const totalVotes = data.reduce((acc, curr) => {
        const v1 = parseInt(curr['Votes 1']) || 0;
        const v2 = parseInt(curr['Votes 2']) || 0;
        const v3 = parseInt(curr['Votes 3']) || 0;
        return acc + v1 + v2 + v3;
    }, 0);

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white p-4">
            <div className="max-w-7xl mx-auto py-10 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text pb-2">
                        Election 2026 Results
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Live updates from across all divisions. Data is synced in real-time from the official spreadsheet.
                    </p>

                    {/* Quick Stats */}
                    <div className="flex justify-center gap-8 mt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{totalConstituencies}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-widest">Constituencies</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">
                                {totalVotes.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 uppercase tracking-widest">Total Votes Counted</div>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <ElectionTable data={data} />
            </div>
        </main>
    );
}
