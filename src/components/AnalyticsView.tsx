import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, BarChart3, FileText, Download, Map, TrendingDown, CheckCircle, Filter, ArrowUpDown } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Crime } from '../App';

interface AnalyticsViewProps {
  onBack: () => void;
  onViewCrimeDetail: (crime: Crime) => void;
}

interface AnalysisReport {
  id: string;
  title: string;
  dateGenerated: string;
  type: 'map' | 'pdf' | 'chart';
  crimeIds: string[];
  location?: string;
  status: 'completed';
}

export function AnalyticsView({ onBack, onViewCrimeDetail }: AnalyticsViewProps) {
  const [verifiedCrimes, setVerifiedCrimes] = useState<Crime[]>([]);
  const [analysisReports, setAnalysisReports] = useState<AnalysisReport[]>([]); // ✅ ADDED
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch verified citizen reports
        const response = await fetch("http://localhost:4000/api/citizen-reports");
        const data = await response.json();
        
        // Filter only verified reports
        const verified = data.filter((r: Crime) => r.status === 'verified');
        setVerifiedCrimes(verified);

        // Fetch analysis reports from Reports table
        const reportsResponse = await fetch("http://localhost:4000/api/reports");
        const reportsData = await reportsResponse.json();
        
        // Transform database reports to match AnalysisReport interface
        const transformedReports: AnalysisReport[] = reportsData.map((r: any) => ({
          id: String(r.ReportID),
          title: r.Title,
          dateGenerated: r.GeneratedAt,
          type: r.Type.toLowerCase().includes('map') ? 'map' : 'pdf',
          crimeIds: [], // Would need to be populated based on your data structure
          location: r.FilterArea,
          status: 'completed'
        }));
        
        setAnalysisReports(transformedReports);
        
        console.log("Fetched verified reports:", verified);
        console.log("Fetched analysis reports:", transformedReports);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set empty arrays on error to prevent crashes
        setVerifiedCrimes([]);
        setAnalysisReports([]);
      }
    };

    fetchData();
  }, []);
  
  const getReportIcon = (type: string) => {
    switch (type) {
      case 'map':
        return <Map className="w-5 h-5 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'chart':
        return <BarChart3 className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getReportColor = (type: string) => {
    switch (type) {
      case 'map':
        return 'bg-blue-600/10 border-blue-600/20';
      case 'pdf':
        return 'bg-red-600/10 border-red-600/20';
      case 'chart':
        return 'bg-purple-600/10 border-purple-600/20';
      default:
        return 'bg-zinc-600/10 border-zinc-600/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-600/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-orange-600/10 text-orange-500 border-orange-500/20';
      case 'low':
        return 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-zinc-600/10 text-zinc-500 border-zinc-500/20';
    }
  };

  // Filter and sort verified crimes
  let filteredCrimes = [...verifiedCrimes];

  if (filterType !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.type === filterType);
  }

  if (filterSeverity !== 'all') {
    filteredCrimes = filteredCrimes.filter(crime => crime.severity === filterSeverity);
  }

  filteredCrimes = filteredCrimes.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'severity-high':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'severity-low':
        const severityOrderAsc = { high: 3, medium: 2, low: 1 };
        return severityOrderAsc[a.severity] - severityOrderAsc[b.severity];
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const crimeTypes = Array.from(new Set(verifiedCrimes.map(c => c.type)));

  const stats = {
    totalVerified: verifiedCrimes.length,
    totalReports: analysisReports.length,
    mapsGenerated: analysisReports.filter(r => r.type === 'map').length,
    pdfsGenerated: analysisReports.filter(r => r.type === 'pdf').length
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="hover:bg-zinc-800 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white">Analytics Dashboard</h1>
              <p className="text-xs text-zinc-500">Verified Reports & Analysis</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-green-600/10 border-green-600/20 p-3 text-center">
            <p className="text-xl text-green-500 mb-1">{stats.totalVerified}</p>
            <p className="text-xs text-zinc-500">Verified</p>
          </Card>
          <Card className="bg-purple-600/10 border-purple-600/20 p-3 text-center">
            <p className="text-xl text-purple-500 mb-1">{stats.totalReports}</p>
            <p className="text-xs text-zinc-500">Reports</p>
          </Card>
          <Card className="bg-blue-600/10 border-blue-600/20 p-3 text-center">
            <p className="text-xl text-blue-500 mb-1">{stats.mapsGenerated}</p>
            <p className="text-xs text-zinc-500">Maps</p>
          </Card>
          <Card className="bg-red-600/10 border-red-600/20 p-3 text-center">
            <p className="text-xl text-red-500 mb-1">{stats.pdfsGenerated}</p>
            <p className="text-xs text-zinc-500">PDFs</p>
          </Card>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-6">
          {/* Analysis Reports Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white">Analysis Reports</h2>
              <Badge variant="outline" className="bg-green-600/10 text-green-500 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                {analysisReports.length} completed
              </Badge>
            </div>
            <div className="space-y-3">
              {analysisReports.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
                  <p className="text-zinc-500">No analysis reports generated yet</p>
                </Card>
              ) : (
                analysisReports.map((report) => (
                  <Card
                    key={report.id}
                    className={`bg-zinc-900 border-zinc-800 p-4 ${getReportColor(report.type)}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-zinc-800/50 p-2 rounded-lg flex-shrink-0">
                        {getReportIcon(report.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white mb-1">{report.title}</h3>
                        <p className="text-sm text-zinc-500">
                          Generated on {new Date(report.dateGenerated).toLocaleDateString()}
                        </p>
                        {report.location && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
                            <MapPin className="w-3 h-3" />
                            <span>{report.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 capitalize">
                          {report.type}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {report.crimeIds.length} crimes analyzed
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Verified Crimes Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white">Verified Crime Reports</h2>
              <span className="text-xs text-zinc-500">{filteredCrimes.length} reports</span>
            </div>

            {/* Filters and Sorting */}
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="all">All Types</SelectItem>
                    {crimeTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white text-xs h-9">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="date-desc">Latest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="severity-high">High Severity</SelectItem>
                    <SelectItem value="severity-low">Low Severity</SelectItem>
                    <SelectItem value="type">By Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCrimes.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
                  <p className="text-zinc-500">No verified reports found</p>
                </Card>
              ) : (
                filteredCrimes.map((crime) => (
                  <Card
                    key={crime.id}
                    onClick={() => onViewCrimeDetail(crime)}
                    className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-green-600/20 p-2 rounded-lg flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-white">{crime.type}</h3>
                          <Badge variant="outline" className={getSeverityColor(crime.severity)}>
                            {crime.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{crime.location}</span>
                          <span className="mx-1">•</span>
                          <span>Case #{crime.caseNumber}</span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2">{crime.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{new Date(crime.date).toLocaleDateString()} at {crime.time}</span>
                      <Badge variant="outline" className="bg-green-600/10 text-green-500 border-green-500/20">
                        Verified
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Insights Card */}
          <Card className="bg-gradient-to-br from-purple-950 via-zinc-900 to-zinc-950 border-purple-800/50 p-4">
            <div className="flex gap-3">
              <TrendingDown className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white mb-2">Key Insights</h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>• {verifiedCrimes.length} total verified reports</li>
                  <li>• {analysisReports.length} analysis reports generated</li>
                  <li>• Review pending citizen reports in admin dashboard</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
