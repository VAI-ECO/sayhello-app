import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import Connectionscomponent from "../../../Component/Connectionscomponent";
import userService from "../../../Services/userService";
import ProfileHeader from "../../../Component/ProfileHeader";
import { useAuth } from "../../../Context/AuthContext";
import i18n from "../../../Context/i18n";

const Connections = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const router = useRoute();
  const name = router.name;

  const [connections, setConnections] = useState([]);
  const [selectedButton, setSelectedButton] = useState("Connections");
  const [sortBy, setSortBy] = useState("asc");
  const [refreshing, setRefreshing] = useState(false);

  console.log(name,"p1")
  // Function to fetch connections
  const getConnections = () => {
    setLoading(true);
    console.log("user id of getUserConnections is: ", user?.user?._id);
    userService
      .getUserConnections(user?.user?._id)
      .then((res) => {
        setConnections(res.userConnections);
      })
      .catch((err) => {
        console.log(`Error in get connection: ${router.name}`, err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      getConnections();
      setSelectedButton("Connections");
    }, [navigation])
  );

  const togglesortBy = () => {
    setSortBy(sortBy === "asc" ? "desc" : "asc");
    sortChatsData();
  };

  const sortChatsData = () => {
    const sortedData = [...connections].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === "asc" ? dateA - dateB : dateB - dateA;
    });
    setConnections(sortedData);
  };

  const handleButtonPress = (buttonName) => {
    setSelectedButton(buttonName);
    if (buttonName === "Chats") {
      navigation.navigate("ChatList", { state: { refresh: true } });
    }

  };

  const handelNavigationPage = (userDetails) => {
    navigation.navigate("CompletedSurvey", { userDetails: userDetails, from: name });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      Promise.all([getConnections()])
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />
        }
      >
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
            <ProfileHeader />

            <View style={styles.btncontainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedButton === "Connections" && styles.selectedButton,
                ]}
                onPress={() => handleButtonPress("Connections")}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.buttonText,
                    selectedButton === "Connections" && styles.selectedText,
                  ]}
                >
                  {i18n.t("global.connections")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  selectedButton === "Chats" && styles.selectedButton,
                ]}
                onPress={() => handleButtonPress("Chats")}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.buttonText,
                    selectedButton === "Chats" && styles.selectedText,
                  ]}
                >
                  {i18n.t("global.chats")}
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ScrollView style={{ flex: 1, marginTop: 25 }}>
                <ActivityIndicator size="large" />
              </ScrollView>
            ) : (
              <ScrollView>
                {connections &&
                  connections
                    .filter((item) => !item.isBlock)
                    .map((item) => (
                      (<View key={item?._id} style={{ marginTop: 25 }}>
                        <Connectionscomponent
                          event={() => {
                            handelNavigationPage(item);
                          }}
                          userName={`${item?.firstname}`}
                          details={item}
                        />
                      </View>)
                    ))}
              </ScrollView>
            )}
          </View>
        </ImageBackground>
      </ScrollView>
    </View>
  );
};

export default Connections;

const styles = StyleSheet.create({
  container: {
    paddingTop: 45,
    flex: 1,
  },
  btncontainer: {
    flexDirection: "row",
    marginHorizontal: "5%",
    justifyContent: "space-evenly",
    marginTop: 25,
    backgroundColor: "#F3F2F2",
    borderRadius: 30,
  },
  button: {
    padding: 11,
    borderRadius: 30,
    width: "50%",
    alignSelf: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#000000",
  },
  selectedButton: {
    backgroundColor: "#338AFF",
  },
  selectedText: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#fff",
  },
  newestbox: {
    padding: 5,
    width: 95,
    borderWidth: 1,
    alignSelf: "flex-end",
    marginHorizontal: 25,
    marginTop: 25,
    marginBottom: 25,
    alignItems: "center",
    borderRadius: 6,
  },
  newesttext: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    paddingHorizontal: 7,
  },
  dropdown: {
    position: "absolute",
    top: 130,
    right: 25,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
    width: 100,
    borderWidth: 0.5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 5,
  },
});
