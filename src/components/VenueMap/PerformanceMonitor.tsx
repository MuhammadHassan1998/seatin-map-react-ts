import React from 'react';

interface RenderStats {
    totalSeats: number;
    renderedSeats: number;
    fps: number;
    renderTime: number;
}

interface PerformanceMonitorProps {
    stats: RenderStats;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ stats }) => {
    const getPerformanceColor = (fps: number) => {
        if (fps >= 55) return 'text-green-600';
        if (fps >= 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRenderTimeColor = (time: number) => {
        if (time <= 5) return 'text-green-600';
        if (time <= 16) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="absolute top-4 left-4 bg-white/95 p-3 rounded-lg border border-gray-300 shadow-sm z-10">
            <div className="text-sm font-medium text-gray-700 mb-2">Performance Monitor</div>
            <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Seats:</span>
                    <span className="font-mono">{stats.totalSeats.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Rendered:</span>
                    <span className="font-mono">{stats.renderedSeats.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">FPS:</span>
                    <span className={`font-mono ${getPerformanceColor(stats.fps)}`}>
                        {stats.fps}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Render Time:</span>
                    <span className={`font-mono ${getRenderTimeColor(stats.renderTime)}`}>
                        {stats.renderTime}ms
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Culling:</span>
                    <span className="font-mono text-green-600">
                        {stats.totalSeats > 0 ? Math.round((1 - stats.renderedSeats / stats.totalSeats) * 100) : 0}%
                    </span>
                </div>
            </div>
        </div>
    );
};
