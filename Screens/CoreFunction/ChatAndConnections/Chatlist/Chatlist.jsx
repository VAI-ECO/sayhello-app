import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import io from "socket.io-client";
import React, { Fragment, useEffect, useState, useMemo } from "react";
import Header from "../../../../Component/Header";
import { Entypo } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ChatlistComponent from "../../../../Component/ChatlistComponent";
import { useAuth } from "../../../../Context/AuthContext";
import ChatLoader from "../../../../Component/ChatLoader";
import ProfileHeader from "../../../../Component/ProfileHeader";
import i18n from "../../../../Context/i18n";
import AppConfig from "../../../../AppConfig";

const Chatlist = () => {
  const { user } = useAuth();
  // const socket = io("https://api.sayhello.world/", {
  //   transports: ["websocket"],
  // });
  const route = useRoute();
  const { state } = route?.params || {};

  const socket = useMemo(() => io(AppConfig.SocketBaseUrl, {
    transports: ["websocket"],
    autoConnect: false,
  }), []);
  const navigation = useNavigation();
  const [ChatsData, setChatsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedButton, setSelectedButton] = useState("Chats");
  const [refreshing, setRefreshing] = useState(false);

  const handelOpenChat = (user) => {
    navigation.navigate("Chat", {
      userDetails: user?._id,
      userName: user?.username,
      profileUrl:user?.profileUrl,
      from: "ChatList"
    });
    console.log(user?.profileUrl,"dataa")
  };

  const toggleSortOrder = () => {
    const nextOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(nextOrder);
    sortChatsData(nextOrder);
  };

  const sortChatsData = (order = sortOrder) => {
    const sortedData = [...ChatsData].sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      if (order === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
    setChatsData(sortedData);
  };

  const fetchAllMessages = () => {
    setLoading(true)
    socket.emit(
      "fetch-all-in-app-messages",
      { userId: user?.user?._id },
      (data) => {
        console.log(data, 'chatdata')
        setChatsData(Array.isArray(data) ? data : []);
        setLoading(false)
      }
    );
  };

  useEffect(() => {
    if (!user?.user?._id) return;
    socket.connect();
    const onConnectionError = () => setLoading(false);
    socket.on("connect_error", onConnectionError);
    fetchAllMessages();
    return () => {
      socket.off("connect_error", onConnectionError);
      socket.disconnect();
    };
  }, [state, socket, user?.user?._id]);

  const handleButtonPress = (buttonName) => {
    if (buttonName === "Connections") {
      navigation.navigate("Connections");
    } else {
      setSelectedButton("Chats");
    }
  };

  const getUniqueChatDetails = (details) => {
    const uniqueDetails = [];
    const seenIds = new Set();

    details.forEach((detail) => {
      const senderId = detail?.senderId?._id;
      const receiverId = detail?.receiverId?._id;

      if (senderId && receiverId && senderId !== receiverId) {
        const key = `${senderId}-${receiverId}`;

        if (!seenIds.has(key)) {
          uniqueDetails.push(detail);
          seenIds.add(key);
        }
      }
    });
    return uniqueDetails?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  };

  let uniqueChatDetails = getUniqueChatDetails(ChatsData);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchAllMessages()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />
        }
      >
        <ImageBackground
          source={require("../../../../assets/ImageBackground.jpg")}
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

            <ScrollView>
              {loading ? (
                <ScrollView style={{ flex: 1, marginTop: 25 }}>
                  <ActivityIndicator size="large" />
                </ScrollView>
              ) : (
                <>
                  {uniqueChatDetails?.map((chat, idx) => (
                    <Fragment key={idx}>
                      <ChatlistComponent detail={chat} event={handelOpenChat} currentUserId={user?.user?._id} />
                    </Fragment>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chatlist;

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
    alignItems: "center",
    borderRadius: 6,
    marginBottom: 25,
  },
  newesttext: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    paddingHorizontal: 7,
  },
});
