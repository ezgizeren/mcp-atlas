import React from 'react';
import { SecurityScan } from '@/types/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface SecurityTabProps {
  security: SecurityScan;
}

export function SecurityTab({ security }: SecurityTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <ShieldCheck className="h-5 w-5" />;
      case 'warning':
        return <ShieldAlert className="h-5 w-5" />;
      case 'failed':
        return <ShieldX className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive',
    };
    return <Badge variant={variants[severity] || 'secondary'}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
          <CardDescription>
            Overall security assessment for this server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={getStatusColor(security.status)}>
                {getStatusIcon(security.status)}
              </div>
              <div>
                <p className="text-2xl font-bold">{security.score}/100</p>
                <p className="text-sm text-muted-foreground">Security Score</p>
              </div>
            </div>
            <Badge
              variant={
                security.status === 'passed'
                  ? 'default'
                  : security.status === 'warning'
                  ? 'secondary'
                  : 'destructive'
              }
              className="text-sm"
            >
              {security.status.toUpperCase()}
            </Badge>
          </div>

          <Progress value={security.score} className="h-2" />

          <p className="text-sm text-muted-foreground">
            Last scanned: {new Date(security.lastScanned).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Required Permissions
          </CardTitle>
          <CardDescription>
            Permissions this server requires to function
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {security.permissions.map((permission) => (
              <Badge key={permission} variant="outline">
                {permission}
              </Badge>
            ))}
            {security.permissions.length === 0 && (
              <p className="text-sm text-muted-foreground">No special permissions required</p>
            )}
          </div>
        </CardContent>
      </Card>

      {security.vulnerabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Vulnerabilities
            </CardTitle>
            <CardDescription>
              Security issues found during the scan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {security.vulnerabilities.map((vuln, index) => (
              <Alert key={index} className="border-yellow-200 dark:border-yellow-900">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {vuln.type}
                  {getSeverityBadge(vuln.severity)}
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>{vuln.description}</p>
                  {vuln.recommendation && (
                    <p className="text-sm font-medium">
                      Recommendation: {vuln.recommendation}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}