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
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import PosingHeader from "../../../Component/PosingHeader";
import { Calendar } from "react-native-calendars";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import DiscountService from "../../../Services/DiscountService";
import PosingDiscountHeader from "../../../Component/PosingDiscountHeader";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import Loader from "../../../Component/Loader";
import CustomTimePicker from "../../../Component/CustomTimePicker";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import moment from 'moment';
import i18n from "../../../Context/i18n";

const PostDateAndTime = () => {
  const PostDiscount = useSelector((state) => state?.discount?.DiscountData?.postDiscount);
  console.log(PostDiscount?._id, "discout Id is this")

  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;
  const from3 = router?.params?.from3;
  const clearform = router?.params?.clearform;
  const selectedDatebackroute = router?.params?.selectedDate;
  const startTimesbackroute = router?.params?.startTime;
  const endTimesbackroute = router?.params?.endTime;

  console.log(from, from2, from3, pathname, clearform, selectedDatebackroute, startTimesbackroute, endTimesbackroute, "p4");


  // States for dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [link, setLink] = useState("");
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
  const [selectingEndDate, setSelectingEndDate] = useState(false);

  const validationSchema = Yup.object().shape({
    link: Yup.string().required("* Link is required"),
  });

  useEffect(() => {
    console.log(endTimesbackroute, "datatatatata")
    if (selectedDatebackroute || startTimesbackroute || endTimesbackroute) {
      setSelectedDate(selectedDatebackroute || null);
      setEndTime(endTimesbackroute || null);
      setStartTime(startTimesbackroute || null)
    }
    if (clearform) {
      reset({
        startdate: "",
        enddate: "",
        link: "",
      });
      setSelectedDate(null)
    }
  }, [router])

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      startdate: "",
      enddate: "",
      link: "",
    },
  });

  const handleNext = (values) => {
    setIsLoading(true);

    // if (!startDate || !link) {
    //   Toast.show({
    //     type: "error",
    //     text1: "Please fill all Details!",
    //   });
    //   setIsLoading(false);

    //   return;
    // }

    // DiscountService.updateDiscountTime(route?.params?.discountId, {
    DiscountService.updateDiscountTime(PostDiscount?._id, {
      time: `${startTime} - ${endTime}`,
      startDate: values.startdate,
      endDate: values.enddate,
      websiteLink: values.link,
    })
      .then((res) => {
        console.log("Res of the update time: ", res);
        const params = {
          from: from,
          from2: from2,
          from3: from3,
          from4: pathname,
          clearform: true,
          selectedDate: selectedDate,
          endTime, endTime,
          startTime: startTime,
        }
        navigation.navigate("PostImage",params);
        // navigation.navigate("PostImage", {
        //   discountId: route?.params?.discountId,
        // });
        setIsLoading(false);
        setStartDate("");
        setEndDate("");
        setLink("");
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("Err: ", err);
      });
  };

  const handleDateSelect = (day) => {
    if (selectingEndDate) {
      setEndDate(day.dateString);
      setValue("enddate", day.dateString)
      setSelectingEndDate(false);
    } else {
      setStartDate(day.dateString);
      setValue("startdate", day.dateString)
      setSelectingEndDate(true);
    }

    setSelectedDate(day.dateString);

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

  const handleBack = () => {
    navigation.navigate(from3, { from: from, from2: from2 });
  }
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
          <ScrollView style={{ marginBottom: 30 }}>
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
                  top: -10,
                }}
              >
                {i18n.t("DiscountScan.hookupExpiryTimeanddate")}
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
                  minDate={moment(new Date()).format('YYYY-MM-DD')}
                />
                {errors.startdate && <Text style={styles.errorText}>{errors.startdate.message}</Text>}
                {errors.enddate && <Text style={styles.errorText}>{errors.enddate.message}</Text>}
              </View>
              {selectedDate && (
                <>
                  <View
                    style={{
                      backgroundColor: "#ccc",
                      marginHorizontal: 22,
                      borderRadius: 5,
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
              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Roboto-Regular",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#000000",
                  marginTop: "1%",
                  marginHorizontal: 40,
                }}
              >
                {i18n.t("global.link")}
              </Text>
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="web" size={30} color="black" />
                </View>

                <Controller
                  control={control}
                  name="link"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      allowFontScaling={false}
                      style={styles.input}
                      placeholder=""
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </View>
              {errors.link && <Text style={{ ...styles.errorText, marginLeft: 20 }}>{errors.link.message}</Text>}
            </View>
          </ScrollView>
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
                  bottom: 1,
                }}
              >
                {isLoading ? (
                  <Loader />
                ) : (
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
                )}
              </TouchableOpacity>
            )}
          </>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default PostDateAndTime;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    paddingBottom: 20
  },
  calendarContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 0,
  },
  iconContainer: {
    // width: 60,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    // flex: 1,
    width: "91%",
    height: 40,
    backgroundColor: "#EDF5F4",
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
  buton: {
    width: "95%",
    height: 40,
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
});
