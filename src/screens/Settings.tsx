import { useState, useEffect } from 'react';
import { Shield, Bell, HelpCircle, LogOut } from 'lucide-react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type SettingsProps = {
  onNavigate: (view: 'home' | 'history' | 'settings') => void;
};

export function Settings({ onNavigate }: SettingsProps) {
  const { profile, signOut } = useAuth();
  const [preferences, setPreferences] = useState({
    email_reminders: true,
    show_framework_stages: true,
    enable_cbc_detection: false
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile?.preferences) {
      setPreferences(profile.preferences);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setSaved(false);

    try {
      await supabase
        .from('employee_profiles')
        .update({ preferences })
        .eq('id', profile.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-8">
      <Header />

      <main className="max-w-[960px] mx-auto px-6 md:px-12 py-8">
        <h1 className="text-h1 mb-8">Settings</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#1E40AF]" />
              <h2 className="text-h2">Data & Privacy</h2>
            </div>

            <div className="space-y-4 text-body text-[#64748B]">
              <div>
                <p className="font-medium text-[#1E293B] mb-1">Conversation Storage</p>
                <p>Your conversations are stored for continuity only</p>
              </div>

              <div>
                <p className="font-medium text-[#1E293B] mb-1">HR Escalation</p>
                <p>Escalated sessions → HR with your full context</p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#1E293B]">Email reminders for experiments</span>
                  <input
                    type="checkbox"
                    checked={preferences.email_reminders}
                    onChange={(e) => setPreferences({ ...preferences, email_reminders: e.target.checked })}
                    className="w-5 h-5 text-[#1E40AF] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-[#1E40AF]" />
              <h2 className="text-h2">My Coach Preferences</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-body text-[#1E293B]">Show framework stages</span>
                <input
                  type="checkbox"
                  checked={preferences.show_framework_stages}
                  onChange={(e) => setPreferences({ ...preferences, show_framework_stages: e.target.checked })}
                  className="w-5 h-5 text-[#1E40AF] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#1E40AF]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-body text-[#1E293B]">Enable CBC cognitive pattern detection</span>
                <input
                  type="checkbox"
                  checked={preferences.enable_cbc_detection}
                  onChange={(e) => setPreferences({ ...preferences, enable_cbc_detection: e.target.checked })}
                  className="w-5 h-5 text-[#1E40AF] border-[#E2E8F0] rounded focus:ring-2 focus:ring-[#1E40AF]"
                />
              </label>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <a
                  href="#"
                  className="flex items-center gap-2 text-[#1E40AF] text-body hover:underline"
                >
                  <HelpCircle className="w-4 h-4" />
                  What is framework-governed coaching?
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-body text-[#1E293B] font-medium mb-1">Profile</p>
              <p className="text-meta text-[#64748B]">
                {profile?.full_name} - {profile?.employee_id}
              </p>
              <p className="text-meta text-[#64748B]">
                {profile?.email}
              </p>
            </div>

            <div className="flex gap-3">
              {saved && (
                <span className="text-[#10B981] text-body flex items-center">
                  Saved successfully
                </span>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2 inline" />
                Sign out
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="#"
            className="text-[#1E40AF] text-body hover:underline"
          >
            Contact HR Support
          </a>
        </div>
      </main>

      <Navigation currentView="settings" onNavigate={onNavigate} />
    </div>
  );
}
