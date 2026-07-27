import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../../Component/Header";
import { useStripe } from "@stripe/stripe-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../../Context/AuthContext";
import axios from "axios";
import AppConfig from "../../../AppConfig";
import userService from "../../../Services/userService";
import Loader from "../../../Component/Loader";
import PostNotificationService from "../../../Services/PostNotificationService";
import { useSelector } from "react-redux";
import i18n from "../../../Context/i18n";

const NotifcationPayments = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;

  console.log(from, from2, from3, pathname, "p4");

  const hollaData = useSelector(
    (state) => state?.holla?.hollaData?.postNotification
  );

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // console.log("postNotificationId", router?.params?.postNotificationId);
  const [loadingCredit, setLoadingCredit] = useState(true);
  const [loading, setLoading] = useState(false);

  const [ammount, setAmount] = useState(250); // Set the amount to be charged
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [credits, setCredits] = useState(2);
  const [refreshing, setRefreshing] = useState(false);

  const getDetails = async () => {
    setLoadingCredit(true);
    await axios
      .get(`${AppConfig.ApiUrl}api/v1/rules/business`)
      .then((response) => {
        let data = response.data;

        setAmount(data?.postNotificationAmount);
      })
      .catch((err) => {
        console.error(err);
      });

    await axios
      .get(`${AppConfig.ApiUrl}api/v1/users/${user?.user?._id}/credits`)
      .then((response) => {
        let data = response.data;

        setCredits(data?.credits);
        setLoadingCredit(false);
      })
      .catch((err) => {
        setLoadingCredit(false);
        console.error(err);
      });
  };

  useEffect(() => {
    getDetails();
  }, [router]);

  const CreatePaymentIntent = async () => {
    try {
      let body = {
        email: user?.user?.email,
        name: user?.user?.firstname + " " + user?.user?.lastname,
        phone: user?.user?.epassword,
        description: "Business charges",
        amount: JSON.stringify(ammount),
        currency: "usd",
      };

      await axios
        .post(`${AppConfig.ApiUrl}api/v1/payment/paymentIntent`, body)
        .then((res) => {
          let clientSecret = res.data.clientSecret;
          console.log("clientSecret", clientSecret);
          setPaymentIntent(clientSecret);
        })
        .catch((error) => {
          console.log("Payment intent error", error);
        });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    CreatePaymentIntent();
  }, [ammount]);

  const setup = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "SayHello",
      paymentIntentClientSecret: paymentIntent, // retrieve this from your server
    });
    if (error) {
      // handle error
    }
  };

  useEffect(() => {
    setup();
  }, [paymentIntent]);

  const onCheckout = async () => {
    setLoading(true);
    if (paymentIntent) {
      // 2. Initialize the Payment sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: "SayHello",
        paymentIntentClientSecret: paymentIntent,
      });
      if (initResponse.error) {
        console.log(initResponse.error);
        Alert.alert("Something went wrong");
        return;
      }

      // 3. Present the Payment Sheet from Stripe
      const paymentResponse = await presentPaymentSheet();

      if (paymentResponse.error) {
        Alert.alert(
          `Error code: ${paymentResponse.error.code}`,
          paymentResponse.error.message
        );
        return;
      }

      // 4. If payment ok -> create the order
      let submitBody = {
        userId: user?.user?._id,
        amount: ammount,
        paymentType: "stripe",
        description: "Payment for posting hola",
      };
      userService
        .createPostingPayment(submitBody)
        .then((res) => {
          console.log("res of createPostingPayment: ", res);
          console.log("Payment completed successfully");

          // PostNotificationService.markAsComplete(
          //   router?.params?.postNotificationId
          // )
          PostNotificationService.markAsComplete(hollaData?._id)
            .then((resss) => {
              console.log("markAsComplete: ", resss);
              navigation.navigate("PostNotificationScan", {
                from: from,
                from2: from2,
                from3: from3,
                from4: pathname,
              });
              setLoading(false);
            })
            .catch((errs) => {
              console.log("err on markAsComplete: ", errs);
            });
        })
        .catch((err) => {
          console.log("err on createPostingPayment: ", err);
          setLoading(false);
        });
    }
  };

  const handleUseCredit = async () => {
    setLoading(true);
    let body = {
      userId: user?.user?._id,
      amount: 1,
    };

    await axios
      .post(`${AppConfig.ApiUrl}api/v1/users/utilize-credits`, body)
      .then((response) => {
        PostNotificationService.markAsComplete(hollaData?._id)
          .then((resss) => {
            console.log("markAsComplete: ", resss);
            navigation.navigate("PostNotificationScan", {
              from: from,
              from2: from2,
              from3: from3,
              from4: pathname,
            });
            setLoading(false);
          })
          .catch((errs) => {
            console.log("err on markAsComplete: ", errs);
          });
        console.log("Credit utilized successfully");
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error:", error);
        setLoading(false);
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
    navigation.navigate(from3, { from: from, from2: from2 });
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <LinearGradient
          colors={["#008767", "#00EDB4"]}
          style={styles.boxcontainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Header title="" handleBack={handleBack} />
          <Image
            source={require("../../../assets/conghand.png")}
            style={styles.orglogo}
            resizeMode="contain"
          />
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 25,
              fontWeight: "900",
              fontFamily: "Roboto-Bold",
              color: "#fff",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            ${ammount}
          </Text>
        </LinearGradient>

        <View
          style={{
            marginTop: 20,
            alignItems: "center",
            flex: 1,
          }}
        >
          <View
            style={{
              backgroundColor: "#d9d9d9",
              justifyContent: "center",
              alignItems: "center",
              width: 300,
              padding: 20,
              borderWidth: 2,
              borderColor: "#019874",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {loadingCredit ? (
              <Text
                allowFontScaling={false}
                style={{ fontFamily: "Roboto-Bold", fontSize: 16 }}
              >
                {i18n.t("global.loading")}
              </Text>
            ) : (
              <Text
                allowFontScaling={false}
                style={{ fontFamily: "Roboto-Bold", fontSize: 16 }}
              >
                {i18n.t("global.youhave")} {credits}{" "}
                {i18n.t("global.creditsRemaining")}
              </Text>
            )}
            <Text
              allowFontScaling={false}
              style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}
            >
              Your cycle renews every Month
            </Text>
          </View>

          <View
            style={{
              padding: 20,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              bottom: 20,
            }}
          >
            <View
              style={{
                width: "90%",
                alignSelf: "center",
                gap: 20,
              }}
            >
              {loading ? (
                <Loader />
              ) : (
                <>
                  {credits === 0 ? (
                    <Pressable
                      onPress={onCheckout}
                      style={{
                        backgroundColor: "#000",
                        padding: 20,
                        borderRadius: 100,
                        alignItems: "center",
                      }}
                      disabled={paymentIntent === null ? true : false}
                    >
                      <Text allowFontScaling={false} style={styles.buttonText}>
                        {i18n.t("global.paynow")}
                        {/* {isLoading && <ActivityIndicator />} */}
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={handleUseCredit}
                      style={{
                        backgroundColor: "#338aff",
                        padding: 20,
                        borderRadius: 100,
                        alignItems: "center",
                      }}
                      disabled={credits === 0 ? true : false}
                    >
                      <Text allowFontScaling={false} style={styles.buttonText}>
                        {i18n.t("global.useCredit")}
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotifcationPayments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  boxcontainer: {
    width: "100%",
    padding: 9,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 120,
    top: -15,
  },

  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    textTransform: "uppercase",
  },
});
