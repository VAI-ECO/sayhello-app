import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import LoginMethod from "../Screens/OnBoarding/LoginMethod/LoginMethod";
import Selectedlanguage from "../Screens/OnBoarding/Selectedlanguage/Selectedlanguage";
import SelectedRole from "../Screens/OnBoarding/SelectedRole";
import PrivacyIndividual from "../Screens/OnBoarding/Individual/PrivacyIndividual";
import SignUp from "../Screens/OnBoarding/Individual/SignUp";
import OtpScreen from "../Screens/OnBoarding/Individual/OtpScreen";
import CongratulationsIndividual from "../Screens/OnBoarding/Individual/CongratulationsIndividual";
import PersonalInfo from "../Screens/OnBoarding/SetUpIndividual/PersonalInfo";
import GeneralInterest from "../Screens/OnBoarding/SetUpIndividual/GeneralInterest";
import RomanticlInfo from "../Screens/OnBoarding/SetUpIndividual/RomanticlInfo";
import RomanticQuestion from "../Screens/OnBoarding/SetUpIndividual/RomanticQuestion";
import BusinesInfo from "../Screens/OnBoarding/SetUpIndividual/BusinesInfo";
import BusinessQuestion from "../Screens/OnBoarding/SetUpIndividual/BusinessQuestion";
import PersonalSurvey from "../Screens/OnBoarding/SetUpIndividual/PersonalSurvey";
import PersonalSurveyTwo from "../Screens/OnBoarding/SetUpIndividual/PersonalSurveyTwo";
import PersonalSurveyThree from "../Screens/OnBoarding/SetUpIndividual/PersonalSurveyThree";
import PersonalSurveyFour from "../Screens/OnBoarding/SetUpIndividual/PersonalSurveyFour";
import PrivacyOrg from "../Screens/OnBoarding/Organization/PrivacyOrg";
import OtpOrg from "../Screens/OnBoarding/Organization/OtpOrg";
import ChoicesScreen from "../Screens/OnBoarding/Organization/ChoosegroupAndOrg";
import ChoosegroupAndOrg from "../Screens/OnBoarding/Organization/ChoosegroupAndOrg";
import OrganizationName from "../Screens/OnBoarding/Organization/OrganizationName";
import OrgDiscription from "../Screens/OnBoarding/Organization/OrgDiscription";
import OrgSocial from "../Screens/OnBoarding/Organization/OrgSocial";
import OrgSummary from "../Screens/OnBoarding/Organization/OrgSummary";
import OrgPassword from "../Screens/OnBoarding/Organization/OrgPassword";
import CongratulationsOrg from "../Screens/OnBoarding/Organization/CongratulationsOrg";
import OrgPhoto from "../Screens/OnBoarding/SetUpOrganization/OrgPhoto";
import AlsOrg from "../Screens/OnBoarding/SetUpOrganization/AlsOrg";
import AlsGroup from "../Screens/OnBoarding/SetUpOrganization/AlsGroup";
import GroupName from "../Screens/OnBoarding/Group/GroupName";
import GroupDiscription from "../Screens/OnBoarding/Group/GroupDiscription";
import GroupSocial from "../Screens/OnBoarding/Group/GroupSocial";
import GroupSummary from "../Screens/OnBoarding/Group/GroupSummary";
import GroupPassword from "../Screens/OnBoarding/Group/GroupPassword";

import PrivacyBusines from "../Screens/OnBoarding/Business/PrivacyBusines";
import BusinessIntro from "../Screens/OnBoarding/Business/BusinessIntro";
import EnterData from "../Screens/OnBoarding/Business/EnterData";
import Stripe from "../Screens/OnBoarding/Business/Stripe/Stripe";
import BusinesSearch from "../Screens/OnBoarding/Business/BusinesSearch";
import BusinessCatagory from "../Screens/OnBoarding/Business/BusinessCatagory";
import BusinessHours from "../Screens/OnBoarding/Business/BusinessHours";
import BusinesSocial from "../Screens/OnBoarding/Business/BusinesSocial";
import BusinesDiscription from "../Screens/OnBoarding/Business/BusinesDiscription";
import BusinesPhoto from "../Screens/OnBoarding/Business/BusinesPhoto";
import PostNotification from "../Screens/Posting/PostNotification/PostNotification";
// import PostDiscount from "../Screens/Posting/PostDiscount/PostDiscount";
// import PostDateAndTime from "../Screens/Posting/PostDiscount/PostDateAndTime";
// import PostImage from "../Screens/Posting/PostDiscount/PostImage";
import ResetPassword from "../Screens/ResetPassword/ResetPassword";
import ResetPassPhone from "../Screens/ResetPassword/ResetPassPhone";
import ResetPassEmail from "../Screens/ResetPassword/ResetPassEmail";
import ResetPassOtpPhone from "../Screens/ResetPassword/ResetPassOtpPhone";
import ResetPassOtpEmail from "../Screens/ResetPassword/ResetPassOtpEmail";
import ChangePass from "../Screens/ResetPassword/ChangePass";
import InitialNotification from "../Screens/CoreFunction/InitialNotification/InitialNotification";
import ProfileReviel from "../Screens/CoreFunction/InitialNotification/ProfileReviel ";
import QRScreen from "../Screens/CoreFunction/InitialNotification/QRScreen";
import TakeSelfi from "../Screens/CoreFunction/InitialNotification/TakeSelfi";
import Connections from "../Screens/CoreFunction/ChatAndConnections/Connections";
import Caht from "../Screens/CoreFunction/ChatAndConnections/Chat/index";
import Chatlist from "../Screens/CoreFunction/ChatAndConnections/Chatlist/Chatlist";
import CompletedSurvey from "../Screens/CoreFunction/ChatAndConnections/CompletedSurvey";
import SurveyQuestion from "../Screens/CoreFunction/ChatAndConnections/SurveyQuestion";
import Survey from "../Screens/CoreFunction/ChatAndConnections/Survey";
import OpenChat from "../Screens/CoreFunction/ChatAndConnections/OpenChat";
import BusinesSummary from "../Screens/OnBoarding/Business/BusinesSummary";
import BusinesName from "../Screens/OnBoarding/Business/BusinesName";
import BusCongratulation from "../Screens/OnBoarding/Business/BusCongratulation";
import BusPassword from "../Screens/OnBoarding/Business/BusPassword";
import BusOTP from "../Screens/OnBoarding/Business/BusOTP";
import ThankYouBus from "../Screens/OnBoarding/Business/ThankYouBus";
import PrivacyInfluncer from "../Screens/OnBoarding/Influncer/PrivacyInfluncer";
import InfluncerIntro from "../Screens/OnBoarding/Influncer/InfluncerIntro";
import InfluncerSignUp from "../Screens/OnBoarding/Influncer/InfluncerSignUp";
import InfluncerSocial from "../Screens/OnBoarding/Influncer/InfluncerSocial";
import InfluncerOtpScreen from "../Screens/OnBoarding/Influncer/InfluncerOtpScreen";
import PersonalInfoInfluncer from "../Screens/OnBoarding/Influncer/PersonalInfoInfluncer";
import GroupImage from "../Screens/OnBoarding/Group/GroupImage";
import BeyondHello from "../Screens/BeyondHello/BeyondHello";
import AlsInfluncer from "../Screens/OnBoarding/Influncer/AlsInfluncer";
import AlsBusiness from "../Screens/OnBoarding/Business/AlsBusiness";
import PrivacyAmbasdor from "../Screens/OnBoarding/Ambasdor/PrivacyAmbasdor";
import AmbsadorSignUp from "../Screens/OnBoarding/Ambasdor/AmbsadorSignUp";
import AmbasdorOtpScreen from "../Screens/OnBoarding/Ambasdor/AmbasdorOtpScreen";
import CongratulationsAmbasdor from "../Screens/OnBoarding/Ambasdor/CongratulationsAmbasdor";
import IndivdualSingup from "../Screens/OnBoarding/Individual/SignUp";

const Stack = createNativeStackNavigator();
const AuthNavigation = ({ initialRouteName = "LoginMethod" }) => {
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        animation: "slide_from_right",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen
        name="LoginMethod"
        component={LoginMethod}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Selectedlanguage"
        component={Selectedlanguage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectedRole"
        component={SelectedRole}
        options={{ headerShown: false }}
      />
      {/* Ambasdor */}

      <Stack.Screen
        name="PrivacyAmbasdor"
        component={PrivacyAmbasdor}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AmbsadorSignUp"
        component={AmbsadorSignUp}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AmbasdorOtpScreen"
        component={AmbasdorOtpScreen}
        options={{ headerShown: false }}
      />

<Stack.Screen
        name="CongratulationsAmbasdor"
        component={CongratulationsAmbasdor}
        options={{ headerShown: false }}
      />

      {/* Individual */}
      <Stack.Screen
        name="PrivacyIndividual"
        component={PrivacyIndividual}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IndivdualSingup"
        component={IndivdualSingup}
        options={{ headerShown: false }}
      />

      
      <Stack.Screen
        name="OtpScreen"
        component={OtpScreen}
        options={{ headerShown: false }}
      />
      {/* Individuals */}
      <Stack.Screen
        name="CongratulationsIndividual"
        component={CongratulationsIndividual}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GeneralInterest"
        component={GeneralInterest}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RomanticlInfo"
        component={RomanticlInfo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RomanticQuestion"
        component={RomanticQuestion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinesInfo"
        component={BusinesInfo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinessQuestion"
        component={BusinessQuestion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalSurvey"
        component={PersonalSurvey}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalSurveyTwo"
        component={PersonalSurveyTwo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalSurveyThree"
        component={PersonalSurveyThree}
        options={{ headerShown: false }}
      />
      {/* signin uses hear */}
      <Stack.Screen
        name="PersonalSurveyFour"
        component={PersonalSurveyFour}
        options={{ headerShown: false }}
      />
      {/* org login*/}
      <Stack.Screen
        name="PrivacyOrg"
        component={PrivacyOrg}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OtpOrg"
        component={OtpOrg}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChoosegroupAndOrg"
        component={ChoosegroupAndOrg}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrganizationName"
        component={OrganizationName}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrgDiscription"
        component={OrgDiscription}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrgSocial"
        component={OrgSocial}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrgSummary"
        component={OrgSummary}
        options={{ headerShown: false }}
      />
      {/* SignUp page */}
      <Stack.Screen
        name="OrgPassword"
        component={OrgPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CongratulationsOrg"
        component={CongratulationsOrg}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrgPhoto"
        component={OrgPhoto}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlsOrg"
        component={AlsOrg}
        options={{ headerShown: false }}
      />
      {/* Group login/signup */}
      <Stack.Screen
        name="AlsGroup"
        component={AlsGroup}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupName"
        component={GroupName}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupDiscription"
        component={GroupDiscription}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupSocial"
        component={GroupSocial}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupSummary"
        component={GroupSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupPassword"
        component={GroupPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupImage"
        component={GroupImage}
        options={{ headerShown: false }}
      />
      {/* bussiness login/signup*/}
      <Stack.Screen
        name="BusinessIntro"
        component={BusinessIntro}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyBusines"
        component={PrivacyBusines}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EnterData"
        component={EnterData}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Stripe"
        component={Stripe}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinesSearch"
        component={BusinesSearch}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinessCatagory"
        component={BusinessCatagory}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BeyondHello"
        component={BeyondHello}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinessHours"
        component={BusinessHours}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinesSocial"
        component={BusinesSocial}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinesDiscription"
        component={BusinesDiscription}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinesPhoto"
        component={BusinesPhoto}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinesSummary"
        component={BusinesSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusinesName"
        component={BusinesName}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusCongratulation"
        component={BusCongratulation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusPassword"
        component={BusPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusOTP"
        component={BusOTP}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ThankYouBus"
        component={ThankYouBus}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PostNotification"
        component={PostNotification}
        options={{ headerShown: false }}
      />

      {/* <Stack.Screen
        name="PostDiscount"
        component={PostDiscount}
        options={{ headerShown: false }}
      /> */}
      {/* <Stack.Screen
        name="PostDateAndTime"
        component={PostDateAndTime}
        options={{ headerShown: false }}
      /> */}
      {/* <Stack.Screen
        name="PostImage"
        component={PostImage}
        options={{ headerShown: false }}
      /> */}
      {/* <Stack.Screen
        name="SelectedPosting"
        component={SelectedPosting}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassPhone"
        component={ResetPassPhone}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassEmail"
        component={ResetPassEmail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassOtpPhone"
        component={ResetPassOtpPhone}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassOtpEmail"
        component={ResetPassOtpEmail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePass"
        component={ChangePass}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InitialNotification"
        component={InitialNotification}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileReviel"
        component={ProfileReviel}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QRScreen"
        component={QRScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="TakeSelfi"
        component={TakeSelfi}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Connections"
        component={Connections}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chats"
        component={Caht}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chatlist"
        component={Chatlist}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="OpenChat"
        component={OpenChat}
        options={{ headerShown: false }}
      />
      {/* influencers */}
      <Stack.Screen
        name="InfluncerIntro"
        component={InfluncerIntro}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyInfluncer"
        component={PrivacyInfluncer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InfluncerSignUp"
        component={InfluncerSignUp}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InfluncerSocial"
        component={InfluncerSocial}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InfluncerOtpScreen"
        component={InfluncerOtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonalInfoInfluncer"
        component={PersonalInfoInfluncer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlsInfluncer"
        component={AlsInfluncer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlsBusiness"
        component={AlsBusiness}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
