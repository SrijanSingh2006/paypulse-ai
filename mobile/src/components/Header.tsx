import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNotificationPress }) => {
  const { user, switchRole } = useAuth();
  const { unreadCount } = useApp();

  const isManager = user?.role === 'HR_MANAGER';

  return (
    <View style={styles.container}>
      {/* Subtle top accent line */}
      <View style={styles.accentLine} />

      <View style={styles.row}>
        <View style={styles.leftRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
              }}
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Heftin Member'}</Text>
            <View style={styles.roleRow}>
              <View style={[styles.roleBadge, isManager ? styles.badgeManager : styles.badgeEmployee]}>
                <Ionicons
                  name={isManager ? 'shield-checkmark' : 'person'}
                  size={9}
                  color={isManager ? Colors.accentLight : Colors.primaryLight}
                />
                <Text style={[styles.roleBadgeText, isManager && styles.roleBadgeTextManager]}>
                  {isManager ? 'HR & FINANCE MANAGER' : 'EMPLOYEE (HEFTIN AI)'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.rightActions}>
          {/* Quick Role Switcher for Demo Reviewers */}
          <TouchableOpacity
            style={styles.roleToggleBtn}
            onPress={() => switchRole(isManager ? 'EMPLOYEE' : 'HR_MANAGER')}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={13} color={Colors.primary} />
            <Text style={styles.roleToggleText}>
              {isManager ? 'Switch: Emp' : 'Switch: Mgr'}
            </Text>
          </TouchableOpacity>

          {onNotificationPress && (
            <TouchableOpacity style={styles.bellButton} onPress={onNotificationPress}>
              <Ionicons name="notifications-outline" size={21} color={Colors.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  accentLine: {
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.6,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  userName: {
    fontSize: 17,
    color: Colors.text,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  roleRow: {
    marginTop: 3,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  badgeEmployee: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  badgeManager: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  roleBadgeTextManager: {
    color: Colors.accentLight,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.danger,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
