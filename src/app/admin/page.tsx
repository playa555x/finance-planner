'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Activity,
  DollarSign,
  MapPin,
  Search,
  RefreshCw,
  Shield,
  TrendingUp,
  Calendar,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  createdAt: Date;
  statistics: {
    totalFinancialPlans: number;
    totalExpenses: number;
    totalDailyBudgets: number;
    totalFixedCosts: number;
    totalSpent: number;
    lastLocation: string;
    currentBudget: number;
    currency: string;
  };
}

interface DashboardData {
  users: User[];
  statistics: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    regularUsers: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn();
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session, page, search]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setData(result);
      } else {
        console.error('Failed to fetch dashboard data:', result.error);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8" />
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-blue-100">
                Welcome back, {session.user?.name || session.user?.email}
              </p>
            </div>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {data.statistics.totalUsers}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold text-green-600">
                      {data.statistics.activeUsers}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Admin Users</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {data.statistics.adminUsers}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Regular Users</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {data.statistics.regularUsers}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users by email or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={() => setPage(1)}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Manage and view all registered users with their statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.users.map((user) => (
                <Card key={user.id} className="border">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* User Info */}
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {user.name || 'No Name'}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                              >
                                {user.role}
                              </Badge>
                              <Badge
                                variant={user.isActive ? 'default' : 'destructive'}
                              >
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {user.lastLoginAt && (
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              <span>
                                Last Login:{' '}
                                {new Date(user.lastLoginAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">Plans</p>
                            <p className="text-lg font-bold">
                              {user.statistics.totalFinancialPlans}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">Expenses</p>
                            <p className="text-lg font-bold">
                              {user.statistics.totalExpenses}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">Budgets</p>
                            <p className="text-lg font-bold">
                              {user.statistics.totalDailyBudgets}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">Fixed Costs</p>
                            <p className="text-lg font-bold">
                              {user.statistics.totalFixedCosts}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Financial Info
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 rounded">
                            <p className="text-xs text-gray-600">Total Spent</p>
                            <p className="text-lg font-bold text-green-700">
                              {user.statistics.totalSpent.toLocaleString()}{' '}
                              {user.statistics.currency}
                            </p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded">
                            <p className="text-xs text-gray-600">Current Budget</p>
                            <p className="text-lg font-bold text-blue-700">
                              {user.statistics.currentBudget.toLocaleString()}{' '}
                              {user.statistics.currency}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{user.statistics.lastLocation}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/admin/users/${user.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {data?.users.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * data.pagination.limit + 1} to{' '}
                  {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
                  {data.pagination.total} users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
