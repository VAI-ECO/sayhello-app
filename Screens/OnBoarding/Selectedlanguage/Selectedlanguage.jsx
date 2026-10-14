import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { EvilIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Header from "../../../Component/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LanguageContext } from "../../../Context/LanguageContext";
import i18n from "../../../Context/i18n";

const languagesData = [
  { label: "Arabic", value: "ar", image: require("../../../assets/flags/SA.png") },
  { label: "Bengali", value: "bn", image: require("../../../assets/flags/BD.png") },
  { label: "German", value: "de", image: require("../../../assets/flags/DE.png") },
  { label: "English", value: "en", image: require("../../../assets/flags/US.png") },
  { label: "French", value: "fr", image: require("../../../assets/flags/FR.png") },
  { label: "Hausa", value: "ha", image: require("../../../assets/flags/CC.png") },
  { label: "Hindi", value: "hi", image: require("../../../assets/flags/IN.png") },
  { label: "Indonesian", value: "id", image: require("../../../assets/flags/ID.png") },
  { label: "Japanese", value: "ja", image: require("../../../assets/flags/JP.png") },
  { label: "Korean", value: "ko", image: require("../../../assets/flags/KR.png") },
  { label: "Marathi", value: "mr", image: require("../../../assets/flags/IN.png") },
  { label: "Portuguese", value: "pt", image: require("../../../assets/flags/PT.png") },
  { label: "Russian", value: "ru", image: require("../../../assets/flags/RU.png") },
  { label: "Tamil", value: "ta", image: require("../../../assets/flags/IN.png") },
  { label: "Telugu", value: "te", image: require("../../../assets/flags/IN.png") },
  { label: "Turkish", value: "tr", image: require("../../../assets/flags/TR.png") },
  { label: "Urdu", value: "ur", image: require("../../../assets/flags/PK.png") },
  { label: "Vietnamese", value: "vi", image: require("../../../assets/flags/VN.png") },
  { label: "Chinese", value: "zh", image: require("../../../assets/flags/CN.png") },
  { label: "Spanish", value: "es", image: require("../../../assets/flags/AR.png") },
];

const Selectedlanguage = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState("English");
  const [search, setSearch] = useState("");
  const [allLanguagesData, setAllLanguagesData] = useState([]);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const { changeLanguage } = useContext(LanguageContext);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardOpen(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardOpen(false);
      }
    );

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  const handleSearch = (search) => {
    if (search === "") {
      setAllLanguagesData(languagesData);
    } else {
      const data = languagesData.filter((el) =>
        el.value.toLowerCase().includes(search.toLowerCase()) || el.label.toLowerCase().includes(search.toLowerCase())
      );
      setAllLanguagesData(data);
    }
  };

  useEffect(() => {
    handleSearch(search);
  }, [search]);

  useEffect(() => {
    const storeData = async (value) => {
      try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem("selected_language", jsonValue);
      } catch (e) {
        // saving error
        console.log("e", e);
      }
    };

    storeData(selectedOption);
  }, [selectedOption]);

  const handelChangeSelection = (value) => {
    setSelectedOption(value);
    changeLanguage(value);
  };

  const Item = ({ item }) => (
    <>
      <TouchableOpacity
        style={[
          styles.optionContainer,
          selectedOption === item.value && styles.selectedOption,
        ]}
        onPress={() => handelChangeSelection(item.value)}
      >
        <View style={styles.optionContent}>
          <Image style={styles.image} source={item.image} />
          <Text allowFontScaling={false} style={styles.languagetext}>
            {item?.label}
          </Text>
        </View>
        {selectedOption === item.value && (
          <AntDesign name="check" size={30} color="#338AFF" />
        )}
      </TouchableOpacity>
      <View style={styles.divider} />
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#fff", height: "100%" }}
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
            <Header title={i18n.t("global.Selectthelanguage")} />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View style={styles.searchContainer}>
                <EvilIcons name="search" size={26} color="#BBBBBB" />
                <TextInput
                  allowFontScaling={false}
                  style={styles.searchInput}
                  placeholder="Search language"
                  placeholderTextColor="#BBBBBB"
                  onChangeText={setSearch}
                />
              </View>
            </KeyboardAvoidingView>
            <View style={{ flex: 1 }}>
              <FlatList
                data={allLanguagesData}
                renderItem={Item}
                keyExtractor={(item) => item.label}
              />
            </View>
            {isKeyboardOpen ? null : (
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate("SelectedRole")}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      fontFamily: "Inter-Regular",
                      color: "#fff",
                    }}
                  >
                    Keep going
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Selectedlanguage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 42,
    backgroundColor: "#F1F1F1",
    borderRadius: 4,
    marginHorizontal: 23,
    marginTop: 20,
    marginBottom: 15,
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    color: "#000000",
    paddingLeft: 10,
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    fontWeight: "400",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontFamily: "Roboto-Regular",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 25,
    color: "#000000",
  },
  image: {
    width: 40,
    resizeMode: "contain",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginBottom: 1,
  },
  languagetext: {
    fontFamily: "Roboto-Regular",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 30,
    color: "#000000",
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
  },
});
