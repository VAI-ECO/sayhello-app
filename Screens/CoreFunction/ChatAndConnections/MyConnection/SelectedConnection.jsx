import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../../../Context/AuthContext";
import ConnectionHeader from "../../../../Component/ConnectionHeader";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "../../../../Context/i18n";

const SelectedConnection = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const pathname = route?.name;
  console.log(pathname, "p1");

  console.log(user?.user?.user_type, "user-type----->")

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ImageBackground
          source={require("../../../../assets/ImageBackground.jpg")}
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            flex: 1,
            left: 0,
            top: 0,
          }}
        >
          <View style={styles.container}>
            <ConnectionHeader />
            {/* <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}> */}
            {user?.user?.user_type === "individual" && (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate("HoostaUserDeails", { from: pathname })}
                  style={{ paddingTop: "13%" }}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.ourHootsas")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("NotificationsUserDeails", { from: pathname })}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.ourHollas")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("DiscountUserDeails", { from: pathname })}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.ourHookups")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {(user?.user?.user_type === "organization" ||
              user?.user?.user_type === "group") && (
                <>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("HoostaUserDeails", { from: pathname })}
                    style={{ paddingTop: "13%" }}
                  >
                    <LinearGradient
                      colors={["#F7CC7F", "#F60F0F"]}
                      style={styles.hangoutbox}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text allowFontScaling={false} style={styles.innertext}>
                        {i18n.t("global.ourHootsas")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("NotificationsUserDeails", { from: pathname })}
                  >
                    <LinearGradient
                      colors={["#F7CC7F", "#F60F0F"]}
                      style={styles.hangoutbox}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text allowFontScaling={false} style={styles.innertext}>
                        {i18n.t("global.ourHollas")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("DiscountUserDeails", { from: pathname })}
                  >
                    <LinearGradient
                      colors={["#F7CC7F", "#F60F0F"]}
                      style={styles.hangoutbox}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text allowFontScaling={false} style={styles.innertext}>
                        {i18n.t("global.ourHookups")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

            {user?.user?.user_type === "influencer" && (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ReferalRewardUser", { from: pathname })}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.ourCommissions")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("MySignups", { from: pathname })}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.mySignUps")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("MyCode", { from: pathname })}>
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.myCode")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {user?.user?.user_type === "business" && (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate("HoostaUserDeails", { from: pathname })}
                  style={{ paddingTop: "13%" }}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.ourHootsas")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("DiscountUserDeails", { from: pathname })}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.ourDiscounts")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("NotificationsUserDeails", { from: pathname })}
                >
                  <LinearGradient
                    colors={["#F7CC7F", "#F60F0F"]}
                    style={styles.hangoutbox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text allowFontScaling={false} style={styles.innertext}>
                      {i18n.t("global.ourHollas")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {user?.user?.user_type === "individual" &&
              user?.user?.isAmbesdor && (
                <>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("ReferalSignups", { from: pathname })}
                  >
                    <LinearGradient
                      colors={["#F7CC7F", "#F60F0F"]}
                      style={styles.hangoutbox}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text allowFontScaling={false} style={styles.innertext}>
                        {i18n.t("global.signedHangouts")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("ReferalRewardUser", { from: pathname })}
                  >
                    <LinearGradient
                      colors={["#F7CC7F", "#F60F0F"]}
                      style={styles.hangoutbox}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text allowFontScaling={false} style={styles.innertext}>
                        {i18n.t("global.ourCommissions")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

            {/* {user?.user?.user_type === "individual" &&
              !user?.user?.isAmbesdor && (
                <>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("HoostaUserDeails")}
                    style={{ paddingTop: "13%" }}
                  >
                    <LinearGradient
                      colors={["#F7CC7F", "#F60F0F"]}
                      style={styles.hangoutbox}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text allowFontScaling={false} style={styles.innertext}>
                        Our Hootsa’s
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )} */}

            {/* 
          <TouchableOpacity
            onPress={() => navigation.navigate("HoostaUserDeails")}
            style={{ paddingTop: "13%" }}
          >
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutbox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                Our Hootsa’s
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("DiscountUserDeails")}
          >
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutbox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                Our Discounts
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationsUserDeails")}
          >
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutbox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                Our Notifications
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ReferalRewardUser")}
          >
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutbox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                Our Commissions
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ReferalSignups")}
          >
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutbox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                Signed Hangouts
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("MySignups")}>
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutbox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                My Sign Ups
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("MyCode")}>
            <LinearGradient
              colors={["#F7CC7F", "#F60F0F"]}
              style={styles.hangoutbox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text allowFontScaling={false} style={styles.innertext}>
                My Code
              </Text>
            </LinearGradient>
          </TouchableOpacity> */}
            {/* </ScrollView> */}
          </View>
          <View style={styles.postButtonContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SelectedPosting", { from: pathname })}
            >
              <LinearGradient
                colors={["#2AC327", "#7C7C7C"]}
                style={styles.postbtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text allowFontScaling={false} style={styles.innertext}>
                  Post
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

export default SelectedConnection;

const styles = StyleSheet.create({
  container: {
    flex: 1,

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
    marginBottom: 15,
  },
  innertext: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  postButtonContainer: {
    width: "100%",
    padding: 10,
    paddingHorizontal: 22,
  },
  postbtn: {
    width: "100%",
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
  },
});
