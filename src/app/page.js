
import ElectionTable from '@/components/ElectionTable';
import SeatDistributionChart from '@/components/SeatDistributionChart';
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

    // Calculate party wins
    let bnpWins = 0;
    let jamaatWins = 0;
    let ncpWins = 0;
    let othersWins = 0;
    let declaredSeats = 0;

    data.forEach(item => {
        const v1 = parseInt(item['Votes 1']) || 0;
        const v2 = parseInt(item['Votes 2']) || 0;
        const v3 = parseInt(item['Votes 3']) || 0;
        const total = v1 + v2 + v3;

        if (total > 0) {
            declaredSeats++;
            const candidates = [
                { name: item['Candidate 1'], votes: v1 },
                { name: item['Candidate 2'], votes: v2 },
                { name: item['Candidate 3'], votes: v3 }
            ];

            // Sort by votes descending
            candidates.sort((a, b) => b.votes - a.votes);
            const winner = candidates[0];

            if (winner.votes > 0 && winner.name) {
                const nameLower = winner.name.toLowerCase();
                if (nameLower.includes('bnp')) bnpWins++;
                else if (nameLower.includes('jamaat')) jamaatWins++;
                else if (nameLower.includes('ncp')) ncpWins++;
                else othersWins++;
            }
        }
    });

    const undeclaredSeats = totalConstituencies - declaredSeats;

    const chartData = [
        { name: 'BNP', value: bnpWins, fill: '#22c55e' }, // Green
        { name: 'Jamaat', value: jamaatWins, fill: '#a855f7' }, // Purple
        { name: 'NCP', value: ncpWins, fill: '#f97316' }, // Orange
        { name: 'Others', value: othersWins, fill: '#6b7280' }, // Gray
        { name: 'Undeclared', value: undeclaredSeats, fill: '#e5e7eb' } // Light Gray
    ];

    return (
        <main className="min-h-screen text-white p-4">
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
                    <div className="flex justify-center gap-8 mt-6 flex-wrap">
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

                        {/* Party Stats */}
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-500">{bnpWins}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-widest">BNP Wins</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-500">{jamaatWins}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-widest">Jamaat Wins</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-500">{ncpWins}</div>
                            <div className="text-sm text-gray-500 uppercase tracking-widest">NCP Wins</div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="mt-8 flex justify-center">
                        <SeatDistributionChart data={chartData} />
                    </div>
                </div>

                {/* Main Table */}
                <ElectionTable data={data} />
            </div>
        </main>
    );
}
