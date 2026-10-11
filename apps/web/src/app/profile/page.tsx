'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, updateUserProfile } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/stores/toast-store';
import { User } from '@/lib/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const { add: addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setName(data.name || '');
    } catch (error) {
      addToast({ message: 'Ошибка загрузки профиля', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateUserProfile({ name });
      setProfile(updated);
      addToast({ message: 'Профиль обновлён', type: 'success' });
    } catch (error) {
      addToast({ message: 'Ошибка сохранения', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-body text-text-secondary">Войдите в аккаунт</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-body text-text-secondary">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8">
      <h1 className="text-h1 md:text-[48px] font-bold text-text-primary">
        Личный профиль
      </h1>

      <div className="bg-surface rounded-xl p-6 sm:p-8 shadow-sm border border-border space-y-6">
        <div>
          <label className="block text-small font-semibold text-text-secondary mb-2">
            Телефон
          </label>
          <p className="text-body text-text-primary">{profile?.phone}</p>
        </div>

        <div>
          <label className="block text-small font-semibold text-text-secondary mb-2">
            Имя
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
          />
        </div>

        <div>
          <label className="block text-small font-semibold text-text-secondary mb-2">
            Дата регистрации
          </label>
          <p className="text-body text-text-primary">
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : '-'}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="w-full"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  );
}
