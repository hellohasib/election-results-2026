
'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ElectionTable({ data }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('All');

    // Extract unique divisions for filter
    const divisions = useMemo(() => {
        const unique = new Set(data.map(item => item.Division).filter(Boolean));
        return ['All', ...Array.from(unique).sort()];
    }, [data]);

    // Filter data
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.Constituency?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDivision = selectedDivision === 'All' || item.Division === selectedDivision;
            return matchesSearch && matchesDivision;
        });
    }, [data, searchTerm, selectedDivision]);

    // Helper to parse votes safely
    const parseVotes = (votes) => {
        const parsed = parseInt(votes, 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-lg border border-white/10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search Constituency..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-500 w-5 h-5" />
                    <select
                        className="bg-gray-50 border border-gray-200 rounded-lg text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                    >
                        {divisions.map(div => (
                            <option key={div} value={div} className="text-gray-900">
                                {div}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((item, index) => {
                    const v1 = parseVotes(item['Votes 1']);
                    const v2 = parseVotes(item['Votes 2']);
                    const v3 = parseVotes(item['Votes 3']);
                    const totalVotes = v1 + v2 + v3;

                    // Create array of candidates with their data
                    const candidates = [
                        { name: item['Candidate 1'], votes: v1, color: 'bg-green-500', originalIndex: 1 },
                        { name: item['Candidate 2'], votes: v2, color: 'bg-purple-500', originalIndex: 2 },
                        { name: item['Candidate 3'], votes: v3, color: 'bg-orange-500', originalIndex: 3 }
                    ];

                    // Sort candidates by votes in descending order
                    const sortedCandidates = candidates.sort((a, b) => b.votes - a.votes);

                    // Winner is the first candidate after sorting (highest votes)
                    const winnerIndex = totalVotes > 0 ? sortedCandidates[0].originalIndex : -1;

                    // Alternating background colors
                    const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-orange-50';

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`${bgColor} rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300`}
                        >
                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{item.Constituency}</h3>
                                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-2 inline-block font-medium">
                                        {item.Division}
                                    </span>
                                </div>
                                {winnerIndex !== -1 && (
                                    <Trophy className="text-yellow-500 w-6 h-6 animate-pulse" />
                                )}
                            </div>

                            <div className="space-y-4">
                                {sortedCandidates.map((candidate, idx) => (
                                    <CandidateRow
                                        key={idx}
                                        name={candidate.name}
                                        votes={candidate.votes}
                                        total={totalVotes}
                                        isWinner={candidate.originalIndex === winnerIndex}
                                        color={candidate.color}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filteredData.length === 0 && (
                <div className="text-center text-white/80 py-20">
                    No results found matching your criteria.
                </div>
            )}
        </div>
    );
}

function CandidateRow({ name, votes, total, isWinner, color }) {
    if (!name || name === '—N/a') return null;

    const percentage = total > 0 ? ((votes / total) * 100).toFixed(1) : 0;

    return (
        <div className="relative">
            <div className="flex justify-between text-sm mb-1">
                <span className={`font-medium ${isWinner ? 'text-yellow-600 font-bold' : 'text-gray-700'}`}>
                    {name}
                </span>
                <span className="text-gray-600">{votes.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000 ${isWinner ? 'shadow-sm' : ''}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-right text-xs text-gray-400 mt-0.5">{percentage}%</div>
        </div>
    );
}
