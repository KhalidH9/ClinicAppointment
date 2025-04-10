import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { doctorApi } from '../services/api';
import { Doctor, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // التحقق من جلسة المستخدم الحالية عند تحميل التطبيق
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          const doctorData = await doctorApi.getProfile(data.session.user.id);
          setState({
            user: doctorData,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('خطأ في التحقق من الجلسة:', error);
        setState({
          user: null,
          loading: false,
          error: 'فشل التحقق من الجلسة',
        });
      }
    };

    checkSession();

    // الاستماع لتغييرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const doctorData = await doctorApi.getProfile(session.user.id);
            setState({
              user: doctorData,
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error('خطأ في جلب بيانات الطبيب:', error);
            setState({
              user: null,
              loading: false,
              error: 'فشل جلب بيانات المستخدم',
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      const result = await doctorApi.login(email, password);
      
      if (!result) {
        throw new Error('بيانات الاعتماد غير صحيحة');
      }
      
      setState({
        user: result,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      setState({
        ...state,
        loading: false,
        error: error.message || 'فشل تسجيل الدخول',
      });
      throw error;
    }
  };

  const logout = async () => {
    setState({ ...state, loading: true, error: null });
    
    try {
      await supabase.auth.signOut();
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('خطأ في تسجيل الخروج:', error);
      setState({
        ...state,
        loading: false,
        error: error.message || 'فشل تسجيل الخروج',
      });
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
