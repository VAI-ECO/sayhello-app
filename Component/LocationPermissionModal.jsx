import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 768; // Check if it's a large screen, such as iPad
const LocationPermissionModal = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, isLargeScreen && styles.centeredContainer]}>
        <ImageBackground
          source={require("../assets/ImageBackground.jpg")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.content, isLargeScreen && styles.largeScreenContent]}>
              <View style={{ marginTop: isLargeScreen ? 10 : 40 }}>

                <Text style={styles.title}>Allow Permissions</Text>
                <Text style={styles.title}>Below</Text>
              </View>
              <Text style={styles.description}>
                To enhance your experience, we require access to the following features. You can manage
                these permissions later in your settings.
              </Text>
              {/* Permissions Section */}
              <View style={styles.permissionItem}>
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.circularButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="location" size={isLargeScreen ? 30 : 24} color="white" />
                </LinearGradient>
                <View>
                  <Text style={styles.permissionTitle}>Location</Text>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Find matches nearby based on your preferences.
                    </Text>
                  </View>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Discover local events for singles in your area.
                    </Text>
                  </View>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Navigate to meetup spots with ease.
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.permissionItem}>
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.circularButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="folder-open" size={isLargeScreen ? 30 : 24} color="white" />
                </LinearGradient>
                <View>
                  <Text style={styles.permissionTitle}>Storage</Text>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Save photos and profiles of your matches.
                    </Text>
                  </View>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Access downloaded media like shared images.
                    </Text>
                  </View>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Ensure a smooth app experience by caching data.
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.permissionItem}>
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.circularButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="camera" size={isLargeScreen ? 30 : 24} color="white" />
                </LinearGradient>
                <View
                  style={{
                  }}>
                  <Text style={styles.permissionTitle}>Camera</Text>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Capture your best moments for your profile.
                    </Text>
                  </View>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Take live photos for instant sharing.
                    </Text>
                  </View>
                  <View style={styles.permissionDescriptionContainer}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.permissionDescription}>
                      Verify your identity securely through selfies.
                    </Text>
                  </View>
                </View>
              </View>
              {/* Additional Permission Sections */}
              {/* Add similar permission blocks here as needed */}
              {/* Confirm Button */}
              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={["#338AFF", "#00EDB4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.2, y: 0.6 }}
                >
                  <TouchableOpacity
                    onPress={onConfirm}
                    style={styles.buttonTouchable}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flex: 1,
    left: 0,
    top: 0,
  },
  content: {
    padding: isLargeScreen ? 30 : 15,
  },
  largeScreenContent: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    fontSize: isLargeScreen ? 36 : 26,
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Inter-Regular',
    marginBottom: isLargeScreen ? 15 : 10,
  },
  description: {
    marginTop: 10,
    fontSize: isLargeScreen ? 26 : 16,
    color: 'gray',
    fontFamily: 'Inter-Regular',
    textAlign: 'justify',
    marginBottom: 20,
  },
  circularButton: {
    width: isLargeScreen ? 70 : 50,
    height: isLargeScreen ? 70 : 50,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: isLargeScreen ? 15 : 10,
    marginBottom: 20,
  },
  permissionTitle: {
    fontWeight: 'bold',
    fontSize: isLargeScreen ? 24 : 16,
  },
  permissionDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: isLargeScreen ? 20 : 10,
    marginTop: isLargeScreen ? 10 : 2,
    width: width - 110,
  },
  bulletPoint: {
    fontWeight: 'bold',
  },
  permissionDescription: {
    fontSize: isLargeScreen ? 20 : 13,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flexGrow: 1,
  },
  buttonContainer: {
    alignSelf: 'center',
    width: '100%',
    marginTop: 10,
  },
  button: {
    width: '100%',
    height: isLargeScreen ? 65 : 58,
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttonTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: isLargeScreen ? 24 : 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
});
export default LocationPermissionModal;