import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfileHeader from "../../Component/ProfileHeader";
import { AntDesign, EvilIcons } from "@expo/vector-icons";
import ImageSlider from "../../Screens/Home/ImageSlider";
import { LinearGradient } from "expo-linear-gradient";
import HoostaService from "../../Services/HoostaService";
import { useAuth } from "../../Context/AuthContext";
import i18n from "../../Context/i18n";

const HappeningDetailsHoosta = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;

  const data = router?.params?.data;
  console.log(from, from2, pathname, "p3");
  const [isHeartSelected, setIsHeartSelected] = useState(false);

  const uniquePhotos = [
    ...new Set(data?.details?.photos?.filter((photo) => photo !== null)),
  ];

  useEffect(() => {
    if (user?.likesEvents?.includes(data?.details?._id)) {
      setIsHeartSelected(true);
    }
  }, [user, data]);

  const handleLikeEvent = () => {
    setIsHeartSelected(!isHeartSelected);

    const action = !isHeartSelected ? "like" : "unlike";
    console.log(action);

    let bodySubmit = {
      userId: user?.user?._id,
      hoostaId: data?.details?._id,
    };

    HoostaService.addlikeEvent(bodySubmit)
      .then((res) => {
        console.log("Res: ", res);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };

  const handleBack = () => {
    navigation.navigate(from2, { from: from });
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={{ marginBottom: 10 }}>
            <ProfileHeader handleBack={handleBack} />
          </View>
          <ImageSlider images={uniquePhotos} />
          <View style={{ paddingTop: 20, marginHorizontal: 22 }}>
            <View style={styles.headerSection}>
              <Text style={styles.name}>{data?.details?.name || "N/A"}</Text>
              <TouchableOpacity onPress={handleLikeEvent}>
                <AntDesign
                  name="heart"
                  size={22}
                  color={isHeartSelected ? "#F01717" : "blue"}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <EvilIcons name="location" size={20} color="black" />
              <Text style={styles.infoText}>
                {data?.details?.city || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <EvilIcons name="clock" size={20} color="black" />
              <Text style={styles.infoText}>
                {data?.details?.startTime || "N/A"}
              </Text>
            </View>
          </View>
          <View style={{ paddingTop: 20, marginHorizontal: 22 }}>
            <Text style={styles.sectionTitle}>
              {i18n.t("global.description")}
            </Text>
            <Text style={styles.descriptionText}>
              {data?.details?.description || "No description available."}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default HappeningDetailsHoosta;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginBottom: 3,
  },
  descriptionText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    lineHeight: 20,
  },
  attendBtn: {
    width: "30%",
    height: 45,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 90,
  },
  btnContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#fff",
  },
});
