
import ElectionTable from '@/components/ElectionTable';
import SeatDistributionChart from '@/components/SeatDistributionChart';
import DivisionWinsChart from '@/components/DivisionWinsChart';
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
    const bnpDivisionMap = {};

    data.forEach(item => {
        const v1 = parseInt(item['Votes 1']) || 0;
        const v2 = parseInt(item['Votes 2']) || 0;
        const v3 = parseInt(item['Votes 3']) || 0;
        const total = v1 + v2 + v3;



        // Initialize division count if not exists
        if (item.Division && !bnpDivisionMap[item.Division]) {
            bnpDivisionMap[item.Division] = 0;
        }

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
                if (nameLower.includes('bnp')) {
                    bnpWins++;
                    // Increment division win for BNP
                    if (item.Division) {
                        bnpDivisionMap[item.Division] = (bnpDivisionMap[item.Division] || 0) + 1;
                    }
                }
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

    // Format data for Division Chart
    const divisionChartData = Object.keys(bnpDivisionMap).sort().map(division => ({
        name: division,
        wins: bnpDivisionMap[division]
    }));

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

                        {/* Party Stats Table */}
                        <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
                            <table className="min-w-[300px] bg-white/5 backdrop-blur-sm">
                                <thead className="bg-white/10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Party</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">Seats Won</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">BNP</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-white">{bnpWins}</td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-400">Jamaat</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-white">{jamaatWins}</td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-400">NCP</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-white">{ncpWins}</td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-400">Others</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-white">{othersWins}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 items-start">
                        <div className="flex justify-center w-full">
                            <SeatDistributionChart data={chartData} />
                        </div>
                        <div className="flex justify-center w-full">
                            <DivisionWinsChart data={divisionChartData} />
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <ElectionTable data={data} />
            </div>
        </main>
    );
}
