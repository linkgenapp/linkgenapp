import { Redirect } from 'expo-router';
import { useAuthRole } from '../../store/authRole';

export default function TabsIndex() {
  const { isAuthenticated } = useAuthRole();
  if (!isAuthenticated) return <Redirect href="/auth" />;
  return <Redirect href="/(tabs)/swipe" />;
}
