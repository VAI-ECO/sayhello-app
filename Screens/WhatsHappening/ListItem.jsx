import { memo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import i18n from "../../Context/i18n";

const ListItem = ({ item, from, pathname }) => {
  const navigation = useNavigation();

  const handelNavigate = (data) => {
    let type = data?.type;

    if (type === "postNotification") {
      navigation.navigate("HappeningDetailsNotification", {
        data: data,
        from: from,
        from2: pathname,
      });
    } else if (type === "hoosta") {
      navigation.navigate("HappeningDetailsHoosta", {
        data: data,
        from: from,
        from2: pathname,
      });
    } else if (type === "postDiscount") {
      navigation.navigate("HappeningDetailsDiscount", {
        data: data,
        from: from,
        from2: pathname,
      });
    }
  };
  return (
    <View style={styles.detailscontainer}>
      <View style={styles.innerContainer}>
        {item?.type === "hoosta" && (
          <Image
            style={styles.mainicon}
            source={require("../../assets/hootsanew.png")}
          />
        )}

        {item?.type === "postDiscount" && (
          <Image
            style={styles.mainicon}
            source={require("../../assets/hookupnew.png")}
          />
        )}

        {item?.type === "postNotification" && (
          <Image
            style={styles.mainicon}
            source={require("../../assets/hollanew.png")}
          />
        )}

        {item?.type === "hoosta" && (
          <Image
            style={styles.detailImage}
            source={{ uri: item?.details?.photos && item?.details?.photos[0] }}
          />
        )}

        {item?.type === "postDiscount" && (
          <>
            {item?.details?.featureImage ? (
              <Image
                style={styles.detailImage}
                source={{ uri: item?.details?.featureImage }}
              />
            ) : (
              <Image
                style={styles.detailImage}
                source={require("../../assets/detailbus.png")}
              />
            )}
          </>
        )}

        {item?.type === "postNotification" && (
          <Image
            style={styles.detailImage}
            source={require("../../assets/detailbus.png")}
          />
        )}

        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "Roboto-Regular",
              color: "#262627",
              marginBottom: 4,
            }}
          >
            {item?.type === "postDiscount" &&
              `${moment(item?.details?.startDate).format("YYYY-MM-DD")}`}

            {item?.type === "hoosta" &&
              `${moment(item.details.date).format("M/D/YY")} - ${
                item.details?.endTime
              }`}
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 16,
              fontWeight: "bold",
              fontFamily: "Roboto-Regular",
              color: "#000000",
              marginBottom: 4,
            }}
          >
            {item?.type === "postDiscount" && item?.details?.itemName}
            {item?.type === "postNotification" && item?.details?.title}
            {item?.type === "hoosta" && item?.details?.name}
          </Text>
          <View style={{ flexDirection: "row" }}>
            {item?.type === "hoosta" && (
              <EvilIcons name="location" size={19} color="black" />
            )}
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 14,
                fontWeight: "600",
                fontFamily: "Roboto-Regular",
                color: "#000000",
              }}
            >
              {item?.type === "hoosta" && item?.details?.address}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.detailsbox}
          onPress={() => handelNavigate(item)}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 14,
              fontWeight: "300",
              fontFamily: "Roboto-Regular",
              color: "#fff",
            }}
          >
            {i18n.t("global.details")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailscontainer: {
    borderRadius: 10,
    marginHorizontal: 22,
    borderColor: "#000000",
    marginBottom: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  detailImage: {
    width: 55,
    height: 55,
    resizeMode: "cover",
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "black",
  },
  mainicon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    alignSelf: "center",
    marginRight: 10,
  },
  detailsbox: {
    alignItems: "center",
    width: 65,
    padding: 5,
    backgroundColor: "#5BBD4B",
    borderRadius: 6,
    borderWidth: 1,
  },
});

export default memo(
  ListItem,
  (prevProps, nextProps) => prevProps.item._id === nextProps.item._id
);
