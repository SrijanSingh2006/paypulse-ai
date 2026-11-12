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
      <View style={styles.leftRow}>
        <Image
          source={{ uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Heftin Member'}</Text>
          <View style={styles.roleRow}>
            <View style={[styles.roleBadge, isManager ? styles.badgeManager : styles.badgeEmployee]}>
              <Text style={styles.roleBadgeText}>
                {isManager ? 'HR & FINANCE MANAGER' : 'EMPLOYEE (HEFTIN AI)'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.rightActions}>
        {/* Quick Role Switcher Button for Demo Reviewers */}
        <TouchableOpacity
          style={styles.roleToggleBtn}
          onPress={() => switchRole(isManager ? 'EMPLOYEE' : 'HR_MANAGER')}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-horizontal" size={14} color={Colors.primary} />
          <Text style={styles.roleToggleText}>{isManager ? 'Switch: Emp' : 'Switch: Mgr'}</Text>
        </TouchableOpacity>

        {onNotificationPress && (
          <TouchableOpacity style={styles.bellButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700',
  },
  roleRow: {
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeEmployee: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeManager: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
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
    backgroundColor: Colors.cardSecondary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
