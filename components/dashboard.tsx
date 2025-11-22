'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  totalPayrollExpense: number;
  averageSalary: number;
  processedPayrolls: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalPayrollExpense: 0,
    averageSalary: 0,
    processedPayrolls: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/payroll/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  };

  const StatCard = ({ icon: Icon, label, value, unit }: any) => (
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {unit ? `${unit} ${value.toLocaleString()}` : value.toLocaleString()}
            </p>
          </div>
          <Icon className="h-8 w-8 text-primary/60" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Employees"
          value={stats.totalEmployees}
        />
        <StatCard
          icon={DollarSign}
          label="Payroll Expense"
          value={stats.totalPayrollExpense}
          unit="₹"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Salary"
          value={Math.round(stats.averageSalary)}
          unit="₹"
        />
        <StatCard
          icon={Calendar}
          label="Processed Payrolls"
          value={stats.processedPayrolls}
        />
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Quick Overview</CardTitle>
          <CardDescription>System status and advanced features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold text-foreground mb-2">Core Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Auto-calculated payroll from attendance</li>
                <li>✓ Tax & deduction processing</li>
                <li>✓ Payslip generation & export</li>
                <li>✓ Employee attendance tracking</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold text-foreground mb-2">Advanced Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Multi-component salary breakdown</li>
                <li>✓ Configurable deductions (PF, Tax, Insurance)</li>
                <li>✓ Monthly & daily payroll summaries</li>
                <li>✓ Database persistence & reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
