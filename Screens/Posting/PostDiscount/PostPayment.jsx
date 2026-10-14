import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
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
import DiscountService from "../../../Services/DiscountService";
import userService from "../../../Services/userService";
import Loader from "../../../Component/Loader";
import { useSelector } from "react-redux";
import i18n from "../../../Context/i18n";

const PostPayment = () => {
  const navigation = useNavigation();
  const PostDiscount = useSelector(
    (state) => state?.discount?.DiscountData?.postDiscount
  );
  console.log(PostDiscount?._id, "discout Id3 is this");
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const from4 = router?.params?.from4;
  const from5 = router?.params?.from5;
  const clearform = router?.params?.clearform;

  console.log(from, from2, from3, from4, from5, pathname, clearform, "p6");

  const [loadingCredit, setLoadingCredit] = useState(true);
  const [loading, setLoading] = useState(false);

  const [ammount, setAmount] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [credits, setCredits] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const getDetails = async () => {
    setLoadingCredit(true);
    try {
      const rulesResponse = await axios.get(
        `${AppConfig.ApiUrl}api/v1/rules/business`
      );
      const rulesData = rulesResponse.data;
      setAmount(rulesData?.postDiscountAmount);

      console.log("Fetched amount:", rulesData?.postDiscountAmount);

      const userCreditsResponse = await axios.get(
        `${AppConfig.ApiUrl}api/v1/users/${user?.user?._id}/credits`
      );
      const userCreditsData = userCreditsResponse.data;

      console.log("Fetched credits:", userCreditsData);

      setCredits(userCreditsData?.credits);
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoadingCredit(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, [router]);
  // console.log("user?.user?.firstname",user?.user?.)

  const CreatePaymentIntent = async () => {
    if (!Number.isFinite(Number(ammount)) || Number(ammount) <= 0 || !user?.user?._id) return;
    try {
      let body = {
        email: user?.user?.email,
        name: user?.user?.firstname + " " + user?.user?.lastname,
        phone: user?.user?.phonenumber,
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
    if (!paymentIntent) return;
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

  const handleSubmit = () => {
    // DiscountService.markAsSubscribed(router?.params?.discountId)
    DiscountService.markAsSubscribed(PostDiscount?._id)
      .then((res) => {
        // DiscountService.markAsCompleted(router?.params?.discountId)
        DiscountService.markAsCompleted(PostDiscount?._id)
          .then((ress) => {
            const params = {
              from: from,
              from2: from2,
              from3: from3,
              from4: from4,
              from5: from5,
              from6: pathname,
            };
            navigation.navigate("DiscountScan", params);
          })
          .catch((err) => {
            console.log("Error markAsCompleted: ", err);
          });
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  const onCheckout = async () => {
    if (loading) return;
    if (!paymentIntent) {
      Alert.alert("Payment unavailable", "Wait for pricing to load, then try again.");
      return;
    }
    setLoading(true);

    if (paymentIntent) {
      // 2. Initialize the Payment sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: "SayHello",
        paymentIntentClientSecret: paymentIntent,
      });
      if (initResponse.error) {
        setLoading(false);
        console.log(initResponse.error);
        Alert.alert("Something went wrong");
        return;
      }

      // 3. Present the Payment Sheet from Stripe
      const paymentResponse = await presentPaymentSheet();

      if (paymentResponse.error) {
        setLoading(false);
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
        description: "Payment for posting hookup",
      };
      userService
        .createPostingPayment(submitBody)
        .then((res) => {
          console.log("res of createPostingPayment: ", res);
          console.log("Payment completed successfully");
          handleSubmit();
          setLoading(false);
          setLoading(false);
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
        DiscountService.markAsCompleted(PostDiscount?._id)
          .then((ress) => {
            console.log("Credit utilized successfully");
            const params = {
              from: from,
              from2: from2,
              from3: from3,
              from4: from4,
              from5: from5,
              from6: pathname,
            };
            navigation.navigate("DiscountScan", params);
            setLoading(false);
          })
          .catch((Errr) => {
            console.log("Error markAsCompleted: ", Errr);
          });
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
    navigation.navigate(from5, {
      from: from,
      from2: from2,
      from3: from3,
      from4: from4,
    });
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
                {i18n.t("global.youhave")} {credits}
                {i18n.t("global.creditsRemaining")}
              </Text>
            )}
            <Text
              allowFontScaling={false}
              style={{ fontFamily: "Roboto-Regular", fontSize: 14 }}
            >
              {i18n.t("global.yourcyclerenewseveryMonth")}
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

export default PostPayment;

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
import { Alert } from "react-native";
