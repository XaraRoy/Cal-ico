const check = () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('No Service Worker support!')
    }
    if (!('PushManager' in window)) {
      throw new Error('No Push API Support!')
    }
    return "ok"

}

const registerServiceWorker = async () => {
    const swRegistration = await navigator.serviceWorker.register('../service.js', {scope: '/'});
    return swRegistration;
}


const requestNotificationPermission = async () => {
    window.Notification.requestPermission().then((permission) => {
        if (permission == "granted") {
            registerServiceWorker();
        }
    });

}

const showLocalNotification = (title, body, swRegistration) => {
    const options = {
        body,
    };
    swRegistration.showNotification(title, options);
}

const main = async () => {
    console.log('checking permission capability')
    notificationCapability = await check();
    if (Notification.permission == 'default' && notificationCapability == 'ok'){
        await requestNotificationPermission();
        if (Notification.permission == 'granted'){
            console.log('permission granted');
        } else {
            console.warn('permission not granted or available')
        }
    }
}
