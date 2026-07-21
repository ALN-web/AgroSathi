export const getCropMetadata = (cropName: string) => {
  const normalized = cropName.toLowerCase().trim();
  
  // Basic mapping of crops to existing images in the frontend
  // Since we don't have all 22 specific images, we reuse standard assets
  const imageMap: Record<string, string> = {
    maize: '/images/service_crop.png',
    groundnut: '/images/service_soil.png',
    soybean: '/images/crop_prediction.png',
    cotton: '/images/service_drone.png',
    rice: '/images/crop_prediction.png',
    jute: '/images/service_crop.png',
  };

  return {
    image: imageMap[normalized] || '/images/service_crop.png',
  };
};
