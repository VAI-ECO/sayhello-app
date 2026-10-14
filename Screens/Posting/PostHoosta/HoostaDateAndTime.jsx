import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Calendar } from "react-native-calendars";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import HoostaHeader from "../../../Component/HoostaHeader ";
import HoostaService from "../../../Services/HoostaService";
import { useAuth } from "../../../Context/AuthContext";
import CustomTimePicker from "../../../Component/CustomTimePicker";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { createHoosta } from "../../../features/hoosta/hoostaSlice";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const HoostaDateAndTime = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const clearform = router?.params?.clearform;
  const selectedDatebackroute = router?.params?.selectedDate;
  const startTimesbackroute = router?.params?.startTime;
  const endTimesbackroute = router?.params?.endTime;

  console.log(
    from,
    from2,
    pathname,
    clearform,
    selectedDatebackroute,
    startTimesbackroute,
    endTimesbackroute,
    "p3"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTimes, setStartTimes] = useState({});
  const [endTimes, setEndTimes] = useState({});
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  console.log("startTime:", startTime);
  console.log("endTime:", endTime);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("* Name is required"),
    date: Yup.string().required("* Date is required"),
  });

  useEffect(() => {
    console.log(endTimesbackroute, "datatatatata");
    if (selectedDatebackroute || startTimesbackroute || endTimesbackroute) {
      setSelectedDate(selectedDatebackroute || null);
      setEndTime(endTimesbackroute || null);
      setStartTime(startTimesbackroute || null);
    }
    if (clearform) {
      reset({
        name: "",
        date: "",
      });
      setSelectedDate(null);
    }
  }, [router]);

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
      name: "",
      date: "",
    },
  });

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setValue("date", day.dateString);
    scrollViewRef.current?.scrollToEnd({ animated: true });
    console.log("Selected date:", day.dateString);
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

  const showStartTimePicker = () => setStartTimePickerVisible(true);
  const showEndTimePicker = () => setEndTimePickerVisible(true);
  const hideStartTimePicker = () => setStartTimePickerVisible(false);
  const hideEndTimePicker = () => setEndTimePickerVisible(false);

  const handleStartTimeConfirm = (time) => {
    setStartTimes((prev) => ({
      ...prev,
      [selectedDate]: time,
    }));
    setValue("startTime", time);
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (time) => {
    setEndTimes((prev) => ({
      ...prev,
      [selectedDate]: time,
    }));
    hideEndTimePicker();
  };

  const handleNext = (values) => {
    setIsLoading(true);

    const formatTime = (date) => {
      if (!date) return "00:00 AM";
      const options = { hour: "2-digit", minute: "2-digit", hour12: true };
      return new Date(date).toLocaleTimeString("en-US", options);
    };

    const bodySubmit = {
      name: values.name,
      userId: user?.user?._id,
      date: values.date,
      startTime: startTime,
      endTime: endTime,
    };

    console.log("bodySubmit: ", bodySubmit);
    // HoostaService.createHoosta(bodySubmit)
    dispatch(createHoosta(bodySubmit))
      .then((res = res?.payload) => {
        const params = {
          from: from,
          from2: from2,
          from3: pathname,
          clearform: true,
          selectedDate: selectedDate,
          endTime,
          endTime,
          startTime: startTime,
        };
        navigation.navigate("HoostaLocation", params);
        setName(null);
        setSelectedDate(null);
        setStartTimes({});
        setStartTime(null);
        setEndTimes({});
        setEndTime(null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error is: ", err);
        setIsLoading(false);
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
          <ScrollView style={{ paddingBottom: 10 }} ref={scrollViewRef}>
            <View style={styles.container}>
              <HoostaHeader handleBack={handleBack} />
              <View style={{ top: -20 }}>
                <View style={styles.formContainer}>
                  <Text allowFontScaling={false} style={styles.label}>
                    {i18n.t("global.nameofHootsa")}
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        allowFontScaling={false}
                        placeholder={i18n.t("global.nameofHootsa")}
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
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}
                </View>
                <Text allowFontScaling={false} style={styles.title}>
                  {i18n.t("global.timeandDate")}
                </Text>
                <View style={styles.calendarContainer}>
                  <Calendar
                    onDayPress={handleDateSelect}
                    markedDates={{
                      [selectedDate]: {
                        selected: true,
                        selectedColor: "#00adf5",
                      },
                    }}
                    theme={{
                      backgroundColor: "#000000",
                      calendarBackground: "#fff",
                      textSectionTitleColor: "#000000",
                      selectedDayBackgroundColor: "#fff",
                      selectedDayTextColor: "#fff",
                      todayTextColor: "#00adf5",
                      dayTextColor: "#000000",
                      textDisabledColor: "#000000",
                      textMonthFontWeight: "bold",
                    }}
                    // minDate={new Date()}
                    minDate={new Date().toISOString().split("T")[0]}
                  />
                  {errors.date && (
                    <Text style={styles.errorText}>{errors.date.message}</Text>
                  )}
                </View>
              </View>
              {selectedDate && (
                <>
                  <View
                    style={{
                      backgroundColor: "#ccc",
                      marginHorizontal: 22,
                      borderRadius: 5,
                      marginBottom: 5,
                    }}
                  >
                    <View style={styles.timeContainer}>
                      <CustomTimePicker onTimeSelected={setStartTime} />
                      <CustomTimePicker onTimeSelected={setEndTime} />
                    </View>
                  </View>
                </>
              )}
              {selectedDate &&
                startTimes[selectedDate] &&
                endTimes[selectedDate] && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      backgroundColor: "#ccc",
                      marginHorizontal: 22,
                      marginTop: 7,
                      paddingVertical: 16,
                      borderRadius: 5,
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.datetime}>
                      {selectedDate}
                    </Text>
                    <Text allowFontScaling={false} style={styles.datetime}>
                      {startTimes[selectedDate].toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      to{" "}
                      {endTimes[selectedDate].toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                )}
            </View>
          </ScrollView>
          {isLoading ? (
            <View style={styles.btncontainer}>
              <ActivityIndicator size={50} color="#0000ff" />
            </View>
          ) : (
            <>
              {isKeyboardOpen ? null : (
                <TouchableOpacity
                  onPress={handleSubmit(handleNext)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    // position: "absolute",
                    alignItems: "center",
                    alignSelf: "center",
                    // bottom: 5,
                    marginBottom: 5,
                    // flexDirection: "row",
                    // justifyContent: "space-evenly",
                    // alignItems: "center",
                    // alignSelf: "center",
                    // marginBottom: 10,
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
                        <Text allowFontScaling={false} style={styles.textbtn}>
                          {i18n.t("global.next")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}

          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={hideStartTimePicker}
          />
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={hideEndTimePicker}
          />
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HoostaDateAndTime;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  calendarContainer: {
    paddingHorizontal: 20,
  },
  buton: {
    width: "94%",
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
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    // marginBottom: 10,
    marginTop: 10,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
  },
  timeText: {
    fontSize: 16,
    fontFamily: "Roboto-Bold",
    fontWeight: "600",
  },
  toText: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: "#000000",
    fontWeight: "600",
  },
  datetime: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: "#000000",
    fontWeight: "700",
  },
  btncontainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
});
