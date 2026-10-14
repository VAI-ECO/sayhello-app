import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InitialNotification from '../Screens/CoreFunction/InitialNotification/InitialNotification';
import ProfileReviel from '../Screens/CoreFunction/InitialNotification/ProfileReviel ';
import QRScreen from '../Screens/CoreFunction/InitialNotification/QRScreen';
import TakeSelfi from '../Screens/CoreFunction/InitialNotification/TakeSelfi';
import CameraScreen from '../Screens/CoreFunction/InitialNotification/QRScan';
import OpenChat from "../Screens/CoreFunction/ChatAndConnections/OpenChat";

const Stack = createNativeStackNavigator();
const NotificationStack = ({navigation}) => {
    return (
        <Stack.Navigator
          initialRouteName="InitialNotification"
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: "none",
            },
          }}
        >
          <Stack.Screen
            name="InitialNotification"
            component={InitialNotification}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="ProfileReviel"
            component={ProfileReviel}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="QRScreen"
            component={QRScreen}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="TakeSelfi"
            component={TakeSelfi}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="QRScan"
            component={CameraScreen}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="OpenChat"
            component={OpenChat}
            options={{ tabBarVisible: false }}
          />
        </Stack.Navigator>
      );
}

export default NotificationStack