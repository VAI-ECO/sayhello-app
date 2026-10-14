import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Selectedlanguage from '../Screens/OnBoarding/Selectedlanguage/Selectedlanguage';
import SelectedRole from '../Screens/OnBoarding/SelectedRole';
import PrivacyIndividual from "../Screens/OnBoarding/Individual/PrivacyIndividual";
import ChoosegroupAndOrg from '../Screens/OnBoarding/Organization/ChoosegroupAndOrg';
import PrivacyBusines from '../Screens/OnBoarding/Business/PrivacyBusines';
import PrivacyInfluncer from '../Screens/OnBoarding/Influncer/PrivacyInfluncer';
import SignUp from '../Screens/OnBoarding/Individual/SignUp';
import OtpScreen from '../Screens/OnBoarding/Individual/OtpScreen';
import CongratulationsIndividual from '../Screens/OnBoarding/Individual/CongratulationsIndividual';
import PersonalInfo from '../Screens/OnBoarding/SetUpIndividual/PersonalInfo';
import GeneralInterest from '../Screens/OnBoarding/SetUpIndividual/GeneralInterest';
import RomanticlInfo from '../Screens/OnBoarding/SetUpIndividual/RomanticlInfo';
import RomanticQuestion from '../Screens/OnBoarding/SetUpIndividual/RomanticQuestion';
import BusinesInfo from '../Screens/OnBoarding/SetUpIndividual/BusinesInfo';
import BusinessQuestion from '../Screens/OnBoarding/SetUpIndividual/BusinessQuestion';
import PersonalSurvey from '../Screens/OnBoarding/SetUpIndividual/PersonalSurvey';
import PersonalSurveyTwo from '../Screens/OnBoarding/SetUpIndividual/PersonalSurveyTwo';
import PersonalSurveyThree from '../Screens/OnBoarding/SetUpIndividual/PersonalSurveyThree';
import PersonalSurveyFour from '../Screens/OnBoarding/SetUpIndividual/PersonalSurveyFour';
const Stack = createNativeStackNavigator();
const SelectedScreen = ({navigation}) => {
    return (
        <Stack.Navigator
          initialRouteName="Selectedlanguage"
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: "none",
            },
          }}
        >
          <Stack.Screen
            name="Selectedlanguage"
            component={Selectedlanguage}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="SelectedRole"
            component={SelectedRole}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="PrivacyIndividual"
            component={PrivacyIndividual}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="ChoosegroupAndOrg"
            component={ChoosegroupAndOrg}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="PrivacyBusines"
            component={PrivacyBusines}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="PrivacyInfluncer"
            component={PrivacyInfluncer}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="OtpScreen"
            component={OtpScreen}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="CongratulationsIndividual"
            component={CongratulationsIndividual}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="PersonalInfo"
            component={PersonalInfo}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="GeneralInterest"
            component={GeneralInterest}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="RomanticlInfo"
            component={RomanticlInfo}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="RomanticQuestion"
            component={RomanticQuestion}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="BusinesInfo"
            component={BusinesInfo}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="BusinessQuestion"
            component={BusinessQuestion}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="PersonalSurvey"
            component={PersonalSurvey}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="PersonalSurveyTwo"
            component={PersonalSurveyTwo}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="PersonalSurveyThree"
            component={PersonalSurveyThree}
            options={{ tabBarVisible: false }}
          />
          <Stack.Screen
            name="PersonalSurveyFour"
            component={PersonalSurveyFour}
            options={{ tabBarVisible: false }}
          />
        </Stack.Navigator>
      );
}

export default SelectedScreen