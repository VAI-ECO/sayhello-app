import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Text,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const ImageSlider = ({ images }) => {
  const { width } = Dimensions.get("window");
  const height = width * 0.5;

  const [active, setActive] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    images.forEach((image) => {
      if (image) {
        Image.prefetch(image);
      }
    });
  }, [images]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (active === images.length - 1) {
        setActive(0);
        scrollViewRef.current.scrollTo({ x: 0, animated: true });
      } else {
        setActive(active + 1);
        scrollViewRef.current.scrollTo({
          x: width * (active + 1),
          animated: true,
        });
      }
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [active, images.length, width]);

  const onScrollChange = ({ nativeEvent }) => {
    const slide = Math.ceil(
      nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
    );
    if (slide !== active) {
      setActive(slide);
    }
  };

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        horizontal
        onScroll={onScrollChange}
        showsHorizontalScrollIndicator={false}
      >
        {images.map(
          (image, index) =>
            image && (
              <View
                key={index}
                style={{
                  width,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={{
                    // width: "90%",
                    // height: 180,
                    height: hp("20%"),
                    width: wp("90%"),
                    resizeMode: "contain",
                    borderRadius: 20,
                  }}
                />
              </View>
            )
        )}
      </ScrollView>
      <View style={styles.pagination}>
        {images.map((i, k) => (
          <Text
            allowFontScaling={false}
            key={k}
            style={k == active ? styles.activeDot : styles.dot}
          >
            &bull;
          </Text>
        ))}
      </View>
    </View>
  );
};

export default ImageSlider;

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    alignSelf: "center",
  },
  dot: {
    color: "#D3E6FF",
    fontSize: 20,
  },
  activeDot: {
    color: "#00EDB4",
    fontSize: 20,
  },
});