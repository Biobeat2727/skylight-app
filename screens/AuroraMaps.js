import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, Dimensions, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

const screenWidth = Dimensions.get('window').width;

// Keep video data static
const solarVideos = [
  { id: '304', label: '304 Ångström (Prominences, Plasma Loops)', uri: 'https://sdo.gsfc.nasa.gov/assets/img/latest/mpeg/latest_512_0304.mp4' },
  { id: '171', label: '171 Ångström (Coronal Loops)', uri: 'https://sdo.gsfc.nasa.gov/assets/img/latest/mpeg/latest_512_0171.mp4' },
  { id: '193', label: '193 Ångström (Coronal Holes, Flares)', uri: 'https://sdo.gsfc.nasa.gov/assets/img/latest/mpeg/latest_512_0193.mp4' },
];

// SDO definitions with Helioviewer sourceId (NOTE: sourceId isn't used in this fetch method)
const sdoWavelengthDefinitions = [
    { id: '304', label: '304 Ångström (Prominences, Plasma Loops)' },
    { id: '171', label: '171 Ångström (Coronal Loops)' },
    { id: '193', label: '193 Ångström (Coronal Holes, Flares)' },
];

// --- REVISED renderImageTile Helper Function ---
const renderImageTile = (imageUrl, title, isLoading, error, baseStyle = styles.slideImage) => {
    let imageContent;
    if (isLoading) {
        imageContent = <ActivityIndicator size="large" color="#00ffcc" style={styles.loadingIndicator} />;
    } else if (error || !imageUrl) {
        imageContent = <Text style={styles.errorText}>{error || 'Image unavailable'}</Text>;
    } else {
        imageContent = <Image source={{ uri: imageUrl }} style={baseStyle} resizeMode="contain" />;
    }
    return (
        <View style={styles.slideContainer}>
            {imageContent}
            <Text style={styles.slideCaption}>{title}</Text>
        </View>
    );
};
// --- End of Revised Helper ---

export default function AuroraMaps() {
  const [visibleVideoId, setVisibleVideoId] = useState(solarVideos[0]?.id);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const solarFlatListRef = useRef();
  const headerHeight = useHeaderHeight();

  const [auroraForecastUrl, setAuroraForecastUrl] = useState(null);
  const [sdoImageUrls, setSdoImageUrls] = useState({});
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [isLoadingSdoImages, setIsLoadingSdoImages] = useState(true);
  const [errorForecast, setErrorForecast] = useState(null);
  const [errorSdoImages, setErrorSdoImages] = useState(null);

  // --- Fetch Aurora Forecast Function ---
  const fetchAuroraForecast = async () => {
    setIsLoadingForecast(true);
    setErrorForecast(null);
    try {
      const response = await fetch('https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data && data.length > 0 && data[data.length - 1]?.url) {
        setAuroraForecastUrl(`https://services.swpc.noaa.gov${data[data.length - 1].url}`);
      } else {
        throw new Error('Invalid forecast JSON');
      }
    } catch (error) {
      console.error("Error fetching Aurora forecast:", error);
      setErrorForecast("Could not load forecast.");
    } finally {
      setIsLoadingForecast(false);
    }
  };
  // --- End of fetchAuroraForecast Function ---

  // --- Fetch SDO Images Function with Helioviewer API ---
  const fetchSdoImagesUsingApi = async () => {
    setIsLoadingSdoImages(true);
    setErrorSdoImages(null);
    const urls = {};
    const fallbackImageUrl = 'path_to_fallback_image.jpg'; // Replace with a placeholder image path

    try {
        const promises = sdoWavelengthDefinitions.map(async (wavelength) => {
            let imageUrl = null;
            const params = {
                date: '2025-04-26T00:00:00Z',  // Date and time for the image request
                sourceId: '14', // SDO AIA sourceId (adjust based on wavelength)
            };

            console.log(`Requesting JP2 image for ${wavelength.label} with params:`, params);

            try {
                const response = await fetch(`https://api.helioviewer.org/v2/getJP2Image/?${new URLSearchParams(params)}`);
                const data = await response.json();

                // Log the API response to see what we are getting back
                console.log(`API response for ${wavelength.label}:`, data);

                if (data.uri) {
                    console.log(`Found image for ${wavelength.label}:`, data.uri);
                    imageUrl = data.uri; // JPIP URI returned by the API
                } else {
                    console.log(`Failed to fetch image for ${wavelength.label} - No valid image URI.`);
                }
            } catch (error) {
                console.log(`Error fetching image for ${wavelength.label}:`, error);
            }

            // If an image URL is found, use it; otherwise, fall back to a placeholder
            if (imageUrl) {
                urls[wavelength.id] = imageUrl;
            } else {
                console.error(`All attempts failed for ${wavelength.label}. Using fallback.`);
                urls[wavelength.id] = fallbackImageUrl; // Fallback to placeholder image
                setErrorSdoImages(`Could not load image for ${wavelength.label}. Showing placeholder.`);
            }
        });

        await Promise.all(promises); // Wait for all promises to resolve
        setSdoImageUrls(urls); // Update the state with fetched URLs

    } catch (error) {
        console.error("Error during SDO image fetching:", error);
        setErrorSdoImages("Error fetching SDO images.");
    } finally {
        setIsLoadingSdoImages(false);
    }
};

  // --- End of fetchSdoImagesUsingApi Function ---

  useEffect(() => {
    // Call the functions to fetch data
    fetchAuroraForecast();
    fetchSdoImagesUsingApi();
  }, []); // Run only once when component mounts

  // --- Video FlatList Viewability ---
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
      if (viewableItems.length > 0) {
          const currentVisibleId = viewableItems[0].item.id;
          setVisibleVideoId(currentVisibleId);
      }
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 30 }).current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: headerHeight }]}>

        {/* Aurora Forecast Section */}
        <Text style={styles.sectionTitle}>🧭 Aurora Forecast</Text>
        {renderImageTile(
            auroraForecastUrl,
            "Latest Ovation Forecast",
            isLoadingForecast,
            errorForecast
        )}

        {/* Live Solar Activity Section */}
        <Text style={styles.sectionTitle}>☀️ Live Solar Activity</Text>
        <FlatList
          data={solarVideos}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          ref={solarFlatListRef}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={0}
          getItemLayout={(data, index) => ({length: screenWidth, offset: screenWidth * index, index})}
          windowSize={5}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setSelectedVideo(item); setModalVisible(true); }}>
              <View style={styles.slideContainer}>
                <Video
                    source={{ uri: item.uri }}
                    rate={1.0}
                    volume={0.0}
                    isMuted
                    resizeMode="cover"
                    shouldPlay={item.id === visibleVideoId}
                    isLooping
                    style={styles.video}
                />
                <Text style={styles.slideCaption}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Sun Wavelengths Section */}
        <Text style={styles.sectionTitle}>🌈 Sun in Different Wavelengths</Text>
        <FlatList
          data={sdoWavelengthDefinitions}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          renderItem={({ item }) => renderImageTile(
              sdoImageUrls[item.id],
              item.label,
              isLoadingSdoImages,
              errorSdoImages
          )}
        />
      </ScrollView>

      {/* Modal remains the same */}
      {selectedVideo && (
        <Modal visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)} transparent={true}>
          {/* Modal Content */}
        </Modal>
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000814' },
  container: { alignItems: 'center', paddingBottom: 60 }, // paddingTop added dynamically
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#00ffcc', marginTop: 20, marginBottom: 10 },
  slideContainer: { width: screenWidth - 40, marginHorizontal: 20, alignItems: 'center', borderRadius: 12, overflow: 'hidden', backgroundColor: '#001d3d', marginBottom: 20, minHeight: 250 },
  slideImage: { width: '100%', height: 200, backgroundColor: '#000' },
  slideCaption: { color: '#ccc', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 10, paddingBottom: 8 },
  video: { width: '100%', height: 200, backgroundColor: '#000' },
  loadingIndicator: { height: 200, width: '100%', justifyContent: 'center', alignItems: 'center' },
  errorText: { height: 200, width: '90%', textAlign: 'center', textAlignVertical: 'center', color: '#ff6b6b', fontSize: 16, padding: 10 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center' },
  fullscreenVideo: { width: '100%', height: '75%', backgroundColor: 'transparent' },
  modalTextWrapper: { position: 'absolute', bottom: 10, width: '90%', maxHeight: '20%', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: 8 },
  modalTextArea: {},
  modalText: { color: '#e0e0e0', fontSize: 15, lineHeight: 21, textAlign: 'center', marginBottom: 5 },
  closeButton: { position: 'absolute', top: 50, right: 15, zIndex: 999, padding: 10 },
  closeButtonText: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
});
