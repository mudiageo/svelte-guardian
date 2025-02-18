import type { RequestEvent } from '@sveltejs/kit';

//Optional import util
export const optionalImport = async (packageName: string) => {
	try {
		const optionalPackage = await import(packageName);
		return optionalPackage;
	} catch (e) {
		console.log(`${packageName} not found. Make sure it is installed if you plan on using it`, e);
	}
};

export const convertEventRequestBodyFromJsonToFormData = async (event: RequestEvent) => {
	const requestClone = event.request.clone();
	const request = event.request;
	const contentType = request.headers.get('content-type');

	// Early check based on content-type
	if (
		contentType?.includes('application/x-www-form-urlencoded') ||
		contentType?.includes('multipart/form-data')
	)
		return event;
	if (contentType?.includes('application/json')) {
		const jsonData = await requestClone.json();
		const formData = getFormData(jsonData);

		const newRequest = new Request(event.request.url, {
			method: event.request.method,
			headers: event.request.headers,
			body: formData
		});

		// Create a new event object with the updated request
		newRequest.formData = () => formData;
		return {
			...event,
			request: newRequest
		};
	}
	try {
		const clonedRequest = request.clone();

		const formData = await clonedRequest.formData();
		return event;

		const jsonData = await clonedRequest.json();
		const newFormData = getFormData(jsonData);
		const newRequest = new Request(event.request.url, {
			method: event.request.method,
			headers: event.request.headers,
			body: newFormData
		});
		newRequest.formData = () => formData;

		// Create a new event object with the updated request
		return {
			...event,
			request: newRequest
		};
	} catch {
		// Unable to read body
		return event;
	}
	return event;
};

function getFormData(object) {
	const formData = new FormData();
	Object.keys(object).forEach((key) => formData.append(key, object[key]));
	return formData;
}
