import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
        }}
        />

      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}