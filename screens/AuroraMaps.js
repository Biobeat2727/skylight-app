import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  Modal,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Video } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

const screenWidth = Dimensions.get('window').width;

// Media type constants
const MEDIA_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
  FORECAST: 'forecast'
};

// Video data
const solarVideos = [
  { 
    id: '304', 
    label: '304 Ångström', 
    uri: 'https://sdo.gsfc.nasa.gov/assets/img/latest/mpeg/latest_512_0304.mp4',
    description: 'Shows prominences and plasma loops (50,000-100,000°C plasma)' 
  },
  { 
    id: '171', 
    label: '171 Ångström', 
    uri: 'https://sdo.gsfc.nasa.gov/assets/img/latest/mpeg/latest_512_0171.mp4',
    description: 'Displays coronal loops (1 million°C plasma)' 
  },
  { 
    id: '193', 
    label: '193 Ångström', 
    uri: 'https://sdo.gsfc.nasa.gov/assets/img/latest/mpeg/latest_512_0193.mp4',
    description: 'Reveals coronal holes and flare regions (1.5 million°C)' 
  }
];

// Wavelength data
const sdoWavelengthDefinitions = [
  { 
    id: '211', 
    label: '211 Ångström', 
    description: 'Active regions where magnetic energy concentrates (1-2 million°C)' 
  },
  { 
    id: '335', 
    label: '335 Ångström', 
    description: 'Extremely hot flare regions (2.5-3 million°C)' 
  },
  { 
    id: '094', 
    label: '94 Ångström', 
    description: 'Magnetic footpoints during solar flares' 
  },
  { 
    id: 'HMII', 
    label: 'HMI Magnetogram', 
    description: 'Colorized map of magnetic fields (red/blue = opposite polarities)' 
  }
];

export default function AuroraMaps() {
  const [visibleVideoId, setVisibleVideoId] = useState(solarVideos[0]?.id);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [auroraForecastUrl, setAuroraForecastUrl] = useState(null);
  const [sdoImageUrls, setSdoImageUrls] = useState({});
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [isLoadingSdoImages, setIsLoadingSdoImages] = useState(true);
  const [errorForecast, setErrorForecast] = useState(null);
  const [errorSdoImages, setErrorSdoImages] = useState(null);
  const solarFlatListRef = useRef();
  const headerHeight = useHeaderHeight();

  // Fetch Aurora Forecast
  const fetchAuroraForecast = async () => {
    setIsLoadingForecast(true);
    setErrorForecast(null);
    try {
      const response = await fetch('https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data?.length > 0 && data[data.length - 1]?.url) {
        // Store just the URL string, not the object
        setAuroraForecastUrl(`https://services.swpc.noaa.gov${data[data.length - 1].url}`);
      } else {
        throw new Error('Invalid forecast data');
      }
    } catch (error) {
      console.error("Forecast error:", error);
      setErrorForecast("Could not load forecast");
    } finally {
      setIsLoadingForecast(false);
    }
  };

  // Fetch SDO Images
  const fetchSdoImages = async () => {
    setIsLoadingSdoImages(true);
    setErrorSdoImages(null);
    
    const getUrl = (id) => {
      if (id === 'HMII') {
        return `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMII.jpg?t=${Date.now()}`;
      }
      return `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_${id.padStart(4,'0')}.jpg?t=${Date.now()}`;
    };

    try {
      setSdoImageUrls({
        '211': getUrl('211'),
        '335': getUrl('335'),
        '094': getUrl('094'),
        'HMII': getUrl('HMII')
      });
    } catch (error) {
      console.error("SDO image error:", error);
      setErrorSdoImages("Could not load solar images");
    } finally {
      setIsLoadingSdoImages(false);
    }
  };

  useEffect(() => {
    fetchAuroraForecast();
    fetchSdoImages();
    
    const sdoInterval = setInterval(fetchSdoImages, 15 * 60 * 1000);
    const forecastInterval = setInterval(fetchAuroraForecast, 60 * 60 * 1000);
    
    return () => {
      clearInterval(sdoInterval);
      clearInterval(forecastInterval);
    };
  }, []);

  // Video viewability config
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisibleVideoId(viewableItems[0].item.id);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 30 }).current;

  const renderMediaItem = ({ item }, section) => {
    // Handle forecast case differently
    const imageUri = section === MEDIA_TYPES.FORECAST ? auroraForecastUrl : sdoImageUrls[item?.id];
    
    return (
      <TouchableOpacity 
        onPress={() => {
          setSelectedMedia({ 
            uri: section === MEDIA_TYPES.FORECAST ? auroraForecastUrl : item.uri || sdoImageUrls[item.id],
            type: section,
            label: section === MEDIA_TYPES.FORECAST ? 'Aurora Forecast' : item.label,
            description: section === MEDIA_TYPES.FORECAST ? 'Latest aurora forecast map from NOAA' : item.description
          });
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.slideContainer}>
          {section === MEDIA_TYPES.VIDEO ? (
            <Video
              source={{ uri: item.uri }}
              shouldPlay={item.id === visibleVideoId}
              isMuted
              isLooping
              resizeMode="cover"
              style={styles.video}
            />
          ) : (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.slideImage} 
              resizeMode="contain"
            />
          )}
          <Text style={styles.slideCaption}>
            {section === MEDIA_TYPES.FORECAST ? 'Aurora Forecast' : item.label}
          </Text>
          {item?.description && <Text style={styles.slideDescription}>{item.description}</Text>}
          {section === MEDIA_TYPES.FORECAST && (
            <Text style={styles.slideDescription}>Latest aurora forecast map from NOAA</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: headerHeight }]}>
        
        {/* Aurora Forecast Section */}
        <Text style={styles.sectionTitle}> Aurora Forecast</Text>
        {isLoadingForecast ? (
          <ActivityIndicator size="large" color="#00ffcc" />
        ) : errorForecast ? (
          <Text style={styles.errorText}>{errorForecast}</Text>
        ) : (
          renderMediaItem({ item: auroraForecastUrl }, MEDIA_TYPES.FORECAST)
        )}

        {/* Solar Videos Section */}
        <Text style={styles.sectionTitle}> Solar Activity Videos</Text>
        <FlatList
          data={solarVideos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={(item) => renderMediaItem(item, MEDIA_TYPES.VIDEO)}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index
          })}
        />

        {/* Solar Images Section */}
        <Text style={styles.sectionTitle}> Solar Wavelengths</Text>
        {isLoadingSdoImages ? (
          <ActivityIndicator size="large" color="#00ffcc" />
        ) : errorSdoImages ? (
          <Text style={styles.errorText}>{errorSdoImages}</Text>
        ) : (
          <FlatList
            data={sdoWavelengthDefinitions}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={(item) => renderMediaItem(item, MEDIA_TYPES.IMAGE)}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index
            })}
          />
        )}
      </ScrollView>

      {/* Unified Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          {/* Media Content */}
          <View style={styles.fullscreenMediaContainer}>
            {selectedMedia?.type === MEDIA_TYPES.VIDEO ? (
              <Video
                source={{ uri: selectedMedia.uri }}
                shouldPlay
                isMuted
                isLooping
                resizeMode="contain"
                style={styles.fullscreenMedia}
                useNativeControls={false}
              />
            ) : (
              <Image
                source={{ uri: selectedMedia?.uri }}
                style={styles.fullscreenMedia}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Header with Close Button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedMedia?.label}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Footer with Description */}
          {selectedMedia?.description && (
            <View style={styles.modalFooter}>
              <Text style={styles.modalDescription}>
                {selectedMedia.description}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000814'
  },
  container: {
    alignItems: 'center',
    paddingBottom: 60
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center'
  },
  slideContainer: {
    width: screenWidth - 40,
    marginHorizontal: 20,
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#001d3d',
    marginBottom: 20,
    minHeight: 300
  },
  slideImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#000'
  },
  slideCaption: {
    color: '#00ffcc',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontWeight: '600'
  },
  slideDescription: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 15,
    marginTop: 5,
    marginBottom: 10,
    fontStyle: 'italic'
  },
  video: {
    width: '100%',
    height: 250,
    backgroundColor: '#000'
  },
  loadingIndicator: {
    height: 250,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    height: 250,
    width: '90%',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#ff6b6b',
    fontSize: 16,
    padding: 10
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)'
  },
  fullscreenMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullscreenMedia: {
    width: '100%',
    height: '100%'
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 29, 61, 0.8)'
  },
  modalFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0, 29, 61, 0.8)'
  },
  modalTitle: {
    color: '#00ffcc',
    fontSize: 20,
    fontWeight: 'bold'
  },
  modalDescription: {
    color: '#e0e0e0',
    fontSize: 14,
    textAlign: 'center'
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'center'
  }
});