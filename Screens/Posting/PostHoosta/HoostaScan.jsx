import {
  Image,
  ImageBackground,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import HoostaHeader from "../../../Component/HoostaHeader ";
import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import HoostaService from "../../../Services/HoostaService";
import { useSelector } from "react-redux";
import i18n from "../../../Context/i18n";

const HoostaScan = () => {
  // const router = useRoute();

  const Hoosta = useSelector((state) => state?.hoosta?.hoostaData?.hoosta);
  console.log(Hoosta?._id, "hoosta7");
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const from4 = router?.params?.from4;
  const from5 = router?.params?.from5;
  const from6 = router?.params?.from6;
  const from7 = router?.params?.from7;
  const from8 = router?.params?.from8;
  const from9 = router?.params?.from9;

  console.log(
    from,
    from2,
    from3,
    from4,
    from5,
    from6,
    from7,
    from8,
    from9,
    pathname,
    "p10"
  );

  const [results, setResults] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getDetails = () => {
    // HoostaService.getDetails(router?.params?.hoostaId)
    HoostaService.getDetails(Hoosta?._id)
      .then((res) => {
        console.log("response of the detaikls is: ", res);
        setResults(res);
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  useEffect(() => {
    getDetails();
  }, [Hoosta?._id]);
  // }, [router]);

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

  const handleBack = () => {
    const params = {
      from: from,
      from2: from2,
      from3: from3,
      from4: from4,
      from5: from5,
      from6: from6,
      from7: from7,
      from8: from8,
    };
    navigation.navigate(from9, params);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={50}
          />
        }
      >
        <ImageBackground
          source={require("../../../assets/ImageBackground.jpg")}
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
            <HoostaHeader handleBack={handleBack} />
            <View style={{ top: -20 }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#000000",
                  alignSelf: "center",
                }}
              >
                {i18n.t("global.congratulations")}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#000000",
                  alignSelf: "center",
                }}
              >
                {i18n.t("global.yourHootsaislive")}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#000000",
                  alignSelf: "center",
                }}
              >
                {i18n.t("global.checkitoutin")}
              </Text>
            </View>
            <Image
              style={styles.back}
              source={require("../../../assets/Whats Happening.png")}
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Bold",
                fontSize: 25,
                fontWeight: "900",
                color: "#000000",
                alignSelf: "center",
                paddingTop: 20,
              }}
            >
              {results?.name}
            </Text>
            <View
              style={{
                alignItems: "center",
                paddingTop: 20,
                width: "100%",
                height: 200,
              }}
            >
              <QRCode
                value={"https://www.sayhello.world/"}
                color="#000000"
                size={250}
                logo={require("../../../assets/qr/hand.png")}
                logoBackgroundColor="#fff"
                logoBorderRadius={5}
                logoSize={40}
              />
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              bottom: 5,
              width: "90%",
            }}
          >
            <LinearGradient
              colors={["#338AFF", "#00EDB4"]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.2, y: 0.6 }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("Home")}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    fontFamily: "Inter-Regular",
                    color: "#fff",
                  }}
                >
                  {i18n.t("global.home")}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HoostaScan;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  back: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 37,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
});
