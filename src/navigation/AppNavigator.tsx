/**
 * AppNavigator
 *
 * Navegação principal da aplicação
 * Stack Navigator (Login) + Bottom Tabs (Posts, Users, Profile)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { screenTransitions } from '../theme/animations';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen';
import UserListScreen from '../screens/UserListScreen';
import UserFormScreen from '../screens/UserFormScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Types
import { Post } from '../types/Post';
import { User } from '../types/User';

// ============================================================================
// Type Definitions
// ============================================================================

// Parâmetros do Stack de Posts
export type PostsStackParamList = {
  Home: undefined;
  PostDetail: { post: Post };
  CreatePost: undefined;
  EditPost: { post: Post };
};

// Parâmetros do Stack de Users
export type UsersStackParamList = {
  UserList: undefined;
  UserForm: { user?: User };
};

// Parâmetros do Stack de Profile
export type ProfileStackParamList = {
  Profile: undefined;
};

// Parâmetros das Tabs
export type TabsParamList = {
  PostsTab: undefined;
  UsersTab: undefined;
  ProfileTab: undefined;
};

// Parâmetros do Root Stack (Login + Tabs)
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
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

// ============================================================================
// Stack: Posts (Home, PostDetail, CreatePost, EditPost)
// ============================================================================

function PostsStackScreen() {
  const theme = useTheme();

  return (
    <PostsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        animation: screenTransitions.slideRight.animation,
        animationDuration: screenTransitions.slideRight.duration,
      }}
    >
      <PostsStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Posts' }}
      />
      <PostsStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Detalhes' }}
      />
      <PostsStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Novo Post' }}
      />
      <PostsStack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{ title: 'Editar Post' }}
      />
    </PostsStack.Navigator>
  );
}

// ============================================================================
// Stack: Users (UserList, UserForm) - Apenas para professores
// ============================================================================

function UsersStackScreen() {
  const theme = useTheme();

  return (
    <UsersStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        animation: screenTransitions.slideRight.animation,
        animationDuration: screenTransitions.slideRight.duration,
      }}
    >
      <UsersStack.Screen
        name="UserList"
        component={UserListScreen}
        options={{ title: 'Usuários' }}
      />
      <UsersStack.Screen
        name="UserForm"
        component={UserFormScreen}
        options={{ title: 'Formulário de Usuário' }}
      />
    </UsersStack.Navigator>
  );
}

// ============================================================================
// Stack: Profile (Profile) - Logout e configurações
// ============================================================================

function ProfileStackScreen() {
  const theme = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        animation: screenTransitions.fade.animation,
        animationDuration: screenTransitions.fade.duration,
      }}
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </ProfileStack.Navigator>
  );
}

// ============================================================================
// Bottom Tabs Navigator
// ============================================================================

function MainTabsNavigator() {
  const theme = useTheme();
  const { user } = useAuth();

  // Verificar se usuário é professor
  const isProfessor = user?.role === 'PROFESSOR';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Headers já estão nos stacks internos
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
          fontSize: 12,
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
      {/* Tab: Posts */}
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

      {/* Tab: Users (apenas para professor) */}
      {isProfessor && (
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

      {/* Tab: Profile */}
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

  // Mostrar nada enquanto carrega (evita flash de tela errada)
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
