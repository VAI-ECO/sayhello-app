import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  ImageBackground,
  View,
} from "react-native";
import axios from "axios";
import AppConfig from "../../AppConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileHeader from "../../Component/ProfileHeader";

import Items from "./items";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = `${AppConfig.ApiUrl}api/v1/group/all`;

const AllGroups = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleImageId, setVisibleImageId] = useState(null);

  const toggleImageVisibility = (id) => {
    setVisibleImageId((prevId) => (prevId === id ? null : id));
  };

  const fetchData = async (pageNum) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}?page=${pageNum}&limit=10`);
      const newData = response.data.groups;

      setData((prevData) => {
        const allData = [...prevData, ...newData];
        return allData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t._id === item._id)
        );
      });

      setHasMore(pageNum < response.data.totalPages);
      setPage(pageNum + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(page); // Fetch data when the screen comes into focus
    }, [])
  );

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchData(page);
    }
  };

  const renderItem = ({ item }) => (
    <Items
      item={item}
      visibleImageId={visibleImageId}
      toggleImageVisibility={toggleImageVisibility}
    />
  );

  const refreshData = useCallback(async () => {
    // setRefreshing(true);
    setPage(1); // Reset page to 1 for fresh data
    setData([]); // Clear the existing data
    fetchData(1);

    // try {
    //   const response = await axios.get(`${API_URL}?page=1&limit=10`);
    //   console.log("pyeeeeeeeeeee: ", response.data)
    //   setData(response.data.data);
    //   setHasMore(response.data.totalPages > 1);
    // } catch (error) {
    //   console.error(error);
    // } finally {
    //   setRefreshing(false);
    // }
  }, []);

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
          <ProfileHeader />
          <FlatList
            data={data}
            keyExtractor={(item, index) =>
              item?._id ? item._id : `key-${index}`
            }
            renderItem={renderItem}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={refreshData}
            ListHeaderComponent={<View style={{ paddingTop: 20 }} />}
            ListFooterComponent={
              loading ? (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  style={{ alignItems: "center", alignSelf: "center" }}
                />
              ) : null
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 40,
  },
});
export default AllGroups;
