import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfileHeader from "../../Component/ProfileHeader";

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "N/A"}</Text>
  </View>
);

const HappeningDetailsNotification = () => {
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;

  console.log(from, from2, pathname, "p3");

  let data = router?.params?.data?.details;

  const handleBack = () => {
    navigation.navigate(from2, { from: from });
  }
  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader handleBack={handleBack} />
      <Image
        style={styles.image}
        source={require("../../assets/businfo.png")}
      />
      <View style={{ paddingTop: 20 }}>
        <DetailItem label="Title" value={data?.title} />
        <DetailItem label="Website Link" value={data?.websiteLink} />
        {/* <DetailItem label="Created At" value={data?.createdAt} />
      <DetailItem label="Updated At" value={data?.updatedAt} /> */}
        {/* <DetailItem label="User ID" value={data?.userId} /> */}
      </View>
    </SafeAreaView>
  );
};

export default HappeningDetailsNotification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 45,
  },
  image: {
    width: "90%",
    resizeMode: "contain",
    alignSelf: "center",
  },
  detailItem: {
    marginBottom: 10,
    marginHorizontal: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    marginBottom: 3,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Roboto-Regular",
    color: "#000000",
    lineHeight: 20,
  },
});