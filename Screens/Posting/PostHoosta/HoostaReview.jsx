import {
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import HoostaHeader from "../../../Component/HoostaHeader ";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import HoostaService from "../../../Services/HoostaService";
import moment from "moment";
import { useSelector } from "react-redux";
import i18n from "../../../Context/i18n";

const HoostaReview = () => {
  const Hoosta = useSelector((state) => state?.hoosta?.hoostaData?.hoosta);
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

  console.log(from, from2, from3, from4, from5, from6, from7, pathname, "p8");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getDetails();
  }, [Hoosta?._id, router]);

  const getDetails = () => {
    setLoading(true);
    // HoostaService.getDetails(router?.params?.hoostaId)
    HoostaService.getDetails(Hoosta?._id)
      .then((res) => {
        console.log("response of the details is: ", res);
        setResults(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error: ", err);
        setLoading(false);
      });
  };

  const handleSubmit = async () => {
    setButtonLoading(true);
    HoostaService.markAsCompleted(Hoosta?._id)
      .then((res) => {
        const params = {
          from: from,
          from2: from2,
          from3,
          from3,
          from4: from4,
          from5: from5,
          from6: from6,
          from7: from7,
          from8: pathname,
        };
        navigation.navigate("HoostaPayments", params);
        setResults(null);
      })
      .catch((err) => {
        console.log("error: ", err);
      })
      .finally(() => {
        setButtonLoading(false);
      });
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

  const handleBack = () => {
    const params = {
      from: from,
      from2: from2,
      from3: from3,
      from4: from4,
      from5: from5,
      from6: from6,
    };
    navigation.navigate(from7, params);
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
            {loading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  zIndex: 1000,
                }}
              >
                <ActivityIndicator size="large" />
              </View>
            ) : (
              <>
                <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                  <View style={styles.container}>
                    <HoostaHeader handleBack={handleBack} />

                    {results && results === null ? (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ActivityIndicator size="large" />
                      </View>
                    ) : (
                      <>
                        <Text allowFontScaling={false} style={styles.title}>
                          {i18n.t("global.reviews")}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginHorizontal: 25,
                            marginTop: 25,
                            marginBottom: 20,
                            alignItems: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.time}>
                            {i18n.t("global.name")} :
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.datetime}
                          >
                            {results?.name}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            marginHorizontal: 25,
                            marginBottom: 20,
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.time}>
                            {i18n.t("global.date")}:
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.datetime}
                          >
                            {moment(results?.date).format("MMM Do YYYY")}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            marginHorizontal: 25,
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.time}>
                            {i18n.t("global.time")} :
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.datetime}
                          >
                            {results?.startTime} - {results?.endTime}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            marginHorizontal: 25,
                            marginTop: 25,
                            marginBottom: 20,
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.time}>
                            {i18n.t("global.location")} :
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={{
                              fontSize: 18,
                              fontWeight: "600",
                              fontFamily: "Roboto-Regular",
                              color: "#000000",
                              maxWidth: 300,
                            }}
                          >
                            {results?.address}
                          </Text>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginHorizontal: 25,
                            marginTop: 10,
                            marginBottom: 20,
                            alignItems: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.time}>
                            {i18n.t("AmbBusinesEnterData.ContactNameis")}:
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.datetime}
                          >
                            {results?.contactName}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginHorizontal: 25,
                            marginBottom: 20,
                            alignItems: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.time}>
                            {i18n.t("AmbBusinesEnterData.ContactPhone")}:
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.datetime}
                          >
                            {results?.phone}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginHorizontal: 25,
                            marginBottom: 20,
                            alignItems: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.time}>
                            {i18n.t("global.ContactEmail")} :
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.datetime}
                          >
                            {results?.email}
                          </Text>
                        </View>

                        <Text allowFontScaling={false} style={styles.dis}>
                          {i18n.t("global.description")}:
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={{
                            fontSize: 17,
                            fontWeight: "600",
                            fontFamily: "Roboto-Regular",
                            color: "#000000",
                            flexShrink: 1,
                            marginHorizontal: 35,
                            lineHeight: 20,
                            // flex: 1,
                          }}
                        >
                          {results?.description}
                        </Text>
                      </>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
          {buttonLoading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{
                position: "absolute",
                alignSelf: "center",
                // bottom: 5,
              }}
            />
          ) : (
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
                  onPress={handleSubmit}
                  disabled={results === null ? true : false}
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
                    {i18n.t("global.submit")}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HoostaReview;

const styles = StyleSheet.create({
  container: {
    paddingTop: 25,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
  },
  datetime: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  time: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginHorizontal: 8,
  },
  dis: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginBottom: 12,
    marginHorizontal: 35,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 10,
  },
});
