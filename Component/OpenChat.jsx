import { StyleSheet, Text, View } from "react-native";
import React from "react";

const questions = [
  "1. What's the best book you've ever read?",
  "2. What's the last movie you watched and loved?",
  "3. What's your favorite restaurant?",
  "4. What's your favorite thing to cook?",
  "5. Do you have any pets?",
  "6. What's your favorite travel destination?",
  "7. What's your favorite music genre?",
  "8. What's your favorite sports team?",
  "9. What's your favorite quote?",
  "10. What's your favorite outdoor activity?",
  "11. What's your favorite indoor activity?",
  "12. What's your favorite type of cuisine?",
  "13. What's your favorite TV show?",
  "14. What's your dream job?",
  "15. What's something you've always wanted to learn?",
  "16. What's something you're passionate about?",
  "17. What's your favorite season?",
  "18. What's your idea of a perfect date?",
  "19. What's the best advice you've ever received?",
  "20. What's something you've always wanted to try but",
  "21. What's your favorite way to unwind after a long day?",
  "22. What's your favorite holiday?",
  "23. Do you have any siblings?",
  "24. What's the best gift you've ever received?",
  "25. What's your favorite way to exercise?",
  "26. Do you prefer the beach or the mountains?",
  "27. What's your favorite type of art?",
  "28. Do you have any hidden talents?",
  "29. What's the best trip you've ever taken?",
  "30. What's your favorite type of dessert?",
  "31. What's your favorite childhood memory?",
  "32. What's something you're looking forward to in the future?",
  "33. What's the best concert you've ever been to?",
  "34. What's your favorite way to relax?",
  "35. Do you have any favorite quotes from movies or TV shows?",
  "36. What's your favorite type of cocktail?",
  "37. Do you have any favorite comedians or funny TV shows?",
  "38. What's the most adventurous thing you've ever done?",
  "39. What's something most people don't know about you?",
  "40. What's your favorite hobby?",
];

const OpenChat = ({ item }) => {
  const index = parseInt(item.name.replace('question', ''), 10) - 1;
  const question = questions[index]?.replace(/^\d+\.\s*/, ''); // Remove numbers and dots
  const answer = item?.answer;

  return (
    <View>
      <View style={{ paddingHorizontal: 22 }}>
        <Text allowFontScaling={false} style={styles.text}>{question}</Text>
        <Text allowFontScaling={false} style={styles.description}>{answer}</Text>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

export default OpenChat;

const styles = StyleSheet.create({
  text: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: "Roboto-Regular",
    marginBottom: 3,
  },
  divider: {
    borderBottomColor: "#D9D9D9",
    borderBottomWidth: 1,
    marginBottom: 16,
    marginTop: 16,
  },
  description: {
    color: "#338AFF",
    fontWeight: "400",
    fontSize: 17,
    fontFamily: "Roboto-Regular",
    paddingLeft: 20,
  },
});
