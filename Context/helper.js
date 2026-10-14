import axios from "axios";
import AppConfig from "../AppConfig";
import requests from "../Services/httpservice";
const generateRandomImageName = () => {
  const timestamp = Date.now(); // Get the current timestamp
  const randomString = Math.random().toString(36).substring(2, 15); // Generate a random string
  return `image_${timestamp}_${randomString}.jpg`; // Combine them into a file name
};

export const UploadImage = async (selectedImage) => {

  if (!selectedImage) return;

  const imageName = generateRandomImageName();

  if (imageName) {
    const formData = new FormData();
    formData.append("file", {
      uri: selectedImage,
      name: imageName, // You can change the name and extension as needed
      type: "image/jpeg", // Adjust the MIME type as needed
    });

    try {
      const response = await axios.post(
        `${AppConfig.ApiUrl}api/v1/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Upload failed:", error?.message);
    }
  }
};

export const UploadDocument = async (selectedFile) => {
  console.log("selectedFile--->",selectedFile)
  if (!selectedFile) return;
  const formData = new FormData();
  formData.append("file", {
    uri: selectedFile?.uri,
    name: selectedFile?.name,
    type: "application/pdf",
  });
  try {
    const response = await axios.post(
      `${AppConfig.ApiUrl}api/v1/upload-pdf`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("response==========>",response.data)
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
