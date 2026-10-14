import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Linking,
  ImageBackground,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import ProfileHeader from "../../Component/ProfileHeader";
import { LinearGradient } from "expo-linear-gradient";
import BeyondHelloService from "../../Services/BeyondHelloService";
import BeyondHeader from "../../Component/BeyondHeader";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import i18n from "../../Context/i18n";

const BeyondHello = () => {
  const [agencies, setAgencies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const getDetails = () => {
    BeyondHelloService.getAgencies()
      .then((res) => {
        setAgencies(res);
      })
      .catch((err) => {
        console.log("Err: ", err);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      getDetails();
    }, [navigation])
  );

  const handleDonatePress = (link) => {
    Linking.openURL(link);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([getDetails()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}  progressViewOffset={50}/>
          }
        >
      <ImageBackground
        source={require("../../assets/ImageBackground.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <ProfileHeader />
          <LinearGradient
            colors={["#EAE3376B", "#EAE3376B"]}
            style={styles.circlecontainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0 }}
          >
            <Image
              style={styles.icon}
              source={require("../../assets/hnadheart.png")}
            />
            <Text allowFontScaling={false} style={styles.innertext}>
              {i18n.t("global.beyondHello")}
            </Text>
          </LinearGradient>
          <View style={styles.topNegativeMargin}>
            <View style={styles.headerRow}>
              <Image
                style={styles.adobeStock}
                source={require("../../assets/AdobeStock.png")}
              />
              <Image
                style={styles.adobe}
                source={require("../../assets/Adobe.png")}
              />
            </View>
            <BeyondHeader />
            <View style={styles.agencyListContainer}>
              <View style={styles.selectcontainer}>
                {agencies &&
                  agencies?.map((item) => (
                    <View key={item?._id} style={styles.agencyRow}>
                      <Image
                        style={styles.aLS}
                        source={require("../../assets/Als.png")}
                      />
                      <TouchableOpacity
                        onPress={() => handleDonatePress(item?.link)}
                        style={styles.donatebox}
                      >
                        <Text allowFontScaling={false} style={styles.donateText}>
                          {i18n.t("global.donate")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
      </ScrollView>
    </View>
  );
  
};

export default BeyondHello;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    top: 0,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  circlecontainer: {
    width: 95,
    height: 95,
    borderRadius: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 45,
    height: 45,
  },
  innertext: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold",
    color: "#000000",
  },
  topNegativeMargin: {
    top: -100,
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  adobeStock: {
    resizeMode: "contain",
    alignSelf: "center",
    height: "65%",
  },
  adobe: {
    resizeMode: "contain",
    alignSelf: "center",
    width: "33%",
  },
  agencyListContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  selectcontainer: {
    borderRadius: 5,
    backgroundColor: "#D9D9D945",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    marginBottom: 12,
    paddingLeft: 20,
    justifyContent: "center",
    borderWidth: 1,
  },
  agencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 13,
    alignItems: "center",
  },
  aLS: {
    resizeMode: "contain",
    width: 70,
    height: 70,
  },
  donatebox: {
    padding: 3,
    backgroundColor: "#338AFF",
    width: "47%",
    borderRadius: 6,
    justifyContent: "center",
    borderWidth: 1,
    paddingVertical: 14,
  },
  donateText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Bold",
    color: "#fff",
    textAlign: "center",
  },
});
