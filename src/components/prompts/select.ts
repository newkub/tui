export function select<T>(options: {
	message: string;
	options: { value: T; label: string }[];
}): Promise<T> {
	return new Promise((resolve) => {
		console.log(`${options.message}`);
		resolve(options.options[0].value); // คืนค่าแรกชั่วคราว
	});
}
