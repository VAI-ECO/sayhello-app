import { View, Text } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native';
import { useLocation } from '../Context/LocationContext';
import { useAuth } from '../Context/AuthContext';
import MainNavigation from './MainNavigation';
import Caht from '../Screens/CoreFunction/ChatAndConnections/Chat';
import DeleteAccountScreen from '../Screens/DeleteAccountScreen/DeleteAccountScreen';
import GetSupportScreen from '../Screens/GetSupportScreen/GetSupportScreen';
import FAQsScreen from '../Screens/GetSupportScreen/FAQsScreen';
import AuthNavigation from './AuthNavigation';
import NotificationStack from './NotificationStack';
import SelectedScreen from './SelectedScreen';
import SettingStack from './SettingStack';
import CustomeDrawer from "../Component/Drawer/CustomeDrawer";
import { createDrawerNavigator } from "@react-navigation/drawer";
const Drawer = createDrawerNavigator();
export default function DrawerNavigator() {
    const { user, isLoading, isInNotificationFlow, notRightnow } = useAuth();
    const { location } = useLocation();
  
  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator accessibilityLabel="Restoring your session" /></View>;
  }
  return (
    <>
    {!user ? (
      <>
        <AuthNavigation />
      </>
    ) : (
      <>
        <Drawer.Navigator
          gestureEnabled={false}
          screenOptions={{ headerShown: false, gestureEnabled: false }}
          drawerContent={(props) => <CustomeDrawer {...props} />}
        >
          <Drawer.Screen name="Main" component={MainNavigation} />
          <Drawer.Screen name="Notification" component={NotificationStack} />
          <Drawer.Screen name="SelectedScreen" component={SelectedScreen} />
          <Drawer.Screen name="Chat" component={Caht} />
          <Drawer.Screen
            name="DeleteAccount"
            component={DeleteAccountScreen}
          />
          <Drawer.Screen name="SupportScreen" component={GetSupportScreen} />
          <Drawer.Screen name="FAQsScreen" component={FAQsScreen} />
          <Drawer.Screen name="MySettings" component={SettingStack} />
        </Drawer.Navigator>
      </>
    )}
  </>
  )
}
