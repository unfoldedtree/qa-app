import { ref } from "vue";

function createUUID(): string {
    let dt = new Date().getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            const r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return uuid;
}

export interface Notification {
    id: string;
    type: string;
    message: string;
    autoClose: boolean;
    duration: number;
}

export type CreateNotification = {
    (options: {
        type?: string;
        message?: string;
        autoClose?: boolean;
        duration?: number;
    }): void;
};

const defaultNotificationOptions = {
    type: "info",
    message: "Ooops! A message was not provided",
    autoClose: true,
    duration: 5,
};

export default function useNotifications() {
    const notifications = ref<Notification[]>([]);

    const createNotification: CreateNotification = (options) => {
        const _options = Object.assign({ ...defaultNotificationOptions }, options);

        notifications.value.push(
            ...[
                {
                    id: createUUID(),
                    ..._options,
                },
            ]
        );
    };

    const createErrorNotification: CreateNotification = (options) => {
        createNotification({
            type: "error",
            duration: 8,
            ...options,
        });
    };

    const createSuccessNotification: CreateNotification = (options) => {
        createNotification({
            type: "success",
            ...options
        });
    };

    const createWarningNotification: CreateNotification = (options) => {
        createNotification({
            type: "warning",
            duration: 8,
            ...options,
        });
    };

    const removeNotifications = (id: string) => {
        const index = notifications.value.findIndex((item) => item.id === id);
        if (index !== -1) notifications.value.splice(index, 1);
    };

    return {
        notifications,
        createNotification,
        createSuccessNotification,
        createErrorNotification,
        createWarningNotification,
        removeNotifications,
    };
}