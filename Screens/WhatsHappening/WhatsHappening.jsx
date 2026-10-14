import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import moment from "moment";
import { useState, useEffect, useCallback } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import ListItem from "./ListItem";
import AppConfig from "../../AppConfig";
import axios from "axios";

import { useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { getWhatshappeningAll } from "../../features/whatshappening/whatshappeningSlice";
import i18n from "../../Context/i18n";

const API_URL = `${AppConfig.ApiUrl}api/v1/whatshappening/all`;

const WhatsHappening = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;

  console.log(from, pathname, "p2");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [eventType, setEventType] = useState("Event Type");
  const [organizer, setOrganizer] = useState("Organizer Type");
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [showOrganizerDropdown, setShowOrganizerDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const eventTypes = ["Conference", "Meetup", "Workshop"];
  const organizers = ["Organizer 1", "Organizer 2", "Organizer 3"];

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
    console.log("Selected date:", day.dateString);
  };

  const handleBack = () => {
    navigation.navigate(from ? from : "Home");
    setPage(1);
    setData([]);
  };

  const fetchData = async (pageNum) => {
    if (loading) return;
    setLoading(true);

    if (pageNum === 1) {
      setData([]);
    }
    try {
      // const params = {
      //   pageNum:pageNum
      // }
      const response = await axios.get(`${API_URL}?page=${pageNum}&limit=10`);
      // const response = await dispatch(getWhatshappeningAll(params));

      const newData = response?.data?.data;

      setData((prevData) => [...(prevData || []), ...(newData || [])]);
      setHasMore(pageNum < response?.data?.totalPages);
      setPage(pageNum + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchData(page);
    }, [])
  );

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchData(page);
    }
  };

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setData([]);

    try {
      const response = await axios.get(`${API_URL}?page=1&limit=10`);
      setData(response.data.data);
      setHasMore(response.data.totalPages > 1);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderItem = ({ item }) => (
    <ListItem item={item} from={from} pathname={pathname} />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ImageBackground
        source={require("../../assets/ImageBackground.jpg")}
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
          <View style={styles.headrecontainer}>
            <TouchableOpacity onPress={handleBack}>
              <Image
                style={{
                  width: 35,
                  height: 35,
                  resizeMode: "contain",
                }}
                source={require("../../assets/btnbtn.png")}
              />
            </TouchableOpacity>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 18,
                fontWeight: "900",
                fontFamily: "Roboto-Regular",
                color: "#000000",
              }}
            >
              {i18n.t("global.whatsHappening")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation?.openDrawer();
              }}
            >
              <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
          </View>
          {/* <View style={styles.dropdownContainer}>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowEventTypeDropdown(!showEventTypeDropdown)}
              >
                <Text
                  allowFontScaling={false}
                  style={styles.dropdownButtonText}
                >
                  {eventType}
                </Text>
                <Ionicons
                  name={showEventTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={15}
                  color="black"
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>
              {showEventTypeDropdown && (
                <View style={styles.dropdown}>
                  {eventTypes.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setEventType(type);
                        setShowEventTypeDropdown(false);
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.dropdownItemText}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowOrganizerDropdown(!showOrganizerDropdown)}
              >
                <Text
                  allowFontScaling={false}
                  style={styles.dropdownButtonText}
                >
                  {organizer}
                </Text>
                <Ionicons
                  name={showOrganizerDropdown ? "chevron-up" : "chevron-down"}
                  size={15}
                  color="black"
                  style={styles.dropdownIcon}
                />
              </TouchableOpacity>
              {showOrganizerDropdown && (
                <View style={styles.dropdown}>
                  {organizers.map((name, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setOrganizer(name);
                        setShowOrganizerDropdown(false);
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.dropdownItemText}
                      >
                        {name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.thirdBox}
              onPress={() => setShowCalendar(true)}
            >
              <Text allowFontScaling={false} style={styles.dropdownButtonText}>
                Time & Date
              </Text>
            </TouchableOpacity>
          </View> */}

          <View style={{ paddingTop: 30 }}>
            <FlatList
              data={data}
              // keyExtractor={(item) => item._id}
              renderItem={renderItem}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              refreshing={refreshing} // Changed from loading to refreshing
              onRefresh={refreshData} // Enable the refresh function
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : null
              }
            />
          </View>

          <Modal
            visible={showCalendar}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCalendar(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowCalendar(false)}>
              <View style={styles.modalBackground}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContainer}>
                    <Calendar
                      onDayPress={handleDateSelect}
                      markedDates={{
                        [selectedDate]: {
                          selected: true,
                          selectedColor: "#00adf5",
                        },
                      }}
                      theme={{
                        backgroundColor: "#ffffff",
                        calendarBackground: "#fff",
                        textSectionTitleColor: "#000000",
                        selectedDayBackgroundColor: "#00adf5",
                        selectedDayTextColor: "#ffffff",
                        todayTextColor: "#00adf5",
                        dayTextColor: "#000000",
                        textDisabledColor: "#d9e1e8",
                        textMonthFontWeight: "bold",
                      }}
                      minDate={moment().format("YYYY-MM-DD")}
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowCalendar(false)}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.closeButtonText}
                      >
                        {i18n.t("global.closed")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
        <Text></Text>
        <Text></Text>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default WhatsHappening;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 45,
  },
  detailscontainer: {
    borderRadius: 10,
    marginHorizontal: 22,
    borderColor: "#000000",
    marginBottom: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  detailImage: {
    width: 60,
    height: 60,
    resizeMode: "cover",
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "black",
  },
  mainicon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    alignSelf: "center",
    marginRight: 10,
  },
  detailsbox: {
    alignItems: "center",
    width: 65,
    padding: 5,
    backgroundColor: "#5BBD4B",
    borderRadius: 6,
    borderWidth: 1,
  },
  headrecontainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 22,
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    gap: 10,
    marginTop: 20,
  },
  dropdownWrapper: {
    flex: 1,
    gap: 10,
  },
  dropdownButton: {
    backgroundColor: "#E5E5E5",
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#000000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  dropdownButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000000",
    fontFamily: "Roboto-Bold",
  },
  dropdownIcon: {
    position: "absolute",
    right: 4,
    justifyContent: "flex-start",
  },
  dropdown: {
    backgroundColor: "#fff",
    position: "absolute",
    top: 30,
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 6,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#000000",
    fontFamily: "Roboto-Regular",
  },
  thirdBox: {
    backgroundColor: "#E5E5E5",
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#000000",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#00adf5",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
