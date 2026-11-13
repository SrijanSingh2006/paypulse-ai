import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      <View style={styles.row}>
        <View style={styles.leftRow}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>{user?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'PP'}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.greeting}>PAYPULSE  /  PERSONAL FINANCE</Text>
            <Text style={styles.userName}>{user?.name || 'Heftin Member'}</Text>
            <View style={styles.roleRow}>
              <View style={[styles.roleBadge, isManager ? styles.badgeManager : styles.badgeEmployee]}>
                <Ionicons
                  name={isManager ? 'shield-checkmark' : 'person'}
                  size={9}
                  color={isManager ? Colors.accentLight : Colors.primaryLight}
                />
                <Text style={[styles.roleBadgeText, isManager && styles.roleBadgeTextManager]}>
                  {isManager ? 'PEOPLE OPERATIONS' : 'EMPLOYEE WORKSPACE'}
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
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 19,
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 13,
    backgroundColor: Colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EACDBF',
  },
  avatarText: {
    color: Colors.accentLight,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1.15,
  },
  userName: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 3,
  },
  roleRow: {
    marginTop: 3,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 0,
    paddingVertical: 2,
    borderRadius: 0,
    alignSelf: 'flex-start',
  },
  badgeEmployee: {
    backgroundColor: 'transparent',
  },
  badgeManager: {
    backgroundColor: 'transparent',
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.0,
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
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.border,
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
