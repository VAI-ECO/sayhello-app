import React, { useRef, useEffect, useState } from "react";

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Modal,
  RefreshControl,
  Animated,
  Easing
} from "react-native";
import ImageSlider from "./ImageSlider";
import CustomSwitch from "./CustomSwitch";
import { useAuth } from "../../Context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import userService from "../../Services/userService";
import AntDesign from "@expo/vector-icons/AntDesign";
import Icon from "react-native-vector-icons/Ionicons";
import i18n from "../../Context/i18n";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AuthServices from "../../Services/authService";
import { useLocation } from "../../Context/LocationContext";

const removeItems = async () => {
  try {
    await AsyncStorage.removeItem("user_info");
    await AsyncStorage.removeItem("BusinessCatagory");
    await AsyncStorage.removeItem("selected_language");
    console.log("Items removed successfully");
  } catch (error) {
    console.error("Error removing items", error);
  }
};

const HomeScreen = () => {
  const { user, signOut, updateUser } = useAuth();
  const userId = user.user._id;
  const { isAppearModalVisible, setIsAppearModalVisible, isClockModalVisible,
    setIsClockModalVisible } = useLocation();
  const navigation = useNavigation();
  const route = useRoute();
  const pathname = route?.name;

  const [selectedTime, setSelectedTime] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [homeDetails, setHomeDetails] = useState({});
  const [name, setName] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [images, setImages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedSecond, setSelectedSecond] = useState("");
  const [showError, setShowError] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [resetNearby, setResetNearby] = useState(null);
  const [resetNotification, setResetNotification] = useState(null);
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState(null);



  console.log(user?.user?.isAmbesdor, "ambasador user----->");

  const hours = Array.from({ length: 24 }, (_, i) =>
    // i.toString().padStart(2, "0")
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    // i.toString().padStart(2, "0")
    (i + 1).toString().padStart(2, "0")
  );
  const seconds = Array.from({ length: 60 }, (_, i) =>
    // i.toString().padStart(2, "0")
    (i + 1).toString().padStart(2, "0")
  );

  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = user.user._id;
      if (user && userId) {
        try {
          const response = await AuthServices.getUserById(userId);
          console.log(response, "response..>>>")
          const { firstname, lastname, profileUrl } = response;
          setName(`${firstname} ${lastname}`);
          setProfileImageUri(profileUrl)

        } catch (error) {
          console.error("Error fetching user data:", error.response?.data || error.message);
          signOut();
        }
      }
    };
    fetchUserData();
  }, [user]);

  const getHomeAdvertisments = () => {
    userService
      .homeAdvertisement()
      .then((res) => {
        console.log(res, "advertisement data")
        const activeImages = res
          .filter((ad) => ad?.status === "active")
          .map((ad) => ad?.image);

        setImages(activeImages);
      })
      .catch((err) => {
        console.log("Err on getHomeAdvertisments: ", err);
      });
  };

  const getuserHomePoints = () => {
    console.log("user gethome pints: ", user?.user?._id);
    userService
      .getUserHomePoints(user?.user?._id)
      .then((res) => {
        setHomeDetails(res);
      })
      .catch((err) => {
        console.log("Err on getUserHomePoints: ", err);
      });
  };

  const updateToggleStatusByTime = () => {
    if (!user?.user?.isAppearsNearby) {
      if (user?.user?.appearOfflineEndTime) {
        let currentTime = new Date();
        const endTimeDate = new Date(user?.user?.appearOfflineEndTime);
        if (currentTime < endTimeDate) {
          const timeDiff = endTimeDate - currentTime;
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

          setRemainingTime(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
        } else {
          setRemainingTime(null);
        }

        if (currentTime > endTimeDate && user?.user?.isAppearsNearby == false) {
          toggleIsAppearsNearby(true);
        }
      }
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      updateToggleStatusByTime();
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [user]);


  useFocusEffect(
    React.useCallback(() => {
      updateToggleStatusByTime();
    }, [user])
  );

  useEffect(() => {
    removeItems();
    getuserHomePoints();
    getHomeAdvertisments();
  }, [navigation]);

  const ApiFunctionGeneral = async (statusGeneral) => {
    if (statusGeneral) {
      setResetNotification(true);
    }
    else {
      setResetNotification(false);
    }
    userService
      .updateUserGeneralNotification(user?.user?._id)
      .then(async (res) => {
        const updates = {
          isGeneralNotification: res.user.isGeneralNotification,
        };
        updateUser(updates);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const closeModalWithoutSelection = () => {
    setTimeModalVisible(false);
    setIsAppearModalVisible(false);
    setShowError(false);
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    setResetNearby(true);
  };


  const toggleIsAppearsNearby = (newStatus) => {
    if (!newStatus) {
      setTimeModalVisible(true);
      setIsAppearModalVisible(true);
      setResetNearby(null);
      setSelectedHour("");
      setSelectedMinute("");
      setSelectedSecond("");
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      setResetNearby(true);
      userService
        .toggleIsAppearsNearby({ userId: user?.user?._id })
        .then(async (res) => {
          const updates = { isAppearsNearby: res.user.isAppearsNearby };
          updateUser(updates);
          console.log("Switched OFF and updated to backend:", updates);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleTimeSelection = () => {
    // if (!selectedHour || !selectedMinute || !selectedSecond) {
    //   setShowError(true);
    //   return;
    // }

    if (!selectedHour && !selectedMinute && !selectedSecond) {
      setShowError(true);
      return;
    }

    if (selectedHour === "00" && selectedMinute === "00" && selectedSecond === "00") {
      setShowError(true);
      return;
    }
    console.log(selectedHour, selectedMinute, selectedSecond, 'Time is this1')

    const startTime = new Date();
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + parseInt(selectedHour || 0));
    endTime.setMinutes(endTime.getMinutes() + parseInt(selectedMinute || 0));
    endTime.setSeconds(endTime.getSeconds() + parseInt(selectedSecond || 0));

    setShowError(false);
    setTimeModalVisible(false);
    setIsAppearModalVisible(false);
    setResetNearby(false);
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    const data = {
      userId: user?.user?._id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    }
    userService
      .toggleIsAppearsNearby(data)
      .then(async (res) => {
        const updates = { isAppearsNearby: res.user.isAppearsNearby, appearOfflineStartTime: startTime.toISOString(), appearOfflineEndTime: endTime.toISOString() };
        updateUser(updates);
        console.log("Time selected and status updated to backend:", updates);
      })
      .catch((err) => console.log(err));
  };

  const handleDurationChange = (value, type) => {
    setDuration((prev) => ({ ...prev, [type]: value }));
  };

  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    setModalVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([getHomeAdvertisments(), getuserHomePoints(), updateToggleStatusByTime()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };


  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />
          }
        >
          <ImageBackground
            source={require("../../assets/ImageBackground.jpg")}
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              flex: 1,
              left: 0,
              top: 0,
            }}
          >
            <ScrollView style={{ flex: 1 }}>
              <View style={styles.container}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    paddingHorizontal: 20,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {profileImageUri !== "" ? (
                      <Image
                        style={styles.profileImage}
                        source={{ uri: profileImageUri }}
                      />
                    ) : (
                      <Image
                        style={styles.profileImage}
                        source={require("../../assets/profile_img.png")}
                      />
                    )}

                    <Text
                      allowFontScaling={false}
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        fontFamily: "Roboto-Regular",
                        color: "#000000",
                      }}
                    >
                      {" "}
                      {user?.user?.firstname} {user?.user?.lastname}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: "row",
                  }}>
                    <TouchableOpacity style={styles.searchIcon}
                      onPress={() => navigation.navigate('SearchFilter')}>
                      <Ionicons name="filter-circle-sharp" size={28} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        navigation?.openDrawer();
                      }}
                    >
                      <Ionicons name="menu" size={28} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center",
                    width: "90%",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text allowFontScaling={false} style={styles.notiftext}>
                      {i18n.t("global.notification")}
                    </Text>
                    <CustomSwitch
                      value={user?.user?.isGeneralNotification}
                      ApiFunction={ApiFunctionGeneral}
                      resetState={resetNotification}
                    />
                  </View>
                  {user?.user?.user_type === "individual" && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text
                        allowFontScaling={false}
                        style={{
                          paddingLeft: 15,
                          fontFamily: "Roboto-Regular",
                          color: "#000000",
                          fontSize: 14,
                          fontWeight: "bold",
                        }}
                      >
                        {i18n.t("global.appearOnline")}
                      </Text>
                      {remainingTime && (
                        <AntDesign
                          name="clockcircleo"
                          size={20}
                          color="black"
                          style={{ paddingLeft: 10, marginRight: -20 }}
                          onPress={() => {
                            setClockModalVisible(true)
                            setIsClockModalVisible(true);
                          }}
                        />
                      )}

                      <CustomSwitch
                        value={user?.user?.isAppearsNearby}
                        ApiFunction={toggleIsAppearsNearby}
                        resetState={resetNearby}
                      />
                    </View>

                  )}
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center",
                    width: "90%",
                    justifyContent: "space-between",
                    marginTop: 15,
                    marginHorizontal: 10,
                  }}
                >
                  <View style={{ flexDirection: "column", alignItems: "center" }}>
                    <Text allowFontScaling={false} style={styles.pointsstyle}>
                      {i18n.t("global.drawingEntries")}
                    </Text>
                    <Text allowFontScaling={false} style={styles.pointstext}>
                      {homeDetails?.drawingEntries}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{ flexDirection: "column", alignItems: "center" }}
                    onPress={handlePress}
                  >
                    <Text allowFontScaling={false} style={styles.pointsstyle}>
                      {i18n.t("global.helloPoints")}
                      <AntDesign
                        name="infocirlceo"
                        size={15}
                        color="black"
                        style={{ marginLeft: 5 }}
                      />
                    </Text>

                    <Text allowFontScaling={false} style={styles.pointstext}>
                      {homeDetails?.helloPoints}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: "column", alignItems: "center" }}>
                    <Text allowFontScaling={false} style={styles.pointsstyle}>
                      {i18n.t("global.daysRemaining")}
                    </Text>
                    <Text allowFontScaling={false} style={styles.pointstext}>
                      {homeDetails?.dayreamingDays}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 15,
                    marginBottom: 15,
                    justifyContent: "space-around",
                    // width: "90%",
                  }}
                >
                  <TouchableOpacity
                    // onPress={() => navigation.navigate("Connections")}
                    onPress={() => navigation.navigate("SelectedConnection")}
                  >
                    <LinearGradient
                      colors={["#FD2A2A", "#E90E0E26"]}
                      style={styles.boxcontainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Image
                        style={styles.handheart}
                        // source={require("../../assets/Individuallogo.png")}
                        source={require("../../assets/organizationlogo.png")}
                      // source={require("../../assets/logohnad.png")}
                      // source={require("../../assets/logohnad.png")}
                      />
                      <Text allowFontScaling={false} style={styles.innertext}>
                        {i18n.t("global.hello")}
                        {/* Our hello */}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("BeyondHello")}
                  >
                    <LinearGradient
                      colors={["#FFEA2C", "#F3F2F2"]}
                      style={styles.boxcontainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Image
                        style={styles.handheart}
                        source={require("../../assets/hnadheart.png")}
                      />
                      <Text allowFontScaling={false} style={styles.innertext}>
                        {i18n.t("global.beyond")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("HoostaDateAndTime", { from2: pathname, clearform: true })}
                  >
                    <LinearGradient
                      colors={["#338AFF", "#CCCCCC"]}
                      style={styles.boxcontainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Image
                        style={styles.handheart}
                        source={require("../../assets/manicon.png")}
                      />
                      <Text allowFontScaling={false} style={styles.innertext}>
                        {i18n.t("global.myHootsa")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  {user?.user?.isAmbesdor ? (
                    <TouchableOpacity
                      onPress={() => navigation.navigate("AmbBusinesSearch", { from: pathname, clearform: true })}
                    >
                      <LinearGradient
                        colors={["#008767", "#CCCCCC"]}
                        style={styles.boxcontainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Image
                          style={styles.handheart}
                          source={require("../../assets/homehlo.png")}
                        />
                        <Text allowFontScaling={false} style={styles.innertext}>
                          {i18n.t("global.hangouts")}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => navigation.navigate("HangoutSearch", { from: pathname, clearform: true })}
                    >
                      <LinearGradient
                        colors={["#008767", "#CCCCCC"]}
                        style={styles.boxcontainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Image
                          style={styles.handheart}
                          source={require("../../assets/homehlo.png")}
                        />
                        <Text allowFontScaling={false} style={styles.innertext}>
                          {i18n.t("global.hangouts")}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
                <View
                  style={{
                    backgroundColor: "#8C7B7B",
                    marginBottom: 20,
                    // marginHorizontal: 20,
                  }}
                >
                  <Image
                    style={styles.hellohang}
                    source={require("../../assets/Hello Hangouts.png")}
                  />
                  <ImageSlider images={images} />
                </View>
                {/*           <CustomTimePicker onTimeSelected={setSelectedTime} />           */}

                <TouchableOpacity
                  onPress={() => navigation.navigate("WhatsHappening", { from: pathname, })}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image
                      style={styles.hangout}
                      source={require("../../assets/Whats Happening.png")}
                    />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("HangoutList")}
                >
                  <LinearGradient
                    colors={["#999999", "#A42BDD"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image
                      style={styles.hangout}
                      source={require("../../assets/hangouts.png")}
                    />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("AllGroups")}
                >
                  <LinearGradient
                    colors={["#CCCCCC", "#7C7C7C"]}
                    style={styles.pricebox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image
                      style={styles.hangoutimage}
                      source={require("../../assets/Organizations.png")}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("DrawingPrizes")}
                >
                  <LinearGradient
                    colors={["#2AC327", "#7C7C7C"]}
                    style={styles.pricebox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image
                      style={styles.hangoutimage}
                      source={require("../../assets/PrizesDrawings.png")}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ImageBackground>
          <Modal
            transparent={true}
            visible={isClockModalVisible}
            animationType="slide"
            onRequestClose={() => {
              setClockModalVisible(false);
              setIsClockModalVisible(false);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.clockmodalContent}>
                <Text style={styles.remainingTimeText}>
                  HH : MM : SS
                </Text>
                <Text style={styles.remainingTimeText}>
                  {remainingTime || "00:00:00"}
                </Text>
                <TouchableOpacity
                  style={{
                    marginLeft: "auto",
                  }}
                  onPress={() => {
                    setClockModalVisible(false);
                    setIsClockModalVisible(false);
                  }}
                >
                  <Icon name="close" size={25} color="#000" />
                </TouchableOpacity>

              </View>
            </View>
          </Modal>
          <Modal
            transparent={true}
            visible={isAppearModalVisible}
            animationType="slide"
            onRequestClose={() => closeModalWithoutSelection()}
          >
            <View style={styles.modalContainer}>
              <Animated.View style={[styles.modalContent, { opacity }]}>

                <View style={{
                  flexDirection: "row",
                }}>
                  <Text style={styles.title}>Select Time</Text>
                  <TouchableOpacity
                    style={{
                      marginLeft: "auto",
                    }}
                    onPress={() => closeModalWithoutSelection()}
                  >
                    <Icon name="close" size={25} color="#000" />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: 'bold' }}>HH</Text>
                  <Text style={{ fontWeight: 'bold' }}>MM</Text>
                  <Text style={{ fontWeight: 'bold' }}>SS</Text>
                </View>

                <View style={styles.pickerContainer}>

                  <ScrollView style={styles.picker}>
                    {hours.map((hour, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedHour(hour)}
                        style={[
                          styles.pickerItem,
                          selectedHour === hour && styles.selectedItem,
                        ]}
                      >
                        <Text style={styles.pickerText}>{hour}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={styles.separator}>:</Text>
                  <ScrollView style={styles.picker}>
                    {minutes.map((minute, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedMinute(minute)}
                        style={[
                          styles.pickerItem,
                          selectedMinute === minute && styles.selectedItem,
                        ]}
                      >
                        <Text style={styles.pickerText}>{minute}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={styles.separator}>:</Text>
                  <ScrollView style={styles.picker}>
                    {seconds.map((period, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedSecond(period)}
                        style={[
                          styles.pickerItem,
                          selectedSecond === period && styles.selectedItem,
                        ]}
                      >
                        <Text style={styles.pickerText}>{period}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {showError && (<Text style={{
                    color: 'red',
                    fontSize: 16,
                  }}>* Please select a valid time</Text>)}
                  <TouchableOpacity onPress={() => {
                    setSelectedTime(true);
                    handleTimeSelection();
                  }} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Select</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>
          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={{
                    top: -10,
                    marginLeft: "auto",
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="close" size={25} color="#000" />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    fontFamily: "Roboto-Regular",
                    color: "#000000",
                    alignSelf: "center",
                    marginBottom: 20,
                  }}
                >
                  {i18n.t("global.earnOnePointActions")}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.attendA")}{" "}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        fontFamily: "Roboto-Regular",
                        color: "#000000",
                      }}
                    >
                      {i18n.t("global.Hootsa")}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.createA")}{" "}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        fontFamily: "Roboto-Regular",
                        color: "#000000",
                      }}
                    >
                      {i18n.t("global.Hootsa")}
                    </Text>
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.attendA")}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        fontFamily: "Roboto-Regular",
                        color: "#000000",
                      }}
                    >
                      {i18n.t("global.HelloHangout")}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    {i18n.t("global.shareA")}{" "}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        fontFamily: "Roboto-Regular",
                        color: "#000000",
                      }}
                    >
                      {i18n.t("global.newsayhello")}
                    </Text>
                  </Text>
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    fontFamily: "Roboto-Regular",
                    color: "#000000",
                    marginBottom: 20,
                    marginTop: 20,
                    lineHeight: 20,
                  }}
                >
                  {i18n.t("global.pointOneText")}
                </Text>
              </View>
            </View>
          </Modal>
        </ScrollView >
      </View >
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  bannertext: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    alignSelf: "center",
    marginBottom: 10,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  notiftext: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
    color: "#000000",
    fontFamily: "Roboto-Regular",
  },
  pointstext: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
    color: "#000000",
    fontFamily: "Roboto-Regular",
    flex: 1,
  },
  pointsstyle: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    fontFamily: "Roboto-Bold",
    flex: 1,
    backgroundColor: "#F7CC7F",
    borderRadius: 6,
    padding: 6,
  },
  handheart: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 40,
    height: 40,
  },
  boxcontainer: {
    borderRadius: 15,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    width: 70,
  },
  innertext: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  hellohang: {
    resizeMode: "contain",
    alignSelf: "center",
    width: "40%",
    marginTop: 5,
  },
  hangoutbox: {
    width: "90%",
    padding: 4,
    paddingHorizontal: 22,
    marginHorizontal: 22,
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  pricebox: {
    width: "90%",
    paddingHorizontal: 22,
    marginHorizontal: 22,
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
  },
  searchInput: {
    marginLeft: 15,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    width: "91%",
    marginBottom: 10,
    paddingLeft: 10,
    height: 40
  },
  searchIcon: {
    position: "relative",
    left: -10,
  },
  hangout: {
    resizeMode: "contain",
    // width: "60%",
    width: wp("40%"),
    height: hp("5%"),
  },
  hangoutimage: {
    resizeMode: "contain",
    // width: "60%",
    width: wp("40%"),
    height: hp("5.9%"),
  },
  profileImage: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    borderRadius: 25,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: "90%",
    padding: 15,
    backgroundColor: "#ccc",
    borderRadius: 10,
    // alignItems: "center",
  },
  clockmodalContent: {
    width: "90%",
    padding: 15,
    backgroundColor: "#ccc",
    borderRadius: 10,
    flexDirection: 'row',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    flex: 1,
    height: 150,
  },
  pickerItem: {
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: "white",
    borderRadius: 5,
  },
  pickerText: {
    fontSize: 20,
  },
  separator: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    width: 120,
    height: 40,
    borderRadius: 5,
    alignItems: "center",
    display: 'flex',
    justifyContent: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  remainingTimeText: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 'auto',
  },
});

