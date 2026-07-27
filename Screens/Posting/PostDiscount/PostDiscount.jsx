import {
  ImageBackground,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import DiscountService from "../../../Services/DiscountService";
import { useAuth } from "../../../Context/AuthContext";
import PosingDiscountHeader from "../../../Component/PosingDiscountHeader";
import Toast from "react-native-toast-message";
import Loader from "../../../Component/Loader";
import { useDispatch } from "react-redux";
import { createDiscount } from "../../../features/hookupDiscount/discountSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const PostDiscount = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const clearform = router?.params?.clearform;

  console.log(from, from2, pathname, clearform, "p3");

  // console.log("user is: ", user);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [dis, setDis] = useState(0);
  const [data, setData] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardOpen(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardOpen(false);
      }
    );

    if (clearform) {
      reset({
        itemname: "",
        discount: "",
        directions: "",
      });
    }
    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [router]);

  const validationSchema = Yup.object().shape({
    itemname: Yup.string().required("* Item name is required"),
    discount: Yup.string().required("* Discount or Cost is required"),
    directions: Yup.string().required("* Directions is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      itemname: "",
      discount: "",
      directions: "",
    },
  });

  const handelCreateDiscount = (values) => {
    setIsLoading(true);

    let body = {
      itemName: values.itemname,
      userId: user?.user?._id,
      itemDiscount: values.discount,
      description: values.directions,
    };

    console.log("body", body);

    // DiscountService.createDiscount(body)
    dispatch(createDiscount(body))
      .then((res = res?.payload) => {
        setIsLoading(false);
        navigation.navigate("PostDateAndTime", {
          from: from,
          from2: from2,
          from3: pathname,
          clearform: true,
        });
        // navigation.navigate("PostDateAndTime", {
        //   discountId: res?.postDiscount?._id,
        // });
        setName("");
        setDis(0);
        setData("");
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("error: ", err);
      });
  };

  const handleBack = () => {
    navigation.navigate(from2, { from: from });
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
          resizeMode="cover"
        >
          <View style={styles.container}>
            <PosingDiscountHeader handleBack={handleBack} />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Regular",
                fontSize: 20,
                fontWeight: "700",
                color: "#000000",
                alignSelf: "center",
                top: -15,
              }}
            >
              {i18n.t("DiscountScan.hookup")}
            </Text>
            <View style={styles.formContainer}>
              <Text allowFontScaling={false} style={styles.label}>
                {i18n.t("DiscountScan.nameItem")}
              </Text>
              <Controller
                control={control}
                name="itemname"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    allowFontScaling={false}
                    placeholder={i18n.t("DiscountScan.enterNameItem")}
                    style={styles.inputField}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#7C7C7C"
                  />
                )}
              />
              {errors.itemname && (
                <Text style={styles.errorText}>{errors.itemname.message}</Text>
              )}
              <Text allowFontScaling={false} style={styles.label}>
                {i18n.t("DiscountScan.costorDiscount")}
              </Text>
              <Controller
                control={control}
                name="discount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    allowFontScaling={false}
                    placeholder={i18n.t("DiscountScan.enterCostorDiscount")}
                    style={styles.inputField}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#7C7C7C"
                  />
                )}
              />
              {errors.discount && (
                <Text style={styles.errorText}>{errors.discount.message}</Text>
              )}
              <Text allowFontScaling={false} style={styles.label}>
                {i18n.t("global.enterDirections")}
              </Text>
              <Controller
                control={control}
                name="directions"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    allowFontScaling={false}
                    placeholder={i18n.t("global.enterDirections")}
                    style={{
                      ...styles.inputFieldd,
                      fontSize: 16,
                      fontFamily: "Roboto-Regular",
                      fontWeight: "400",
                      color: "#7C7C7C",
                      paddingLeft: 18,
                      paddingRight: 18,
                    }}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#7C7C7C"
                    multiline={true}
                    textInputAccessoryViewID={"none"}
                  />
                )}
              />
              {errors.directions && (
                <Text style={styles.errorText}>
                  {errors.directions.message}
                </Text>
              )}
            </View>
          </View>

          {!isKeyboardOpen && (
            <TouchableOpacity
              onPress={handleSubmit(handelCreateDiscount)}
              style={{
                position: "absolute",
                alignSelf: "center",
                bottom: 3,
                width: "90%",
              }}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={handleSubmit(handelCreateDiscount)}
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
                      {i18n.t("global.next")}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </TouchableOpacity>
          )}
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default PostDiscount;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  formContainer: {
    flex: 1,

    marginHorizontal: 20,
  },
  label: {
    marginBottom: 5,
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
  inputField: {
    height: 40,
    borderRadius: 6,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    paddingLeft: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  inputFieldd: {
    width: "100%",
    height: 110,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    alignSelf: "center",
    borderWidth: 1,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});
