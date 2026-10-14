import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "../../Context/AuthContext";
import AuthServices from "../../Services/authService";
import i18n from "../../Context/i18n";

const DeleteAccountScreen = () => {
  const { user, signOut } = useAuth();
  const [selectedReason, setSelectedReason] = useState(
    "No longer using the service/platform"
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const navigation = useNavigation();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const handelDeleteAccount = () => {
    let reasonToSubmit =
      selectedReason === "Others" ? otherReason : selectedReason;

    let submitBody = {
      userId: user?.user?._id,
      reason: reasonToSubmit,
    };

    console.log(submitBody);
    const handleLogout = async () => {
      signOut();
      navigation.dispatch(DrawerActions.closeDrawer());
      await AsyncStorage.clear();
    };

    AuthServices.DeleteAccount(submitBody)
      .then((res) => {
        console.log("res: ", res);
        setShowConfirmation(false);
        handleLogout();
      })
      .catch((err) => {
        console.log("err: ", err);
      });
  };

  const goBack = () => {
    navigation.goBack();
  };

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

  const reasons = [
    "No longer using the service/platform",
    "Privacy concerns",
    "Too many emails/notifications",
    "Difficulty navigating the platform",
    "Account security concerns",
    "Personal reasons",
    "Others",
  ];

  const handleDeleteAccount = () => {
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    handelDeleteAccount();
    setShowConfirmation(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
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
                        marginBottom: 15,
                      }}
                      source={require("../../assets/btnbtn.png")}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.title}>{i18n.t("global.deleteAccount")}</Text>
              <Text style={styles.subtitle}>
                {i18n.t("global.deleteAccountText")}
              </Text>
              <View style={styles.reasonContainer}>
                <ScrollView>
                  {reasons.map((reason, index) => (
                    <View key={index}>
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => setSelectedReason(reason)}
                      >
                        <View style={styles.radioButton}>
                          {selectedReason === reason && (
                            <View style={styles.radioSelected} />
                          )}
                        </View>
                        <Text style={styles.optionText}>{reason}</Text>
                      </TouchableOpacity>

                      {index < reasons.length - 1 && (
                        <View style={styles.divider} />
                      )}
                    </View>
                  ))}
                  {selectedReason === "Others" && (
                    <TextInput
                      style={styles.input}
                      placeholder="Write a message here"
                      value={otherReason}
                      onChangeText={setOtherReason}
                      maxLength={50}
                      multiline
                      textAlignVertical="top"
                      placeholderTextColor="#888"
                    />
                  )}
                </ScrollView>
              </View>

              <Modal
                transparent={true}
                visible={showConfirmation}
                onRequestClose={() => setShowConfirmation(false)}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <AntDesign name="questioncircle" size={40} color="black" />
                    <Text style={styles.modalTitle}>
                      {i18n.t("global.areYouSureText")}
                    </Text>
                    <Text style={styles.modalText}>
                      {i18n.t("global.deleteAccountPermanently")}
                    </Text>
                    <Text style={styles.modalDescriptionText}>
                      {" "}
                      {i18n.t("global.understandConsequences")}
                      <Text style={styles.boldText}>
                        {i18n.t("global.lossOfDataSubscriptions")}
                      </Text>
                    </Text>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={confirmDelete}
                      >
                        <Text style={styles.modalButtonText}>
                          {i18n.t("global.delete")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalButtonkeep}
                        onPress={() => setShowConfirmation(false)}
                      >
                        <Text style={styles.modalButtonText}>
                          {i18n.t("global.keepAccount")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </ScrollView>
          {!isKeyboardOpen && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteButtonText}>
                {i18n.t("global.delete")}
              </Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: "#777",
    marginHorizontal: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007BFF",
  },
  optionText: {
    fontSize: 16,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    height: 70,
    marginTop: 12,
    padding: 10,
  },
  reasonContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButton: {
    backgroundColor: "#000000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 15,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: "85%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
    color: "#777",
  },
  modalDescriptionText: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: "center",
    color: "#777",
  },
  boldText: {
    fontWeight: "bold",
    color: "#000000",
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
    margin: 5,
  },
  modalButtonkeep: {
    backgroundColor: "#7777",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    flex: 1,
    margin: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default DeleteAccountScreen;
