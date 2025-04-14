// src/lib/notifications/registerForPushNotifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } else {
    alert("Must use physical device for Push Notifications");
    return null;
  }
}
