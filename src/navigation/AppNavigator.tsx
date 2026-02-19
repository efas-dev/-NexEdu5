/**
 * AppNavigator
 *
 * Navegação principal da aplicação
 * Stack Navigator (Login) + Bottom Tabs condicionais por role:
 *   PROFESSOR: Posts | Chamada | Avisos | Usuários | Perfil
 *   ADMIN:     Posts | Avisos  | Usuários | Perfil
 *   ALUNO:     Posts | Perfil
 *   PAI:       Dashboard | Meus Filhos | Meus Avisos | Perfil
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { screenTransitions } from '../theme/animations';

// Screens existentes
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen';
import UserListScreen from '../screens/UserListScreen';
import UserFormScreen from '../screens/UserFormScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Screens Etapa 3
import ChamadaScreen from '../screens/ChamadaScreen';
import AvisosScreen from '../screens/AvisosScreen';
import MeusAvisosScreen from '../screens/MeusAvisosScreen';
import DashboardPaisScreen from '../screens/DashboardPaisScreen';
import MeusFilhosScreen from '../screens/MeusFilhosScreen';

// Types
import { Post } from '../types/Post';
import { User } from '../types/User';

// ============================================================================
// Type Definitions
// ============================================================================

export type PostsStackParamList = {
  Home: undefined;
  PostDetail: { post: Post };
  CreatePost: undefined;
  EditPost: { post: Post };
};

export type UsersStackParamList = {
  UserList: undefined;
  UserForm: { user?: User };
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type ChamadaStackParamList = {
  Chamada: undefined;
};

export type AvisosStackParamList = {
  Avisos: undefined;
};

export type PaiDashboardStackParamList = {
  DashboardPais: undefined;
};

export type MeusFilhosStackParamList = {
  MeusFilhos: undefined;
};

export type MeusAvisosStackParamList = {
  MeusAvisos: undefined;
};

export type TabsParamList = {
  PostsTab: undefined;
  ChamadaTab: undefined;
  AvisosTab: undefined;
  UsersTab: undefined;
  ProfileTab: undefined;
  PaiDashboardTab: undefined;
  MeusFilhosTab: undefined;
  MeusAvisosTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

// ============================================================================
// Stack Navigators
// ============================================================================

const PostsStack = createNativeStackNavigator<PostsStackParamList>();
const UsersStack = createNativeStackNavigator<UsersStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const ChamadaStack = createNativeStackNavigator<ChamadaStackParamList>();
const AvisosStack = createNativeStackNavigator<AvisosStackParamList>();
const PaiDashboardStack = createNativeStackNavigator<PaiDashboardStackParamList>();
const MeusFilhosStack = createNativeStackNavigator<MeusFilhosStackParamList>();
const MeusAvisosStack = createNativeStackNavigator<MeusAvisosStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

// ============================================================================
// Helper: opções de header reutilizáveis
// ============================================================================

function useHeaderOptions() {
  const theme = useTheme();
  return {
    headerStyle: { backgroundColor: theme.colors.surface },
    headerTintColor: theme.colors.onSurface,
    headerTitleStyle: { fontWeight: '600' as const },
    animation: screenTransitions.slideRight.animation,
    animationDuration: screenTransitions.slideRight.duration,
  };
}

// ============================================================================
// Stack: Posts (Home, PostDetail, CreatePost, EditPost)
// ============================================================================

function PostsStackScreen() {
  const headerOpts = useHeaderOptions();

  return (
    <PostsStack.Navigator screenOptions={headerOpts}>
      <PostsStack.Screen name="Home" component={HomeScreen} options={{ title: 'Posts' }} />
      <PostsStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Detalhes' }} />
      <PostsStack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'Novo Post' }} />
      <PostsStack.Screen name="EditPost" component={EditPostScreen} options={{ title: 'Editar Post' }} />
    </PostsStack.Navigator>
  );
}

// ============================================================================
// Stack: Users (UserList, UserForm)
// ============================================================================

function UsersStackScreen() {
  const headerOpts = useHeaderOptions();

  return (
    <UsersStack.Navigator screenOptions={headerOpts}>
      <UsersStack.Screen name="UserList" component={UserListScreen} options={{ title: 'Usuários' }} />
      <UsersStack.Screen name="UserForm" component={UserFormScreen} options={{ title: 'Formulário de Usuário' }} />
    </UsersStack.Navigator>
  );
}

// ============================================================================
// Stack: Profile
// ============================================================================

function ProfileStackScreen() {
  const theme = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: { fontWeight: '600' },
        animation: screenTransitions.fade.animation,
        animationDuration: screenTransitions.fade.duration,
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </ProfileStack.Navigator>
  );
}

// ============================================================================
// Stack: Chamada — Etapa 3 (Professor)
// ============================================================================

function ChamadaStackScreen() {
  const headerOpts = useHeaderOptions();

  return (
    <ChamadaStack.Navigator screenOptions={headerOpts}>
      <ChamadaStack.Screen name="Chamada" component={ChamadaScreen} options={{ title: 'Chamada' }} />
    </ChamadaStack.Navigator>
  );
}

// ============================================================================
// Stack: Avisos — Etapa 3 (Professor/Admin)
// ============================================================================

function AvisosStackScreen() {
  const headerOpts = useHeaderOptions();

  return (
    <AvisosStack.Navigator screenOptions={headerOpts}>
      <AvisosStack.Screen name="Avisos" component={AvisosScreen} options={{ title: 'Avisos' }} />
    </AvisosStack.Navigator>
  );
}

// ============================================================================
// Stack: Dashboard Pais — Etapa 3 (PAI)
// ============================================================================

function PaiDashboardStackScreen() {
  const headerOpts = useHeaderOptions();

  return (
    <PaiDashboardStack.Navigator screenOptions={headerOpts}>
      <PaiDashboardStack.Screen
        name="DashboardPais"
        component={DashboardPaisScreen}
        options={{ title: 'Início' }}
      />
    </PaiDashboardStack.Navigator>
  );
}

// ============================================================================
// Stack: Meus Filhos — Etapa 3 (PAI)
// ============================================================================

function MeusFilhosStackScreen() {
  const headerOpts = useHeaderOptions();

  return (
    <MeusFilhosStack.Navigator screenOptions={headerOpts}>
      <MeusFilhosStack.Screen
        name="MeusFilhos"
        component={MeusFilhosScreen}
        options={{ title: 'Meus Filhos' }}
      />
    </MeusFilhosStack.Navigator>
  );
}

// ============================================================================
// Stack: Meus Avisos — Etapa 3 (PAI)
// ============================================================================

function MeusAvisosStackScreen() {
  const headerOpts = useHeaderOptions();

  return (
    <MeusAvisosStack.Navigator screenOptions={headerOpts}>
      <MeusAvisosStack.Screen
        name="MeusAvisos"
        component={MeusAvisosScreen}
        options={{ title: 'Meus Avisos' }}
      />
    </MeusAvisosStack.Navigator>
  );
}

// ============================================================================
// Bottom Tabs Navigator — tabs condicionais por role
// ============================================================================

function MainTabsNavigator() {
  const theme = useTheme();
  const { user } = useAuth();

  const role = user?.role;
  const isProfessor = role === 'PROFESSOR';
  const isAdmin = role === 'ADMIN';
  const isPai = role === 'PAI';
  const isProfessorOrAdmin = isProfessor || isAdmin;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          elevation: 8,
          shadowOpacity: 0.1,
          height: 55,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 0,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
      }}
    >
      {/* ─── PAI: Dashboard ─── */}
      {isPai ? (
        <Tab.Screen
          name="PaiDashboardTab"
          component={PaiDashboardStackScreen}
          options={{
            tabBarLabel: 'Início',
            tabBarIcon: ({ color, size }) => (
              <Icon name="view-dashboard-outline" size={size} color={color} />
            ),
          }}
        />
      ) : (
        /* ─── Outros roles: Posts ─── */
        <Tab.Screen
          name="PostsTab"
          component={PostsStackScreen}
          options={{
            tabBarLabel: 'Posts',
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* ─── PROFESSOR: Chamada ─── */}
      {isProfessor && (
        <Tab.Screen
          name="ChamadaTab"
          component={ChamadaStackScreen}
          options={{
            tabBarLabel: 'Chamada',
            tabBarIcon: ({ color, size }) => (
              <Icon name="clipboard-check-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* ─── PROFESSOR/ADMIN: Avisos ─── */}
      {isProfessorOrAdmin && (
        <Tab.Screen
          name="AvisosTab"
          component={AvisosStackScreen}
          options={{
            tabBarLabel: 'Avisos',
            tabBarIcon: ({ color, size }) => (
              <Icon name="bell-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* ─── PROFESSOR/ADMIN: Usuários ─── */}
      {isProfessorOrAdmin && (
        <Tab.Screen
          name="UsersTab"
          component={UsersStackScreen}
          options={{
            tabBarLabel: 'Usuários',
            tabBarIcon: ({ color, size }) => (
              <Icon name="account-group" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* ─── PAI: Meus Filhos ─── */}
      {isPai && (
        <Tab.Screen
          name="MeusFilhosTab"
          component={MeusFilhosStackScreen}
          options={{
            tabBarLabel: 'Filhos',
            tabBarIcon: ({ color, size }) => (
              <Icon name="account-child-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* ─── PAI: Meus Avisos ─── */}
      {isPai && (
        <Tab.Screen
          name="MeusAvisosTab"
          component={MeusAvisosStackScreen}
          options={{
            tabBarLabel: 'Avisos',
            tabBarIcon: ({ color, size }) => (
              <Icon name="email-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* ─── Todos os roles: Perfil ─── */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ============================================================================
// Root Navigator (Login + MainTabs)
// ============================================================================

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: screenTransitions.fade.animation,
        animationDuration: screenTransitions.fade.duration,
      }}
    >
      {!user ? (
        <RootStack.Screen name="Login" component={LoginScreen} />
      ) : (
        <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
      )}
    </RootStack.Navigator>
  );
}
