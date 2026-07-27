import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import meetupService from "../../../Services/meetupService";
import HoostaHeader from "../../../Component/HoostaHeader ";
import HoostaService from "../../../Services/HoostaService";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const statesData = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
];

const HoostaLocation = () => {
  const Hoosta = useSelector((state) => state?.hoosta?.hoostaData?.hoosta);
  console.log(Hoosta?._id, "hoosta");
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const clearform = router?.params?.clearform;
  const selectedDate = router?.params?.selectedDate;
  const startTime = router?.params?.startTime;
  const endTime = router?.params?.endTime;

  console.log(
    from,
    from2,
    from3,
    pathname,
    clearform,
    selectedDate,
    startTime,
    endTime,
    "p4"
  );
  const [streetAddress, setStreetAddress] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (clearform) {
      reset({
        address: "",
        state: "",
        zipcode: "",
        directions: "",
        city: "",
      });
    }
  }, [router]);

  const validationSchema = Yup.object().shape({
    address: Yup.string().required("* Address is required"),
    state: Yup.string().required("* State is required"),
    zipcode: Yup.string().required("* Zipcode is required"),
    directions: Yup.string().required("* Directions is required"),
    city: Yup.string().required("* City is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      address: "",
      state: "",
      zipcode: "",
      directions: "",
      city: "",
    },
  });

  const handleNext = (values) => {
    setIsLoading(true);

    const submitData = {
      address: values.address,
      city: values.city,
      state: values.state,
      zipcode: values.zipcode,
      directionDescription: values.directions,
    };
    // HoostaService.updateHoostaLocation(router?.params?.hoostaId, submitData)
    HoostaService.updateHoostaLocation(Hoosta?._id, submitData)
      .then((res) => {
        console.log("res of the upadte location: ", res);
        setIsLoading(false);
        const params = {
          from: from,
          from2: from2,
          from3,
          from3,
          from4: pathname,
          clearform: true,
        };
        navigation.navigate("HoostaDiscription", params);
        // navigation.navigate("HoostaDiscription", {
        //   hoostaId: router?.params?.hoostaId,
        // });
        setStreetAddress("");
        setCity("");
        setState("");
        setZipcode("");
        setData("");
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("error: ", err);
      });
  };

  const goBack = () => {
    navigation.goBack();
  };

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

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleBack = () => {
    navigation.navigate(from3, {
      from: from,
      from2: from2,
      selectedDate: selectedDate,
      startTime: true,
      endTime: endTime,
    });
  };
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
            <HoostaHeader handleBack={handleBack} />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.flex1}
            >
              <ScrollView>
                <View style={styles.header}>
                  <Text allowFontScaling={false} style={styles.headerText}>
                    {i18n.t("global.enterLocation")}
                  </Text>
                </View>
                <View style={styles.formContainer}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.address")}
                  </Text>
                  <Controller
                    control={control}
                    name="address"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("AmbBusinesEnterData.address")}
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
                  {errors.address && (
                    <Text style={styles.errorText}>
                      {errors.address.message}
                    </Text>
                  )}
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text allowFontScaling={false} style={styles.label}>
                        {i18n.t("global.city")}
                      </Text>
                      <Controller
                        control={control}
                        name="city"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            placeholder={i18n.t("global.city")}
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
                      {errors.city && (
                        <Text style={styles.errorText}>
                          {errors.city.message}
                        </Text>
                      )}
                    </View>
                    <View style={styles.column}>
                      <Text allowFontScaling={false} style={styles.label}>
                        {i18n.t("global.state")}
                      </Text>
                      <Controller
                        control={control}
                        name="state"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            placeholder={i18n.t("global.enterState")}
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
                      {errors.state && (
                        <Text style={styles.errorText}>
                          {errors.state.message}
                        </Text>
                      )}
                      {/* <TouchableWithoutFeedback
                    onPress={() => setShowDropdown(true)}
                  >
                    <View style={styles.stateContainer}>
                      <Text allowFontScaling={false}
                        style={
                          state
                            ? styles.selectedStateText
                            : styles.defaultStateText
                        }
                      >
                        {state || "Select State"}
                      </Text>

                      <Entypo
                        name="chevron-small-down"
                        size={24}
                        color="black"
                      />
                    </View>
                  </TouchableWithoutFeedback>
                  {showDropdown && (
                    <FlatList
                      data={statesData}
                      renderItem={({ item }) => (
                        <TouchableWithoutFeedback
                          onPress={() => handleStateChange(item.value)}
                        >
                          <Text allowFontScaling={false} style={styles.stateItem}>{item.label}</Text>
                        </TouchableWithoutFeedback>
                      )}
                      keyExtractor={(item) => item.value}
                      style={styles.flatList}
                    />
                  )}
                */}
                    </View>

                    <View style={styles.column}>
                      <Text allowFontScaling={false} style={styles.label}>
                        {i18n.t("global.enterZipcode")}
                      </Text>
                      <Controller
                        control={control}
                        name="zipcode"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            placeholder={i18n.t("global.enterZipcode")}
                            style={styles.inputField}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="numeric"
                            placeholderTextColor="#7C7C7C"
                          />
                        )}
                      />
                      {errors.zipcode && (
                        <Text style={styles.errorText}>
                          {errors.zipcode.message}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text allowFontScaling={false} style={styles.direction}>
                    {i18n.t("global.enterDirectionsDescription")}
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
                          fontSize: 14,
                          fontFamily: "Roboto-Regular",
                          fontWeight: "400",
                          color: "#7C7C7C",
                          paddingLeft: 18,
                          paddingRight: 18,
                          textAlignVertical: "top",
                          paddingTop: 10,
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
              </ScrollView>

              {isLoading ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      position: "absolute",
                      alignItems: "center",
                      alignSelf: "center",
                      bottom: 8,
                    }}
                  >
                    <ActivityIndicator size={50} color="#0000ff" />
                  </View>
                </>
              ) : (
                <>
                  {isKeyboardOpen ? null : (
                    <TouchableOpacity
                      onPress={handleSubmit(handleNext)}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        position: "absolute",
                        alignItems: "center",
                        alignSelf: "center",
                        bottom: 10,
                      }}
                    >
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.buton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <TouchableOpacity onPress={handleSubmit(handleNext)}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              allowFontScaling={false}
                              style={styles.textbtn}
                            >
                              {i18n.t("global.next")}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </KeyboardAvoidingView>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HoostaLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    paddingTop: 5,
    marginBottom: 10,
  },
  formContainer: {
    flex: 1,
    paddingBottom: 60,
    paddingVertical: 11,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  flex1: {
    flex: 1,
  },
  stateContainer: {
    borderColor: "#000000",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#EDF5F4",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  stateItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  flatList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "##EDF5F4",
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  direction: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginBottom: 8,
  },
  selectedStateText: {
    color: "#7C7C7C",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
  },
  defaultStateText: {
    color: "#7C7C7C",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
  },
  inputFieldd: {
    width: "100%",
    height: 160,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    marginBottom: 15,
    alignSelf: "center",
    borderWidth: 1,
  },
  buton: {
    width: "95%",
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  textbtn: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});
