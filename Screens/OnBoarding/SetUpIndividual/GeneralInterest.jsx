import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import Header from "../../../Component/Header";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import InterestItem from "../../../Component/InterestItem";
import { useNavigation } from "@react-navigation/native";
import intresetService from "../../../Services/intresetService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import Loader from "../../../Component/Loader";
import i18n from "../../../Context/i18n";

const GeneralInterest = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [intresets, setIntresets] = useState([]);
  const [selectedIntresets, setSelectedIntresets] = useState([]);
  const [user_info, setUser_info] = useState(null);
  const [openModel, setOpenModel] = useState(false);
  const [newIntrest, setNewIntrest] = useState(null);
  const [numToShow, setNumToShow] = useState(20);
  const [error, setShowError] = useState(false);
  console.log("intresets", intresets.length);

  // Get the screen width and calculate the number of columns
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = 100; // Adjust the item width based on your item component
  const numColumns = Math.floor(screenWidth / itemWidth);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem("user_info");

      console.log("value", value);

      if (value !== null) {
        // value previously stored
        const new_val = JSON.parse(value);
        setUser_info(new_val);
      }
    } catch (e) {
      // error reading value
      console.log("e", e);
    }
  };

  const loadMoreItems = () => {
    setNumToShow(numToShow + 10); // Increase number of items to show by 10
  };

  const showLessItems = () => {
    setNumToShow(20); // Reset number of items to show to initial value
  };

  useEffect(() => {
    getData();
  }, []);

  const generalIntreset = () => {
    console.log("hi");

    intresetService
      .getIntresets()
      .then((res) => {
        const data = res.interests;

        console.log("data", data[data.leng]);

        setIntresets(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };

  const handelSaveIntresets = () => {
    if (selectedIntresets.length < 1) {
      setShowError(true);
      return;
    }
    setIsLoading(true);
    const body = {
      userId: user_info._id,
      interests: selectedIntresets,
    };
    intresetService
      .SaveIntreset(body)
      .then((res) => {
        console.log("resdsasdasdasdsadas", res);
        generalIntreset();

        navigation.navigate("RomanticlInfo");
      })
      .catch((err) => {
        setIsLoading(false);
        Toast.show({
          type: "error",
          text1: "Something Went Wrong!",
          autoHide: true,
          visibilityTime: 2000,
        });
      });
  };
  useEffect(() => {
    generalIntreset();
  }, []);

  const handleSelectIntrest = (name) => {
    const condition = selectedIntresets?.includes(name);
    if (condition) {
      setSelectedIntresets(selectedIntresets?.filter((item) => item !== name));
    } else {
      setSelectedIntresets([...selectedIntresets, name]);
    }
  };

  const onClose = () => {
    setNewIntrest("");
    setShowError(false);
    setOpenModel(false);
  };

  const handleAddNewIntrest = () => {
    if (!newIntrest) {
      setShowError(true);
      return;
    }
    console.log("newIntrest", newIntrest);
    const body = {
      name: newIntrest,
    };

    intresetService
      .CreateIntrest(body)
      .then((res) => {
        console.log(res);
        setOpenModel(false);
        setNewIntrest(null);
        generalIntreset();
      })
      .catch((err) => {
        console.log(err);
        Toast.show({
          type: "error",
          text1: "The Intrest Already exitst!",
          autoHide: true,
          visibilityTime: 2000,
        });
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
          {/* <Header title="" /> */}
          <Text allowFontScaling={false} style={styles.interesttext}>
            {i18n.t("GeneralInterest.myInterests")}
          </Text>
          <TouchableOpacity style={{ width: "15%" }}>
            <View
              style={{
                width: 175,
                borderRadius: 10,
                marginTop: 15,
                marginHorizontal: 22,
                marginBottom: 20,
              }}
            >
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={{
                  borderRadius: 6,
                  padding: 11,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <TouchableOpacity
                  onPress={() => setOpenModel(true)}
                  style={{
                    flexDirection: "row",
                  }}
                >
                  <AntDesign name="plus" size={20} color="#fff" />
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: 14,
                      fontFamily: "Inter-Regular",
                      alignSelf: "center",
                      paddingLeft: 7,
                    }}
                  >
                    {i18n.t("GeneralInterest.addanewinterest")}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={openModel}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{ alignSelf: "flex-end" }}
                >
                  <Entypo name="cross" size={26} color="#000000" />
                </TouchableOpacity>

                <KeyboardAvoidingView>
                  <Text
                    allowFontScaling={false}
                    style={{
                      marginBottom: 10,
                      color: "#000000",
                      fontWeight: "600",
                      fontSize: 16,
                      fontFamily: "Inter-Regular",
                      marginHorizontal: 10,
                    }}
                  >
                    {i18n.t("GeneralInterest.addIntrest")}
                  </Text>
                  {error && (
                    <Text
                      fontSize={18}
                      style={{
                        marginLeft: 10,
                        marginBottom: 5,
                        marginTop: 0,
                        color: "red",
                      }}
                    >
                      {i18n.t("GeneralInterest.leasefillouthisfield")}
                    </Text>
                  )}
                  <TextInput
                    allowFontScaling={false}
                    placeholder="Enter your interest"
                    style={{
                      ...styles.inputField,
                      fontSize: 15,
                      fontFamily: "Roboto-Regular",
                      fontWeight: "600",
                      color: "#000000",
                      paddingLeft: 20,
                    }}
                    value={newIntrest}
                    onChangeText={(text) => {
                      setNewIntrest(text);
                      setShowError(false);
                    }}
                    placeholderTextColor="#A7A7A8"
                  />
                  <TouchableOpacity
                    onPress={() => handleAddNewIntrest()}
                    // disabled={!newIntrest}
                  >
                    <LinearGradient
                      colors={["#338AFF", "#00EDB4"]}
                      style={{
                        width: "95%",
                        height: 50,
                        borderRadius: 10,
                        alignSelf: "center",
                        marginTop: 20,
                        bottom: 22,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1.2, y: 0.6 }}
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
                        {i18n.t("global.save")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </View>
            </View>
          </Modal>

          {error && (
            <Text
              fontSize={18}
              style={{
                marginLeft: 20,
                marginBottom: 10,
                marginTop: 0,
                color: "red",
              }}
            >
              * Select atleast one Interest
            </Text>
          )}
          <FlatList
            data={intresets.slice(0, numToShow)}
            renderItem={({ item }) => (
              <InterestItem
                interestName={item.name}
                handleSelectIntrest={handleSelectIntrest}
                selectedIntresets={selectedIntresets}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
            numColumns={numColumns}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
        <View
          style={{
            width: "100%",
            position: "absolute",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 15,
            backgroundColor: "#fff",
          }}
        >
          {intresets.length > numToShow && (
            <TouchableOpacity
              onPress={loadMoreItems}
              style={{
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#2F292429",
                width: "90%",
                height: 45,
                borderRadius: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesome5 name="chevron-down" size={18} color="#2F2924" />
                <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 15,
                    fontWeight: "900",
                    fontFamily: "Roboto-Regular",
                    color: "#2F2924",
                    paddingLeft: 10,
                  }}
                >
                  Show more interests
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={handelSaveIntresets}
            disabled={isLoading}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isLoading ? (
              <Loader />
            ) : (
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  fontFamily: "Inter-Regular",
                  color: "#fff",
                }}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default GeneralInterest;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    position: "relative",
  },
  interesttext: {
    color: "#000000",
    fontWeight: "300",
    fontSize: 24,
    fontFamily: "Inter-Regular",
    alignSelf: "center",
  },
  button: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    bottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  inputField: {
    width: "95%",
    height: 53,
    borderRadius: 5,
    backgroundColor: "#F6F6F6",
    marginBottom: 15,
    alignSelf: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    width: "85%",
    height: 230,
  },
});
