import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const InterestItem = ({
  interestName,
  handleSelectIntrest,
  selectedIntresets,
}) => {
  const [selected, setSelected] = useState(false);

  const handleIntrestPress = (name, event) => {
    event.persist();
    handleSelectIntrest(name);
  };

  return (
    <TouchableOpacity
      onPress={(event) => handleIntrestPress(interestName, event)}
      style={{
        flexDirection: "row",
        // flexWrap: "wrap",
        width: "auto",
        padding: 9,
        borderWidth: 1,
        borderColor: selectedIntresets?.includes(interestName)
          ? "#3389FE"
          : "#A2A09D",
        backgroundColor: selectedIntresets?.includes(interestName)
          ? "#3389FE"
          : "transparent",
        borderRadius: 8,
        marginBottom: 10,
        marginLeft: 5,
        alignItems: "center",
      }}
    >
      <AntDesign
        name={selectedIntresets?.includes(interestName) ? "check" : "plus"}
        size={17}
        color={selectedIntresets?.includes(interestName) ? "#fff" : "black"}
      />
      <Text
        allowFontScaling={false}
        style={{
          color: selectedIntresets?.includes(interestName) ? "#fff" : "#2F2924",
          fontWeight: "800",
          fontSize: 12,
          fontFamily: "Assistant-Regular",
          alignSelf: "center",
          paddingLeft: 5,
        }}
      >
        {interestName}
      </Text>
    </TouchableOpacity>
  );
};

export default InterestItem;
