// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// /**
//  * Replace Supabase User type with local user type
//  */
// export type LocalUser = {
//   id: string;
//   email: string;
// };

// /**
//  * Replace EmployeeProfile from supabase.ts
//  */
// export type EmployeeProfile = {
//   id: string;
//   employee_id: string;
//   email: string;
//   full_name: string;
//   persona_type: string;
//   career_stage: string;
//   department: string;
//   onboarding_completed: boolean;
//   consent_given_at: string;
//   is_admin: boolean;
// };

// type AuthContextType = {
//   user: LocalUser | null;
//   profile: EmployeeProfile | null;
//   loading: boolean;
//   isSyntheticSession: boolean;
//   signIn: (input: string) => Promise<void>;
//   signOut: () => Promise<void>;
//   refreshProfile: () => Promise<void>;
//   setSyntheticSession: (value: boolean) => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// /**
//  * 🔹 Synthetic in-memory database
//  * Add as many users as you want here
//  */
// const syntheticUsers: EmployeeProfile[] = [
//   {
//     id: '1',
//     employee_id: 'BO-001',
//     email: 'bo001@synthetic.local',
//     full_name: 'Branch Officer 1',
//     persona_type: 'OH-EC-IC',
//     career_stage: 'Early',
//     department: 'Operations',
//     onboarding_completed: true,
//     consent_given_at: new Date().toISOString(),
//     is_admin: false,
//   },
//   {
//     id: '2',
//     employee_id: 'BM-001',
//     email: 'bm001@synthetic.local',
//     full_name: 'Branch Manager 1',
//     persona_type: 'OH-EC-IC',
//     career_stage: 'Mid',
//     department: 'Management',
//     onboarding_completed: true,
//     consent_given_at: new Date().toISOString(),
//     is_admin: false,
//   },
//   {
//     id: '3',
//     employee_id: 'ADMIN-001',
//     email: 'admin@synthetic.local',
//     full_name: 'System Admin',
//     persona_type: 'OH-EC-IC',
//     career_stage: 'Senior',
//     department: 'Administration',
//     onboarding_completed: true,
//     consent_given_at: new Date().toISOString(),
//     is_admin: true,
//   },
// ];

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<LocalUser | null>(null);
//   const [profile, setProfile] = useState<EmployeeProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isSyntheticSession, setIsSyntheticSession] = useState<boolean>(() => {
//     const stored = sessionStorage.getItem('syntheticSession');
//     return stored === 'true';
//   });

//   /**
//    * Load session from localStorage on app start
//    */
//   useEffect(() => {
//     const storedUser = localStorage.getItem('authUser');
//     const storedProfile = localStorage.getItem('authProfile');

//     if (storedUser && storedProfile) {
//       setUser(JSON.parse(storedUser));
//       setProfile(JSON.parse(storedProfile));
//       setIsSyntheticSession(true);
//     }

//     setLoading(false);
//   }, []);

//   const setSyntheticSession = (value: boolean) => {
//     setIsSyntheticSession(value);
//     sessionStorage.setItem('syntheticSession', value.toString());
//   };

//   /**
//    * 🔐 SIGN IN (100% local synthetic)
//    */
//   const signIn = async (input: string) => {
//     setLoading(true);

//     const normalized = input.trim().toLowerCase();

//     const foundProfile = syntheticUsers.find(
//       (u) =>
//         u.employee_id.toLowerCase() === normalized ||
//         u.email.toLowerCase() === normalized
//     );

//     if (!foundProfile) {
//       setLoading(false);
//       throw new Error('Employee not found in synthetic database.');
//     }

//     const localUser: LocalUser = {
//       id: foundProfile.id,
//       email: foundProfile.email,
//     };

//     setUser(localUser);
//     setProfile(foundProfile);
//     setSyntheticSession(true);

//     localStorage.setItem('authUser', JSON.stringify(localUser));
//     localStorage.setItem('authProfile', JSON.stringify(foundProfile));

//     setLoading(false);
//   };

//   /**
//    * 🔓 SIGN OUT
//    */
//   const signOut = async () => {
//     setUser(null);
//     setProfile(null);
//     setSyntheticSession(false);

//     localStorage.removeItem('authUser');
//     localStorage.removeItem('authProfile');
//     sessionStorage.removeItem('syntheticSession');
//   };

//   /**
//    * 🔄 REFRESH PROFILE
//    */
//   const refreshProfile = async () => {
//     if (!profile) return;

//     const updated = syntheticUsers.find((u) => u.id === profile.id);
//     if (updated) {
//       setProfile(updated);
//       localStorage.setItem('authProfile', JSON.stringify(updated));
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         profile,
//         loading,
//         isSyntheticSession,
//         signIn,
//         signOut,
//         refreshProfile,
//         setSyntheticSession,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/* =========================
   TYPES
========================= */

export type LocalUser = {
  id: string;
  email: string;
};

export type EmployeeProfile = {
  id: string;
  employee_id: string;
  email: string;
  full_name: string;
  persona_type: string;
  career_stage: string;
  department: string;
  onboarding_completed: boolean;
  consent_given_at: string;
  is_admin: boolean;
};

type AuthContextType = {
  user: LocalUser | null;
  profile: EmployeeProfile | null;
  loading: boolean;
  isSyntheticSession: boolean;
  signIn: (input: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setSyntheticSession: (value: boolean) => void;
};

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   SYNTHETIC DATABASE
   (Add more users here)
========================= */

const syntheticUsers: EmployeeProfile[] = [
  {
    id: '1',
    employee_id: 'BO-001',
    email: 'bo001@synthetic.local',
    full_name: 'Branch Officer 1',
    persona_type: 'OH-EC-IC',
    career_stage: 'Early',
    department: 'Operations',
    onboarding_completed: true,
    consent_given_at: new Date().toISOString(),
    is_admin: false,
  },
  {
    id: '2',
    employee_id: 'BM-001',
    email: 'bm001@synthetic.local',
    full_name: 'Branch Manager 1',
    persona_type: 'OH-EC-IC',
    career_stage: 'Mid',
    department: 'Management',
    onboarding_completed: true,
    consent_given_at: new Date().toISOString(),
    is_admin: false,
  },
  {
    id: '3',
    employee_id: 'ADMIN-001',
    email: 'admin@synthetic.local',
    full_name: 'System Admin',
    persona_type: 'OH-EC-IC',
    career_stage: 'Senior',
    department: 'Administration',
    onboarding_completed: true,
    consent_given_at: new Date().toISOString(),
    is_admin: true,
  },
];

/* =========================
   PROVIDER
========================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyntheticSession, setIsSyntheticSession] = useState<boolean>(() => {
    return sessionStorage.getItem('syntheticSession') === 'true';
  });

  /* =========================
     LOAD STORED SESSION
  ========================= */

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    const storedProfile = localStorage.getItem('authProfile');

    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
      setIsSyntheticSession(true);
    }

    setLoading(false);
  }, []);

  /* =========================
     SESSION FLAG
  ========================= */

  const setSyntheticSession = (value: boolean) => {
    setIsSyntheticSession(value);
    sessionStorage.setItem('syntheticSession', value.toString());
  };

  /* =========================
     SIGN IN (LOCAL ONLY)
  ========================= */

  const signIn = async (input: string) => {
    setLoading(true);

    const normalized = input.trim().toLowerCase();

    const foundProfile = syntheticUsers.find(
      (u) =>
        u.employee_id.toLowerCase() === normalized ||
        u.email.toLowerCase() === normalized
    );

    if (!foundProfile) {
      setLoading(false);
      throw new Error('Employee not found in synthetic database.');
    }

    const localUser: LocalUser = {
      id: foundProfile.id,
      email: foundProfile.email,
    };

    setUser(localUser);
    setProfile(foundProfile);
    setSyntheticSession(true);

    localStorage.setItem('authUser', JSON.stringify(localUser));
    localStorage.setItem('authProfile', JSON.stringify(foundProfile));

    setLoading(false);
  };

  /* =========================
     SIGN OUT
  ========================= */

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSyntheticSession(false);

    localStorage.removeItem('authUser');
    localStorage.removeItem('authProfile');
    sessionStorage.removeItem('syntheticSession');
  };

  /* =========================
     REFRESH PROFILE
  ========================= */

  const refreshProfile = async () => {
    if (!profile) return;

    const updatedProfile = syntheticUsers.find(
      (u) => u.id === profile.id
    );

    if (updatedProfile) {
      setProfile(updatedProfile);
      localStorage.setItem('authProfile', JSON.stringify(updatedProfile));
    }
  };

  /* =========================
     PROVIDER RETURN
  ========================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isSyntheticSession,
        signIn,
        signOut,
        refreshProfile,
        setSyntheticSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
