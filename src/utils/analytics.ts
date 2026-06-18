type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
	interface Window {
		umami?: {
			track: (event: string, data?: EventProps) => void;
		};
	}
}

export function track(event: string, data?: EventProps): void {
	window.umami?.track(event, data);
}
