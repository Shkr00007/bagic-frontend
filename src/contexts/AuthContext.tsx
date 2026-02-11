import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, EmployeeProfile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  profile: EmployeeProfile | null;
  loading: boolean;
  isSyntheticSession: boolean;
  signIn: (email: string, forceOtp?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setSyntheticSession: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyntheticSession, setIsSyntheticSession] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('syntheticSession');
    return stored === 'true';
  });

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('employee_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);

      if (data.email.includes('@synthetic.bagic.local')) {
        setIsSyntheticSession(true);
        sessionStorage.setItem('syntheticSession', 'true');
      }
    }
  };

  const setSyntheticSession = (value: boolean) => {
    setIsSyntheticSession(value);
    sessionStorage.setItem('syntheticSession', value.toString());
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (input: string, forceOtp: boolean = false) => {
    const { data: existingProfile } = await supabase
      .from('employee_profiles')
      .select('*')
      .or(`email.eq.${input},employee_id.eq.${input}`)
      .maybeSingle();

    let profileEmail = input;
    let employeeId = input;
    const defaultPassword = 'demo-password-2024';

    if (!existingProfile) {
      if (forceOtp || input.includes('admin') || input.includes('hr-') || input.includes('ops-')) {
        throw new Error('Admin account not found. Please contact system administrator.');
      }

      const isEmail = input.includes('@');

      if (!isEmail) {
        employeeId = input;
        profileEmail = `${input.toLowerCase().replace(/[^a-z0-9]/g, '')}@synthetic.bagic.local`;
      } else {
        profileEmail = input;
        employeeId = `EMP-${Date.now().toString().slice(-6)}`;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: profileEmail,
        password: defaultPassword,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            employee_id: employeeId,
            synthetic: true,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message?.includes('User already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: profileEmail,
            password: defaultPassword,
          });

          if (!signInError && signInData.session) {
            setUser(signInData.user);
            await loadProfile(signInData.user.id);
            setIsSyntheticSession(true);
            sessionStorage.setItem('syntheticSession', 'true');
            return;
          }
        }
        throw signUpError;
      }

      if (authData.user) {
        const fullName = isEmail
          ? profileEmail.split('@')[0].split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')
          : `Employee ${employeeId}`;

        await supabase.from('employee_profiles').insert({
          id: authData.user.id,
          employee_id: employeeId,
          email: profileEmail,
          full_name: fullName,
          persona_type: 'OH-EC-IC',
          career_stage: 'Early',
          department: 'General',
          onboarding_completed: true,
          consent_given_at: new Date().toISOString(),
          is_admin: false,
        });

        if (authData.session) {
          setUser(authData.user);
          await loadProfile(authData.user.id);
          setIsSyntheticSession(true);
          sessionStorage.setItem('syntheticSession', 'true');
        }
        return;
      }
    } else {
      const targetEmail = existingProfile.email;

      if (existingProfile.is_admin) {
        const { error } = await supabase.auth.signInWithOtp({
          email: targetEmail,
          options: {
            shouldCreateUser: false,
          },
        });

        if (error) throw error;
        return;
      }

      if (targetEmail.includes('@synthetic.bagic.local')) {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: defaultPassword,
        });

        if (signInError) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: targetEmail,
            password: defaultPassword,
          });

          if (signUpError && signUpError.message?.includes('User already registered')) {
            const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
              email: targetEmail,
              password: defaultPassword,
            });

            if (!retryError && retrySignIn.session) {
              setUser(retrySignIn.user);
              await loadProfile(retrySignIn.user.id);
              setIsSyntheticSession(true);
              sessionStorage.setItem('syntheticSession', 'true');
            }
            return;
          }

          if (signUpData?.session) {
            setUser(signUpData.user!);
            await loadProfile(signUpData.user!.id);
            setIsSyntheticSession(true);
            sessionStorage.setItem('syntheticSession', 'true');
          }
        } else if (authData.session) {
          setUser(authData.user);
          await loadProfile(authData.user.id);
          setIsSyntheticSession(true);
          sessionStorage.setItem('syntheticSession', 'true');
        }
        return;
      }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: existingProfile?.email || profileEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setIsSyntheticSession(false);
    sessionStorage.removeItem('syntheticSession');
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isSyntheticSession, signIn, signOut, refreshProfile, setSyntheticSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
