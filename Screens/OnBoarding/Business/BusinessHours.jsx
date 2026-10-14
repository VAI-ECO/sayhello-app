import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Switch,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../../Component/Header";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import BusinessService from "../../../Services/BusinessService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../../Component/Loader";
import i18n from "../../../Context/i18n";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const BusinessHours = () => {
  const [enabledDays, setEnabledDays] = useState(Array(7).fill(false));
  const navigation = useNavigation();
  // const router = useRoute();
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [startTimes, setStartTimes] = useState(Array(7).fill(null));
  const [endTimes, setEndTimes] = useState(Array(7).fill(null));

  const [isLoading, setIsLoading] = useState(false);
  const [businessDetails, setBusinessDetails] = useState(null);

  useEffect(() => {
    const getBusinessDetailsFromLocalSorage = async () => {
      let result = await AsyncStorage.getItem(`BusinessCatagory`);
      let parse_result = JSON.parse(result);
      setBusinessDetails(parse_result);
    };
    getBusinessDetailsFromLocalSorage();
  }, []);

  const toggleSwitch = (index) => {
    setEnabledDays((prev) => {
      const newDays = [...prev];
      newDays[index] = !newDays[index];
      return newDays;
    });
  };

  const showStartTimePicker = (index) => {
    setSelectedDayIndex(index);
    setStartTimePickerVisible(true);
  };

  const showEndTimePicker = (index) => {
    setSelectedDayIndex(index);
    setEndTimePickerVisible(true);
  };

  const hideStartTimePicker = () => setStartTimePickerVisible(false);
  const hideEndTimePicker = () => setEndTimePickerVisible(false);

  const handleStartTimeConfirm = (time) => {
    setStartTimes((prev) => {
      const newTimes = [...prev];
      newTimes[selectedDayIndex] = new Date(time);
      return newTimes;
    });
    hideStartTimePicker();
  };

  const handleEndTimeConfirm = (time) => {
    setEndTimes((prev) => {
      const newTimes = [...prev];
      newTimes[selectedDayIndex] = new Date(time);
      return newTimes;
    });
    hideEndTimePicker();
  };

  function formatTime(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null; // Handle invalid dates

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutesFormatted}${ampm}`;
  }

  const formattedSchedule = daysOfWeek.map((day, index) => {
    if (!enabledDays[index]) {
      return `${day}: Closed`;
    }

    const startTime = formatTime(startTimes[index]);
    const endTime = formatTime(endTimes[index]);

    if (startTime && endTime) {
      return `${day}: ${startTime} - ${endTime}`;
    }

    // Default schedule for days where start or end times are null
    if (index < 5) {
      return `${day}: 9:00am - 5:00pm`;
    } else if (index === 5) {
      return `${day}: 10:00am - 4:00pm`;
    } else {
      return `${day}: Closed`;
    }
  });

  // console.log("formattedSchedule", formattedSchedule);

  const parseTime = (timeStr) => {
    if (!timeStr) return null;

    new_time_str = "";

    if (timeStr.includes("am")) {
      new_time_str = timeStr.replace("am", " am");
    }

    if (timeStr.includes("pm")) {
      new_time_str = timeStr.replace("pm", " pm");
    }

    // Standardize the time format by adding ":00" if not present
    let [time, modifier] = new_time_str.split(" ");
    if (time.indexOf(":") === -1) {
      time += ":00";
    }

    let [hour, minute] = time.split(":").map(Number);

    if (modifier === "pm" && hour !== 12) {
      hour += 12;
    } else if (modifier === "am" && hour === 12) {
      hour = 0;
    }

    const date = new Date();
    date.setHours(hour, minute, 0, 0); // set hours, minutes, seconds, milliseconds

    return date;
  };

  const getStoreBusinessDetails = async () => {
    let result = await AsyncStorage.getItem("BusinessDetails");
    let parse_result = JSON.parse(result);

    if (parse_result?.businessHours) {
      const parsedStartTimes = Array(7).fill(null);
      const parsedEndTimes = Array(7).fill(null);
      const parsedEnabledDays = Array(7).fill(false);

      parse_result.businessHours.forEach((hours, index) => {
        if (hours.includes("Closed")) {
          parsedStartTimes[index] = null;
          parsedEndTimes[index] = null;
        } else {
          const [day, timeRange] = hours.split(": ");
          const [start, end] = timeRange.split(" - ");

          const startTime = parseTime(start);
          const endTime = parseTime(end);

          parsedStartTimes[index] = startTime;
          parsedEndTimes[index] = endTime;
          parsedEnabledDays[index] = true;
        }
      });

      setStartTimes(parsedStartTimes);
      setEndTimes(parsedEndTimes);
      setEnabledDays(parsedEnabledDays);
    }
  };

  useEffect(() => {
    getStoreBusinessDetails();
  }, []);
  const handleSubmit = () => {
    setIsLoading(true);
    let body = {
      businessHours: formattedSchedule,
    };

    BusinessService.UpdateBusinessHours(businessDetails?.businessId, body)
      .then((response) => {
        navigation.navigate("BusinesSocial");
        // navigation.navigate("BusinesSocial", {
        //   orgData: router?.params?.orgData,
        // });
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
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
            {/* <Header title="" /> */}
            <Image
              source={require("../../../assets/busniessicon.png")}
              style={styles.orglogo}
              resizeMode="contain"
            />
            <Text allowFontScaling={false} style={styles.title}>
              {i18n.t("global.businessHours")}
            </Text>
            {daysOfWeek.map((day, index) => (
              <View key={day}>
                <View style={styles.row}>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={enabledDays[index] ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => toggleSwitch(index)}
                    value={enabledDays[index]}
                    style={styles.switch}
                  />
                  <Text allowFontScaling={false} style={styles.dayText}>
                    {day}
                  </Text>
                  {enabledDays[index] ? (
                    <>
                      <TouchableOpacity
                        style={styles.timeContainer}
                        onPress={() => showStartTimePicker(index)}
                      >
                        <Text allowFontScaling={false} style={styles.timeText}>
                          {startTimes[index] instanceof Date &&
                          !isNaN(startTimes[index].getTime())
                            ? startTimes[index].toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Start Time"}
                        </Text>
                      </TouchableOpacity>
                      <Text allowFontScaling={false} style={styles.toText}>
                        To
                      </Text>
                      <TouchableOpacity
                        style={styles.timeContainer}
                        onPress={() => showEndTimePicker(index)}
                      >
                        <Text allowFontScaling={false} style={styles.timeText}>
                          {endTimes[index] instanceof Date &&
                          !isNaN(endTimes[index].getTime())
                            ? endTimes[index].toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "End Time"}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text allowFontScaling={false} style={styles.closeText}>
                      Closed
                    </Text>
                  )}
                </View>
                {index < daysOfWeek.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}

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
                  onPress={() => handleSubmit()}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text allowFontScaling={false} style={styles.buttonText}>
                    {i18n.t("global.next")}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BusinessHours;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 55,
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  switch: {
    marginRight: 10,
  },
  dayText: {
    fontSize: 12,
    flex: 1,
    fontFamily: "Roboto-Bold",
    fontWeight: "900",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Roboto-Bold",
    fontWeight: "600",
  },
  selectTimeText: {
    fontSize: 14,
    fontFamily: "Roboto-Bold",
    fontWeight: "600",
    color: "#007AFF",
  },
  toText: {
    fontSize: 14,
    fontFamily: "Roboto-Bold",
    fontWeight: "600",
    marginHorizontal: 10,
  },
  closeText: {
    fontSize: 16,
    flex: 2,
    textAlign: "right",
    color: "#999",
  },
  plusButton: {
    flex: 0.5,
    alignItems: "flex-end",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 20,
    marginBottom: 5,
    marginTop: 5,
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 7,
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
