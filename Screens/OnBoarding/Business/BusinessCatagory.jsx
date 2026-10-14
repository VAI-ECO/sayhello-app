import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  ImageBackground,
} from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import HangoutService from "../../../Services/HangoutService";
import Header from "../../../Component/Header";
import BusinessService from "../../../Services/BusinessService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../../Component/Loader";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../../Context/i18n";

const goBack = () => {
  useNavigation.goBack();
};

const BusinessCatagory = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showSubDropdown, setShowSubDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [dropdownItems, setDropdownItems] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [businessDetails, setBusinessDetails] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getBusinessDetailsFromLocalSorage = async () => {
      let result = await AsyncStorage.getItem(`BusinessCatagory`);
      setBusinessDetails(JSON.parse(result));
      setSelectedItem(JSON.parse(result)?.businessCategory);
    };
    getBusinessDetailsFromLocalSorage();
  }, []);

  const getAllCategories = () => {
    BusinessService.getAllBusinessCategories()
      .then((res) => {
        setDropdownItems(res?.categories);
      })
      .catch((err) => {
        console.log("Error: ", err);
      });
  };
  useEffect(() => {
    getAllCategories();
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item.name);
    setShowDropdown(false);

    // Find the selected category
    const selectedCategory = dropdownItems.find(
      (category) => category.name === item.name
    );

    // Set subcategories if they exist
    if (selectedCategory?.subcategories?.length > 0) {
      setSubcategories(selectedCategory.subcategories.map((sub) => sub.name));
    } else {
      setSubcategories([]);
    }

    if (item.name === "Other") {
      setShowModal(true);
    }
  };

  const handleModalSubmit = () => {
    setSelectedItem(otherText);
    setShowModal(false);
  };

  const validationSchema = Yup.object().shape({
    category: Yup.string().required("* Select atleast one Category"),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
    defaultValues: {
      category: "",
    },
  });

  const handleNext = (values) => {
    setIsLoading(true);
    let data = {
      businessCategory: values.category,
      subCategory: selectedSubcategory || "",
    };
    BusinessService.updateBusinessCategory(businessDetails?.businessId, data)
      .then((res) => {
        navigation.navigate("BusinesDiscription");
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Err: ", err);
        Toast.show({
          type: "error",
          text1: "Something went wrong",
        });
        setIsLoading(false);
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
      >
        <View style={styles.container}>
          <Header title="" />
          <Image
            source={require("../../../assets/busniessicon.png")}
            style={styles.orglogo}
            resizeMode="contain"
          />
          <Controller
            name="category"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={{ paddingHorizontal: 20 }}>
                <Text allowFontScaling={false} style={styles.headerText}>
                  {i18n.t("global.businessCategory")}
                </Text>
                <TouchableOpacity
                  style={styles.selectContainer}
                  onPress={toggleDropdown}
                >
                  <Text allowFontScaling={false} style={styles.selectText}>
                    {value || "Please Select"}
                  </Text>
                  <View style={styles.dropdownIcon}>
                    <AntDesign name="caretdown" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                {showDropdown && (
                  <ScrollView style={styles.dropdownContainer}>
                    {dropdownItems.map((item) => (
                      <TouchableOpacity
                        key={item._id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          onChange(item.name);
                          handleItemSelect(item);
                        }}
                      >
                        <Text
                          allowFontScaling={false}
                          style={styles.dropdownText}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                {errors.category && (
                  <Text style={styles.errorText}>
                    {errors.category.message}
                  </Text>
                )}
              </View>
            )}
          />
          {isLoading ? (
            <Loader />
          ) : (
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleSubmit(handleNext)}
            >
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <TouchableOpacity onPress={handleSubmit(handleNext)}>
                  <View style={styles.buttonContent}>
                    <Text allowFontScaling={false} style={styles.buttonText}>
                      {i18n.t("global.next")}
                    </Text>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
          >
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPressOut={() => setShowModal(false)}
            >
              <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
                <TouchableOpacity
                  style={styles.modalCloseIcon}
                  onPress={() => setShowModal(false)}
                >
                  <AntDesign name="close" size={20} color="#000" />
                </TouchableOpacity>
                <Text allowFontScaling={false} style={styles.modalTitle}>
                  {i18n.t("BusinesPhoto.texttwo")}
                </Text>
                <TextInput
                  allowFontScaling={false}
                  style={styles.modalInput}
                  value={otherText}
                  onChangeText={setOtherText}
                  placeholder="Enter category"
                />
                {isLoading ? (
                  <Loader />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleModalSubmit}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.modalButtonText}
                      >
                        {i18n.t("global.submit")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default BusinessCatagory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 55,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  selectContainer: {
    height: 45,
    borderRadius: 5,
    backgroundColor: "#EDF5F4",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    fontWeight: "600",
    color: "#7C7C7C",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 25,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: "100%",
    backgroundColor: "#1895F0",
    zIndex: 1,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownContainer: {
    marginTop: 5,
    marginBottom: 320,
  },
  dropdownItem: {
    paddingVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 1,
    marginHorizontal: 20,
    borderRadius: 5,
  },
  dropdownText: {
    fontSize: 16,
    paddingLeft: 25,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 10,
  },
  button: {
    width: "95%",
    height: 50,
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#fff",
    textAlign: "center",
  },
  orglogo: {
    resizeMode: "contain",
    alignSelf: "center",
    height: 90,
    top: -10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalCloseIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 15,
    color: "#54595E",
    fontFamily: "Roboto-Regular",
    width: "100%",
  },
  modalInput: {
    width: "100%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#338AFF",
    borderRadius: 5,
    width: "100%",
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 20,
  },
});
