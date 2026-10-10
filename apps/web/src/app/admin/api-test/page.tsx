'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getQrToken, getOrders, getUserProfile } from '@/lib/api-client';

export default function ApiTest() {
  const { user, token, isLoading } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runTests = async () => {
    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    // Test 1: Health check
    try {
      const health = await fetch('http://localhost:8000/api/health/');
      results.health = { status: health.status, data: await health.json() };
    } catch (e: any) {
      errors.health = e.message;
    }

    // Test 2: Get user profile
    try {
      if (token) {
        const profile = await getUserProfile();
        results.profile = profile;
      } else {
        errors.profile = 'No token available';
      }
    } catch (e: any) {
      errors.profile = e.message;
    }

    // Test 3: Get QR token
    try {
      if (token) {
        const qr = await getQrToken();
        results.qr = qr;
      } else {
        errors.qr = 'No token available';
      }
    } catch (e: any) {
      errors.qr = e.message;
    }

    // Test 4: Get orders
    try {
      if (token) {
        const orders = await getOrders(5);
        results.orders = orders;
      } else {
        errors.orders = 'No token available';
      }
    } catch (e: any) {
      errors.orders = e.message;
    }

    setTestResults(results);
    setErrors(errors);
  };

  useEffect(() => {
    if (!isLoading) {
      runTests();
    }
  }, [isLoading, token]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-h2 font-bold">API Test Panel</h1>

      {/* Auth Status */}
      <div className="bg-surface p-4 rounded-lg space-y-2">
        <h2 className="text-h3 font-bold">Auth Status</h2>
        <p>Loading: {isLoading ? 'YES' : 'NO'}</p>
        <p>User: {user?.name || 'GUEST'}</p>
        <p>Token: {token ? 'YES' : 'NO'}</p>
      </div>

      {/* Test Results */}
      <div className="bg-surface p-4 rounded-lg space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-h3 font-bold">API Tests</h2>
          <button
            onClick={runTests}
            className="bg-accent text-text-inverse px-4 py-2 rounded cursor-pointer"
          >
            Run Tests
          </button>
        </div>

        {Object.keys(testResults).length === 0 && Object.keys(errors).length === 0 && (
          <p className="text-text-muted">Running tests...</p>
        )}

        {Object.entries(testResults).map(([key, value]) => (
          <div key={key} className="border-b border-border pb-3">
            <h3 className="font-semibold text-success">✅ {key}</h3>
            <pre className="text-small bg-bg-dark text-text-inverse p-2 rounded mt-2 overflow-auto max-h-40">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}

        {Object.entries(errors).map(([key, message]) => (
          <div key={key} className="border-b border-border pb-3">
            <h3 className="font-semibold text-error">❌ {key}</h3>
            <p className="text-small text-error mt-2">{message}</p>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-info text-info-content p-4 rounded-lg">
        <h3 className="font-bold mb-2">Инструкция:</h3>
        <ol className="list-decimal list-inside space-y-1 text-small">
          <li>Убедитесь, что бэкенд запущен: <code className="bg-black bg-opacity-20 px-1">python manage.py runserver</code></li>
          <li>Войдите в аккаунт: телефон +79991234567, код 000000</li>
          <li>Нажмите "Run Tests" для проверки всех API эндпоинтов</li>
          <li>Поделитесь результатами с разработчиком</li>
        </ol>
      </div>
    </div>
  );
}
