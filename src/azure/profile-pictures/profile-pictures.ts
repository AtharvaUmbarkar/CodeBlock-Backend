import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  ContainerClient,
  BlobClient,
} from "@azure/storage-blob";

const _importDynamic = new Function("modulePath", "return import(modulePath)");
const fetch = async function (...args: any) {
  const { default: fetch } = await _importDynamic("node-fetch");
  return fetch(...args);
};

// const fetch = (url: RequestInfo, init?: RequestInit) =>  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
const accountKey = process.env.AZURE_STORAGE_KEY as string;
const accountCoreURL = process.env.AZURE_CORE_URL as string;
const connectionString = process.env.AZURE_CONNECTION_STRING as string;
const profilePictureContainerName = process.env
  .AZURE_PROFILE_PICTURES_CONTAINER_NAME as string;
const cdnURL = process.env.AZURE_CDN_URL as string;

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);
const blobServiceClient = new BlobServiceClient(
  accountCoreURL,
  sharedKeyCredential
);

const containerClient = blobServiceClient.getContainerClient(
  profilePictureContainerName
);

const uploadImage = async (authID: string, data: Buffer) => {
  const blobName = authID + "-" + Date.now().toString();
  const blobClient = containerClient.getBlockBlobClient(blobName);
  try {
    const uploadOptions = {
      blobHTTPHeaders: { blobContentType: "image/jpeg" },
    };
    const uploadResponse = await blobClient.upload(
      data,
      data.length,
      uploadOptions
    );
    const blobCDNURL =
      accountCoreURL + "/" + profilePictureContainerName + "/" + blobName;
    return blobCDNURL;
  } catch (error) {
    return "";
  }
};

const deleteImage = async (blobLink: string) => {
  const blobName = blobLink.replace(`${accountCoreURL}/${profilePictureContainerName}/`, "");
  const blobClient = containerClient.getBlockBlobClient(blobName);
  try {
    const deleteResponse = await blobClient.delete();
    const blobCDNURL =
      accountCoreURL + "/" + profilePictureContainerName + "/" + blobName;
    return blobCDNURL;
  } catch (error) {
    return "";
  }
};

const replaceImage = async (authID: string, oldBlobLink: string, data: Buffer) => {
  const blobName = authID + "-" + Date.now().toString();
  const blobClient = containerClient.getBlockBlobClient(blobName);
  const oldBlobName = oldBlobLink.replace(`${accountCoreURL}/${profilePictureContainerName}/`, "");
  const oldBlobClient = containerClient.getBlockBlobClient(oldBlobName);
  try {
    await oldBlobClient.delete();
    const uploadOptions = {
      blobHTTPHeaders: { blobContentType: "image/jpeg" },
    };
    const uploadResponse = await blobClient.upload(
      data,
      data.length,
      uploadOptions
    );
    const blobCDNURL =
      accountCoreURL + "/" + profilePictureContainerName + "/" + blobName;
    return blobCDNURL;
  } catch (error) {
    return "";
  }
};

const uploadImageFromLink = async (authID: string, imageLink: string) => {
  const blobName = authID + "-" + Date.now().toString();
  const blobClient = containerClient.getBlockBlobClient(blobName);
  try {
    let response = await fetch(imageLink);
    response = await response.arrayBuffer();
    const data = Buffer.from(response);

    const uploadOptions = {
      blobHTTPHeaders: { blobContentType: "image/jpeg" },
    };
    const uploadResponse = await blobClient.upload(
      data,
      data.length,
      uploadOptions
    );
    const blobCDNURL =
      accountCoreURL + "/" + profilePictureContainerName + "/" + blobName;
    return blobCDNURL;
  } catch (error) {
    return "";
  }
};

const ProfilePicture = {
  uploadImage,
  uploadImageFromLink,
  deleteImage,
  replaceImage,
};

export default ProfilePicture;
