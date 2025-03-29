// Utility functions for analytics data processing

/**
 * Processes raw inspection data to generate analytics data for charts
 * @param inspections Array of inspection objects
 * @param breaches Array of breach objects
 * @returns Object containing processed data for various analytics charts
 */
export function processAnalyticsData(inspections: any[], breaches: any[] = []) {
  // Process inspections by status
  const statusCounts: Record<string, number> = {};
  inspections.forEach(inspection => {
    const status = inspection.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',    // amber-500
    inProgress: '#3b82f6',  // blue-500
    completed: '#10b981',   // emerald-500
    cancelled: '#ef4444',   // red-500
    unknown: '#6b7280',     // gray-500
  };
  
  const inspectionsByStatus = Object.keys(statusCounts).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: statusCounts[status],
    color: statusColors[status] || statusColors.unknown
  }));
  
  // Process inspections by type
  const typeCounts: Record<string, number> = {};
  inspections.forEach(inspection => {
    const type = inspection.inspectionType || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  const inspectionsByType = Object.keys(typeCounts).map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    count: typeCounts[type]
  }));
  
  // Process breach severity
  const severityCounts: Record<string, number> = {};
  breaches.forEach(breach => {
    const severity = breach.severity || 'unknown';
    severityCounts[severity] = (severityCounts[severity] || 0) + 1;
  });
  
  const severityColors: Record<string, string> = {
    critical: '#ef4444',  // red-500
    high: '#f97316',      // orange-500
    medium: '#f59e0b',    // amber-500
    low: '#3b82f6',       // blue-500
    unknown: '#6b7280',   // gray-500
  };
  
  const breachSeverity = Object.keys(severityCounts).map(severity => ({
    severity: severity.charAt(0).toUpperCase() + severity.slice(1),
    count: severityCounts[severity],
    color: severityColors[severity] || severityColors.unknown
  }));
  
  // Generate monthly trends (last 6 months)
  const inspectionTrends = generateMonthlyTrends(inspections, breaches);
  
  return {
    inspectionsByStatus,
    inspectionsByType,
    breachSeverity,
    inspectionTrends
  };
}

/**
 * Generates monthly trends for inspections and breaches
 * @param inspections Array of inspection objects
 * @param breaches Array of breach objects
 * @returns Array of monthly trend data
 */
function generateMonthlyTrends(inspections: any[], breaches: any[] = []) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const result = [];
  
  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(currentDate);
    targetDate.setMonth(currentDate.getMonth() - i);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    
    // Count inspections for this month
    const monthlyInspections = inspections.filter(inspection => {
      const inspectionDate = new Date(inspection.inspectionDate);
      return inspectionDate.getMonth() === targetMonth && inspectionDate.getFullYear() === targetYear;
    });
    
    // Count breaches for this month
    const monthlyBreaches = breaches.filter(breach => {
      const breachDate = new Date(breach.createdAt);
      return breachDate.getMonth() === targetMonth && breachDate.getFullYear() === targetYear;
    });
    
    result.push({
      month: `${monthNames[targetMonth]} ${targetYear.toString().substr(2, 2)}`,
      inspections: monthlyInspections.length,
      breaches: monthlyBreaches.length
    });
  }
  
  return result;
}

/**
 * Calculates risk assessment score based on inspection data
 * @param inspection Inspection object
 * @returns Risk score and level
 */
export function calculateRiskScore(inspection: any, breaches: any[] = []) {
  // Different factors contribute to the risk score
  let score = 0;
  
  // Base risk is determined by inspection type
  const typeRisk: Record<string, number> = {
    'safety': 50,
    'environmental': 45,
    'compliance': 40,
    'routine': 20,
    'follow-up': 30
  };
  
  // Add base risk based on inspection type
  score += typeRisk[inspection.inspectionType] || 20;
  
  // Add risk based on breach severity
  const severityWeight: Record<string, number> = {
    'critical': 50,
    'high': 30,
    'medium': 15,
    'low': 5
  };
  
  breaches.forEach(breach => {
    score += severityWeight[breach.severity] || 0;
  });
  
  // Cap score at 100
  score = Math.min(score, 100);
  
  // Determine risk level
  let level: 'critical' | 'high' | 'medium' | 'low' | 'none';
  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'medium';
  else if (score >= 20) level = 'low';
  else level = 'none';
  
  return { score, level };
}

/**
 * Generates risk assessment items from inspection and breaches
 * @param inspection Inspection object
 * @param breaches Array of breach objects
 * @returns Array of risk items for visualization
 */
export function generateRiskItems(inspection: any, breaches: any[] = []) {
  const items = [];
  
  // Overall risk
  const { score, level } = calculateRiskScore(inspection, breaches);
  items.push({
    id: 'overall',
    name: 'Overall Risk',
    level,
    value: score,
    description: 'Overall risk assessment based on all factors'
  });
  
  // Create items for each breach if present
  if (breaches.length > 0) {
    breaches.forEach(breach => {
      items.push({
        id: breach.id,
        name: breach.title || 'Breach',
        level: breach.severity || 'medium',
        description: breach.description || ''
      });
    });
  }
  
  // Add site-specific risk
  if (inspection.siteComplexity) {
    const complexityLevel: Record<string, 'high' | 'medium' | 'low'> = {
      'complex': 'high',
      'moderate': 'medium',
      'simple': 'low'
    };
    
    items.push({
      id: 'site-complexity',
      name: 'Site Complexity',
      level: complexityLevel[inspection.siteComplexity] || 'low',
      description: 'Risk based on the complexity of the site'
    });
  }
  
  return items;
}