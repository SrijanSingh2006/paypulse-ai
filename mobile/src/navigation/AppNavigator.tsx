import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { EwaScreen } from '../screens/EwaScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { AICopilotScreen } from '../screens/AICopilotScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.danger,
  },
};

function MainTabNavigator() {
  const { unreadCount } = useApp();
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const desktopWeb = Platform.OS === 'web' && width >= 920;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: desktopWeb ? styles.webTabBar : styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
      sceneContainerStyle={desktopWeb ? styles.webSceneContainer : styles.mobileSceneContainer}
      tabBar={desktopWeb ? (props) => (
        <WebSidebar {...props} unreadCount={unreadCount} userName={user?.name || 'PayPulse member'} onSignOut={logout} />
      ) : undefined}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Pulse',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FinTech"
        component={EwaScreen}
        options={{
          tabBarLabel: 'Wages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Copilot"
        component={AICopilotScreen}
        options={{
          tabBarLabel: 'AI',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: styles.badgeStyle,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileSettingsScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const WEB_LABELS: Record<string, string> = {
  Dashboard: 'Overview',
  FinTech: 'Pay & access',
  Expenses: 'Claims & expenses',
  Copilot: 'AI assistant',
  Notifications: 'Notifications',
  Profile: 'My account',
};

const WEB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid-outline',
  FinTech: 'wallet-outline',
  Expenses: 'receipt-outline',
  Copilot: 'sparkles-outline',
  Notifications: 'notifications-outline',
  Profile: 'person-circle-outline',
};

function WebSidebar({ state, navigation, unreadCount, userName, onSignOut }: BottomTabBarProps & {
  unreadCount: number;
  userName: string;
  onSignOut: () => Promise<void>;
}) {
  return (
    <View style={styles.webSidebar}>
      <View style={styles.webBrandRow}>
        <View style={styles.webBrandIcon}><Ionicons name="pulse" size={19} color={Colors.onPrimary} /></View>
        <View>
          <Text style={styles.webBrandName}>PayPulse</Text>
          <Text style={styles.webBrandCaption}>PEOPLE & PAY</Text>
        </View>
      </View>

      <Text style={styles.webSectionLabel}>WORKSPACE</Text>
      <View style={styles.webNavList}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = WEB_LABELS[route.name] || route.name;
          const showBadge = route.name === 'Notifications' && unreadCount > 0;
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              style={[styles.webNavItem, focused && styles.webNavItemActive]}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.78}
            >
              <Ionicons name={WEB_ICONS[route.name] || 'ellipse-outline'} size={18} color={focused ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.webNavText, focused && styles.webNavTextActive]}>{label}</Text>
              {showBadge && <View style={styles.webBadge}><Text style={styles.webBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.webSidebarSpacer} />
      <View style={styles.webDemoNote}>
        <View style={styles.webDemoIcon}><Ionicons name="shield-checkmark-outline" size={17} color={Colors.primary} /></View>
        <Text style={styles.webDemoTitle}>Interactive demo</Text>
        <Text style={styles.webDemoCopy}>Sample INR ledger · no real payments</Text>
      </View>
      <View style={styles.webAccountRow}>
        <View style={styles.webUserAvatar}><Text style={styles.webAvatarText}>{userName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Text></View>
        <View style={styles.webUserInfo}><Text style={styles.webUserName} numberOfLines={1}>{userName}</Text><Text style={styles.webUserRole}>PayPulse workspace</Text></View>
        <TouchableOpacity onPress={onSignOut} accessibilityLabel="Sign out" style={styles.webSignOut}>
          <Ionicons name="log-out-outline" size={17} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="pulse" size={44} color={Colors.primary} />
        <Text style={styles.loadingText}>Heftin PayPulse AI...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={appTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    maxWidth: 1100,
    alignSelf: 'center',
    width: '100%',
  },
  webTabBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 248,
    height: '100%',
    borderTopWidth: 0,
  },
  webSceneContainer: {
    marginLeft: 248,
    backgroundColor: Colors.background,
  },
  mobileSceneContainer: {
    backgroundColor: Colors.background,
  },
  webSidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 248,
    backgroundColor: Colors.card,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: 17,
    paddingTop: 24,
    paddingBottom: 16,
  },
  webBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 5,
    marginBottom: 42,
  },
  webBrandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webBrandName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  webBrandCaption: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 1,
  },
  webSectionLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  webNavList: {
    gap: 4,
  },
  webNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 43,
    paddingHorizontal: 11,
    borderRadius: 11,
    gap: 11,
  },
  webNavItemActive: {
    backgroundColor: Colors.primaryTint,
  },
  webNavText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  webNavTextActive: {
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  webBadge: {
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.onPrimary,
  },
  webSidebarSpacer: {
    flex: 1,
  },
  webDemoNote: {
    backgroundColor: Colors.primaryTint,
    borderRadius: 13,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  webDemoIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  webDemoTitle: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  webDemoCopy: {
    color: Colors.textSecondary,
    fontSize: 9,
    marginTop: 3,
  },
  webAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
    paddingHorizontal: 3,
    gap: 9,
  },
  webUserAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webAvatarText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  webUserInfo: {
    flex: 1,
  },
  webUserName: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  webUserRole: {
    color: Colors.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  webSignOut: {
    padding: 5,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeStyle: {
    backgroundColor: Colors.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});

