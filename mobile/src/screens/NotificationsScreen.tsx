import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Api } from '../api/endpoints';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';
import { useAuth } from '../context/AuthContext';

export const NotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const { refreshKey, triggerRefresh } = useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await Api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.warn('Error loading notifications:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [refreshKey, user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await Api.markNotificationRead(id);
    triggerRefresh();
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'EWA_ADVANCE':
        return { name: 'flash', color: Colors.primary };
      case 'EXPENSE_UPDATE':
        return { name: 'receipt', color: Colors.edTech };
      case 'PAYROLL':
        return { name: 'cash-outline', color: Colors.info };
      default:
        return { name: 'notifications-outline', color: Colors.accentLight };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>ACCOUNT ACTIVITY  /  03</Text>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>Pay updates, advances, and claim decisions in one place.</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {notifications.length > 0 ? (
          notifications.map((item) => {
            const iconMeta = getIconForType(item.type);
            const timeAgo = new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, !item.read && styles.unreadCard]}
                onPress={() => handleMarkRead(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: `${iconMeta.color}20` }]}>
                  <Ionicons name={iconMeta.name as any} size={20} color={iconMeta.color} />
                </View>

                <View style={styles.contentCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.itemMessage}>{item.message}</Text>
                  <Text style={styles.itemTime}>{timeAgo}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accentLight,
    letterSpacing: 1.6,
    marginBottom: 7,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  list: {
    padding: 22,
    gap: 8,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 7,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    backgroundColor: '#FFF9F4',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  itemMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  itemTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
  },
});

