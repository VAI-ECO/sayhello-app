import * as React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CustomTabBar } from "./CustomeTabBar";
import HomeScreen from "../Screens/Home";
import Connections from "../Screens/CoreFunction/ChatAndConnections/Connections";
import SelectedPosting from "../Screens/Posting/SelectedPosting";
import PostDiscount from "../Screens/Posting/PostDiscount/PostDiscount";
import PostDateAndTime from "../Screens/Posting/PostDiscount/PostDateAndTime";
import PostImage from "../Screens/Posting/PostDiscount/PostImage";
import PostNotification from "../Screens/Posting/PostNotification/PostNotification";
import HoostaDateAndTime from "../Screens/Posting/PostHoosta/HoostaDateAndTime";
import HoostaLocation from "../Screens/Posting/PostHoosta/HoostaLocation";
import HoostaDiscription from "../Screens/Posting/PostHoosta/HoostaDiscription";
import HoostaContact from "../Screens/Posting/PostHoosta/HoostaContact";
import HoostaReview from "../Screens/Posting/PostHoosta/HoostaReview";
import HoostaVerify from "../Screens/Posting/PostHoosta/HoostaVerify";
import HoostaScan from "../Screens/Posting/PostHoosta/HoostaScan";
import DiscountScan from "../Screens/Posting/PostDiscount/DiscountScan";
import BeyondHello from "../Screens/BeyondHello/BeyondHello";
import PledgeHello from "../Screens/BeyondHello/PledgeHello";
import WhatsHappening from "../Screens/WhatsHappening/WhatsHappening";
import HangoutSearch from "../Screens/IndividualBusiness/HangoutSearch";
import HangoutLocation from "../Screens/IndividualBusiness/HangoutLocation";
import HangoutInformation from "../Screens/IndividualBusiness/HangoutInformation";
import HangoutDetaile from "../Screens/IndividualBusiness/HangoutDetaile";
import HoostaPayments from "../Screens/Posting/PostHoosta/HoostaPayments";
import PostPayment from "../Screens/Posting/PostDiscount/PostPayment";
import NotifcationPayments from "../Screens/Posting/PostNotification/NotifcationPayments";
import AmbBusinesSearch from "../Screens/Ambassador/AmbBusinesSearch";
import AmbBusinesEnterData from "../Screens/Ambassador/AmbBusinesEnterData";
import AmbBusinesPostImage from "../Screens/Ambassador/AmbBusinesPostImage";
import AmbassadorInfo from "../Screens/Ambassador/AmbassadorInfo";
import AmbassadorInfoSecond from "../Screens/Ambassador/AmbassadorInfoSecond";
import HelloAmbassador from "../Screens/IndividualBusiness/HelloAmbassador";
import Embassadordetails from "../Screens/IndividualBusiness/Embassadordetails";
import HangoutList from "../Screens/HangoutSearch/HangoutList";

import Chatlist from "../Screens/CoreFunction/ChatAndConnections/Chatlist/Chatlist";
import MapScreen from "../Screens/Map";
import EditProfile from "../Screens/EditProfile/EditProfile";
import PostNotificationScan from "../Screens/Posting/PostNotification/PostNotificationScan";
import SelectedConnection from "../Screens/CoreFunction/ChatAndConnections/MyConnection/SelectedConnection";
import DetailesConnections from "../Screens/CoreFunction/ChatAndConnections/MyConnection/DetailesConnections";
import AllGroups from "../Screens/GroupSearch/AllGroups";
import HappeningDetailsDiscount from "../Screens/WhatsHappening/HappeningDetailsDiscount";
import HappeningDetailsHoosta from "../Screens/WhatsHappening/HappeningDetailsHoosta";
import HappeningDetailsNotification from "../Screens/WhatsHappening/HappeningDetailsNotification";
import HoostaUserDeails from "../Screens/Posting/PostHoosta/HoostaUserDeails";
import DiscountUserDeails from "../Screens/Posting/PostDiscount/DiscountUserDeails";
import NotificationsUserDeails from "../Screens/Posting/PostNotification/NotificationsUserDeails";
import ReferalRewardUser from "../Screens/Referal/ReferalRewardUser";
import ReferalSignups from "../Screens/Referal/ReferalSignups";
import ReferalsUsers from "../Screens/Referal/ReferalsUsers";
import MySignups from "../Screens/Referal/MySignups";
import MyCode from "../Screens/Referal/MyCode";
import DrawingPrizes from "../Screens/DrawingPrizes/DrawingPrizes";
import HoostaPhoto from "../Screens/Posting/PostHoosta/HoostaPhoto";
import CompletedSurvey from "../Screens/CoreFunction/ChatAndConnections/CompletedSurvey";
import SurveyQuestion from "../Screens/CoreFunction/ChatAndConnections/SurveyQuestion";
import Survey from "../Screens/CoreFunction/ChatAndConnections/Survey";
import OpenChat from "../Screens/CoreFunction/ChatAndConnections/OpenChat";
import Caht from "../Screens/CoreFunction/ChatAndConnections/Chat";
import HelloEntries from "../Screens/HelloEntries/HelloEntries";
import ShowWallet from "../Screens/EditProfile/ShowWallet";
import SearchFilter from '../Screens/Home/SearchFilter'
import SearchResults from "../Screens/Home/SearchResults";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: "Roboto-Regular",
          fontSize: 12,
          top: -5,
          tabBarHideOnKeyboard: true,
        },
        tabBarActiveTintColor: "#338AFF",
        tabBarStyle: {
          height: 80,
          elevation: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 10,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Connections" component={Connections} />
      <Tab.Screen name="ChatList" component={Chatlist} />
      <Tab.Screen
        name="SearchFilter"
        component={SearchFilter}
        options={{ tabBarVisible: false }}
      />
      <Tab.Screen
        name="SearchResults"
        component={SearchResults}
        options={{ tabBarVisible: false }}
      />
      <Tab.Screen
        name="OpenChat"
        component={OpenChat}
        options={{ tabBarVisible: false }}
      />
      <Tab.Screen
        name="PostDiscount"
        component={PostDiscount}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="SelectedPosting"
        component={SelectedPosting}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chat"
        component={Caht}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="PostDateAndTime"
        component={PostDateAndTime}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="PostImage"
        component={PostImage}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="PostPayment"
        component={PostPayment}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="PostNotification"
        component={PostNotification}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="NotifcationPayments"
        component={NotifcationPayments}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="PostNotificationScan"
        component={PostNotificationScan}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="CompletedSurvey"
        component={CompletedSurvey}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="SurveyQuestion"
        component={SurveyQuestion}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Survey"
        component={Survey}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="HoostaDateAndTime"
        component={HoostaDateAndTime}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HoostaLocation"
        component={HoostaLocation}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HoostaDiscription"
        component={HoostaDiscription}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HoostaContact"
        component={HoostaContact}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HoostaPhoto"
        component={HoostaPhoto}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HoostaReview"
        component={HoostaReview}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HoostaPayments"
        component={HoostaPayments}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HoostaVerify"
        component={HoostaVerify}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HoostaScan"
        component={HoostaScan}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="DiscountScan"
        component={DiscountScan}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="BeyondHello"
        component={BeyondHello}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="PledgeHello"
        component={PledgeHello}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="WhatsHappening"
        component={WhatsHappening}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="HappeningDetailsDiscount"
        component={HappeningDetailsDiscount}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HappeningDetailsHoosta"
        component={HappeningDetailsHoosta}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HappeningDetailsNotification"
        component={HappeningDetailsNotification}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="HangoutSearch"
        component={HangoutSearch}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HangoutLocation"
        component={HangoutLocation}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HangoutDetaile"
        component={HangoutDetaile}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HangoutInformation"
        component={HangoutInformation}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HelloAmbassador"
        component={HelloAmbassador}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Embassadordetails"
        component={Embassadordetails}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="AmbBusinesSearch"
        component={AmbBusinesSearch}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="AmbBusinesEnterData"
        component={AmbBusinesEnterData}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="AmbBusinesPostImage"
        component={AmbBusinesPostImage}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="AmbassadorInfo"
        component={AmbassadorInfo}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="AmbassadorInfoSecond"
        component={AmbassadorInfoSecond}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HangoutList"
        component={HangoutList}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="AllGroups"
        component={AllGroups}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="DrawingPrizes"
        component={DrawingPrizes}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ShowWallet"
        component={ShowWallet}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="SelectedConnection"
        component={SelectedConnection}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="DetailesConnections"
        component={DetailesConnections}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="HoostaUserDeails"
        component={HoostaUserDeails}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="DiscountUserDeails"
        component={DiscountUserDeails}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="NotificationsUserDeails"
        component={NotificationsUserDeails}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="ReferalRewardUser"
        component={ReferalRewardUser}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ReferalSignups"
        component={ReferalSignups}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ReferalsUsers"
        component={ReferalsUsers}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="MySignups"
        component={MySignups}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="MyCode"
        component={MyCode}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="HelloEntries"
        component={HelloEntries}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
