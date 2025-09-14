'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  Award
} from 'lucide-react';

interface RedFlag {
  code: string;
  description: string;
}

interface ScoringComponent {
  name: string;
  score: number;
  weight: number;
  max_score: number;
  justification: string;
  weighted_score: number;
}

interface PositiveIndicator {
  impact: string;
  description: string;
}

interface Observation {
  finding: string;
  evidence_source: string;
  impact_on_score: 'Strongly Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Strongly Negative' | 'Not Applicable';
  aspect_evaluated: string;
  recommendation_for_improvement: string;
}

interface Scoring {
  red_flags: RedFlag[];
  components: ScoringComponent[];
  final_score: number;
  scoring_summary: string;
  positive_indicators: PositiveIndicator[];
  score_interpretation: string;
  calculation_breakdown?: string;
}

interface CriterionEvaluation {
  scoring: Scoring;
  rationale: string;
  criterion_id: string;
  observations: Observation[];
  criterion_name: string;
  evaluation_strategy: string;
}

interface ScoringOverviewProps {
  scoring: CriterionEvaluation[];
}

export function ScoringOverview({ scoring }: ScoringOverviewProps) {
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());
  const [expandedObservations, setExpandedObservations] = useState<Set<string>>(new Set());

  if (!scoring || scoring.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quality Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No scoring data available.</p>
        </CardContent>
      </Card>
    );
  }

  const toggleCriterion = (criterionId: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(criterionId)) {
      newExpanded.delete(criterionId);
    } else {
      newExpanded.add(criterionId);
    }
    setExpandedCriteria(newExpanded);
  };

  const toggleObservations = (criterionId: string) => {
    const obsKey = `${criterionId}-obs`;
    const newExpanded = new Set(expandedObservations);
    if (newExpanded.has(obsKey)) {
      newExpanded.delete(obsKey);
    } else {
      newExpanded.add(obsKey);
    }
    setExpandedObservations(newExpanded);
  };

  // Calculate overall metrics
  const averageScore = scoring.reduce((sum, criterion) => sum + criterion.scoring.final_score, 0) / scoring.length;
  const totalRedFlags = scoring.reduce((sum, criterion) => sum + criterion.scoring.red_flags.length, 0);
  const totalPositiveIndicators = scoring.reduce((sum, criterion) => sum + criterion.scoring.positive_indicators.length, 0);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    if (score >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 4.5) return 'default';
    if (score >= 3.5) return 'secondary';
    if (score >= 2.5) return 'outline';
    return 'destructive';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Strongly Positive': return 'text-green-600';
      case 'Positive': return 'text-green-500';
      case 'Neutral': return 'text-gray-500';
      case 'Negative': return 'text-orange-500';
      case 'Strongly Negative': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quality Assessment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore.toFixed(1)}/5.0
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{scoring.length}</div>
              <div className="text-sm text-muted-foreground">Criteria Evaluated</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${totalRedFlags > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {totalRedFlags}
              </div>
              <div className="text-sm text-muted-foreground">Red Flags</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalPositiveIndicators}</div>
              <div className="text-sm text-muted-foreground">Strengths</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Quality</span>
              <span className={`text-sm font-medium ${getScoreColor(averageScore)}`}>
                {((averageScore / 5) * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={(averageScore / 5) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Criteria Details */}
      <div className="space-y-4">
        {scoring.map((criterion) => (
          <Card key={criterion.criterion_id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCriterion(criterion.criterion_id)}
                    className="p-0 h-auto"
                  >
                    {expandedCriteria.has(criterion.criterion_id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <CardTitle className="text-lg">{criterion.criterion_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {criterion.scoring.scoring_summary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getScoreBadgeVariant(criterion.scoring.final_score)}>
                    {criterion.scoring.final_score.toFixed(1)}/5.0
                  </Badge>
                  <Badge variant="outline">
                    {criterion.scoring.score_interpretation}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {expandedCriteria.has(criterion.criterion_id) && (
              <CardContent className="pt-0">
                {/* Red Flags */}
                {criterion.scoring.red_flags.length > 0 && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <div className="font-medium text-red-800 mb-2">Critical Issues Found:</div>
                      <ul className="space-y-1">
                        {criterion.scoring.red_flags.map((flag, index) => (
                          <li key={index} className="text-sm text-red-700">
                            <strong>{flag.code}:</strong> {flag.description}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Positive Indicators */}
                {criterion.scoring.positive_indicators.length > 0 && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <div className="font-medium text-green-800 mb-2">Key Strengths:</div>
                      <ul className="space-y-1">
                        {criterion.scoring.positive_indicators.map((indicator, index) => (
                          <li key={index} className="text-sm text-green-700">
                            <strong>{indicator.description}:</strong> {indicator.impact}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Scoring Components */}
                <div className="mb-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Score Breakdown
                  </h4>
                  <div className="space-y-2">
                    {criterion.scoring.components.map((component, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{component.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Weight: {(component.weight * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${getScoreColor(component.score)}`}>
                              {component.score}/{component.max_score}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Weighted: {component.weighted_score.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <Progress
                          value={(component.score / component.max_score) * 100}
                          className="h-1.5 mb-2"
                        />
                        <p className="text-xs text-muted-foreground">{component.justification}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rationale */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Rationale</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {criterion.rationale}
                  </p>
                </div>

                {/* Observations */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Detailed Observations ({criterion.observations.length})
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleObservations(criterion.criterion_id)}
                    >
                      {expandedObservations.has(`${criterion.criterion_id}-obs`) ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>

                  {expandedObservations.has(`${criterion.criterion_id}-obs`) && (
                    <div className="space-y-3">
                      {criterion.observations.map((observation, index) => (
                        <div key={index} className="border-l-4 border-gray-200 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {observation.aspect_evaluated}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getImpactColor(observation.impact_on_score)}`}
                            >
                              {observation.impact_on_score}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{observation.finding}</p>
                          <p className="text-xs text-muted-foreground mb-1">
                            <strong>Evidence:</strong> {observation.evidence_source}
                          </p>
                          {observation.recommendation_for_improvement &&
                           observation.recommendation_for_improvement !== 'N/A' && (
                            <p className="text-xs text-blue-600">
                              <strong>Recommendation:</strong> {observation.recommendation_for_improvement}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}