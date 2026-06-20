import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { useThemeStore } from '@/store/theme';
import { dummyUsers } from '@/types/user';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Edit2, LogOut, Settings as SettingsIcon, ChevronRight } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { design } from '@/constants/design';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function ProfileScreen() {
  const [currentUser] = useState(dummyUsers[0]);

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerStyle: { backgroundColor: design.colors.base },
          headerTintColor: design.colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.headerBtn}>
              <LogOut size={22} color={design.colors.error} />
            </Pressable>
          ),
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <AnimatedCard style={styles.profileCard} withHaptic={false}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
              <Pressable style={styles.editAvatarBtn}>
                <Edit2 size={16} color="#FFF" />
              </Pressable>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{currentUser.username}</Text>
              <Text style={styles.bio}>{currentUser.bio}</Text>
              <Text style={styles.joinDate}>
                Joined {new Date(currentUser.joinDate).toLocaleDateString()}
              </Text>
            </View>
          </AnimatedCard>
        </Animated.View>

        <View style={styles.statsGrid}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ flex: 1 }}>
            <AnimatedCard style={styles.statCard} withHaptic={false}>
              <Text style={styles.statValue}>{currentUser.stats.transactions}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </AnimatedCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={{ flex: 1 }}>
            <AnimatedCard style={styles.statCard} withHaptic={false}>
              <Text style={styles.statValue}>{currentUser.stats.categories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </AnimatedCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)} style={{ flex: 1 }}>
            <AnimatedCard style={styles.statCard} withHaptic={false}>
              <Text style={styles.statValue}>${currentUser.stats.totalSaved.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Saved</Text>
            </AnimatedCard>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <AnimatedCard
            style={styles.actionCard}
            onPress={() => router.push('/settings')}
          >
            <View style={styles.actionRow}>
              <View style={[styles.iconBox, { backgroundColor: design.colors.primary + '20' }]}>
                <SettingsIcon size={20} color={design.colors.primary} />
              </View>
              <Text style={styles.actionTitle}>App Preferences</Text>
            </View>
            <ChevronRight size={20} color={design.colors.textSecondary} />
          </AnimatedCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: design.colors.base,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: design.spacing.lg,
    paddingBottom: 60,
  },
  headerBtn: {
    padding: design.spacing.xs,
    paddingRight: design.spacing.md,
  },
  profileCard: {
    padding: design.spacing.xl,
    alignItems: 'center',
    marginBottom: design.spacing.xl,
    backgroundColor: design.colors.surface,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: design.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: design.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: design.colors.surface,
  },
  profileInfo: {
    alignItems: 'center',
  },
  username: {
    ...design.typography.h2,
    color: design.colors.text,
    marginBottom: design.spacing.xs,
  },
  bio: {
    ...design.typography.body,
    color: design.colors.textSecondary,
    textAlign: 'center',
    marginBottom: design.spacing.sm,
  },
  joinDate: {
    ...design.typography.caption,
    color: design.colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: design.spacing.sm,
    marginBottom: design.spacing.xl,
  },
  statCard: {
    padding: design.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: design.colors.surface,
  },
  statValue: {
    ...design.typography.subtitle,
    color: design.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...design.typography.caption,
    color: design.colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...design.typography.h3,
    color: design.colors.text,
    marginBottom: design.spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: design.spacing.lg,
    backgroundColor: design.colors.surface,
    marginBottom: design.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: design.spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: design.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    ...design.typography.subtitle,
    color: design.colors.text,
  },
});
