import React, { Fragment, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Skeleton } from "moti/skeleton";
import { MotiView } from "moti";

const ConnectionsLoader = ({ userName, details, event }) => {
  const [isSelected, setIsSelected] = useState(false);
  const handlePress = () => {
    setIsSelected(!isSelected);
  };

  const array = Array.from({ length: 10 });

  return (
    <>
      {array.map((_, index) => (
        <Fragment key={index}>
          <LinearGradient
            colors={
              isSelected
                ? ["#338AFF", "#00EDB4"]
                : ["transparent", "transparent"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1.2, y: 0.6 }}
            style={[
              styles.mainContainer,
              isSelected && styles.selectedContainer,
            ]}
          >
            <MotiView
              style={{
                padding: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 20,
              }}
            >
              <Skeleton
                colorMode="light"
                radius="round"
                height={55}
                width={55}
              />
              <Skeleton colorMode="light" width={280} height={20} />
            </MotiView>
          </LinearGradient>
        </Fragment>
      ))}
    </>
  );
};

export default ConnectionsLoader;

const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 20,
    borderColor: "#2E93F7",
  },
  selectedContainer: {
    backgroundColor: "#fff",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileImage: {
    width: 70,
    height: 70,
    resizeMode: "cover",
    alignSelf: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    flex: 1,
  },
  heatBox: {
    width: 35,
    height: 35,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
    borderWidth: 1,
    borderColor: "#D0411B",
    marginRight: 10,
  },
  removebox: {
    flexDirection: "row",
    alignItems: "center",
    width: 73,
    padding: 3,
    backgroundColor: "#FF3B3B",
    borderRadius: 15,
    marginRight: 6,
  },
});
