import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

import { CountryCodes } from "./countryCodes";

const CustomePhoneInput = ({ value, onChangeText, placeholder, onBlur, style, editable }) => {
  const [formattedValue, setFormattedValue] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // Default country code
  const [isModalVisible, setModalVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(CountryCodes);

  useEffect(() => {
    // Synchronize the formattedValue with the value prop
    if (value) {
      const cleanValue = value.replace(countryCode, ""); // Remove country code
      setFormattedValue(formatPhoneNumber(cleanValue));
    }
  }, [value, countryCode]);

  const handleChange = (text) => {
    const cleanedText = text.replace(/\D/g, ""); // Remove non-numeric characters
    const formattedText = formatPhoneNumber(cleanedText);

    setFormattedValue(formattedText);
    let number = `${countryCode}${cleanedText}`;
    onChangeText(number);
  };

  const formatPhoneNumber = (number) => {
    if (countryCode === "+91") {
      if (number.length <= 5) return number;
      return `${number.slice(0, 5)} - ${number.slice(5, 10)}`;
    }

    if (number.length <= 3) return number;
    if (number.length <= 6) return `${number.slice(0, 3)}-${number.slice(3)}`;
    return `${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6, 10)}`;
  };

  const handleSelectCountry = (code) => {
    setCountryCode(code);
    setModalVisible(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilteredData(
      CountryCodes.filter(
        (country) =>
          country.name.toLowerCase().includes(query.toLowerCase()) ||
          country.code.toLowerCase().includes(query.toLowerCase()) ||
          country.dial_code.includes(query)
      )
    );
  };

  // Memoize the filtered data to avoid unnecessary re-renders
  const memoizedFilteredData = useMemo(() => filteredData, [filteredData]);

  const RenderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleSelectCountry(item.dial_code)}
        style={styles.countryItem}
      >
        {/* <Image source={imageSource} /> */}
        <Text style={styles.countryItemText}>
          {item.name} ({item.dial_code})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        // onPress={() => {
        //   if (editable) {
        //     setModalVisible(true)
        //   }
        //   else {
        //     setModalVisible(false);
        //   }
        // }
        // }
        style={styles.countryCodeContainer}
      >
        <Text style={styles.countryCodeText}>
          {countryCode}
          <Entypo name="chevron-down" size={14} color="black" />
        </Text>
      </TouchableOpacity>
      <TextInput
        value={formattedValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        onBlur={onBlur}
        placeholderTextColor="#3C2828"
        keyboardType="phone-pad"
        style={styles.input}
        editable={editable}
        maxLength={14} // Adjust maxLength based on the country codes and formatting
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={styles.modalContainer}>
            <TextInput
              style={{
                height: 55,
                backgroundColor: "#fff",
                borderWidth: 1,
                paddingHorizontal: 15,
                marginHorizontal: 10,
                borderRadius: 40,
                marginTop: 10,
              }}
              placeholder="Search countries..."
              placeholderTextColor="#000000"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <FlatList
              data={memoizedFilteredData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <RenderItem item={item} />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 6,
  },
  input: {
    borderBottomColor: "#ccc",
    backgroundColor: "#F6F6F6",
    fontSize: 15,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#3C2828",
    paddingLeft: 5,
    borderRadius: 6,
    flex: 1,
  },
  label: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
  countryCodeContainer: {
    height: 55,
    borderBottomColor: "#ccc",
    justifyContent: "center",
    backgroundColor: "#F6F6F6",
    marginLeft: 12,
  },
  countryCodeText: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    fontWeight: "900",
    color: "#000000",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  countryItem: {
    backgroundColor: "white",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  countryItemText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
});

export default CustomePhoneInput;
