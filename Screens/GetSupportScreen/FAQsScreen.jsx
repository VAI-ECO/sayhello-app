import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const FAQsScreen = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const navigation = useNavigation();

  const faqs = [
    {
      question: "What is your return policy?",
      answer: "You can return any item within 30 days of purchase.",
    },
    {
      question: "How can I contact customer service?",
      answer: "You can reach us at support@example.com.",
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to many countries worldwide.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit cards, PayPal, and Apple Pay.",
    },

    {
      question: "How do I track my order?",
      answer:
        "You can track your order status in the Orders section of your account.",
    },
    {
      question: "What should I do if I receive a damaged item?",
      answer:
        "Please contact our customer service, and we will assist you with a replacement.",
    },
    {
      question: "Do you offer gift cards?",
      answer: "Yes, we offer gift cards that can be purchased on our website.",
    },
    {
      question: "Can I change my shipping address after placing an order?",
      answer:
        "If your order hasn’t been shipped yet, you can change the shipping address by contacting customer service.",
    },
  ];

  const goBack = () => {
    navigation.goBack();
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.faqItem}>
      <TouchableOpacity onPress={() => toggleExpand(index)}>
        <Text style={styles.question}>{item.question}</Text>
      </TouchableOpacity>
      {expandedIndex === index && (
        <Text style={styles.answer}>{item.answer}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ImageBackground
        source={require("../../assets/ImageBackground.jpg")}
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
                    marginBottom: 20,
                  }}
                  source={require("../../assets/btnbtn.png")}
                />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={faqs}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  question: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
  },
  answer: {
    marginTop: 8,
    fontSize: 14,
    color: "#000000",
    fontFamily: "Roboto-Regular",
  },
});

export default FAQsScreen;
