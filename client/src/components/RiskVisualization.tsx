import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle2, Circle } from 'lucide-react';

type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

interface RiskItem {
  id: string | number;
  name: string;
  level: RiskLevel;
  description?: string;
  value?: number;
}

interface RiskVisualizationProps {
  title: string;
  description?: string;
  items: RiskItem[];
  showProgress?: boolean;
}

export default function RiskVisualization({
  title,
  description,
  items,
  showProgress = true
}: RiskVisualizationProps) {
  // Color coding based on risk level
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-400 text-black';
      case 'low': return 'bg-blue-400 text-white';
      case 'none': return 'bg-green-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  // Icon based on risk level
  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <Circle className="h-4 w-4" />;
      case 'none': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  // Progress color based on risk level
  const getProgressColor = (level: RiskLevel) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-blue-400';
      case 'none': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  // Get progress value based on risk level or use the provided value
  const getProgressValue = (item: RiskItem) => {
    if (typeof item.value === 'number') return item.value;
    
    switch (item.level) {
      case 'critical': return 100;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
      case 'none': return 0;
      default: return 0;
    }
  };

  const highestRiskLevel = items.reduce((highest, current) => {
    const levels: RiskLevel[] = ['critical', 'high', 'medium', 'low', 'none'];
    const highestIndex = levels.indexOf(highest as RiskLevel);
    const currentIndex = levels.indexOf(current.level);
    return highestIndex <= currentIndex ? highest : current.level;
  }, 'none' as RiskLevel);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {highestRiskLevel !== 'none' && (
            <Badge className={`${getRiskColor(highestRiskLevel)} text-xs`}>
              {highestRiskLevel.charAt(0).toUpperCase() + highestRiskLevel.slice(1)} Risk
            </Badge>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`inline-flex items-center justify-center p-1 rounded-full mr-2 ${getRiskColor(item.level)}`}>
                    {getRiskIcon(item.level)}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <Badge variant="outline" className={`text-xs ${item.level !== 'none' ? 'border-' + item.level + '-500' : ''}`}>
                  {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                </Badge>
              </div>
              
              {item.description && (
                <p className="text-xs text-gray-500 ml-7">{item.description}</p>
              )}
              
              {showProgress && (
                <Progress 
                  value={getProgressValue(item)} 
                  className="h-2" 
                  indicatorClassName={getProgressColor(item.level)}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}