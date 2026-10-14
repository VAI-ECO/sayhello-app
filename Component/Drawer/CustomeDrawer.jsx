import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Share,
  Modal,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import Divider from "../Divider";
import { useNavigation } from "@react-navigation/native";
import CustomSwitch from "../../Component/Drawer/CustomSwitch";
import { useAuth } from "../../Context/AuthContext";
import userService from "../../Services/userService";
import { DrawerActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppConfig from "../../AppConfig";
import axios from "axios";
import requests from "../../Services/httpservice";

const StatusBarHeight = Constants.statusBarHeight;

const CustomDrawer = (props) => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const userId = user.user._id;
  const { signOut } = useAuth();
  const [showSubcategories, setShowSubcategories] = useState(false);

  const [isLoadingGeneral, setIsLoadingGeneral] = useState(false);
  const [isLoadingDating, setIsLoadingDating] = useState(false);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImageUri, setProfileImageUri] = useState(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    let body = {
      email: user?.user?.email,
      latitude: 0.0,
      longitude: 0.0,
    };


    try {
      await requests.post(`${AppConfig.ApiUrl}api/v1/users/saveLocation`, body);
      console.log("body is: ", body)
    } catch (err) {
      console.log("Error in saveLocation:", err);
    } finally {
      navigation.dispatch(DrawerActions.closeDrawer());
      await signOut();
      setIsLoggingOut(false);
    }
  };

  const toggleSubcategories = () => {
    setShowSubcategories(!showSubcategories);
  };

  const ApiFunctionGeneral = async (statusGeneral) => {
    setIsLoadingGeneral(true);
    userService
      .updateUserGeneralNotification(user?.user?._id)
      .then(async (res) => {
        const updates = {
          isGeneralNotification: res?.user?.isGeneralNotification,
        };
        updateUser(updates);
        setIsLoadingGeneral(false);
      })
      .catch((err) => {
        setIsLoadingGeneral(false);
        console.log(err);
      });
  };
  const ApiFunctionDating = async (statusGeneral) => {
    setIsLoadingDating(true);
    userService
      .updateDattingNotification(user?.user?._id)
      .then(async (res) => {
        const updates = {
          isDatingNotification: res.user.isDatingNotification,
        };
        updateUser(updates);
        setIsLoadingDating(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoadingDating(false);
      });
  };

  const ApiFunctionBusiness = async (statusGeneral) => {
    setIsLoadingBusiness(true);
    userService
      .updateBussinessNotification(user?.user?._id)
      .then(async (res) => {
        const updates = {
          isBusinessNotification: res.user.isBusinessNotification,
        };
        updateUser(updates);
        setIsLoadingBusiness(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoadingBusiness(false);
      });
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Discover the world of SayHello. Stay connected, organized, and productive with our user-friendly interface and powerful features. Download now!  ${user?.user?.Applink}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          await userService
            .shareAppPoints(user?.user?._id)
            .then((res) => {
              console.log("res: ", res);
            })
            .catch((err) => {
              console.log("err on shareAppPoints: ", err);
            });
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      console.log("Error on share acion: ", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userData = await userService.getUserById(userId);
        setUsername(userData?.username);
        setProfileImageUri(userData?.profileUrl)
      }
      else if (user) {
        setUsername(user?.user?.username);
        setProfileImageUri(user?.user?.profileUrl)
      }
    }

    fetchUserData();
  }, [user, userId]);

  return (
    <>
      <Modal
        visible={isLoggingOut}
        transparent={true}
        animationType="fade"
        // onRequestClose={() => setIsLoggingOut(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#338AFF" />
            <Text style={styles.modalText}>Logging out...</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <View style={styles.titleContainer}>
          {profileImageUri === "" ? (
            <Image
              style={styles.profileImage}
              source={require("../../assets/qr/profile_img.png")}
            />
          ) : (
            <Image
              style={styles.profileImage}
              source={{ uri: profileImageUri }}
            />
          )}

          <Text
            allowFontScaling={false}
            style={{
              fontSize: 16,
              color: "#000000",
              fontFamily: "Roboto-Regular",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {username}
          </Text>
        </View>
        <DrawerContentScrollView {...props}>
          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() => navigation.navigate("Main", { screen: "EditProfile" })}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Profile
              </Text>
              <AntDesign name="right" size={16} color="#fff" />
            </View>
            <Divider />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() => navigation.navigate("Main", { screen: "ShowWallet" })}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Wallets
              </Text>
              <AntDesign name="right" size={16} color="#fff" />
            </View>
            <Divider />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() => navigation.navigate("Main", { screen: "MapScreen" })}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Hello Map
              </Text>
              <AntDesign name="right" size={16} color="#CCCCCC" />
            </View>
            <Divider />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() => navigation.navigate("Main", { screen: "WhatsHappening" })}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                What’s Happening
              </Text>
              <AntDesign name="right" size={16} color="#CCCCCC" />
            </View>
            <Divider />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() => navigation.navigate("Main", { screen: "Connections" })}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Connections/Chats
              </Text>
              <AntDesign name="right" size={16} color="#CCCCCC" />
            </View>
            <Divider />
          </TouchableOpacity> */}

          {user?.user?.user_type === "individual" && (
            <>
              <TouchableOpacity
                style={{ backgroundColor: "transparent" }}
                onPress={toggleSubcategories}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 25,
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 16,
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    Connection notification
                  </Text>
                  <AntDesign
                    name={showSubcategories ? "up" : "down"}
                    size={16}
                    color="#CCCCCC"
                  />
                </View>
                <Divider />
              </TouchableOpacity>
              {showSubcategories && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 35,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => console.log("General")}
                      style={styles.subcategory}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.subcategoryText}
                      >
                        General
                      </Text>
                      <CustomSwitch
                        value={user?.user?.isGeneralNotification}
                        onValueChange={ApiFunctionGeneral}
                        isLoading={isLoadingGeneral}
                      />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 35,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => console.log("Dating")}
                      style={styles.subcategory}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.subcategoryText}
                      >
                        Dating
                      </Text>
                      <CustomSwitch
                        value={user?.user?.isDatingNotification}
                        onValueChange={ApiFunctionDating}
                        isLoading={isLoadingDating}
                      />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 35,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => console.log("Business")}
                      style={styles.subcategory}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.subcategoryText}
                      >
                        Business
                      </Text>
                      <CustomSwitch
                        value={user?.user?.isBusinessNotification}
                        onValueChange={ApiFunctionBusiness}
                        isLoading={isLoadingBusiness}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}

          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() => {
              onShare();
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Share App
              </Text>
              <AntDesign name="right" size={16} color="#CCCCCC" />
            </View>
            <Divider />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() => navigation.navigate("SupportScreen")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Get Support
              </Text>
              <AntDesign name="right" size={16} color="#CCCCCC" />
            </View>
            <Divider />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() => navigation.navigate("DeleteAccount")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Delete Account
              </Text>
              <AntDesign name="right" size={16} color="#CCCCCC" />
            </View>
            <Divider />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() =>
              navigation.navigate("MySettings", { screen: "SettingScreen" })
            }
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Settings
              </Text>
              <AntDesign name="right" size={16} color="#CCCCCC" />
            </View>
            <Divider />
          </TouchableOpacity>

          {/* {user?.user?.user_type === "individual" && (
          <TouchableOpacity
            style={{ backgroundColor: "transparent" }}
            onPress={() =>
              navigation.navigate("MySettings", { screen: "SettingScreen" })
            }
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 25,
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 16,
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                }}
              >
                Settings
              </Text>
              <AntDesign name="right" size={16} color="#CCCCCC" />
            </View>
            <Divider />
          </TouchableOpacity>
        )} */}
          {/* <View style={{ padding: 25 }}>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Regular",
                color: "#000000",
                fontSize: 16,
              }}
            >
              App Version: 2.5
            </Text>
          </View> */}
        </DrawerContentScrollView>
        <View style={{ padding: 25 }}>
          <TouchableOpacity onPress={handleLogout}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="login"
                size={24}
                color="#000000"
                style={{ transform: [{ rotate: "180deg" }] }}
              />
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  color: "#000000",
                  fontSize: 16,
                }}
              >
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBarHeight,
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingTop: 15,
  },
  titleContainer: {
    alignSelf: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 8,
  },
  subcategory: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  subcategoryText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 200,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
    fontFamily: "Roboto-Regular",
  },
  logoutText: {
    fontFamily: "Roboto-Regular",
    color: "#000000",
    fontSize: 16,
  },
});
