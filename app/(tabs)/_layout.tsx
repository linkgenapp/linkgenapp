import { Tabs } from 'expo-router';
import { TabBarIcon } from '../../components/TabBarIcon';
import { LinkGenLogo } from '../../components/LinkGenLogo';
import { useAuthRole } from '../../store/authRole';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../lib/theme';
import { t } from '../../lib/i18n';

export default function TabLayout() {
  const { role, loading, language } = useAuthRole();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.greenPrimary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: '#FFF4B8',
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerStyle: { backgroundColor: COLORS.yellowLight },
        headerTitleAlign: 'center',
        headerTitle: () => <LinkGenLogo variant="header" />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: t(language, 'tabTasks'),
          href: '/(tabs)/swipe',
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="youthEvents"
        options={{
          title: t(language, 'tabEvents'),
          href: role === 'youth' ? '/(tabs)/youthEvents' : null,
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: t(language, 'tabMatches'),
          href: '/(tabs)/matches',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: t(language, 'tabHelpRequests'),
          href: role === 'elderly' ? '/(tabs)/requests' : null,
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: t(language, 'tabEvents'),
          href: role === 'elderly' ? '/(tabs)/events' : null,
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t(language, 'tabChat'),
          tabBarIcon: ({ color }) => <TabBarIcon name="wechat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t(language, 'tabProfile'),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t(language, 'tabMap'),
          href: role === 'youth' ? '/(tabs)/map' : null,
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="newRequest"
        options={{
          href: null,
          title: t(language, 'tabNewRequest'),
        }}
      />
    </Tabs>
  );
}
