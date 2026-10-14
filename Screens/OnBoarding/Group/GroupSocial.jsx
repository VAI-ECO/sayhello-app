import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  AntDesign,
  Feather,
  Entypo,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Header from "../../../Component/Header";
import { useNavigation, useRoute } from "@react-navigation/native";
import GroupService from "../../../Services/GroupService";
import Loader from "../../../Component/Loader";
import reviewImage1 from "../../../assets/yelp.png";
import reviewImage2 from "../../../assets/google (2).png";
import reviewImage3 from "../../../assets/bbb.png";

import facebookLogo from "../../../assets/facebook.png";
import instagramLogo from "../../../assets/insta.png";
import tiktokLogo from "../../../assets/tiktok.png";
import youtubeLogo from "../../../assets/youtube.png";
import linkedinLogo from "../../../assets/linkedin.png";
import twitterLogo from "../../../assets/x.png";
import i18n from "../../../Context/i18n";
import { useSelector } from "react-redux";

const GroupSocial = () => {
  // const router = useRoute();
  const navigation = useNavigation();

  const GroupData = useSelector((state)=> state?.group?.groupData);
  console.log(GroupData?._id,"group data2");

  const [isLoading, setIsLoading] = useState(false);
  const [socials, setSocials] = useState([
    {
      type: "Facebook",
      link: "",
      logoUrl: facebookLogo,
    },
    {
      type: "Instagram",
      link: "",
      logoUrl: instagramLogo,
    },
    {
      type: "TikTok",
      link: "",
      logoUrl: tiktokLogo,
    },
    {
      type: "YouTube",
      link: "",
      logoUrl: youtubeLogo,
    },
    {
      type: "LinkedIn",
      link: "",
      logoUrl: linkedinLogo,
    },
    {
      type: "Twitter",
      link: "",
      logoUrl: twitterLogo,
    },
  ]);

  const [reviews, setReviews] = useState([
    {
      type: "Yelp",
      link: "",
      imageUrl: reviewImage1,
    },
    {
      type: "Google",
      link: "",
      imageUrl: reviewImage2,
    },
    {
      type: "BBB",
      link: "",
      imageUrl: reviewImage3,
    },
  ]);

  const handleSocialChange = (index, value) => {
    const newSocials = [...socials];
    newSocials[index].link = value;
    setSocials(newSocials);
  };

  const handleReviewChange = (index, value) => {
    const newReviews = [...reviews];
    newReviews[index].link = value;
    setReviews(newReviews);
  };

  const handleNext = () => {
    setIsLoading(true);
    const data = {
      socials,
    };

    console.log("Data: ", data);

    // GroupService.addGroupSocial(router?.params?.groupId, socials)
    GroupService.addGroupSocial(GroupData?._id, socials)
      .then((res) => {
        console.log("Res: ", res);
        navigation.navigate("GroupSummary");
        // navigation.navigate("GroupSummary", {
        //   groupId: router?.params?.groupId,
        // });
        setIsLoading(false);
        setSocials("");
      })
      .catch((err) => {
        console.log("Err: ", err);
        setIsLoading(false);
      });
  };

  const goBack = () => {
    navigation.goBack();
  };
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

    // Clean up listeners when component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ImageBackground
          source={require("../../../assets/ImageBackground.jpg")}
          style={styles.background}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView contentContainerStyle={styles.container}>
              {/* <Header title="" /> */}
              <Image
                source={require("../../../assets/Group.png")}
                style={styles.orglogo}
                resizeMode="contain"
              />
              <Text allowFontScaling={false} style={styles.title}>
                {i18n.t("global.groupSocial")}
              </Text>
              {socials &&
                socials.map((social, index) => (
                  <View style={styles.row} key={index}>
                    <View style={styles.iconContainer}>
                      <Image
                        source={social.logoUrl}
                        style={styles.socialLogo}
                        resizeMode="contain"
                      />
                    </View>
                    <TextInput
                      allowFontScaling={false}
                      style={styles.input}
                      placeholder={social.type}
                      value={social.link}
                      onChangeText={(text) => handleSocialChange(index, text)}
                    />
                  </View>
                ))}
              <Text allowFontScaling={false} style={styles.title}>
                {i18n.t("global.reviews")}
              </Text>
              {reviews.map((review, index) => (
                <View style={styles.row} key={index}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={review.imageUrl}
                      style={styles.reviewImage}
                      resizeMode="contain"
                    />
                  </View>
                  <TextInput
                    allowFontScaling={false}
                    style={styles.input}
                    placeholder={review.type}
                    value={review.link}
                    onChangeText={(text) => handleReviewChange(index, text)}
                  />
                </View>
              ))}
            </ScrollView>
            {isLoading ? (
              <Loader />
            ) : (
              <>
                {!isKeyboardOpen && (
                  <TouchableOpacity
                    onPress={() => handleNext()}
                    style={styles.footer}
                  >
                    <LinearGradient
                      colors={["#338AFF", "#00EDB4"]}
                      style={styles.button}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1.2, y: 0.6 }}
                    >
                      <TouchableOpacity onPress={() => handleNext()}>
                        <View style={styles.buttonContent}>
                          <Text allowFontScaling={false} style={styles.textbtn}>
                            {i18n.t("global.next")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            )}
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default GroupSocial;

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    right: 0,
    bottom: 0,
    flex: 1,
    left: 0,
    top: 0,
  },
  container: {
    flexGrow: 1,
    paddingTop: 55,
    paddingBottom: 80,
  },
  circlecontainer: {
    width: 85,
    height: 85,
    borderRadius: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginTop: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#EDF5F4",
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginHorizontal: 10,
  },
  title: {
    fontFamily: "Roboto-Bold",
    fontSize: 17,
    fontWeight: "400",
    color: "#000000",
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
    bottom: 20,
  },
  button: {
    width: "93%",
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
  textbtn: {
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
  reviewImage: {
    width: 40,
    height: 40,
  },
  socialLogo: {
    width: 40,
    height: 40,
  },
});
