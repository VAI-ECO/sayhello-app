import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import userService from "../../Services/userService";
import { useAuth } from "../../Context/AuthContext";

const GetSupportScreen = () => {
  const bottomSheetModalRef = useRef(null);
  const { user } = useAuth();
  const navigation = useNavigation();
  const [modalTitle, setModalTitle] = useState("");
  const [bugTitle, setBugTitle] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  const openBottomSheet = (title) => {
    console.log("title: ", title)
    setModalTitle(title);
    bottomSheetModalRef.current?.present();
  };

  const closeBottomSheet = () => {
    bottomSheetModalRef.current?.dismiss();
  };

  useFocusEffect(
    React.useCallback(() => {
      closeBottomSheet();
      return () => {};
    }, [])
  );

  const handleSubmit = () => {
    if (modalTitle === "Report a bug") {
      console.log("Bug Report:", bugTitle, bugDescription);
      userService
        .createBugReport({
          title: bugTitle,
          desc: bugDescription,
          reportedBy: user?.user?._id,
        })
        .then((res) => {
          console.log("res: ", res);
          Toast.show({
            type: "success",
            text1: "Report Submitted Successfully",
            autoHide: true,
            visibilityTime: 1000,
          });
        })
        .catch((err) => {
          console.log("error on bug report: ", err);
        });
    } else if (modalTitle === "Other feedback") {
      console.log("Feedback:", feedbackTitle, feedbackDetails);
      userService
        .createFeedbackReport({
          desc: feedbackDetails,
          reportedBy: user?.user?._id,
        })
        .then((res) => {
          console.log("res: ", res);
          Toast.show({
            type: "success",
            text1: "Thank you for your feedback!",
            autoHide: true,
            visibilityTime: 1000,
          });
        })
        .catch((err) => {
          console.log("error on bug report: ", err);
        });
    }
    closeBottomSheet();
  };

  const supportOptions = [
    {
      id: "1",
      title: "Report a bug",
      description: "Let us know any specific issue you experience",
    },
    {
      id: "2",
      title: "FAQs",
      description: "You may find answers to some of your questions here",
    },
    {
      id: "3",
      title: "Other feedback",
      description: "We want to know how we can better serve you",
    },
  ];

  const navigateToScreen = (item) => {
    if (item.title === "FAQs") {
      navigation.navigate("FAQsScreen");
    } else {
      openBottomSheet(item.title);
    }
  };

  const renderItem = ({ item }) => (
    <View>
      <View style={styles.optionContent}>
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => navigateToScreen(item)}
        >
          <View>
            <Text style={styles.optionTitle}>{item.title}</Text>
            <Text style={styles.optionDescription}>{item.description}</Text>
          </View>
        </TouchableOpacity>
        <AntDesign name="right" size={20} color="#ccc" />
      </View>
      <View style={styles.divider} />
    </View>
  );

  return (
    <BottomSheetModalProvider>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                width: "14%",
                justifyContent: "flex-start",
              }}
            >
              <TouchableOpacity onPress={goBack}>
                <Image
                  style={{
                    width: 35,
                    height: 35,
                    resizeMode: "contain",
                    marginBottom: 10,
                  }}
                  source={require("../../assets/btnbtn.png")}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.header}>Get Support</Text>
          <FlatList
            data={supportOptions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />

          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={["50%"]}
            style={styles.bottomSheet}
            backgroundStyle={{ backgroundColor: "#ccc" }}
            onBackdropPress={closeBottomSheet}
          >
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.subtitle}>
                {modalTitle === "Report a bug"
                  ? "Let us know any specific issues you experienced"
                  : "We value your feedback and want to know how we can improve"}
              </Text>

              {modalTitle === "Report a bug" ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Bug Title"
                    placeholderTextColor="#7a7a7a"
                    value={bugTitle}
                    onChangeText={setBugTitle}
                  />

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Bug Description"
                    placeholderTextColor="#7a7a7a"
                    multiline
                    value={bugDescription}
                    onChangeText={setBugDescription}
                  />
                </>
              ) : modalTitle === "Other feedback" ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Feedback Title"
                    placeholderTextColor="#7a7a7a"
                    value={feedbackTitle}
                    onChangeText={setFeedbackTitle}
                  />

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Feedback Details"
                    placeholderTextColor="#7a7a7a"
                    multiline
                    value={feedbackDetails}
                    onChangeText={setFeedbackDetails}
                  />
                </>
              ) : null}
            </ScrollView>

            {isKeyboardOpen ? null : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </BottomSheetModal>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 25,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
  listContainer: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  optionItem: {
    paddingVertical: 20,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  optionDescription: {
    fontSize: 14,
    color: "#7a7a7a",
  },
  bottomSheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 1,
    color: "#000",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#800080",
    paddingVertical: 15,
    borderRadius: 10,
    // marginTop: 40,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: "#7a7a7a",
    textAlign: "center",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
  },
});

export default GetSupportScreen;