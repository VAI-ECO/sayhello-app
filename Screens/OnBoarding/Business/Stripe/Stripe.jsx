import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../../../Component/Header";

import { Fontisto, AntDesign } from "@expo/vector-icons";

import { useStripe } from "@stripe/stripe-react-native";
import AppConfig from "../../../../AppConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import BusinessService from "../../../../Services/BusinessService";
import userService from "../../../../Services/userService";
import { useAuth } from "../../../../Context/AuthContext";
import requests from "../../../../Services/httpservice";
import { useSelector } from "react-redux";
import i18n from "../../../../Context/i18n";

const BusinesStripe = () => {
  const navigator = useNavigation();
  const router = useRoute();
  const { user, updateUser } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const businessData = useSelector((state) => state?.business?.businessData);

  console.log(businessData?.businessId, "businessId2");

  const [ammount, setAmount] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const [user_info, setUser_info] = useState(null);

  const getAmmount = async () => {
    await requests
      .get(`${AppConfig.ApiUrl}api/v1/rules/business`)
      .then((response) => {
        let data = response;

        console.log("response----->ß", data);
        setAmount(data?.paymentAmount);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    const GetUserInfo = async () => {
      let result = await AsyncStorage.getItem("user_info");

      if (result) {
        const new_val = JSON.parse(result);
        setUser_info(new_val);
      }
    };
    getAmmount();
    GetUserInfo();
  }, []);

  const CreatePaymentIntent = async () => {
    try {
      let body = {
        email: user_info?.email,
        name: user_info?.firstname + " " + user_info?.lastname,
        phone: user_info?.epassword,
        description: "Business charges",
        amount: JSON.stringify(ammount),
        currency: "usd",
      };
      console.log("nodyssssssss: ", body);
      console.log("user_info: ", user_info);

      await requests
        .post(`${AppConfig.ApiUrl}api/v1/payment/paymentIntent`, body)
        .then((res) => {
          console.log("res", res);
          let clientSecret = res.clientSecret;
          console.log("clientSecret", clientSecret);
          setPaymentIntent(res);
          onCheckout();
        })
        .catch((error) => {
          console.log("Payment intent error", error);
        });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // useEffect(() => {
  //   CreatePaymentIntent();
  // }, []);

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
  }, []);

  const handleNext = () => {};

  const onCheckout = async () => {
    // 1. Create a payment intent
    // CreatePaymentIntent();

    if (paymentIntent) {
      // 2. Initialize the Payment sheet
      const initResponse = await initPaymentSheet({
        merchantDisplayName: "Example, Inc.",
        customerId: paymentIntent?.customer,
        customerEphemeralKeySecret: paymentIntent?.ephemeralKey,
        paymentIntentClientSecret: paymentIntent?.clientSecret,
        // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
        //methods that complete payment after a delay, like SEPA Debit and Sofort.
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: "Jane Doe",
        },
      });
      if (initResponse.error) {
        console.log(initResponse.error);
        Alert.alert("Something went wrong");
        return;
      }

      console.log("payment Cash");
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

      // console.log("Payment completed successfully",router?.params);
      // BusinessService.subscribeBusiness({
      //   businessId: router?.params?.businessId,
      // })
      BusinessService.subscribeBusiness({
        businessId: businessData?.businessId,
      })
        .then((res) => {
          console.log("Order created successfully");
          console.log("Ali body: ", {
            userId: user_info?._id,
            amount: ammount,
            paymentType: "stripe",
            description: "Payment for subscription",
            // businessId: router?.params?.businessId,
            businessId: businessData?.businessId,
            status: "completed",
          });
          userService
            .createPayment({
              userId: user_info?._id,
              amount: ammount,
              paymentType: "stripe",
              description: "Payment for subscription",
              // businessId: router?.params?.businessId,
              businessId: businessData?.businessId,
              status: "completed",
            })
            .then((res) => {
              console.log("Res of the create paynebt: ", res);
              let submitBody = { status: "Paid", userId: user_info?._id };
              console.log("submitBodysubmitBody: ", submitBody);
              userService
                .updateUserStatus(submitBody)
                .then((res) => {
                  console.log("res of the update statys is: ", res);
                  const updates = {
                    Status: res?.user?.Status,
                  };
                  updateUser(updates);
                  navigator.navigate("BusinessHours");
                  // navigator.navigate("BusinessHours", {
                  //   orgData: router?.params?.orgData,
                  // });
                })
                .catch((err) => {
                  console.log("Error on update staus of the user");
                });
            })
            .catch((err) => {
              console.log("error on create payment");
            });
        })
        .catch((err) => {
          console.log("error on subscribeBusiness: ", err);
        });

      // onCreateOrder();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#008767", "#00EDB4"]}
        style={styles.boxcontainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* <Header title="" /> */}
        <Image
          source={require("../../../../assets/conghand.png")}
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
          margin: 10,
          position: "relative",
          flex: 1,
        }}
      >
        <Pressable onPress={CreatePaymentIntent} style={styles.button}>
          <Text allowFontScaling={false} style={styles.buttonText}>
            {i18n.t("global.paynow")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default BusinesStripe;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
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
  button: {
    position: "absolute",
    backgroundColor: "black",
    bottom: 30,
    width: "90%",
    alignSelf: "center",
    height: 50,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
});
