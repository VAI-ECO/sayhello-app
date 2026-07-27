import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProfileHeader from "../../Component/ProfileHeader";
import moment from "moment";

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const HappeningDetailsDiscount = () => {
  const navigation = useNavigation();
  const router = useRoute();
  const pathname = router?.name;
  const from = router?.params?.from;
  const from2 = router?.params?.from2;

  const data = router?.params?.data;
  console.log(from, from2, pathname, data, "p3");

  const handleBack = () => {
    navigation.navigate(from2, { from: from });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader handleBack={handleBack} />
      {data?.details?.featureImage ? (
        <Image
          style={styles.image}
          source={{ uri: data?.details?.featureImage }}
        />
      ) : (
        <Image
          style={styles.image}
          source={require("../../assets/detailbus.png")}
        />
      )}

      <DetailItem label="Title" value={data?.details?.itemName || "N/A"} />
      <DetailItem
        label="Website Link"
        value={data?.details?.websiteLink || "N/A"}
      />
      <DetailItem
        label="Description"
        value={data?.details?.description || "N/A"}
      />
      <DetailItem label="Time" value={data?.details?.time || "N/A"} />
      <DetailItem
        label="Item Discount"
        value={data?.details?.itemDiscount || "N/A"}
      />

      <DetailItem
        label="Start Date"
        value={moment(data?.details?.startDate).format("YYYY-MM-DD") || "N/A"}
      />
    </SafeAreaView>
  );
};

export default HappeningDetailsDiscount;

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
    marginBottom: 6,
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
