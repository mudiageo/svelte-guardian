const load = async ({ locals }) => {
	return {
		session: await locals.auth(),
		verificationSent: true
	};
};
