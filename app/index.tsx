import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthRole } from '../store/authRole';

export default function RootIndex() {
  const { loading, isAuthenticated } = useAuthRole();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/auth'} />;
}
