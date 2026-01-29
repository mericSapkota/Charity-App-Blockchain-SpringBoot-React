import React from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminFooter from '../components/AdminFooter';
import { useTheme } from '../contexts/ThemeContext';
import { FaChartLine, FaDownload, FaWallet, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AdminReportsPage = () => {
    const { isDark } = useTheme();

    const themeClasses = isDark ? "bg-zinc-900 text-zinc-100" : "bg-gray-50 text-zinc-900";
    const cardBg = isDark ? 'bg-zinc-800' : 'bg-white';
    const highlightColor = 'text-red-500';
    const reportListBg = isDark ? 'bg-zinc-700' : 'bg-gray-100';

    const recentReports = [
        { name: 'Q3 2025 Financial Audit', date: 'Oct 1, 2025', status: 'Completed', color: 'text-green-500' },
        { name: 'Pending Smart Contract Log', date: 'Nov 16, 2025', status: 'Pending Review', color: 'text-yellow-500' },
        { name: 'Suspicious Activity Flag', date: 'Nov 17, 2025', status: 'Critical', color: 'text-red-500' },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${themeClasses} flex flex-col`}>
            
            <AdminHeader />

            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    
                    <h1 className={`text-4xl font-extrabold mb-6 ${highlightColor}`}>
                        Financial & Blockchain Reports
                    </h1>
                    
                    {/* 1. Key Metrics Summary */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className={`p-6 rounded-xl shadow-lg ${cardBg}`}>
                            <FaWallet className={`w-8 h-8 mb-3 text-blue-500`} />
                            <div className="text-3xl font-bold mb-1">$1,400,000</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Fiat Received</div>
                        </div>
                        <div className={`p-6 rounded-xl shadow-lg ${cardBg}`}>
                            <FaChartLine className={`w-8 h-8 mb-3 text-green-500`} />
                            <div className="text-3xl font-bold mb-1">99.8%</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tokenization Success Rate</div>
                        </div>
                        <div className={`p-6 rounded-xl shadow-lg ${cardBg}`}>
                            <FaCheckCircle className={`w-8 h-8 mb-3 text-yellow-500`} />
                            <div className="text-3xl font-bold mb-1">45</div>
                            <div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Open Audit Findings</div>
                        </div>
                    </div>

                    {/* 2. Transaction Flow Chart Placeholder */}
                    <div className={`p-6 rounded-xl shadow-lg mb-12 ${cardBg}`}>
                        <h2 className="text-2xl font-bold mb-4">Live Token Flow Analysis</h2>
                        <div className={`h-64 flex items-center justify-center rounded-lg ${reportListBg}`}>
                            <p className="text-gray-500 italic">
                                [Chart Placeholder: Visualization of token flow from Donor Wallets to Project Smart Contracts]
                            </p>
                        </div>
                    </div>
                    
                    {/* 3. Recent Audits and Reports List */}
                    <h2 className="text-2xl font-bold mb-4">Recent Audit Files</h2>
                    <div className={`p-6 rounded-xl shadow-lg ${cardBg}`}>
                        {recentReports.map((report, index) => (
                            <div key={index} className={`flex justify-between items-center p-3 mb-2 rounded-lg ${reportListBg}`}>
                                <div className="flex items-center space-x-3">
                                    <span className={`text-sm font-semibold ${report.color}`}>
                                        {report.status === 'Completed' ? <FaCheckCircle /> : report.status === 'Critical' ? <FaTimesCircle /> : '...'}
                                    </span>
                                    <div>
                                        <p className="font-semibold">{report.name}</p>
                                        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Generated: {report.date}</p>
                                    </div>
                                </div>
                                <button className="py-1 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center space-x-2">
                                    <FaDownload />
                                    <span>Download</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    
                </div>
            </main>

            <AdminFooter />
        </div>
    );
};

export default AdminReportsPage;