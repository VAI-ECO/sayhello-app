import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from './CustomeTabBar';
import SettingScreen from '../Screens/Settings/SettingScreen';
import ChangePassword from '../Screens/Settings/ChangePassword';
import EditPersonalInfo from '../Screens/Settings/EditPersonalInfo';
import EditBusinesInfo from "../Screens/Settings/Bussiness/EditBusinesInfo";
import EditBusinessQuestion from "../Screens/Settings/Bussiness/EditBusinessQuestion";
const Tab = createBottomTabNavigator();
const SettingStack = () => {
    return (
        <Tab.Navigator
          tabBar={() => <CustomTabBar />}
          initialRouteName="SettingScreen"
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: "none",
            },
          }}
        >
          <Tab.Screen
            name="SettingScreen"
            component={SettingScreen}
            options={{ tabBarVisible: false }}
          />
          <Tab.Screen
            name="ChangePassword"
            component={ChangePassword}
            options={{ tabBarVisible: false }}
          />
          <Tab.Screen
            name="EditPersonalInfo"
            component={EditPersonalInfo}
            options={{ tabBarVisible: false }}
          />
          <Tab.Screen
            name="EditBusinesInfo"
            component={EditBusinesInfo}
            options={{ tabBarVisible: false }}
          />
          <Tab.Screen
            name="EditBusinessQuestion"
            component={EditBusinessQuestion
            }
            options={{ tabBarVisible: false }}
          />
        </Tab.Navigator>
      );
}

export default SettingStack