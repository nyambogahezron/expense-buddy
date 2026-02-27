import { Tabs } from 'expo-router';
import { design } from '@/constants/design';
import { Home, List, PlusCircle, PieChart, User } from 'lucide-react-native';
import { Platform, View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: design.colors.surface,
          borderTopWidth: 1,
          borderTopColor: design.colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: design.colors.primary,
        tabBarInactiveTintColor: design.colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 10,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          href: '/transactions/new',
          tabBarIcon: ({ color }) => (
            <View style={styles.addIconContainer}>
              <PlusCircle size={40} color={design.colors.primary} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Hidden tabs for preserved old screens */}
      <Tabs.Screen name="budgets_old" options={{ href: null }} />
      <Tabs.Screen name="categories_old" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addIconContainer: {
    marginTop: -10, // Elevates the add button slightly
  }
});
