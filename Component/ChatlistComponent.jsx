import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

const ChatlistComponent = ({ detail, event, currentUserId }) => {
  const isSender = detail?.senderId?._id === currentUserId;
  const chatPartner = isSender ? detail.receiverId : detail.senderId;

  return (
    <>
      {
        detail.senderId._id !== detail.blockedby_user_Id && detail.receiverId._id !== detail.blockedby_user_Id &&
        (
          <TouchableOpacity onPress={() => event(chatPartner)}>
            <View style={styles.mainContainer}>
              {chatPartner?.profileUrl === "" ? (
                <Image
                  style={styles.profileImage}
                  source={require("../assets/profile_img.png")}
                />
              ) : (
                <Image
                  style={styles.profileImage}
                  source={{ uri: chatPartner?.profileUrl }}
                />
              )}

              <View style={{ marginLeft: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingRight: 75,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                    }}
                  >
                    <Text allowFontScaling={false} style={styles.usernametext}>
                      {chatPartner?.username}
                    </Text>
                    <Text allowFontScaling={false} style={styles.datetext}>
                      {formatDate(detail?.updatedAt)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
          </TouchableOpacity>
        )
      }

      {
        (detail.senderId._id == detail.blockedby_user_Id) &&
        (
          detail.senderId._id == currentUserId ?
            (
              <TouchableOpacity onPress={() => event(chatPartner)}>
                <View style={styles.mainContainer}>
                  <Image
                    style={styles.profileImage}
                    source={require("../assets/profile_img.png")}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingRight: 75,
                      }}
                    >
                      <View
                        style={{
                          width: "100%",
                        }}
                      >
                        <Text allowFontScaling={false} style={styles.usernametext}>
                          {chatPartner?.username}
                        </Text>
                        <Text allowFontScaling={false} style={styles.datetext}>
                          User Blocked
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.divider} />
              </TouchableOpacity>
            ) :
            (
              <View></View>
            )
        )
      }

      {
        (detail.receiverId._id == detail.blockedby_user_Id) &&
        (
          detail.receiverId._id == currentUserId ?
            (
              <TouchableOpacity onPress={() => event(chatPartner)}>
                <View style={styles.mainContainer}>
                  <Image
                    style={styles.profileImage}
                    source={require("../assets/profile_img.png")}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingRight: 75,
                      }}
                    >
                      <View
                        style={{
                          width: "100%",
                        }}
                      >
                        <Text allowFontScaling={false} style={styles.usernametext}>
                          {chatPartner?.username}
                        </Text>
                        <Text allowFontScaling={false} style={styles.datetext}>
                          User Blocked
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.divider} />
              </TouchableOpacity>
            ) :
            (
              <View></View>
            )
        )
      }
    </>
  );
};

export default ChatlistComponent;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    marginTop: 25,
    marginHorizontal: 15,
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    resizeMode: "cover",
    alignSelf: "center",
  },
  usernametext: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginBottom: 5,
  },
  datetext: {
    fontSize: 16,
    fontWeight: "300",
    fontFamily: "Roboto-Regular",
    color: "#999999",
  },
  discription: {
    fontSize: 12,
    fontWeight: "900",
    fontFamily: "Roboto-Regular",
    color: "#888888",
    paddingRight: 80,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F2F2",
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 10,
  },
});
