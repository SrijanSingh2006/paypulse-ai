import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Api } from '../api/endpoints';
import { ReleaseInfo } from '../types';

export const VersionUpdateBanner: React.FC = () => {
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Api.checkVersion().then(setRelease).catch(() => {});
  }, []);

  if (!release) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.banner}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.left}>
          <View style={styles.dot} />
          <Text style={styles.bannerText}>
            Portfolio demo · v{release.latestVersion} ({release.buildNumber})
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.viewChangelog}>What's New</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogHeader}>
              <View>
                <Text style={styles.dialogTitle}>Showcase build v{release.latestVersion}</Text>
                <Text style={styles.dialogDate}>Interactive PayPulse portfolio preview</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.changelogList}>
              {release.whatsNew.map((item, index) => (
                <View key={index} style={styles.changelogRow}>
                  <Text style={styles.changelogBullet}>•</Text>
                  <Text style={styles.changelogText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.storePills}>
              <View style={styles.storePill}>
                <Ionicons name="globe-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.storePillText}>React Native Web</Text>
              </View>
              <View style={styles.storePill}>
                <Ionicons name="flask-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.storePillText}>Actions are simulated</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeActionBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeActionText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.25)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentLight,
  },
  bannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentLight,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewChangelog: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  dialogDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changelogList: {
    gap: 10,
    marginBottom: 16,
  },
  changelogRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  changelogBullet: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  changelogText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  storePills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  storePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.cardSecondary,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storePillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  closeActionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});

