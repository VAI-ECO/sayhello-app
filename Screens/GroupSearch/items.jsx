import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from "react-native";
import {
  Feather,
  EvilIcons,
  MaterialCommunityIcons,
  AntDesign,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AppConfig from "../../AppConfig";
import { useAuth } from "../../Context/AuthContext";
import i18n from "../../Context/i18n";

const Items = ({ item, visibleImageId, toggleImageVisibility }) => {
  const { user, updateUser } = useAuth();
  // console.log("user:", user?.user?.groupIds.includes(item?._id));

  const handlePhoneCall = (phone) => {
    const phoneNumber = `tel:${phone}`;
    Linking.openURL(phoneNumber).catch((err) =>
      console.error("Failed to open dialer:", err)
    );
  };

  const handleOpenMap = (address) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(mapUrl).catch((err) =>
      console.error("Failed to open Google Maps:", err)
    );
  };

  const handleNotifyMe = async (item, groupId) => {
    console.log("item type: ", item?.type);
    if (item?.type === "group") {
      try {
        let ApiUrl = `${AppConfig.ApiUrl}api/v1/users/add-group-ids`;

        let user_group_ids = [...user?.user?.groupIds, groupId];

        let body = {
          userId: user?.user?._id,
          groupIds: user_group_ids,
        };

        console.log("user_group_ids:", user_group_ids);

        await axios
          .post(ApiUrl, body)
          .then((res) => {
            console.log("groupaAdded");

            const updates = {
              groupIds: user_group_ids,
            };
            updateUser(updates);
          })
          .catch((err) => console.log(err));
      } catch (error) {
        console.log("Error notification: ", error);
      }
    } else {
      try {
        let ApiUrl = `${AppConfig.ApiUrl}api/v1/users/add-organization-ids`;

        let orgazation_ids = [...user?.user?.organizationIds, groupId];

        let body = {
          userId: user?.user?._id,
          organizationIds: orgazation_ids,
        };
        // console.log("organizationIds:", orgazation_ids);

        await axios
          .post(ApiUrl, body)
          .then((res) => {
            console.log("orgazation_ids", res.data);

            const updates = {
              organizationIds: res.data?.user?.organizationIds,
            };
            updateUser(updates);
          })
          .catch((err) => console.log(err));
      } catch (error) {
        console.log("Error notification: ", error);
      }
    }
  };

  const handleEmailOnpen = (email) => {
    const url = `mailto:${email}`;
    Linking.openURL(url).catch((err) => {
      console.error(
        "An error occurred while trying to open the email client:",
        err
      );
    });
  };

  return (
    <View key={item?._id} style={styles.detailscontainer}>
      <View style={styles.innerContainer}>
        <Image style={styles.mainicon} source={{ uri: item?.photosarray[0] }} />
        <View style={{ marginLeft: 5, flex: 1 }}>
          <Text allowFontScaling={false} style={styles.nameText}>
            {item?.name}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => toggleImageVisibility(item?._id)}>
          <View style={styles.appleinercontainer}>
            <Feather name="minimize" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleOpenMap(`${item?.address} in ${item?.city}`)}
        >
          <View style={styles.appleinercontainer}>
            <EvilIcons name="location" size={26} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePhoneCall(item?.phone)}>
          <View style={styles.appleinercontainer}>
            <Feather name="phone-call" size={19} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleImageVisibility(item?._id)}>
          <View style={styles.appleinercontainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={23}
              color="#fff"
            />
          </View>
        </TouchableOpacity>
      </View>
      {visibleImageId === item?._id && (
        <View>
          {item?.photosarray ? (
            <Image
              style={styles.mainimage}
              source={{ uri: item?.photosarray && item?.photosarray[0] }}
              // source={require("../../assets/alscat.png")}
            />
          ) : (
            <Image
              style={styles.mainimage}
              source={require("../../assets/alscat.png")}
              // source={{uri: item?.photosarray[0]}}
            />
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 8,
            }}
          >
            <LinearGradient
              colors={["#F01717", "#F01717"]}
              style={styles.buton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
            >
              {user?.user?.groupIds.includes(item?._id) ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons
                      name="notifications-active"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 5 }}
                    />
                    <Text allowFontScaling={false} style={styles.textbtn}>
                      {i18n.t("global.notified")}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => handleNotifyMe(item, item?._id)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <MaterialIcons
                        name="notifications-active"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 5 }}
                      />
                      <Text allowFontScaling={false} style={styles.textbtn}>
                        {i18n.t("global.notifyMe")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </LinearGradient>
            <View style={styles.alscontainer}>
              <AntDesign name="heart" size={20} color="#fff" />
            </View>
            <View style={styles.alscontainer}>
              <FontAwesome5 name="people-arrows" size={20} color="#fff" />
            </View>
            <View style={styles.alscontainer}>
              <Image
                style={{ resizeMode: "contain", height: 20 }}
                source={require("../../assets/alshand.png")}
              />
            </View>
            {/* <View style={styles.alscontainer}>
                <AntDesign name="sharealt" size={23} color="#fff" />
              </View> */}
          </View>
          <View
            style={{
              padding: 10,
              backgroundColor: "#E7F7F3",
              borderRadius: 8,
              marginHorizontal: 5,
              borderWidth: 1,
              borderColor: "#008767",
              marginBottom: 15,
              marginTop: 10,
            }}
          >
            <Text allowFontScaling={false} style={styles.text}>
              {item?.description}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 10,
              marginBottom: 10,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 16,
                fontWeight: "bold",
                fontFamily: "Roboto-Regular",
                color: "#262627",
                flex: 1,
              }}
            >
              {i18n.t("global.address")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 13,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#262627",
                flex: 1,
              }}
            >
              {item?.address} , {item?.state} , {item?.zipcode}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 10,
              marginBottom: 10,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 16,
                fontWeight: "bold",
                fontFamily: "Roboto-Regular",
                color: "#262627",
                flex: 1,
              }}
            >
              {i18n.t("global.phoneNumber")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 13,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#262627",
                flex: 1,
              }}
            >
              {item?.phone}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 10,
              marginBottom: 10,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 16,
                fontWeight: "bold",
                fontFamily: "Roboto-Regular",
                color: "#262627",
                flex: 1,
              }}
            >
              {i18n.t("global.email")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 13,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#262627",
                flex: 1,
              }}
            >
              {item?.email}
            </Text>
          </View>

          <View
            style={{
              padding: 7,
              backgroundColor: "#E7F7F3",
              borderRadius: 8,
              marginHorizontal: 5,
              borderWidth: 1,
              borderColor: "#008767",
              marginBottom: 10,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 16,
                fontWeight: "900",
                fontFamily: "Roboto-Regular",
                color: "#262627",
                textAlign: "center",
              }}
            >
              {i18n.t("global.social")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            {item?.socialLinks
              ?.filter((els) => els?.link !== "")
              ?.map((social, index) => (
                <TouchableOpacity key={index}>
                  {social?.type === "Facebook" && (
                    <FontAwesome5
                      name="facebook"
                      size={30}
                      color="#338AFF"
                      style={{ marginRight: 10 }}
                    />
                  )}
                  {social?.type === "Instagram" && (
                    <FontAwesome5
                      name="instagram"
                      size={30}
                      color="#338AFF"
                      style={{ marginRight: 10 }}
                    />
                  )}
                  {social?.type === "TikTok" && (
                    <FontAwesome5
                      name="tiktok"
                      size={30}
                      color="#338AFF"
                      style={{ marginRight: 10}}
                    />
                  )}
                  {social?.type === "YouTube" && (
                    <FontAwesome5
                      name="youtube"
                      size={30}
                      color="#338AFF"
                      style={{ marginRight: 10 }}
                    />
                  )}
                  {social?.type === "LinkedIn" && (
                    <FontAwesome5
                      name="linkedin"
                      size={30}
                      color="#338AFF"
                      style={{ marginRight: 10 }}
                    />
                  )}
                  {social?.type === "Twitter" && (
                    <FontAwesome5
                      name="twitter"
                      size={30}
                      color="#338AFF"
                      style={{ marginRight: 10 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default Items;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 45,
  },
  detailscontainer: {
    borderRadius: 6,
    marginHorizontal: 22,
    borderColor: "#000000",
    marginBottom: 10,
    borderWidth: 1,
    padding: 3,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 5,
  },
  mainicon: {
    width: 50,
    height: 50,
    resizeMode: "cover",
    alignSelf: "center",
    marginRight: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  appleinercontainer: {
    backgroundColor: "#338AFF",
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 8,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  alscontainer: {
    backgroundColor: "#F01717",
    height: 35,
    width: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 8,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#262627",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  mainimage: {
    width: "95%",
    resizeMode: "contain",
    alignSelf: "center",
  },
  buton: {
    width: "30%",
    height: 35,
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    marginLeft: 5,
  },
  textbtn: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    lineHeight: 20,
    marginHorizontal: 5,
  },
  dayTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#262627",
  },
});
