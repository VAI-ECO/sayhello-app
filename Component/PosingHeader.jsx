import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PosingHeader = ({handleBack}) => {
  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginHorizontal: 20,
        }}
      >
        <TouchableOpacity onPress={handleBack ? handleBack : goBack}>
          <Image style={styles.back} source={require("../assets/btnbtn.png")} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation?.openDrawer();
          }}
        >
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <Image style={styles.icon} source={require("../assets/Hollaicon.png")} />
    </View>
  );
};

export default PosingHeader;
const styles = StyleSheet.create({
  icon: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 80,
    height: 80,
    top: -30,
  },
  back: {
    resizeMode: "contain",
    alignSelf: "center",
    width: 35,
    height: 35,
  },
});
