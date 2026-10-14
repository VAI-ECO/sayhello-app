import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import io from "socket.io-client";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../Context/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppConfig from "../../../../AppConfig";
import Toast from "react-native-toast-message";
import userService from "../../../../Services/userService";

const { width, height } = Dimensions.get("window");
const marginBottom = width <= 360 ? height * 0.001 : width < 768 ? height * 0.001 : height * 0.001;
const marginTop = width <= 360 ? height * 0.015 : width < 768 ? height * 0.02 : height * 0.02

function MessageBubble({ userId, message }) {
  const { user } = useAuth();

  return (
    <View
      style={{
        maxWidth: "80%",
        borderRadius: 15,
        padding: 10,
        alignSelf: userId === user.user._id ? "flex-end" : "flex-start",
        backgroundColor: userId === user.user._id ? "#007AFF" : "#F3F2F2",
      }}
    >
      <Text
        allowFontScaling={false}
        style={{
          color: userId === user.user._id ? "#fff" : "#000",
        }}
      >
        {message}
      </Text>
    </View>
  );
}

const Caht = () => {
  const { user } = useAuth();
  const router = useRoute();
  const { userDetails, userName, profileUrl, from } = router?.params || {};
  console.log(userDetails, userName, profileUrl, from, "router data");

  // const socket = io("https://api.sayhello.world/");
  const socket = useMemo(() => io(AppConfig.SocketBaseUrl, { autoConnect: false }), []);

  const [messages, setMessages] = useState([]);

  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const [chat, setChat] = useState({});
  const [allChat, setAllChat] = useState([]);
  const [currentChat, setCurrentChat] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));

  const translateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const handleNavigation = () => {
    navigation.navigate("ChatList")
  }

  const toggleMenu = () => {
    if (isVisible) {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start(() => setIsVisible(false));
    } else {
      setIsVisible(true);
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  };

  const handleMessageUpdate = (data) => {
    setAllChat(data);
    setLoading(false);
  };

  useEffect(() => {
    if (allChat && Array.isArray(allChat)) {
      let selectedChat = allChat.find((item) => item._id === chat?._id);
      setCurrentChat(selectedChat?.messages);
    }
  }, [allChat, chat?._id]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [currentChat]);

  const GetandStartChat = () => {
    if (userDetails) {
      setLoading(true);
      socket.off("allMessages-in-app");
      socket.on("allMessages-in-app", (data) => {
        handleMessageUpdate(data, chat);
      });
      socket.emit(
        "join-in-app-chat",
        { userId: user?.user?._id, receiverId: userDetails },
        (joinData) => {
          if (joinData?.error) {
            alert(joinData.error);
            setLoading(false);
            return;
          }
          setChat(joinData);
          socket.emit(
            "fetch-all-in-app-messages",
            { userId: user?.user?._id },
            (data) => handleMessageUpdate(data, joinData)
          );
        }
      );
    }
  }

  useEffect(() => {
    if (!userDetails || !user?.user?._id) return;
    socket.connect();
    GetandStartChat();
    const onConnectionError = () => {
      setLoading(false);
      Toast.show({ type: "error", text1: "Chat connection unavailable. Please try again." });
    };
    socket.on("connect_error", onConnectionError);
    return () => {
      socket.off("allMessages-in-app");
      socket.off("connect_error", onConnectionError);
      socket.disconnect();
    };
  }, [socket, userDetails, user?.user?._id]);

  const sendMessage = async (chat) => {
    if (!userDetails || !socket.connected) {
      Toast.show({ type: "error", text1: "Select a conversation and wait for chat to connect." });
      return;
    }
    if (message === "") {
      Toast.show({
        type: "error",
        text1: "Please Write a message",
      });
      return;
    }
    socket.emit(
      "sendMessage-in-app-chat",
      {
        message,
        senderId: user?.user?._id,
        receiverId: userDetails,
      },
      (data) => {
        console.log(data, " <==  I am data...");
      }
    );
    setMessage("");
  };

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([GetandStartChat()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const BlockUser = async (userConnectionId, userId) => {
    const body = {
      id: userId
    }
    await userService.blockUserMsg(userConnectionId, body)
    GetandStartChat();
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingVertical: 30,
        position: "relative",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 15,
          paddingRight:15
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
          }}
        >
          <TouchableOpacity
            onPress={handleNavigation}
            style={{
              justifyContent: "flex-start",
            }}
          >
            <Image
              style={{
                width: 35,
                height: 35,
                resizeMode: "contain",
              }}
              source={require("../../../../assets/btnbtn.png")}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "70%",
              overflow: "hidden",
              borderRadius: 10,
              paddingHorizontal: width * 0.02,
            }}
          >
            <Image
              style={[styles.profileImage, {
                width: width * 0.1,
                height: width * 0.1,
                marginRight: width * 0.02,
              }]}
              source={
                profileUrl && profileUrl.trim() !== ""
                  ? { uri: profileUrl }
                  : require("../../../../assets/profile_img.png")
              }
            />
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Roboto-Bold",
                fontSize: width * 0.05,
                flexShrink: 1,
                color: "#000",
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userName}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation?.openDrawer();
          }}
        >
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <FlatList
          data={currentChat}
          ref={flatListRef}
          renderItem={({ item }) => <MessageBubble {...item} />}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 10,
            gap: 10,
            paddingBottom: height * 0.05,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          automaticallyAdjustKeyboardInsets
        />

        {loading ?
          (
            <View>
              <ActivityIndicator size={30} />
              <Text style={styles.message}>{message}</Text>
            </View>
          ) : (
            (chat.receiverId === user?.user?._id && chat.receiverId === chat.blockedby_user_Id) ||
            (chat.senderId === user?.user?._id && chat.senderId === chat.blockedby_user_Id)
          ) && (
            <TouchableOpacity
              style={[styles.button, styles.unblockButton]}
              onPress={() => BlockUser(chat?._id, "")}
            >
              <Text style={styles.buttonText}>Unblock User</Text>
            </TouchableOpacity>
          )
        }

        <KeyboardAvoidingView
          // style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "position" : undefined}
          keyboardVerticalOffset={60}
        >
          <View
            style={{
              position: "relative",
            }}
          >
            <TextInput
              editable={chat.senderId !== chat.blockedby_user_Id && chat.receiverId !== chat.blockedby_user_Id}
              allowFontScaling={false}
              placeholder="Type your message"
              placeholderTextColor={"grey"}
              onChangeText={(text) => setMessage(text)}
              style={[{
                borderWidth: 1,
                borderColor: "gray",
                borderRadius: 100,
                padding: 15,
                color: "black",
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                backgroundColor: "#fff",
              }, (chat.senderId == chat.blockedby_user_Id || chat.receiverId == chat.blockedby_user_Id) && styles.disabledInput]}
              value={message}
            />
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center", // Center vertically
                alignItems: "center", // Center horizontally
                paddingRight: 20,
                elevation: 5,
                display: "flex",
                flexDirection: "row",
              }}
            >
              {chat.senderId !== chat.blockedby_user_Id && chat.receiverId !== chat.blockedby_user_Id ?
                (
                  <TouchableOpacity
                    onPress={() => sendMessage(chat)}>
                    <Image
                      source={require("../../../../assets/arrossend.png")}
                      resizeMode="contain"
                      style={{ width: width * 0.07 }}
                    />
                  </TouchableOpacity>
                ) :
                (<View></View>)
              }
              <TouchableOpacity onPress={toggleMenu} style={[styles.triggerButton]}>
                <Image
                  source={require("../../../../assets/ThreeDot.png")}
                  resizeMode="contain"
                  style={{ width: width * 0.06 }}
                />
                {/* <Text style={styles.triggerButtonText}>⋮</Text> */}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        <Modal
          transparent
          visible={isVisible}
          animationType="fade"
          onRequestClose={toggleMenu}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={toggleMenu}
          >
            <TouchableOpacity activeOpacity={1} style={styles.dropUpContainer}>
              <Animated.View
                style={[styles.dropUpContent, { transform: [{ translateY }] }]}
              >
                { }
                {(chat.receiverId !== chat.blockedby_user_Id && chat.senderId !== chat.blockedby_user_Id) ?
                  (
                    <TouchableOpacity
                      onPress={() => {
                        BlockUser(chat?._id, user?.user?._id);
                        toggleMenu();
                      }}
                      style={styles.menuItem}
                    >
                      <Text style={styles.menuText}>Block User</Text>
                    </TouchableOpacity>
                  ) :
                  (
                    <TouchableOpacity
                      onPress={() => {
                        BlockUser(chat?._id, "");
                        toggleMenu();
                      }}
                      style={styles.menuItem}
                    >
                      {
                        (
                          (chat.receiverId === user?.user?._id && chat.receiverId === chat.blockedby_user_Id) ||
                          (chat.senderId === user?.user?._id && chat.senderId === chat.blockedby_user_Id)
                        ) && (
                          <Text style={styles.menuText}>Unblock User</Text>
                        )
                      }
                    </TouchableOpacity>
                  )
                }
              </Animated.View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Caht;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontFamily: "Roboto-Bold",
    fontWeight: "bold",
  },
  profileImage: {
    width: 40,
    height: 40,
    marginEnd: 10,
    borderRadius: 20,
  },
  centeredButton: {
    position: "static",
    top: "50%",
    left: "15%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  button: {
    // flex: 1,
    borderRadius: 5,
    paddingVertical: height * 0.008,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  blockButton: {
    backgroundColor: "#e74c3c",
    marginRight: 5,
  },
  unblockButton: {
    backgroundColor: "transparent",
    marginLeft: 5,
    borderColor: "black",
    borderWidth: 1,
    width: "auto",
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
  triggerButton: {
    paddingLeft: width * 0.03,
    paddingRight: width * 0.01,
    paddingBottom: height * 0.001
  },
  triggerButtonText: {
    fontSize: height * 0.04,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dropUpContainer: {
    justifyContent: "flex-end",
  },
  dropUpContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "gray",
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
  profileImage: {
    borderRadius: 50,
    resizeMode: "cover",
    alignSelf: "center",
  },
});
