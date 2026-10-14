import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../../Component/Header";
import { useStripe } from "@stripe/stripe-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../../Context/AuthContext";
import axios from "axios";
import AppConfig from "../../../AppConfig";
import HoostaService from "../../../Services/HoostaService";
import userService from "../../../Services/userService";
import Loader from "../../../Component/Loader";
import { useSelector } from "react-redux";
import i18n from "../../../Context/i18n";

const HoostaPayments = () => {
  const navigation = useNavigation();
  const Hoosta = useSelector((state) => state?.hoosta?.hoostaData?.hoosta);
  console.log(Hoosta?._id, "hoosta6");
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

  console.log(
    from,
    from2,
    from3,
    from4,
    from5,
    from6,
    from7,
    from8,
    pathname,
    "p9"
  );

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { user } = useAuth();

  // console.log("router?.params?.hoostaId", router?.params?.hoostaId);
  const [loadingCredit, setLoadingCredit] = useState(true);
  const [loading, setLoading] = useState(false);

  const [ammount, setAmount] = useState(0); // Set the amount to be charged
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [credits, setCredits] = useState(2);
  const [refreshing, setRefreshing] = useState(false);

  const getDetails = async () => {
    setLoadingCredit(true);
    await axios
      .get(`${AppConfig.ApiUrl}api/v1/rules/business`)
      .then((response) => {
        let data = response.data;

        setAmount(data?.hoostaAmount);
      })
      .catch((err) => {
        console.error("err on get rules: ", err);
      });

    await axios
      .get(`${AppConfig.ApiUrl}api/v1/users/${user?.user?._id}/credits`)
      .then((response) => {
        let data = response.data;
        setLoadingCredit(false);
        setCredits(data?.credits);
      })
      .catch((err) => {
        console.error(err);
        setLoadingCredit(false);
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

  const handleSubmit = async () => {
    // let hoostaId = router?.params?.hoostaId;
    const params = {
      from: from,
      from2: from2,
      from3,
      from3,
      from4: from4,
      from5: from5,
      from6: from6,
      from7: from7,
      from8: from8,
      from9: pathname,
    };
    // HoostaService.markAsSubscribed(hoostaId)
    HoostaService.markAsSubscribed(Hoosta?._id)
      .then((res) => {
        navigation.navigate("HoostaScan", params);
      })
      .catch((err) => {
        console.log("error: ", err);
      });
  };

  const onCheckout = async () => {
    // CreatePaymentIntent();
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
        description: "Payment for posting hoosta",
      };
      userService
        .createPostingPayment(submitBody)
        .then((res) => {
          console.log("res of createPostingPayment: ", res);
          console.log("Payment completed successfully");
          handleSubmit();
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
    console.log("Asdasdasdasd: ", body);

    await axios
      .post(`${AppConfig.ApiUrl}api/v1/users/utilize-credits`, body)
      .then((response) => {
        const params = {
          from: from,
          from2: from2,
          from3,
          from3,
          from4: from4,
          from5: from5,
          from6: from6,
          from7: from7,
          from8: from8,
          from9: pathname,
        };
        navigation.navigate("HoostaScan", params);
        // navigation.navigate("HoostaScan", {
        //   hoostaId: router?.params?.hoostaId,
        // });
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
    const params = {
      from: from,
      from2: from2,
      from3: from3,
      from4: from4,
      from5: from5,
      from6: from6,
      from7: from7,
    };
    navigation.navigate(from8, params);
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
              width: "80%",
              padding: 15,
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
                {i18n.t("global.youhave")} {credits}
                {i18n.t("global.creditsRemaining")}
              </Text>
            )}
          </View>

          <View
            style={{
              padding: 10,
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
                gap: 15,
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
                        height: 55,
                        justifyContent: "center",
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
                        height: 55,
                        borderRadius: 100,
                        alignItems: "center",
                        justifyContent: "center",
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

export default HoostaPayments;

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
