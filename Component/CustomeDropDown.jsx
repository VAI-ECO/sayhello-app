import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

const CustomeDropDown = ({ value, onBlur, onChange, data }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [new_data, setNewData] = useState([]);

  useEffect(() => {
    setNewData(data);
  }, []);

  return (
    <Dropdown
      style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      // search
      dropdownPosition="top"
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={!isFocus ? "Select item" : "..."}
      searchPlaceholder="Search..."
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => {
        setIsFocus(false);
        onBlur();
      }}
      onChange={(item) => {
        onChange(item.value);
        setIsFocus(false);
      }}
    // onBlur={() => setIsFocus(false)}
    // onChange={(item) => {
    //   setValue(item.value);
    //   setIsFocus(false);
    // }}
    // renderLeftIcon={() => (
    //   <AntDesign
    //     style={styles.icon}
    //     color={isFocus ? "blue" : "black"}
    //     name="Safety"
    //     size={20}
    //   />
    // )}
    />
  );
};

export default CustomeDropDown;

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    paddingHorizontal: 8,
    backgroundColor: "#F6F6F6",
    width: "100%",
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 22,
    alignSelf: "center",
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
