import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  ImageBackground,
  Image,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../Context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../../Context/i18n";
import Loader from "../../Component/Loader";
import { LinearGradient } from "expo-linear-gradient";
import AuthServices from "../../Services/authService";
import userService from "../../Services/userService";
import CustomePhoneInput from '../../Component/CustomePhoneInput';
import Toast from "react-native-toast-message";
import LocationPermissionModal from "../../Component/LocationPermissionModal";

const EditProfile = ({ route }) => {
  const { signOut, user } = useAuth();
  const { userId } = route.params || {};
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nickName, setNickName] = useState("");
  const [username, setUsername] = useState("");
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const goBack = () => {
    if (userId) {
      navigation.navigate("SearchFilter");
    }
    else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = user.user._id;
      if (user && userId) {
        try {
          const response = await AuthServices.getUserById(userId);
          const { firstname, lastname, username, nickname, phonenumber, email, profileUrl } = response;
          setEmail(email);
          setName(`${firstname} ${lastname}`);
          setPhoneNumber(phonenumber);
          setNickName(nickname);
          setUsername(username);
          setProfileImageUri(profileUrl);
        } catch (error) {
          console.error("Error fetching user data:", error.response?.data || error.message);
          alert("Failed to load user data. Please try again.");
        }
      }
    };

    fetchUserData();
  }, []);


  const handleSave = async () => {
    if (!user || !user?.user?._id) return;
    const userId = user.user._id;
    const [firstname, ...lastnameParts] = name.trim().split(" ");
    const lastname = lastnameParts.join(" ");
    const body = {
      email,
      firstname,
      lastname,
      phoneNumber,
      nickname: nickName,
      username,
      profileUrl: profileImageUri,
    };

    setLoading(true);
    try {
      const response = await AuthServices.updateProfile(userId, body);
      Toast.show({
        type: "success",
        text1: "Profile updated successfully!",
        autoHide: true,
        visibilityTime: 5000,
      });
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      Toast.show({
        type: "error",
        text1: "Failed to update profile. Please try again.",
        autoHide: true,
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      setShowPermissionModal(true);
    }
    else {

      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!pickerResult.canceled) {
        const imageUri = pickerResult.assets[0]?.uri;
        if (imageUri) {
          setProfileImageUri(imageUri);
        }
        else {
          console.log("No valid URI found in the picker result");
        }
      };
    }

  }


  const handleSignOut = () => {
    signOut();
    navigation.navigate("Auth");
  };
  useEffect(() => {

    const fetchUserData = async () => {
      if (userId) {
        const userData = await userService.getUserById(userId);
        let name = `${userData?.firstname} ${userData?.lastname}`;
        setEmail(userData?.email);
        setName(name);
        setPhoneNumber(userData?.phonenumber);
        setNickName(userData?.nickname);
        setUsername(userData?.username);
        setProfileImageUri(userData?.profileUrl)
      }
      else if (user) {
        let name = `${user?.user?.firstname} ${user?.user?.lastname}`;
        setEmail(user?.user?.email);
        setName(name);
        setPhoneNumber(user?.user?.phonenumber);
        setNickName(user?.user?.nickname);
        setUsername(user?.user?.username);
        setProfileImageUri(user?.user?.profileUrl)
      }
    }

    fetchUserData();
  }, [user, userId]);

  const handlePermissionClose = () => {
    setShowPermissionModal(false);
  };

  const handlePermissionConfirm = async () => {
    setShowPermissionModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    handleImagePicker();
  };

  return (
    <>
      {showPermissionModal ? (
        <LocationPermissionModal
          visible={showPermissionModal}
          onClose={handlePermissionClose}
          onConfirm={handlePermissionConfirm}
        />
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View style={styles.container}>
                <View style={styles.headrecontainer}>
                  <TouchableOpacity onPress={goBack}>
                    <Image
                      style={{
                        width: 35,
                        height: 35,
                        resizeMode: "contain",
                      }}
                      source={require("../../assets/btnbtn.png")}
                    />
                  </TouchableOpacity>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 18,
                      fontWeight: "900",
                      fontFamily: "Roboto-Regular",
                      color: "#000000",
                    }}
                  >
                    Profile
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      navigation?.openDrawer();
                    }}
                  >
                    <Ionicons name="menu" size={28} color="black" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <ImageBackground
                    source={require("../../assets/ImageBackground.jpg")}
                    style={{
                      flex: 1,
                      position: "relative",
                      right: 0,
                      bottom: 0,
                      left: 0,
                      top: 0,
                    }}
                    resizeMode="cover"
                  >
                    <View style={{ flex: 1 }}>

                      <View
                        style={{
                          width: "18%",
                          alignSelf: "center",
                          marginTop: 30,
                        }}
                      >

                        {/* <View style={styles.circle}>
                    {user?.user?.profileUrl === "" ? (
                      <Image
                        style={styles.profileImage}
                        source={require("../../assets/profile_img.png")}
                      />
                    ) : (
                      <Image
                        style={styles.profileImage}
                        source={{ uri: profileImageUri }}
                      />
                    )}

                 
                  </View> */}

                        <View style={styles.circle}>
                          <Image
                            style={styles.profileImage}
                            source={profileImageUri ? { uri: profileImageUri } : require("../../assets/profile_img.png")}
                          />
                        </View>

                        <TouchableOpacity onPress={handleImagePicker} style={styles.cameraIconContainer}>
                          <Image
                            style={styles.cameraIcon}
                            source={require("../../assets/camera_icon.png")}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{ paddingTop: 10, paddingHorizontal: 22 }}>
                        <Text style={styles.label}>{i18n.t("global.name")}</Text>
                        <View style={styles.inputField}>
                          <TextInput
                            placeholder={i18n.t("global.enterName")}
                            style={styles.inputfieldinner}
                            value={name}
                            onChangeText={(text) => setName(text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor="#3C2828"
                            editable={userId ? false : true}
                          />
                        </View>

                        <Text style={styles.label}>{i18n.t("global.email")}</Text>
                        <View style={styles.inputField}>
                          <TextInput
                            placeholder="Enter email"
                            style={styles.inputfieldinner}
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoCompleteType="email"
                            placeholderTextColor="#3C2828"
                            editable={userId ? false : true}
                          />
                        </View>

                        <Text style={styles.label}>{i18n.t("global.phoneNumber")}</Text>
                        <View style={styles.inputField}>
                          <CustomePhoneInput
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder={i18n.t("global.phoneNumber")}
                            editable={userId ? false : true}
                          />
                          {/* <TextInput
                      placeholder={i18n.t("global.phoneNumber")}
                      style={styles.inputfieldinner}
                      value={phoneNumber}
                      onChangeText={(text) => setPhoneNumber(text)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor="#3C2828"
                      editable={userId? false : true}
                    /> */}
                        </View>

                        <Text style={styles.label}>{i18n.t("global.nickname")}</Text>
                        <View style={styles.inputField}>
                          <TextInput
                            placeholder={i18n.t("global.nickname")}
                            style={styles.inputfieldinner}
                            value={nickName}
                            onChangeText={(text) => setNickName(text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor="#3C2828"
                            editable={userId ? false : true}
                          />
                        </View>

                        <Text style={styles.label}>{i18n.t("global.username")}</Text>
                        <View style={styles.inputField}>
                          <TextInput
                            placeholder={i18n.t("global.username")}
                            style={styles.inputfieldinner}
                            value={username}
                            onChangeText={(text) => setUsername(text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor="#3C2828"
                            editable={userId ? false : true}
                          />
                        </View>
                      </View>

                      {/* Save Button */}
                      {userId ? (<></>) : (
                        <View style={styles.buttonContainer}>
                          <LinearGradient
                            colors={["#338AFF", "#00EDB4"]}
                            style={styles.button}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1.2, y: 0.6 }}
                          >
                            <TouchableOpacity
                              style={styles.buttonTouchable}
                              type="submit"
                              onPress={handleSave}
                            >
                              <Text allowFontScaling={false} style={styles.buttonText}>
                                {loading ? "Saving..." : "Save"}
                              </Text>
                            </TouchableOpacity>
                          </LinearGradient>
                        </View>
                      )}
                    </View>
                  </ImageBackground>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );

}
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  headrecontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 22,
  },
  circle: {
    width: 110,
    height: 110,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderColor: "#338AFF",
    borderWidth: 1,
    position: "relative",
    alignSelf: "center",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
  },
  inputContainer: {
    width: "80%",
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginBottom: 10,
    fontSize: 16,
    color: "#cccccc",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 24,
    right: -20,

  },
  cameraIcon: {
    height: 30,
    width: 30
  },
  inputField: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    marginBottom: 15,
    alignSelf: "center",
    alignItems: "center",
    paddingLeft: 13,
  },
  inputfieldinner: {
    flex: 1,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    fontSize: 16,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#3C2828",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  buttonTouchable: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    padding: 10,
  },
  button: {
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#fff",
  },
  label: {
    marginBottom: 6,
    color: "#707070",
    fontWeight: "400",
    fontSize: 17,
    fontFamily: "Inter-Regular",
  }

});
export default EditProfile;