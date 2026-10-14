import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { Fragment } from "react";
import { Skeleton } from "moti/skeleton";
import { MotiView } from "moti";

const ChatLoader = () => {
  const array = Array.from({ length: 4 });

  return (
    <View
      style={{
        marginHorizontal: 15,
        gap: 20,
      }}
    >
      {array.map((_, index) => (
        <Fragment key={index}>
          <MotiView
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              gap: 20,
            }}
          >
            <Skeleton colorMode="light" radius="round" height={65} width={65} />

            <MotiView style={{ gap: 10 }}>
              <Skeleton colorMode="light" width={260} height={20} />
              <Skeleton colorMode="light" width={260} height={20} />
            </MotiView>
          </MotiView>
        </Fragment>
      ))}
    </View>
  );
};

export default ChatLoader;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
    alignSelf: "center",
  },
  usernametext: {
    fontSize: 18,
    fontWeight: "bold",
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
    marginBottom: 5,
    marginTop: 5,
  },
});
