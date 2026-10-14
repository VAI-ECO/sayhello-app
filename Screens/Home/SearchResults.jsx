import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const SearchResults = ({ route }) => {

    const { filteredUsers } = route.params || {};
    const navigation = useNavigation();

    const goBack = () => {
        // Navigate back to the previous screen
        navigation.navigate("SearchFilter");
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView style={{ flex: 1 }}>
                {/* <TouchableOpacity onPress={goBack}
                    style={{
                        marginTop: 40,
                        marginLeft: 10,
                    }}>
                    <Image
                        style={{
                            width: 35,
                            height: 35,
                            resizeMode: "contain",
                        }}
                        source={require("../../assets/btnbtn.png")}
                    />
                </TouchableOpacity> */}

                {filteredUsers?.length > 0 && (

                    <View style={styles.searchResultsContainer}>
                        <Text style={styles.title}>Results</Text>
                        {filteredUsers?.map((user) => (
                            <TouchableOpacity
                                key={user.id}
                                onPress={() => {
                                    navigation.navigate("EditProfile", { userId: user?._id });
                                }}
                                style={{
                                    flexDirection: "row",
                                    marginTop: 15,
                                    marginLeft: 0,
                                    borderWidth: 1,
                                    borderColor: "blue",
                                    borderRadius: 10,
                                    padding: 8,
                                }}
                            >
                                <Image
                                    style={styles.profileImage}
                                    source={user?.profileUrl ? { uri: user?.profileUrl } : require("../../assets/profile_img.png")}
                                />
                                <Text style={styles.nameText}>
                                    {user.firstname} {user.lastname}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
            <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
            >
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("SearchFilter")
                    }}
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >

                    <Text
                        allowFontScaling={false}
                        style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            fontFamily: "Inter-Regular",
                            color: "#fff",
                        }}
                    >
                        Modify Search
                    </Text>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    )
}


export default SearchResults;

const styles = StyleSheet.create({
    searchResultsContainer: {
        marginTop: 50,
        margin: 15
    },
    profileImage: {
        width: 45,
        height: 45,
        resizeMode: "contain",
        borderRadius: 25,
        marginRight: 10,
    },
    nameText: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 10
    },
    title: {
        margin: "auto",
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 10,
        fontSize: 20,
        fontWeight: "bold",
    },
    button: {
        margin: 10,
        marginTop: 10,
        height: 50,
        borderRadius: 10,
        width: "auto",
    },
})