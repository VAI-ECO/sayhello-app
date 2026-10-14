import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
  TextInput,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import PhoneInput from "react-native-phone-number-input";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import GroupService from "../../../Services/GroupService";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import { BackHandler } from "react-native";
import i18n from "../../../Context/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { createGroup } from "../../../features/group/groupSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

const statesData = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
];

const GroupName = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [zipCode, setZipCode] = useState("");

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleCityChange = (text) => {
    setCity(text);
  };

  const handleStateChange = (value) => {
    setState(value);
    setShowDropdown(false);
  };

  const validationSchema = Yup.object().shape({
    groupname: Yup.string().required("* Group name is required"),
    groupAddress: Yup.string().required("* Group Address is required"),
    city: Yup.string().required("* City is required"),
    state: Yup.string().required("* State is required"),
    zipcode: Yup.string().required("* Zip Code is required"),
    firstname: Yup.string().required("* First name is required"),
    lastname: Yup.string().required("* Last name is required"),
    title: Yup.string().required("* Title is required"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      groupname: "",
      groupAddress: "",
      city: "",
      state: "",
      zipcode: "",
      firstname: "",
      lastname: "",
      title: ""
    },
  });

  const handelNext = (values) => {
    setIsLoading(true);


    const body = {
      name: name,
      city: city,
      state: state,
      address: address,
      firstname: firstName,
      lastname: lastName,
      title: title,
      zipcode: zipCode,
    }
    // GroupService.createGroup({
    //   name: name,
    //   city: city,
    //   state: state,
    //   address: address,
    //   firstname: firstName,
    //   lastname: lastName,
    //   title: title,
    //   zipcode: zipCode,
    // })
    dispatch(createGroup(body))
      .then((response) => {
        // console.log("response of tjhe group is: ", response._id);
        navigation.navigate("GroupDiscription");
        // navigation.navigate("GroupDiscription", {
        //   groupId: response?._id,
        // });
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("error: ", err);
        setIsLoading(false);
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

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  useEffect(() => {
    const backAction = () => {
      // Handle the back button press here
      return false; // Prevent default behavior (exit the app)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup the event listener on component unmount
  }, [navigation]);

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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 , marginBottom:10}}>
              <View style={styles.container}>
                {/* <Header title="" /> */}
                <Image
                  source={require("../../../assets/Group.png")}
                  style={styles.orglogo}
                  resizeMode="contain"
                />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-Bold",
                    fontSize: 17,
                    fontWeight: "400",
                    color: "#000000",
                    marginTop: 10,
                    marginHorizontal: 22,
                  }}
                >
                  {i18n.t("global.groupName")}
                </Text>
                <View
                  style={{
                    paddingTop: 15,
                    marginHorizontal: 22,
                  }}
                >
                  <Controller
                    control={control}
                    name="groupname"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder="Enter Group name"
                        style={{
                          ...styles.inputField,
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
                        // multiline={true}
                        textInputAccessoryViewID={"none"}
                      />
                    )}
                  />
                  {errors.groupname && <Text style={styles.errorText}>{errors.groupname.message}</Text>}
                </View>

                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-Bold",
                    fontSize: 17,
                    fontWeight: "400",
                    color: "#000000",
                    marginTop: 10,
                    marginHorizontal: 22,
                  }}
                >
                  {i18n.t("global.groupAddress")}
                </Text>
                <View
                  style={{
                    paddingTop: 15,
                    marginHorizontal: 22,
                  }}
                >
                  <Controller
                    control={control}
                    name="groupAddress"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder="Enter Group address"
                        style={{
                          ...styles.inputField,
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
                        // multiline={true}
                        textInputAccessoryViewID={"none"}
                      />
                    )}
                  />
                  {errors.groupAddress && <Text style={styles.errorText}>{errors.groupAddress.message}</Text>}
                </View>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Roboto-Bold",
                    fontSize: 17,
                    fontWeight: "400",
                    color: "#000000",
                    marginTop: 10,
                    marginBottom: 10,
                    marginHorizontal: 22,
                  }}
                >
                  {i18n.t("global.groupLocation")}
                </Text>
                <View style={{ marginHorizontal: 22 }}>
                  <View style={styles.formContainer}>
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
                              placeholder="City"
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
                        {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
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
                              placeholder="State"
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
                        {errors.state && <Text style={styles.errorText}>{errors.state.message}</Text>}
                      </View>
                      <View style={styles.column}>
                        <Text allowFontScaling={false} style={styles.label}>
                          {i18n.t("global.zipcode")}
                        </Text>
                        <Controller
                          control={control}
                          name="zipcode"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              allowFontScaling={false}
                              placeholder="ZipCode"
                              style={styles.inputField}
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              autoCapitalize="none"
                              autoCorrect={false}
                              placeholderTextColor="#7C7C7C"
                              keyboardType="numeric"
                            />
                          )}
                        />
                        {errors.zipcode && <Text style={styles.errorText}>{errors.zipcode.message}</Text>}
                      </View>
                    </View>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontFamily: "Roboto-Bold",
                        fontSize: 17,
                        fontWeight: "400",
                        color: "#000000",
                        marginTop: 10,
                        marginBottom: 8,
                      }}
                    >
                      {i18n.t("global.groupContact")}
                    </Text>
                    <View style={styles.formContainer}>
                      <View style={styles.row}>
                        <View style={styles.column}>
                          <Text allowFontScaling={false} style={styles.label}>
                            {i18n.t("global.firstName")}
                          </Text>
                          <Controller
                            control={control}
                            name="firstname"
                            render={({ field: { onChange, onBlur, value } }) => (
                              <TextInput
                                allowFontScaling={false}
                                placeholder="Enter Name"
                                style={styles.inputField}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCorrect={false}
                                placeholderTextColor="#7C7C7C"
                              />
                            )}
                          />
                          {errors.firstname && <Text style={styles.errorText}>{errors.firstname.message}</Text>}
                        </View>
                        <View style={styles.column}>
                          <Text allowFontScaling={false} style={styles.label}>
                            {i18n.t("global.lastName")}
                          </Text>
                          <Controller
                            control={control}
                            name="lastname"
                            render={({ field: { onChange, onBlur, value } }) => (
                              <TextInput
                                allowFontScaling={false}
                                placeholder="Enter last name"
                                style={styles.inputField}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                placeholderTextColor="#7C7C7C"
                              />
                            )}
                          />
                          {errors.lastname && <Text style={styles.errorText}>{errors.lastname.message}</Text>}
                        </View>
                      </View>
                      <Text allowFontScaling={false} style={styles.label}>
                        {i18n.t("global.title")}
                      </Text>
                      <Controller
                        control={control}
                        name="title"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            allowFontScaling={false}
                            placeholder="Enter Title"
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
                      {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
                    </View>
                  </View>
                </View>
              </View>
              </ScrollView>

              {isLoading ? (
                <Loader />
              ) : (
                <>
                  {!isKeyboardOpen && (
                    <TouchableOpacity
                      onPress={handleSubmit(handelNext)}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        bottom: 20,
                      }}
                    >
                      <LinearGradient
                        colors={["#338AFF", "#00EDB4"]}
                        style={styles.buton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1.2, y: 0.6 }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text allowFontScaling={false} style={styles.textbtn}>
                            {i18n.t("global.next")}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              )}
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default GroupName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
  },

  inputField: {
    width: "95%",
    height: 50,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    alignSelf: "center",
    borderWidth: 1,
  },
  formContainer: {
    flex: 1,
    paddingVertical: 8,
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
    marginBottom: 5,
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
  buton: {
    width: "90%",
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
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
});
