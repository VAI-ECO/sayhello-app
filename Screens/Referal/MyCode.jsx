import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Share,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import ConnectionHeader from "../../Component/ConnectionHeader";
import { useAuth } from "../../Context/AuthContext";
import userService from "../../Services/userService";
import i18n from "../../Context/i18n";

const MyCode = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const from = route?.params?.from;

  const { user, updateUser } = useAuth();
  const [inputCode, setInputCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateNewCode = () => {
    setIsLoading(true);
    let bodySend = { code: inputCode.trim() };
    userService
      .getNewReferalCodeGenrate(user.user._id, bodySend)
      .then((res) => {
        const updates = {
          referalCode: res?.referalCode,
        };
        updateUser(updates);
        setInputCode("");
      })
      .catch((err) => {
        console.error(err);
        Toast.show({
          type: "error",
          text1: "Referral code already taken.",
          autoHide: true,
          visibilityTime: 5000,
        });
        setInputCode("");
      })
      .finally(() => setIsLoading(false));
  };

  const handleShareCode = async () => {
    const code = user.user.referalCode;
    const url = `https://say-hello-882cc.web.app/SignUp/${code}`;
    try {
      await Share.share({
        message: `Unlock exclusive benefits with my referral code: ${code}! 🎉\n${url}`,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Share failed",
        autoHide: true,
        visibilityTime: 5000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ConnectionHeader handleBack={() => navigation.navigate(from)} />

      <View style={{ paddingTop: 10 }}>
        <LinearGradient
          colors={["#F7CC7F", "#F60F0F"]}
          style={styles.hangoutbox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.innertext}>{i18n.t("global.myCode")}</Text>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
        <Text style={styles.codetext}>{user?.user?.referalCode || "—"}</Text>

        {/* Input for user-entered code */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your 10-char code"
            value={inputCode}
            onChangeText={setInputCode}
            maxLength={10}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.postButtonContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <TouchableOpacity
              disabled={!inputCode.trim()}
              onPress={generateNewCode}
            >
              <LinearGradient
                colors={["#2AC327", "#7C7C7C"]}
                style={[
                  styles.postbtn,
                  !inputCode.trim() && styles.disabledBtn,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.posttext}>
                  {i18n.t("global.generateNewCode")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              disabled={!user?.user?.referalCode}
              onPress={handleShareCode}
            >
              <LinearGradient
                colors={["#2AC327", "#7C7C7C"]}
                style={[
                  styles.postbtn,
                  !user?.user?.referalCode && styles.disabledBtn,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.posttext}>
                  {i18n.t("global.shareMyCode")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyCode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 46,
  },
  hangoutbox: {
    width: "90%",
    padding: 14,
    paddingHorizontal: 22,
    marginHorizontal: 22,
    borderRadius: 15,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  innertext: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  codetext: {
    fontSize: 22,
    fontWeight: "900",
    fontFamily: "Roboto-Bold",
    color: "#262627",
    textAlign: "center",
    marginTop: 80,
  },
  inputWrapper: {
    width: "90%",
    alignSelf: "center",
    marginTop: 30,
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
  },
  postButtonContainer: {
    width: "60%",
    paddingHorizontal: 22,
    alignSelf: "center",
    paddingTop: 40,
  },
  postbtn: {
    width: "100%",
    padding: 17,
    borderRadius: 15,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  posttext: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Roboto-Bold",
    color: "#000000",
    textAlign: "center",
  },
});
