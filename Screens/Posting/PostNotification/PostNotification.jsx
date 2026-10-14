import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import PosingHeader from "../../../Component/PosingHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../Context/AuthContext";
import Loader from "../../../Component/Loader";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useDispatch } from "react-redux";
import { createNotification } from "../../../features/hollaPostNotification/hollaSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const PostNotification = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const clearform = router?.params?.clearform;

  console.log(from, from2, pathname, clearform, "p3");

  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsKeyboardOpen(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setIsKeyboardOpen(false)
    );
    if (clearform) {
      reset({
        title: "",
        link: "",
      });
    }
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [router]);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("* Title is required"),
    link: Yup.string()
      .url("* Please enter a valid URL")
      .required("* Link is required"),
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
      title: "",
      link: "",
    },
  });

  // Submission Handler
  const onSubmit = (formValues) => {
    const SubmitData = {
      websiteLink: formValues.link,
      title: formValues.title,
      userId: user?.user?._id,
    };

    setIsLoading(true);

    dispatch(createNotification(SubmitData))
      .then((res) => {
        navigation.navigate("NotifcationPayments", {
          from: from,
          from2: from2,
          from3: pathname,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error: ", err);
        setIsLoading(false);
      });
  };

  const handleBack = () => {
    navigation.navigate(from2, { from: from });
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ImageBackground
        source={require("../../../assets/ImageBackground.jpg")}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <PosingHeader handleBack={handleBack} />
          <Text style={styles.headerText}>{i18n.t("global.holla")}</Text>

          <Text style={styles.labelText}>{i18n.t("global.titleofHolla")}</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.inputField}
                placeholder="Enter title"
                placeholderTextColor="#7C7C7C"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}

          <Text style={styles.labelText}>{i18n.t("global.link")}</Text>
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="web" size={30} color="black" />
            </View>
            <Controller
              control={control}
              name="link"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter link"
                  placeholderTextColor="#7C7C7C"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>
          {errors.link && (
            <Text style={styles.errorText}>{errors.link.message}</Text>
          )}
        </View>

        {!isKeyboardOpen && (
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={styles.submitContainer}
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
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>{i18n.t("global.next")}</Text>
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  imageBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  headerText: {
    fontFamily: "Roboto-Regular",
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    alignSelf: "center",
    marginBottom: 15,
  },
  labelText: {
    fontFamily: "Roboto-Regular",
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 15,
    marginHorizontal: 40,
  },
  inputField: {
    width: "81%",
    height: 90,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    alignSelf: "center",
    borderWidth: 1,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: "#7C7C7C",
    paddingLeft: 18,
    paddingRight: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 35,
    marginTop: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#EDF5F4",
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
  buttonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
    marginLeft: 35,
  },
  submitContainer: {
    position: "absolute",
    alignSelf: "center",
    bottom: 3,
    width: "90%",
  },
});

export default PostNotification;
